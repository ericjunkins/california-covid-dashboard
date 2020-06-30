function rankingLegend_chart(config){

    var margin = {
        bottom:30,
        left: 60,
        right: 60,
        top: 0
    }


    defaultWidth = 1120
    defaultHeight = 50
    var dur = config.duration

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
            .classed("svg-content", true)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom
    

    var barWidth = width * 0.07,
        barHeight = 10,
        spacing = barWidth*0.3

    var colors = ["#ababab", "#badee8", "#f2df91",  '#ffae43', '#ff6e0b', '#8c0804']
    var texts = ["None", "Falling", "Flat", "", "Rising", ""]
    var xLocs = [
        0,
        barWidth + spacing,
        barWidth*2 + spacing*2,
        barWidth*3 + spacing*3,
        barWidth*4 + spacing*3,
        barWidth*5 + spacing*3,
    ]

    var data = []

    for (var i=0; i< colors.length; i++){
        data.push({
            x: xLocs[i],
            y: 0,
            text: texts[i],
            fill: colors[i]
        })
    }

    legendGroup = svg.append('g')
        .attr("transform", "translate(" + width*0.52 + "," + 5 + ")");

    legendGroup.selectAll("rect")
        .data(data, d=> d.x)
        .enter()
            .append("rect")
            .attr("x", d=> d.x)
            .attr("y", d=> d.y)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr('fill', d=> d.fill)

    legendGroup.selectAll("text")
        .data(data, d=> d.x)
        .enter()
            .append('text')
            .attr("text-anchor", "middle")
            .attr("x", d=> d.x + barWidth/2)
            .attr("y", barHeight+ 15)
            .attr("fill", "#fff")
            .text(d=> d.text)

    function rankingLegend(){        

    }

    function draw_chart(){
    }

    rankingLegend.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return rankingLegend;
    }

    rankingLegend.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return rankingLegend;
    }

    rankingLegend.selection = function(value){
        if (!arguments.length) return testSelection;
        testSelection = value;
        updateScales();
        updateLabels();
        draw_chart();
        return rankingLegend;
    }


    return rankingLegend;
}


