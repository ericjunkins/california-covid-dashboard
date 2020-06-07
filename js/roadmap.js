function roadmap_chart(config){
    var margin = { 
        left:config.width * 0.1,
        right:config.width * 0.1, 
        top: config.height * 0.25, 
        bottom:config.height * 0.1 }

    var dur = config.duration
    
    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")

    var roadmapSelection = "Los Angeles",
        hos = [],
        cas = [],
        hospFlag = true

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    


    // console.log(config.hospitalData)
    // console.log(config.criteria)

    var vspacing = height*0.2,
        wspacing = width *0.1
        height1 = height*0.5 - vspacing/2,
        height2 = 0
        width1 = width * 0.5 - wspacing/2,
        width2 = width1 + wspacing

    var x1 = d3.scaleBand()
        .range([0, width1])
        .padding(0.08)

    var x2 = d3.scaleBand()
        .range([width2, width])
        .padding(0.08)

    var y1 = d3.scaleLinear()
        .range([height, 0])

    var y2 = d3.scaleLinear()
        .range([height, 0])

    var y3 = d3.scaleLinear()
        .range([height, 0])
    
    var chart1 = svg.append('g')
        .attr("class", "roadmap-cases")

    var chart2 = svg.append("g")
        .attr("class", "roadmap-hospital")
        .attr("transform", "translate(" + 0 + ",0)")


    var chart2graph = chart2.append("g")
        .attr("id", "hospital-chart")

    var x1_axis = d3.axisBottom()
    var x2_axis = d3.axisBottom()
    var y1_axis = d3.axisLeft().ticks(6)
    var y2_axis = d3.axisLeft().ticks(6)
    var y3_axis = d3.axisRight().ticks(6)

    var x1AxisCall,
        x2AxisCall,
        y1AxisCall,
        y2AxisCall,
        y3AxisCall

    
    var caseAverageLine

    function drawAxes(){

        x1AxisCall = chart1.append('g')
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("class", "axisWhite axis--x")

        x2AxisCall = chart2.append('g')
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("class", "axisWhite axis--x")

        y1AxisCall = chart1.append("g")
            .attr("class", "axisWhite axis--y")

        y2AxisCall = chart2.append("g")
            .attr("transform", "translate(" + width2 + "," + 0 + ")")
            .attr("class", "axisWhite axis--y")

        y3AxisCall = chart2.append("g")
            .attr("transform", "translate(" + width2 + "," + 0 + ")")
            .attr("class", "axisYellow axis--y")

    }

    var hospLines = [
        {name: 'zero', val: 0, class: 'zero-line'},
        {name: 'thresh', val: 5, class: 'threshold-line'}
    ]

    function roadmap(){
        drawAxes();
        drawInit();
        drawLegend();
        updateScales();
        draw_chart();
    }

    function drawInit(){
        caseAverageLine = chart1.append("line")
            .attr("x1", 0)
            .attr("x2", width1)
            .attr("y1", y1(0))
            .attr("y2", y1(0))
            .attr("class", "threshold-line")


        chart1.append('text')
            .attr("x", width1/2)
            .attr("y",  - margin.top * 0.6)
            .attr("class", "title")
            .text("New Cases Per Day")

        chart1.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left/2)
            .attr("class", "axis-label")
            .text("Normalized Cases")


        chart2.append("g")
            .attr("transform", "translate(" + width2 + "," + 0 + ")")
            .append('text')
                .attr("x", (width - width2)/2)
                .attr("y", - margin.top*0.6)
                .attr("class", "title")
                .text("Hospitalized Patients")

        chart2.append("g")
            .attr("transform", "translate(" + width2 + "," + 0 + ")")
            .append('text')
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", -margin.left/2)
                .attr("class", "axis-label")
                .text("Percent Change")



    }
    
    function drawLegend(){
        rectSize = width * 0.025
        spacing = width*0.01
        caseLegWidth = width1 * 0.8

        var legendGroup = svg.append('g')
            .attr("transform", "translate(" + (0) + "," + (height2 - vspacing/2) + ")")

        var caseLegendGroup = legendGroup.append("g")
            .attr("transform", "translate(" + (width1 * 0.2) + "," + (0) + ")")

        var hosLegendGroup = legendGroup.append("g")
            .attr("transform", "translate(" + (width2 + width2 * 0.2) + "," + (0) + ")")

        caseLegendGroup.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "case-line")

        caseLegendGroup.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Reported")


        caseLegendGroup.append('line')
            .attr('x1', rectSize*3 + spacing*3)
            .attr('y1', 0)
            .attr('x2', rectSize*4 + spacing*3)
            .attr('y2', 0)
            .attr("class", "line-yellow")

        caseLegendGroup.append("text")
            .attr("x", rectSize*4 + spacing*4)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Average threshold")


        hosLegendGroup.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "percent-hosp-line")

        hosLegendGroup.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Reported")

        hosLegendGroup.append('line')
            .attr('x1', rectSize*4 + spacing*3)
            .attr('y1', 0)
            .attr('x2', rectSize*5 + spacing*3)
            .attr('y2', 0)
            .attr("class", "threshold-line")

        hosLegendGroup.append("text")
            .attr("x", rectSize*5 + spacing*4)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Daily threshold")

    }

    function updateScales(){
        hos = config.hospitalData[roadmapSelection]
        cas = config.criteria.filter(d=> d.county == roadmapSelection)[0]

        //Get last 2 weeks of data
        hos = hos.filter(function(d, i){
            if (i >= hos.length - 14) return d
        })
        // console.log('cases', cas)

        x1Dates = cas.chartData.map(d=> d.formattedDate)
        x2Dates = hos.map(d=> d.formattedDate)

        caseThreshold = 25 * (cas.population/100000)

        cas.chartData.forEach(function(d){
            d.normalizedCases = d.caseIncrease * (100000/cas.population)
        })



        cas.roadmapCase = d3.sum(cas.chartData, d=> d.normalizedCases)
        y1Max = d3.max(cas.chartData, d=> d.normalizedCases)
        y2Max = d3.max(hos, d=> d.covidPercentThresh) * 1.2

        y2extent = d3.extent(hos, d=> d.covidPercentChange)
        y2Min = Math.min(y2extent[0]*1.2, -5)
        y2Max = Math.max(y2extent[1]*1.2, 7)


        if (!(y2extent[1] - y2extent[0])){
            hospFlag = false;

        } else {
            hospFlag = true;
            y2.domain([y2Min, y2Max])
            y2_axis.scale(y2)
            y2AxisCall.transition().duration(dur).call(y2_axis)
        }

        x1.domain(x1Dates)
        x2.domain(x2Dates)
        y1.domain([0, y1Max])

        var x1ticks = x1.domain().filter(function(d, i){ return !( i % 2 ); });
        var x2ticks = x2.domain().filter(function(d, i){ return !( i % 2 ); });


        x1_axis.scale(x1).tickValues( x1ticks );
        x2_axis.scale(x2).tickValues( x2ticks );
        y1_axis.scale(y1)
        


        x1AxisCall.transition().duration(dur).call(x1_axis)
        y1AxisCall.transition().duration(dur).call(y1_axis)

        x2AxisCall.transition().duration(dur).call(x2_axis)
        

        caseAverageLine
            .transition().duration(dur)
            .attr("y1", y1(25/14))
            .attr("y2", y1(25/14))


    }

    function draw_chart(){
        draw_cases();
        draw_hospitals2();
    }

    function draw_hospitals2(){
        field="covidPercentChange"

        if (!hospFlag){
            hos = []
            hospLinesDisplay = []
            displayText = [{text: "No New Hospitalizations!", family: "Times New Roman"}]
        }
        else {
            hospLinesDisplay = hospLines
            displayText = []
        }


        var texts = chart2graph.selectAll("text")
            .data(displayText, d=> d.text)

        texts.exit()
            .transition().duration(dur/2)
            .attr('opacity', 0)
            .remove()

        texts.enter()
            .append("text")
            .attr("x", width2 + (width - width2)/2)
            .attr("y", height2 + (height - height2)/2)
            .attr("class", "affirmation")
            .attr("font-size", "1.5em")
            .attr("font-family", d=> d.family)
            .text(d=> d.text)
            .attr("opacity", 0)
            .transition().duration(dur)
            .attr("opacity", 1)
            


        // var rects = chart2graph.selectAll("rect")
        //     .data(hos, d=> d.formattedDate)

        // rects.exit()
        //     .transition().duration(dur)
        //         .attr("y", y2(0))
        //         .attr("height", 0)
        //     .remove()

        // rects
        //     .transition().duration(dur)
        //         .attr("y", d=> y2(d[field] < 0 ? 0 : d[field]))
        //         .attr("height", d=> Math.abs(y2(d[field]) - y2(0)))
        //         .attr("x", d=> x2(d.formattedDate))
        //         .attr("width", x2.bandwidth())


        // rects.enter()
        //     .append('rect')
        //     .attr("class", "bar-color-2")
        //     .attr("x", d=> x2(d.formattedDate))
        //     .attr("y", y2(0))
        //     .attr("width", x2.bandwidth())
        //     .attr("height", 0)

        //     .transition().duration(dur)
        //         .attr("y", function(d){
        //            return y2(d[field] < 0 ? 0 : d[field] ) })
        //         .attr("height", d=> Math.abs(y2(d[field]) - y2(0)))

        var percentHosp = chart2graph.selectAll(".percent-hosp-line")
            .data([hos], d=> d.formattedDate)

        percentHosp.exit()
            .transition().duration(dur)
            .attr("d", d3.line()
                .y(y2(0))
                .curve(d3.curveMonotoneX)
            )
            .remove()

        percentHosp
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x2(d.formattedDate))
                    .y(d=> y2(d[field]))
                    .curve(d3.curveMonotoneX)
                )

        percentHosp.enter()
            .append("path")
            .attr("class", "percent-hosp-line")
            .attr("d", d3.line()
                .x(function(d){
                    return x2(d.formattedDate) })
                .y(y2(0))
                .curve(d3.curveMonotoneX)
            )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x2(d.formattedDate))
                    .y(d=> y2(d[field]))
                    .curve(d3.curveMonotoneX)
                )


        lines = chart2graph.selectAll(".hosp-lines")
            .data(hospLinesDisplay)

        lines.exit()
            .transition().duration(dur)
            .attr("opacity", 0)
            .remove()
        
        lines
            .raise()
            .transition().duration(dur)
            .attr("y1", d=> y2(d.val))
            .attr("y2", d=> y2(d.val))

        lines.enter()
            .append('line')
            .attr("opacity", 0)
            .attr("class", d=> d.class + " hosp-lines")
            .attr("x1", x2(x2.domain()[0]))
            .attr("x2", x2(x2.domain()[x2.domain().length -1]))
            .attr("y1", d=> y2(d.val))
            .attr("y2", d=> y2(d.val))

            .transition().duration(dur)
            .attr("opacity", 1)

    }

    function draw_hospitals(){
        var rects = chart2.selectAll("rect")
            .data(hos, d=> d.formattedDate)

        rects.exit().remove()

        rects
            .transition().duration(dur)
                .attr("y", d=> y2(d[field]))
                .attr("height", d=> y2(0) - y2(d[field]))
                .attr("x", d=> x2(d.formattedDate))
                .attr("width", x2.bandwidth())


        rects.enter()
            .append('rect')
            .attr("class", "bar-color-2")
            .attr("x", d=> x2(d.formattedDate))
            .attr("y", y2(0))
            .attr("width", x2.bandwidth())
            .attr("height", 0)

            .transition().duration(dur)
                .attr("y", function(d){ return y2(d.covidPatientsAvg); })
                .attr("height", d=> y2(0) - y2(d.covidPatientsAvg))

        var hospThresh = chart2.selectAll(".line-yellow")
            .data([hos], d=> d.formattedDate)
    
        hospThresh.exit().remove()

        hospThresh
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x2(d.formattedDate)  + x2.bandwidth()/2)
                    .y(d=> y2(d.covidPercentThresh))
                    .curve(d3.curveMonotoneX)
                )

        hospThresh.enter()
            .append('path')
            .attr("class", "line-yellow")
            .attr("d", d3.line()
                .x(function(d){ return x2(d.formattedDate) + x2.bandwidth()/2})
                .y(y1(0))
                .curve(d3.curveMonotoneX)
            )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x2(d.formattedDate)  + x2.bandwidth()/2)
                    .y(function(d){
                        return y2(d.covidPercentThresh)
                    })
                    .curve(d3.curveMonotoneX)
                )


    }

    function draw_cases(){
        var casesLine = chart1.selectAll(".case-line")
            .data([cas.chartData], d=> d.formattedDate)

        casesLine.exit().remove()

        casesLine
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate))
                    .y(d=> y1(d.normalizedCases))
                    .curve(d3.curveMonotoneX)
                )

        casesLine.enter()
            .append('path')
            .attr("class", "case-line")
            .attr("d", d3.line()
                .x(function(d){
                    return x1(d.formattedDate) })
                .y(y1(0))
                .curve(d3.curveMonotoneX)
            )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate))
                    .y(d=> y1(d.normalizedCases))
                    .curve(d3.curveMonotoneX)
                )
    }


    roadmap.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return roadmap;
    }

    roadmap.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return roadmap;
    }

    roadmap.selection = function(value){
        if (!arguments.length) return testSelection;
        roadmapSelection = value;
        updateScales();
        draw_chart();
        return roadmap;
    }


    return roadmap;
}


