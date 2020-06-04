function testing_chart(config){
    var margin = { 
        left:config.width * 0.1,
        right:config.width * 0.1, 
        top: config.height * 0.15, 
        bottom:config.height * 0.15 }
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
    var y_axis = d3.axisLeft().ticks(6).tickFormat(d3.format(".0s"))
    var y2_axis = d3.axisRight(y2).ticks(5)
    var y_axis_grid = d3.axisLeft().tickSize(-width).tickFormat('').ticks(6)

    var testingLabels = svg.append('g')
        .attr("class", "labels")

    var xAxisCall = testingLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")
        .attr("id", "x-axis")

    var yAxisCall = testingLabels.append("g")
        .attr("class", "axisWhite axis--y")


    var yGridCall = testingLabels.append('g')
        .attr("class", "axisGrid axis--y")

    var y2AxisCcall = testingLabels.append('g')
        .attr("class", "axisWhite axis--y")
        .attr("transform", "translate(" + width + ",0)")

    drawLegend();

    function drawLegend(){

    }

    

    function testing(){
        updateScales()
        draw_chart();
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
        dotRadius = (testSelection == "Weekly" ? 4 : 1)

        var group = svg.selectAll("g.layer")
            .data(stackedData, d=> d.key)

        group.exit().remove()

        group.enter().append('g')
            .classed("layer", true)
            .attr("fill", d=> color(d.key))


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

        var lines = svg.selectAll(".percent-line")
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
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3.5)

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
            .attr("fill", "steelblue")
            .attr("stroke", "#fff")
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
        draw_chart();
        return testing;
    }


    return testing;
}


