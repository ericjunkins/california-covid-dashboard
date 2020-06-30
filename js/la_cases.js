function laCases_chart(config){
    var margin = {
        bottom: 60,
        left: 140,
        right: 60,
        top: 80
    }

    var dur = config.duration
    var laCaseSelection = 'newCases'
    defaultWidth = 900
    defaultHeight = 500


    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d")

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
    
    var x = d3.scaleBand()
        .range([width * 0.01, width * 0.99])
        .padding(0.08)

    var y = d3.scaleLinear()
        .range([height, 0])

    var x_axis = d3.axisBottom()
    var y_axis = d3.axisLeft().ticks(6)

    var laCaseLabels = svg.append("g")
    var chart = svg.append('g')

    var xAxisCall = laCaseLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")
        .attr("id", "la-x-axis")

    var yAxisCall = laCaseLabels.append("g")
        .attr("class", "axisWhite axis--y")


        
    function drawLabels(){
        laCaseLabels.append('text')
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left*0.6)
            .attr("class", "axis-label")
            .text("Cases Per Day")

    }

    function drawLegend(){    
        rectSize = 20
        spacing = 10
        legendGroup = svg.append("g")
            .attr("transform", "translate(" + (width *0.2) + "," + (-margin.top * 0.4) + ")")

        var leg1 = legendGroup.append("g")

        var leg2 = legendGroup.append("g")
            .attr("transform", "translate(" + (width *0.3) + "," + (0) + ")")

        leg1.append("line")
            .attr("x1", 0)
            .attr("x2", 0 + rectSize)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("class", "case-line")

        leg1.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("7-day Average")

        leg2.append("rect")
            .attr("x", 0)
            .attr("y", -rectSize/2)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("fill", "#ababab")

        leg2.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Daily Value")
            
    }


    function updateScales(){
        
        laData = config.countyData.filter(d=> d.county == "Los Angeles")[0].fullData
        laData.forEach(function(d){
            d.formattedDate = formatTime(parseTime(d.date))
        })
        

        dates = laData.map(d=> d.formattedDate)
        offsetDay = Math.round(dates.length/10)
        
        var yMax = d3.max(laData, d=> d[laCaseSelection])
        y.domain([0, yMax * 1.2])
        x.domain(dates)

        var ticks = x.domain().filter(function(d, i){ return !( i % offsetDay ); });

        x_axis.scale(x).tickValues( ticks );
        y_axis.scale(y)

        xAxisCall.transition().duration(dur).call(x_axis)
        yAxisCall.transition().duration(dur).call(y_axis)


    }

    

    function laCases(){
        drawLabels();
        drawLegend();
        updateScales();
        drawChart();
    }


    function drawChart(){
        var rects = chart.selectAll("rect")
            .data(laData, d=> d.formattedDate)

        rects.exit().remove()

        rects.enter()
            .append('rect')
            .attr("x", d=> x(d.formattedDate))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "#ababab")
            .attr("opacity", 0.4)
            .transition().duration(dur)
                .attr("y", d=> y(d[laCaseSelection]))
                .attr("height", d=> y(0) - y(d[laCaseSelection]))

        var lines = chart.selectAll("#cases-line")
            .data([laData], d=> d.formattedDate)

        lines.enter()
            .append("path")
            .attr("class", "case-line")
            .attr("id", "cases-line")
            .attr("d", d3.line()
                .x(d=> x(d.formattedDate) + x.bandwidth()/2)
                .y(y(0))
                .curve(d3.curveMonotoneX)
                )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x(d.formattedDate) + x.bandwidth()/2)
                    .y(d=> y(d.binnedNewCase))
                    .curve(d3.curveMonotoneX)
                    )


    }


    laCases.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return laCases;
    }

    laCases.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return laCases;
    }

    return laCases;
}


