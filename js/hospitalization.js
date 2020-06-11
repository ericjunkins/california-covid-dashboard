function hospital_line_chart(config){
    // var margin = { 
    //     left:config.width * 0.1,
    //     right:config.width * 0.02, 
    //     top: config.height * 0.25, 
    //     bottom:config.height * 0.1 }

    var margin = {
        bottom: 25,
        left: 110,
        right: 60,
        top: 66
    }
        

    var dur = config.duration

    defaultWidth = 899  
    defaultHeight = 265 

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")

    var lineChartSelection = "Los Angeles",
        hos = [],
        hospFlag = true

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
            .classed("svg-content", true)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    var hospTooltip = d3.select("#hosp-tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")

    // console.log(config.hospitalData)
    // console.log(config.criteria)

    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom

    var x1 = d3.scaleBand()
        .range([0, width])
        .padding(0.08)


    var y1 = d3.scaleLinear()
        .range([height, 0])


    var chart = svg.append('g')
        .attr("class", "lineChart-hospitals")

    var chartGraph = chart.append("g")
        .attr("id", "hospital-chart")

    var x1_axis = d3.axisBottom()
    var y1_axis = d3.axisLeft().ticks(6).tickFormat(d3.format(".0%"))


    var x1AxisCall,
        y1AxisCall


    function drawAxes(){

        x1AxisCall = chart.append('g')
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("class", "axisWhite axis--x")

        y1AxisCall = chart.append("g")
            .attr("class", "axisWhite axis--y")


    }

    var hospLines = [
        {name: 'zero', val: 0, class: 'zero-line'},
        {name: 'thresh', val: 5/100, class: 'threshold-line'}
    ]

    function lineChart(){
        drawAxes();
        drawInit();
        drawLegend();
        updateScales();
        draw_chart();
    }

    function drawInit(){

        // chart.append('text')
        //     .attr("x", width/2)
        //     .attr("y", - margin.top*0.6)
        //     .attr("class", "title")
        //     .text("Hospitalized Patients")

        chart.append('text')
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left/2)
            .attr("class", "axis-label")
            .text("Percent")



    }
    
    var hoverLine;

    function drawLegend(){
        rectSize = width * 0.025
        spacing = width*0.01
        caseLegWidth = width * 0.8

        var legendGroup = svg.append('g')
            .attr("transform", "translate(" + (width * 0.15) + "," + (-margin.top * 0.7) + ")")


        var leg1 = legendGroup.append("g")
            .attr("transform", "translate(" + (width * 0) + "," + (0) + ")")

        var leg2 = legendGroup.append("g")
            .attr("transform", "translate(" + (width * 0.4) + "," + (0) + ")")

        leg1.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "percent-hosp-line")

        leg1.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Daily Percent Change")

        leg2.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', rectSize)
            .attr('y2', 0)
            .attr("class", "threshold-line")

        leg2.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Daily Threshold")

        hoverLine = chartGraph.append("line")
            .attr("y2", height)
            .attr("class", "hover-line")
            .attr("opacity", 0)


    }

    function updateScales(){
        hos = config.hospitalData[lineChartSelection]
        //Get last 2 weeks of data
        hos = hos.filter(function(d, i){
            if (i >= hos.length - 14) return d
        })
        // console.log('cases', cas)

        x1Dates = hos.map(d=> d.formattedDate)

        y1extent = d3.extent(hos, d=> d.covidPercentChange)
        y1Min = Math.min(y1extent[0]*1.2, -5/100)
        y1Max = Math.max(y1extent[1]*1.2, 7/100)


        if (!(y1extent[1] - y1extent[0])){
            hospFlag = false;

        } else {
            hospFlag = true;
            y1.domain([y1Min, y1Max])
            y1_axis.scale(y1)
            y1AxisCall.transition().duration(dur).call(y1_axis)

            x1.domain(x1Dates)
            var x1ticks = x1.domain().filter(function(d, i){ return !( i % 2 ); });
            x1_axis.scale(x1).tickValues( x1ticks );
            x1AxisCall.transition().duration(dur).call(x1_axis)

        }
    }

    function draw_chart(){
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

        var texts = chartGraph.selectAll("text")
            .data(displayText, d=> d.text)

        texts.exit()
            .transition().duration(dur/2)
            .attr('opacity', 0)
            .remove()

        texts.enter()
            .append("text")
            .attr("x", width/2)
            .attr("y", height/2)
            .attr("class", "affirmation")
            .attr("font-size", "1.5em")
            .attr("font-family", d=> d.family)
            .text(d=> d.text)
            .attr("opacity", 0)
            .transition().duration(dur)
            .attr("opacity", 1)
            
        var percentHosp = chartGraph.selectAll(".percent-hosp-line")
            .data([hos], d=> d.formattedDate)

        percentHosp.exit()
            .transition().duration(dur)
            .attr("d", d3.line()
                .y(y1(0))
                .curve(d3.curveMonotoneX)
            )
            .remove()

        percentHosp
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate)  + x1.bandwidth()/2)
                    .y(d=> y1(d[field]))
                    .curve(d3.curveMonotoneX)
                )

        percentHosp.enter()
            .append("path")
            .attr("class", "percent-hosp-line")
            .attr("d", d3.line()
                .x(function(d){
                    return x1(d.formattedDate)  + x1.bandwidth()/2 })
                .y(y1(0))
                .curve(d3.curveMonotoneX)
            )
            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(d=> x1(d.formattedDate) + x1.bandwidth()/2)
                    .y(d=> y1(d[field]))
                    .curve(d3.curveMonotoneX)
                )

        var circles = chartGraph.selectAll("circle")
            .data(hos, d=> d.formattedDate)

        circles.exit()
            .transition().duration(dur)
            .attr("cy", y1(0))
            .attr("r", 0)
            .remove()

        circles
            .transition().duration(dur)
            .attr("cx", d=> x1(d.formattedDate) + x1.bandwidth()/2)
            .attr("cy", d=> y1(d[field]))

        circles.enter()
            .append("circle")
            .attr("class", "hosp-dot")
            .attr("id", function(d, i){ return "hosp-dot-" + i; })
            .attr("cx", d=> x1(d.formattedDate) + x1.bandwidth()/2)
            .attr("r", 4)
            .attr("cy", y1(0))
            .transition().duration(dur)
            .attr("cy", d=> y1(d[field]))


        lines = chartGraph.selectAll(".hosp-lines")
            .data(hospLinesDisplay)

        lines.exit()
            .transition().duration(dur)
            .attr("opacity", 0)
            .remove()
        
        lines
            .raise()
            .transition().duration(dur)
            .attr("y1", d=> y1(d.val))
            .attr("y2", d=> y1(d.val))

        lines.enter()
            .append('line')
            .attr("opacity", 0)
            .attr("class", d=> d.class + " hosp-lines")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d=> y1(d.val))
            .attr("y2", d=> y1(d.val))

            .transition().duration(dur)
            .attr("opacity", 1)

        chartGraph.append('rect')
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

    x1.invert = function(){
        var domain = x1.domain()
        var range = x1.range()
        var scale = d3.scaleQuantize().domain(range).range(domain)

        return function(x){
            return scale(x)
        }
    }

    function mouseover(d){
        hospTooltip
            .transition().duration(250)
            .style("opacity", 1)
    }



    function mousemove(d){

        var mouseX = d3.mouse(this)[0] - x1.bandwidth()/2

        i = Math.round(mouseX/width  * x1.domain().length)
        curDate = x1.domain()[i]
        curElement = config.hospitalData[lineChartSelection].filter(d => d.formattedDate == curDate)[0]

        d3.selectAll(".hosp-dot")
            .transition().duration(100)
            .attr("r", function(d, index){
                return (index == i ? 8: 4)
            })        
        

        tmpX = event.pageX - d3.mouse(this)[0] + x1(curElement.formattedDate) + x1.bandwidth()/2
        tmpY = event.pageY - d3.mouse(this)[1] + y1(curElement.covidPercentChange)
        
        hoverLine
            .attr("opacity", 1)
            .attr("x1", x1(curElement.formattedDate) + x1.bandwidth()/2)
            .attr("x2", x1(curElement.formattedDate) + x1.bandwidth()/2)
            .attr("y1", y1(curElement.covidPercentChange))

        hospTooltip

            .style("left", tmpX + 15 + "px")
            .style("top", tmpY + "px")
            

        table = d3.select("#hosp-table").selectAll("td")
        vals = [
                curElement.formattedDate, 
                (100 * curElement.covidPercentChange).toFixed(3) + "%", 
                curElement.covidPatients, 
                curElement.covidPatientsIncrease
            ]

        table.each( function(d, i, f){
            d3.select(this).text(vals[i])
        })
        

    }

    function mouseout(d){
        hoverLine
            .transition().duration(250)
            .attr("opacity", 0)


        hospTooltip
            .transition().duration(250)
            .style("opacity", 0)

        d3.selectAll(".hosp-dot")
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


