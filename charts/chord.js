(function(){

    var graph = raw.models.tree();

    var chart = raw.chart()
        .title('Chord diagram')
        .description("Inspired by Circos")
        .thumbnail("imgs/alluvial.png")
        .model(graph);

    var width = chart.number()
        .title("Width")
        .defaultValue(1000)
        .fitToWidth(true);

    var height = chart.number()
        .title("Height")
        .defaultValue(500);

    var padding = chart.number()
        .title("Padding")
        .defaultValue(6);

    var chordOpacity = chart.number()
        .title("Chord opacity")
        .defaultValue(50);

    var ringOpacity = chart.number()
        .title("Ring opacity")
        .defaultValue(60);

    var tickOffset = chart.number()
        .title("Tick offset")
        .defaultValue(0);

    var colors = chart.color()
        .title("Color scale");

    chart.draw(function (selection, data){

        var chordMatrix = [];
        var uniqueLabels = [];

        console.log(data);

        data.children.forEach(function(source){

            if(uniqueLabels.indexOf(source.name) === -1){
                uniqueLabels.push(source.name);
            }
            if(source.children) {
                source.children.forEach(function (target) {

                    if (uniqueLabels.indexOf(target.name) === -1) {
                        uniqueLabels.push(target.name);
                    }
                });
            }
        });

        // Prepare matrix
        for(var i = 0; i < uniqueLabels.length; i++) {
            var row = [];
            for(var j = 0; j < uniqueLabels.length; j++) {
                row[j] = 0;
            }
            chordMatrix.push(row);
        }

        data.children.forEach(function(source){

            var sourceIndex = uniqueLabels.indexOf(source.name);

            if(source.children){
                source.children.forEach(function(target){

                    var targetIndex = uniqueLabels.indexOf(target.name);
                    chordMatrix[sourceIndex][targetIndex] += target.size;
                });
            }
        });

        console.log(chordMatrix);

        var g = selection
            .attr("width", +width() )
            .attr("height", +height() )
            .append("g")
            .attr("transform", "translate(" +width() / 2 + "," +height() / 2 + ")");

        var chord = d3.layout.chord()
            .padding(+padding() / 100)
            .sortSubgroups(d3.descending)
            .matrix(chordMatrix);

        var innerRadius = Math.min(+width(), +height()) * .41,
            outerRadius = innerRadius * 1.1;

        var fill = d3.scale.ordinal()
            .domain(d3.range(4))
            .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

        g.append("g").selectAll("path")
            .data(chord.groups)
            .enter().append("path")
            .style("fill", function(d) { return fill(d.index); })
            .style("opacity", +ringOpacity()/100)
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));

        var ticks = g.append("g").selectAll("g")
            .data(chord.groups)
            .enter().append("g").selectAll("g")
            .data(groupTicks)
            .enter().append("g")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + outerRadius + (+tickOffset()) + ",0)";
            });

        ticks.append("line")
            .attr("x1", 1)
            .attr("y1", 0)
            .attr("x2", 5)
            .attr("y2", 0)
            .style("stroke", "#000");

        ticks.append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return d.label; });

        g.append("g")
            .attr("class", "chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(outerRadius))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("opacity", +chordOpacity()/100);

        // Returns an array of tick angles and labels, given a group.
        function groupTicks(d) {
            var k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, 1000).map(function(v, i) {
                return {
                    angle: v * k + d.startAngle,
                    label: i % 5 ? null : v / 1000 + "k"
                };
            });
        }

        /*
        // Returns an event handler for fading a given chord group.
        function fade(opacity) {
            return function(g, i) {
                svg.selectAll(".chord path")
                    .filter(function(d) { return d.source.index != i && d.target.index != i; })
                    .transition()
                    .style("opacity", opacity);
            };
        }
        */
    });
})();