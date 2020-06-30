function testing_chart(config){
    // var margin = { 
    //     left:config.width * 0.1,
    //     right:config.width * 0.1, 
    //     top: config.height * 0.35, 
    //     bottom:config.height * 0.1 }


    var margin = {
        bottom: 60,
        left: 140,
        right: 60,
        top: 50
    }

    var dur = config.duration
    var testSelection = "Cumulative"
    var barData = [],
        lineData = []

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")


    defaultWidth = 900
    defaultHeight = 380


    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
            .classed("svg-content", true)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var chart = svg.append("g")
    var testingTooltip = d3.select("#testing-tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")

    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom
    

    var testingGroups = ['Tests', 'Positive', 'Percent Positive']

    
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
    // var y_axis = d3.axisLeft().ticks(4).tickFormat(d3.format(".0s"))
    var y_axis = d3.axisLeft().ticks(4)
    var y2_axis = d3.axisRight(y2).ticks(4).tickFormat(d3.format(".0%"))
    var y_axis_grid = d3.axisLeft().tickSize(-width).tickFormat('').ticks(4)

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
    

    // svg.append("text")
    //     .attr("x", width/2)
    //     .attr("y", -margin.top * 0.8)
    //     .attr("class", "title")
    //     .text("Testing in Los Angeles County")

    var yLabel = testingLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left*0.6)
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

    var hoverLine;

    function drawLegend(){
        rectSize = 15
        rect2Start = width*0.3
        lineStart = width * 0.55
        spacing = 10
        legendGroup = svg.append("g")
            .attr("transform", "translate(" + (width *0.1) + "," + (-margin.top * 0.65) + ")")

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
            .text("Positive Tests")

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

        hoverLine = chart.append("line")
            .attr("y2", height)
            .attr("class", "hover-line")
            .attr("opacity", 0)
    }

    

    function testing(){
        updateScales()
        updateLabels();
        draw_chart();
    }


    function updateLabels(){
        if (testSelection == "Cumulative") t = "Total Tests"
        else if (testSelection == "Weekly") t = "Tests each week"
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
        //barData = config.testingData[testSelection]
        barData = config.tracking[testSelection]

        offsetDay = (testSelection == "Weekly" ? 1 : 7)
        barData = barData.filter(function(d,i){
            if (i >= offsetDay) return d
        })

        xBand.domain(barData.map(d=> d.formattedDate))
        y.domain([0, Math.round(d3.max(barData, d=> d.tests))*1.5])
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
                y: Math.min(1, +((d.cases/d.tests)*1).toFixed(4))
            })
        })


        y2.domain([0, Math.min(100, d3.max(lineData, d=> d.y) * 1)])

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

        var group = chart.selectAll("g.layer")
            .data(stackedData, d=> d.key)

        group.exit().remove()

        group.enter().append('g')
            .attr("class", function(d){ return (d.key == "Positive" ? "bar-color-2" : "bar-color-1"); })
            .classed("layer", true)
            .attr("opacity", 1)
            //.attr("fill", d=> color(d.key))


        var bars = chart.selectAll("g.layer").selectAll("rect")
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

        var lines = chart.selectAll("#percent-line")
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


        circles = chart.selectAll(".percent-marker")
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

        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', "#fff")
            .attr("fill-opacity", 0)
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)

    }

    xBand.invert = function(){
        var domain = xBand.domain()
        var range = xBand.range()
        var scale = d3.scaleQuantize().domain(range).range(domain)

        return function(x){
            return scale(x)
        }
    }

    function mouseover(d){
        testingTooltip
            .transition().duration(250)
            .style("opacity", 1)
            
    }



    function mousemove(d){
        var mouseX = d3.mouse(this)[0] - xBand.bandwidth()/2

        i = Math.round(mouseX/width  * xBand.domain().length)
        curDate = xBand.domain()[i]
        curElement = config.tracking[testSelection].filter(function(d){
            return d.formattedDate == curDate
        })[0]

  
        percent = (curElement.cases/ curElement.tests)
        tmpX = event.pageX - d3.mouse(this)[0] + xBand(curElement.formattedDate) + xBand.bandwidth()/2
        tmpY = event.pageY - d3.mouse(this)[1] + y2(percent)
        

        hoverLine
            .raise()
            .attr("opacity", 1)
            .attr("x1", xBand(curElement.formattedDate) + xBand.bandwidth()/2)
            .attr("x2", xBand(curElement.formattedDate) + xBand.bandwidth()/2)
            .attr("y1", y2(percent))

        testingTooltip
            .style("left", tmpX + -300 + "px")
            .style("top", tmpY + "px")
            

        table = d3.select("#testing-table").selectAll("td")
        vals = [
                curElement.formattedDate, 
                curElement.values[1].val, 
                curElement.tests, 
                curElement.values[0].val,
                (percent).toFixed(2) + "%"
            ]

        table.each( function(d, i, f){
            d3.select(this).text(vals[i])
        })
    }

    function mouseout(d){
        hoverLine
            .transition().duration(250)
            .attr("opacity", 0)

        testingTooltip
            .transition().duration(250)
            .style("opacity", 0)

        // d3.selectAll(".hosp-dot")
        //     .transition().duration(100)
        //     .attr("r", 4)   
    }

    function clicked(d){
        
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


