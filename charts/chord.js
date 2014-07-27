(function(){

    var graph = raw.models.tree();

    var chart = raw.chart()
        .title('Chord diagram')
        .description("Inspired by Circos")
        .thumbnail("imgs/alluvial.png")
        .model(graph)

    var width = chart.number()
        .title("Width")
        .defaultValue(1000)
        .fitToWidth(true)

    var height = chart.number()
        .title("Height")
        .defaultValue(500)

    var nodeWidth = chart.number()
        .title("Node Width")
        .defaultValue(10)

    var sortBy = chart.list()
        .title("Sort by")
        .values(['size','name','automatic'])
        .defaultValue('size')

    var colors = chart.color()
        .title("Color scale")

    chart.draw(function (selection, data){

        var relations = {};
        var chordMatrix = [];

        console.log(data);
        /*
         var nested = d3.nest()
         .key(function (d){ return d.source; })
         .entries(data.links)
         */
        data.children.forEach(function(source){

            source.children.forEach(function(target){

                // Make sure that field is initialized
                if(!relations[source.name] || !relations[source.name][target.name]) {
                    relations[source.name] = {};
                    relations[source.name][target.name] = target.size;
                }

                relations[source.name][target.name] += target.size;
            });
        });

        console.log(relations);

        var g = selection
            .attr("width", +width() )
            .attr("height", +height() )
            .append("g")
            .attr("transform", "translate(" +width() / 2 + "," +height() / 2 + ")");

        var matrix = [
            [11975,  5871, 8916, 2868],
            [ 1951, 10048, 2060, 6171],
            [ 8010, 16145, 8090, 8045],
            [ 1013,   990,  940, 6907]
        ];

        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(matrix);

        var innerRadius = Math.min(+width(), +height()) * .41,
            outerRadius = innerRadius * 1.1;

        var fill = d3.scale.ordinal()
            .domain(d3.range(4))
            .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

        g.append("g").selectAll("path")
            .data(chord.groups)
            .enter().append("path")
            .style("fill", function(d) { return fill(d.index); })
            .style("stroke", "#333")
            .style("opacity", 0.9)
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            .on("mouseover", fade(.1))
            .on("mouseout", fade(1));

        var ticks = g.append("g").selectAll("g")
            .data(chord.groups)
            .enter().append("g").selectAll("g")
            .data(groupTicks)
            .enter().append("g")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + outerRadius + ",0)";
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
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("opacity", 1);

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

        // Returns an event handler for fading a given chord group.
        function fade(opacity) {
            return function(g, i) {
                svg.selectAll(".chord path")
                    .filter(function(d) { return d.source.index != i && d.target.index != i; })
                    .transition()
                    .style("opacity", opacity);
            };
        }
    });
})();