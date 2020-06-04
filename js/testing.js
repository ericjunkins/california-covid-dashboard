function testing_chart(config){
    var margin = { 
        left:config.width * 0.1,
        right:config.width * 0.1, 
        top: config.height * 0.35, 
        bottom:config.height * 0.1 }

    var dur = config.duration
    var testSelection = "Cumulative"
    var barData = [],
        lineData = []

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    dropdownX = (margin.left + width * 0.1)
    dropdownY = (margin.top*0.65)



    svg.append('text')
        .attr("transform", "translate(" + (-margin.left + dropdownX) + "," + (dropdownY-margin.top) + ")")
        .attr('x', 3)
        .attr("y", -8)
        .attr("fill", "#fff")
        .attr("font-size", "0.8rem")
        .text("Select Cumulative or Daily:")

    var dropdown = d3.select(config.selection)
        .append("select")
            .attr("class", "select-css")
            .style("position", "absolute")
            .style("top", dropdownY + "px")
            .style("left", dropdownX + "px")
            .style("width", (width/4 + "px"))
                .on("change", dropdownChange)


    


    function dropdownChange(d){
        testSelection =this.value
        updateLabels();
        updateScales();
        draw_chart();
    }

    var testingGroups = ['Tests', 'Positive', 'Percent Positive']

    dropdown.selectAll("option")
        .data(["Cumulative","Daily", "Weekly"])
        .enter()
            .append("option")
            .attr("value", d=> d)
            .text(d=> d)
    
    var color = d3.scaleOrdinal()
        .domain(testingGroups)
        .range(["#adc6e9", "#ffbc72", "#ff112b"])
    
    var x = d3.scaleTime()
        .range([0, width])
        
    var xBand = d3.scaleBand()
        .range([width * 0.01, width * 0.99])
        .padding(0.1)
    
    
    var y = d3.scaleLinear()
        .range([height, 0])

    var y2 = d3.scaleLinear()
        .range([height, 0])


    
    var x_axis = d3.axisBottom()
    var y_axis = d3.axisLeft().ticks(6).tickFormat(d3.format(".0s"))
    var y2_axis = d3.axisRight(y2).ticks(5)
    var y_axis_grid = d3.axisLeft().tickSize(-width).tickFormat('').ticks(6)

    var testingLabels = svg.append('g')

    var xAxisCall = testingLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")
        .attr("id", "x-axis")

    var yAxisCall = testingLabels.append("g")
        .attr("class", "axisWhite axis--y")


    var yGridCall = testingLabels.append('g')
        .attr("class", "axisGrid axis--y")

    var y2AxisCcall = testingLabels.append('g')
        .attr("class", "axisYellow axis--y")
        .attr("transform", "translate(" + width + ",0)")
    

    svg.append("text")
        .attr("x", width/2)
        .attr("y", -margin.top * 0.8)
        .attr("class", "title")
        .text("Testing in Los Angeles County")

    var yLabel = testingLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left/2)
        .attr("class", "axis-label")

    // testingLabels.append("g")
    //     .attr("transform", "translate(" + width + ",0)")
    //     .append('text')
    //     .attr("transform", "rotate(-90)")
    //     .attr("x", -height/2)
    //     .attr("y", margin.right/2)
    //     .attr("class", "axis-label labelYellow")
    //     .text("Percentage Positive")

    drawLegend();

    function drawLegend(){
        rectSize = 25
        rect2Start = width*0.2
        lineStart = width * 0.4
        spacing = 10
        legendGroup = svg.append("g")
            .attr("transform", "translate(" + (width *0.42) + "," + (-margin.top * 0.25) + ")")

        legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", -rectSize/2)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("class", "bar-color-2")


        legendGroup.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Tests Conducted")

        legendGroup.append("rect")
            .attr("x", rect2Start)
            .attr("y", -rectSize/2)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("class", "bar-color-1")


        legendGroup.append("text")
            .attr("x", rect2Start + rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Positive Results")

        legendGroup.append("line")
            .attr("x1", lineStart)
            .attr("x2", lineStart + rectSize)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("class", "percent-line")


        legendGroup.append("text")
            .attr("x", lineStart + rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Percent Positive")


    }

    

    function testing(){
        updateScales()
        updateLabels();
        draw_chart();
    }


    function updateLabels(){
        if (testSelection == "Cumulative") t = "Total tests to date"
        else if (testSelection == "Weekly") t = "Total tests each week"
        else if (testSelection == "Daily") t = "Tests each day"
        yLabel
            .transition().duration(dur/2)
            .attr("opacity", 0)
            .text("")
            .transition().duration(dur/2)
            .attr("opacity", 1)
            .text(t)
    }

    function updateScales(){
        barData = config.testingData[testSelection]
        offsetDay = (testSelection == "Weekly" ? 1 : 7)
        barData = barData.filter(function(d,i){
            if (i >= offsetDay) return d
        })

        xBand.domain(barData.map(d=> d.formattedDate))
        y.domain([0, Math.round(d3.max(barData, d=> d.tests))])
        lineData = []

        barData.forEach(function(d){
            d.values = [
                {
                    name: 'Positive',
                    val: d.cases
                },
                {
                    name: 'Tests',
                    val: Math.max(0, d.tests - d.cases)
                }
            ]
            //console.log(d.cases, d.tests)
            lineData.push({
                date: d.formattedDate,
                y: Math.min(100, +((d.cases/d.tests)*100).toFixed(2))
            })

        })

        y2.domain([0, Math.min(100, d3.max(lineData, d=> d.y) * 1.5)])

        var ticks = xBand.domain().filter(function(d, i){ return !( i % offsetDay ); });
        x_axis.scale(xBand).tickValues( ticks );
        y_axis.scale(y)
        y_axis_grid.scale(y)
        y2_axis.scale(y2)

        xAxisCall.transition().duration(dur).call(x_axis)
        yAxisCall.transition().duration(dur).call(y_axis)
        yGridCall.transition().duration(dur).call(y_axis_grid)
        y2AxisCcall.transition().duration(dur).call(y2_axis)
        stackedData = d3.stack()
            .keys([0,1])
            .value(function(d, i){ return d.values[i].val })
            (barData)

        stackedData.forEach(function(d, i){
            d.key = testingGroups[i]
            d.index = i
        })




    }

    function draw_chart(){
        dotRadius = (testSelection == "Weekly" ? 5 : 3)

        var group = svg.selectAll("g.layer")
            .data(stackedData, d=> d.key)

        group.exit().remove()

        group.enter().append('g')
            .attr("class", function(d){ return (d.key == "Positive" ? "bar-color-2" : "bar-color-1"); })
            .classed("layer", true)
            .attr("opacity", 1)
            //.attr("fill", d=> color(d.key))


        var bars = svg.selectAll("g.layer").selectAll("rect")
            .data(d=> d, e=> e.data.date)

        bars.exit().remove()

        bars
            .transition().duration(dur)
                .attr("width", xBand.bandwidth())
                .attr("x", function(d){ return xBand(d.data.formattedDate) })
                .attr("y", function(d){ return y(d[1]) })
                .attr("height", function(d){ return y(d[0]) - y(d[1]) })

        bars.enter().append("rect")
            .attr("width", xBand.bandwidth())
            .attr("x", function(d){ return xBand(d.data.formattedDate) })
            .attr("y", y(0))
            .attr("height", 0)
            .transition().duration(dur)
                .attr("y", function(d){ return y(d[1]) })
                .attr("height", function(d){ return y(d[0]) - y(d[1]) })

        var lines = svg.selectAll("#percent-line")
            .data([lineData], d=> d.date )

        lines.exit().remove()

        lines
            .transition().duration(dur)
            .attr("d", d3.line()
                .x(d=> xBand(d.date) + xBand.bandwidth()/2)
                .y(d=> y2(d.y))
                .curve(d3.curveMonotoneX))

        lines.enter()
            .append("path")
            //.attr("id", function(d){ console.log(d) })
            .attr("class", "percent-line")
            .attr("id", "percent-line")

            .attr("d", d3.line()
                .x(d=> xBand(d.date)  + xBand.bandwidth()/2)
                .y(d=> y2(0))
                .curve(d3.curveMonotoneX))

            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> xBand(d.date) + xBand.bandwidth()/2)
                    .y(d=> y2(d.y))
                    .curve(d3.curveMonotoneX))


        circles = svg.selectAll(".percent-marker")
            .data(lineData, d=> d.date)

        circles.exit()
            //.transition().duration(dur)
            .attr('r', 0)
            .remove()

        circles
            .transition().duration(dur)
            .attr("cx", d=> xBand(d.date) + xBand.bandwidth()/2)
            .attr("cy", d=> y2(d.y))
            .attr("r", dotRadius)

        circles.enter()
            .append('circle')
            .attr("class", "percent-marker")
            .attr("cx", d=> xBand(d.date) + xBand.bandwidth()/2)
            .attr("cy", y2(0))
            .attr("r", 0)
            .transition().duration(dur)
                .attr("r", dotRadius)
                .attr("cy", d=> y2(d.y))

    }

    testing.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return testing;
    }

    testing.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return testing;
    }

    testing.selection = function(value){
        if (!arguments.length) return testSelection;
        testSelection = value;
        updateScales();
        updateLabels();
        draw_chart();
        return testing;
    }


    return testing;
}


