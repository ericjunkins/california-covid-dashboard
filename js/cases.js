function cases_line_chart(config){
    // var margin = { 
    //     left:config.width * 0.1,
    //     right:config.width * 0.02, 
    //     top: config.height * 0.25, 
    //     bottom:config.height * 0.1 }

    var margin = {
        bottom: 50,
        left: 110,
        right: 60,
        top: 66
    }
    

    var dur = config.duration
    
    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    bisectDate = d3.bisector(function(d) { 
        
        return parseTime(d.date); }).left

    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")
    

    var lineChartSelection = "Los Angeles",
        cas = []

    defaultWidth = 899  
    defaultHeight = 365 
    
    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
            .classed("svg-content", true)
            .append("g")

                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    var casesTooltip = d3.select("#cases-tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")

    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom

    var hoverLine;

    var x1 = d3.scaleBand()
        .range([0, width])
        .padding(0.08)


    var y1 = d3.scaleLinear()
        .range([height, 0])

    var y2 = d3.scaleLinear()
        .range([height, 0])

    var x1_axis = d3.axisBottom()
    var y1_axis = d3.axisLeft().ticks(5)
    var y2_axis = d3.axisRight().ticks(5)


    var x1AxisCall,
        y1AxisCall,
        y2AxisCall

    var chart = svg.append("g")
    
    var caseAverageLine

    function drawAxes(){

        x1AxisCall = chart.append('g')
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("class", "axisWhite axis--x")


        y1AxisCall = chart.append("g")
            .attr("class", "axisWhite axis--y")

        y2AxisCall = chart.append("g")
            .attr("transform", "translate(" + width + "," + 0 + ")")
            .attr("class", "axisWhite axis--y")

    }


    function lineChart(){
        drawAxes();
        drawInit();
        drawLegend();
        updateScales();
        draw_chart();
    }

    function drawInit(){
        caseAverageLine = chart.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y1(0))
            .attr("y2", y1(0))
            .attr("class", "threshold-line")


        // chart.append('text')
        //     .attr("x", width/2)
        //     .attr("y",  - margin.top * 0.6)
        //     .attr("class", "title")
        //     .text("New Cases Per Day")

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left/2)
            .attr("class", "axis-label")
            .text("Cases")

    }
    
    function drawLegend(){
        rectSize = width * 0.025
        spacing = width*0.01
        caseLegWidth = width * 0.8

        var legendGroup = svg.append('g')
            .attr("transform", "translate(" + (width * 0.2) + "," + (-margin.top * 0.7) + ")")

        var leg1 = legendGroup.append("g")
            .attr("transform", "translate(" + (width * 0) + "," + (0) + ")")

        var leg2 = legendGroup.append("g")
            .attr("transform", "translate(" + (width * 0.3) + "," + (0) + ")")

        leg1.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "case-line")

        leg1.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Cases Per 100k")

        leg2.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "line-yellow")

        leg2.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Average Threshold for Reopen")

        hoverLine = chart.append("line")
            .attr("y2", height)
            .attr("class", "hover-line")
            .attr("opacity", 0)
    }

    function updateScales(){
        cas = config.criteria.filter(d=> d.county == lineChartSelection)[0]
        x1Dates = cas.chartData.map(d=> d.formattedDate)

        caseThreshold = 25 * (cas.population/100000)

        // cas.chartData.forEach(function(d){
        //     d.normalizedCases = d.caseIncrease * (100000/cas.population)
        // })

        cas.roadmapCase = d3.sum(cas.chartData, d=> d.normalizedCases)
        y1Max = d3.max(cas.chartData, d=> d.normalizedCases)
        y2Max = d3.max(cas.chartData, d=>d.binnedNewCase)


        x1.domain(x1Dates)
        y1.domain([0, y1Max])
        y2.domain([0, y2Max])

        var x1ticks = x1.domain().filter(function(d, i){ return !( i % 2 ); });

        x1_axis.scale(x1).tickValues( x1ticks );
        y1_axis.scale(y1)
        y2_axis.scale(y2)
        

        x1AxisCall.transition().duration(dur).call(x1_axis)
        y1AxisCall.transition().duration(dur).call(y1_axis)
        y2AxisCall.transition().duration(dur).call(y2_axis)

        caseAverageLine
            .transition().duration(dur)
            .attr("y1", y1(25/14))
            .attr("y2", y1(25/14))


    }

    function draw_chart(){
        draw_cases();
    }

    function draw_cases(){
        var casesLine = chart.selectAll(".case-line")
            .data([cas.chartData], d=> d.formattedDate)

        casesLine.exit().remove()

        casesLine
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate) + x1.bandwidth()/2)
                    .y(d=> y1(d.normalizedCases))
                    .curve(d3.curveMonotoneX)
                )

        casesLine.enter()
            .append('path')
            .attr("class", "case-line")
            .attr("d", d3.line()
                .x(function(d){
                    return x1(d.formattedDate)  + x1.bandwidth()/2})
                .y(y1(0))
                .curve(d3.curveMonotoneX)
            )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate) + x1.bandwidth()/2)
                    .y(d=> y1(d.normalizedCases))
                    .curve(d3.curveMonotoneX)
                )


        var circles = chart.selectAll("circle")
            .data(cas.chartData, d=> d.formattedDate)

        circles.exit()
            .transition().duration(dur)
            .attr("cy", y1(0))
            .attr("r", 0)
            .remove()

        circles
            .transition().duration(dur)
            .attr("cx", d=> x1(d.formattedDate) + x1.bandwidth()/2)
            .attr("cy", d=> y1(d.normalizedCases))

        circles.enter()
            .append("circle")
            .attr("class", "dot-marker")
            .attr("id", function(d,i){ return "dot-" + i; })
            .attr("cx", d=> x1(d.formattedDate) + x1.bandwidth()/2)
            .attr("r", 4)
            .attr("cy", y1(0))
            .transition().duration(dur)
            .attr("cy", d=> y1(d.normalizedCases))

        chart.append('rect')
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

        // var dailyCase = chart.selectAll(".daily-case-line")
        //     .data([cas.chartData], d=> d.formattedDate)

        // dailyCase.exit().remove()

        // dailyCase
        //     .transition().duration(dur)
        //         .attr("d", d3.line()
        //             .x(d=> x1(d.formattedDate) + x1.bandwidth()/2)
        //             .y(d=> y2(d.binnedNewCase))
        //             .curve(d3.curveMonotoneX)
        //         )

        // dailyCase.enter()
        //     .append('path')
        //     .attr("class", "daily-case-line")
        //     .attr("d", d3.line()
        //         .x(function(d){
        //             return x1(d.formattedDate)  + x1.bandwidth()/2})
        //         .y(y2(0))
        //         .curve(d3.curveMonotoneX)
        //     )
        //     .transition().duration(dur)
        //         .attr("d", d3.line()
        //             .x(d=> x1(d.formattedDate) + x1.bandwidth()/2)
        //             .y(d=> y2(d.binnedNewCase))
        //             .curve(d3.curveMonotoneX)
        //         )
    }

    function mouseover(d){
        casesTooltip
            .transition().duration(250)
            .style("opacity", 1)
    }

    x1.invert = function(){
        var domain = x1.domain()
        var range = x1.range()
        var scale = d3.scaleQuantize().domain(range).range(domain)

        return function(x){
            return scale(x)
        }
    }


    curElementSelection = -1

    function mousemove(d){
        var mouseX = d3.mouse(this)[0] - x1.bandwidth()/2

        i = Math.round(mouseX/width  * x1.domain().length)
        curDate = x1.domain()[i]
        curElement = cas.chartData.filter(d => d.formattedDate == curDate)[0]

        

        d3.selectAll(".dot-marker")
            .transition().duration(100)
            .attr("r", function(d, index){
                return (index == i ? 8: 4)
            })          
        

        tmpX = event.pageX - d3.mouse(this)[0] + x1(curElement.formattedDate) + x1.bandwidth()/2
        tmpY = event.pageY - d3.mouse(this)[1] + y1(curElement.normalizedCases)
        
        hoverLine
            .attr("opacity", 1)
            .attr("x1", x1(curElement.formattedDate) + x1.bandwidth()/2)
            .attr("x2", x1(curElement.formattedDate) + x1.bandwidth()/2)
            .attr("y1", y1(curElement.normalizedCases))

        curElementSelection = i

        casesTooltip
            // .style("left", x1(curElement.formattedDate) + x1.bandwidth()/2 + 150 + "px")
            // .style("top", y1(curElement.normalizedCases) - 50 + "px")
            .style("left", tmpX + 15 + "px")
            .style("top", tmpY + "px")
            

        table = d3.select("#cases-table").selectAll("td")
        vals = [curElement.formattedDate, Math.round(curElement.normalizedCases), Math.round(curElement.normalizedCases) - 5, curElement.cases, curElement.deaths]

        table.each( function(d, i, f){
            d3.select(this).text(vals[i])
        })
        
    }

    function mouseout(d){
        hoverLine
            .transition().duration(250)
            .attr("opacity", 0)
        // d3.selectAll(".dot-marker")
        //     .transition().duration(250)
        //     .attr("r", 4)

        casesTooltip
            .transition().duration(250)
            .style("opacity", 0)

        d3.selectAll(".dot-marker")
            .transition().duration(100)
            .attr("r", 4)   
    }

    function clicked(d){

    }


    lineChart.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return lineChart;
    }

    lineChart.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return lineChart;
    }

    lineChart.selection = function(value){
        if (!arguments.length) return testSelection;
        lineChartSelection = value;
        updateScales();
        draw_chart();
        return lineChart;
    }


    return lineChart;
}


