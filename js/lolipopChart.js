function lolipop_chart(config){
    var margin = { 
        left:config.width * 0.08,
        right:config.width * 0.05, 
        top: config.height * 0.15, 
        bottom:config.height * 0.2 }
    var dur = config.duration
    
    var statsWidth = config.width * 0.3

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right - statsWidth;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d")

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right + statsWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    selection = "Los Angeles"
    field = "doubleDays"
    var noNewCases = false;

    config.criteria.forEach(function(d){
        d.chartData.forEach(function(v){
            v.dateFormatted = formatTime(parseTime(v.date))
        })
    })

    console.log(config.criteria)

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.02)

    var y = d3.scaleLinear()
        .range([height, 0])


    var xLinear = d3.scaleLinear()
        .range([0, width])



    var x_axis = d3.axisBottom().tickPadding(10)
    var y_axis = d3.axisLeft().ticks(5)

    var y_axis_grid = d3.axisLeft().tickSize(-width).tickFormat('').ticks(5)

    var statsGroup = svg.append("g")
        .attr("transform", "translate(" + (margin.right *0.5 + width) + "," + 0 + ")")
        .attr("class", "county-stats")


    var radius = Math.min(height/2, statsWidth) * 1/2,
        startRad = ang2rad(-75)
        endRad = ang2rad(75)
        textRadius = radius * 1.25
        innerTick = radius * 0.9
        outerTick = radius * 1.1,
        wiperRad = radius * 1.15


    var pos = d3.scaleLinear()
        .domain([-5, 5])
        .range([startRad, endRad])


    var colors = d3.scaleLinear()
        .domain([
            pos.domain()[0],
            pos.domain()[0] + (pos.domain()[1] - pos.domain()[0])/2,
            pos.domain()[1]
        ])
        .range([
            '#f72c11',
            '#f2df91',
            '#73eb4b'
        ])

    var arc = d3.arc()
        .innerRadius(radius*0.6)
        .outerRadius(radius)
        .startAngle(startRad)
        .endAngle(endRad)

    var colorArc = d3.arc()
        .innerRadius(radius*0.6)
        .outerRadius(radius)
        .startAngle(d=> d.start)
        .endAngle(d=> d.end)

    colorDial = []
    dialSegments = 11
    pieceSize = (endRad - startRad) / dialSegments
    for (var i=0; i< dialSegments; i++){
        colorDial.push({
            start: startRad + pieceSize * i,
            end: startRad + pieceSize * (i+1),
            color: colors(pos.domain()[0] + (pos.domain()[1] - pos.domain()[0])/dialSegments * i),
            id: i
        })
    }

    var avgDeathText;
    var avgCaseText;

    var dial = statsGroup.append('g')
        .attr("transform", "translate(" + statsWidth/2 + "," + (height * 1 + margin.bottom*0.3) + ")")
        .attr("opacity", 0)

    var flag = svg.append('g')
        

    var affirmBox = statsGroup.append("g")
        .attr("transform", "translate(" + 0 + "," + height * 0.85 + ")")
    
    var wiper = dial.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("stroke", "#14BDEB")
        .attr("stroke-width", 3)

    var labels = svg.append("g")


    var xAxisCall = labels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")


    var yAxisCall = labels.append("g")
        .attr("class", "axisWhite axis--y")

    var yGridCall = labels.append('g')
        .attr("class", "axisGrid axis--y")

    var legend = svg.append('g')
        .attr("transform", "translate(" + width + "," + height* 0.3 + ")")



    function drawDial(){
        dial.append('text')
            .attr("x", 0)
            .attr("y", -radius * 1.7)
            .attr("text-anchor", "middle")
            .attr("font-size", "1.5em")
            .attr("fill", "#fff")
            .text("Rate of New Cases per Day")

        dial.append("path")
            .attr("d", arc())
            .attr("stroke", "#fff")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("fill-opacity", 0)

        dialBg = dial.selectAll(".dial")
            .data(colorDial, d=> d.id)
            .enter()
            .append('path')
            .attr("d", d=> colorArc(d))
            .attr("fill", d=> d.color)


        dial.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", "#14BDEB")


        dial.append("text")
            .attr("x", 0)
            .attr("y", -textRadius)
            .attr("class", "centerText whiteText")
            .text("About the same")

        dial.append("text")
            .attr("x", -Math.sin(endRad)*textRadius)
            .attr("y", -Math.cos(endRad)*textRadius)
            .attr("class", "whiteText")
            .attr("text-anchor", "end")
            .text("Increasing")

        dial.append("text")
            .attr("x", Math.sin(endRad)*textRadius)
            .attr("y", -Math.cos(endRad)*textRadius)
            .attr("class", "whiteText")
            .attr("text-anchor", "start")
            .text("Decreasing")
    }

    function drawAffirm(){
        affirmBox.append('text')
        .attr("x", statsWidth * 0.4)
        .attr("y", 0)
        .attr('font-family', 'FontAwesome')
        .attr("class", "affirmation")
        .attr("font-size", "2em")
        .attr("fill", "#fff")
        .attr("dominant-baseline", "middle")
        .text('No New Cases!')

        affirmBox.append('text')
            .attr("x", statsWidth *0.8)
            .attr("y", 0)
            .attr("class", "affirmation")
            .attr('font-family', 'FontAwesome')
            .attr("font-size", "4em")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#fff")
            .text('\uf058')

    }

    function drawLabels(){
        labels.append('text')
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -margin.left/2)
            .attr("class", "axis-label")
            .text("Number of Days")

        labels.append('text')
            .attr("x", width/2)
            .attr("y", -margin.top*0.3)
            .attr("font-size", "1.8em")
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .text("Days to Double Cases")
    }

    function drawStats(){

        row1 = height * 0.34
        row2 = height * 0.45

        statsGroup.append('text')
            .attr("x", statsWidth * 0.1)
            .attr("y", row1)
            .attr("font-size", "1.2em")
            .attr("fill", "#fff")
            .attr("dominant-baseline", "middle")
            .text("Average cases/day")

        avgCaseText = statsGroup.append("text")
            .attr("x", statsWidth * 0.65)
            .attr("y", row1)
            .attr("font-size", "2em")
            .attr("fill", "#fff")
            .attr("dominant-baseline", "middle")


        statsGroup.append('text')
            .attr("x", statsWidth * 0.1)
            .attr("y", row2)
            .attr("font-size", "1.2em")
            .attr("fill", "#fff")
            .attr("dominant-baseline", "middle")
            .text("Average deaths/day")

        avgDeathText =  statsGroup.append('text')
            .attr("x", statsWidth * 0.65)
            .attr("y", row2)
            .attr("font-size", "2em")
            .attr("fill", "#fff")
            .attr("dominant-baseline", "middle")

        flag.append('text')
            .attr("transform", "translate(" + (width*0.75) + "," + (-margin.top*0.34) + ")")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "warning-flag")
            .attr('font-family', 'FontAwesome')
            .attr("font-size", "3em")
            .attr("dominant-baseline", "middle")
            .attr("stroke-width", 0.25)
            .attr("stroke", "#fff")
            .text('\uf024')

        flag.append("text")
            .attr("transform", "translate(" + (width * 0.1) + "," + (height + margin.bottom*0.8) + ")")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "warning-flag")
            .attr('font-family', 'FontAwesome')
            .attr("font-size", "2em")
            .attr("dominant-baseline", "middle")
            .attr("stroke-width", 0.25)
            .attr("stroke", "#fff")
            .text('\uf024')


        flag.append("text")
            .attr("transform", "translate(" + (width * 0.1) + "," + (height + margin.bottom*0.8) + ")")
            .attr("x", 25)
            .attr("y", 0)
            .attr("font-size", "1em")
            .attr("fill", "#fff")
            .attr("dominant-baseline", "middle")
            .text('A small number of overall cases leads to hard to predict trends')

    
    }

    function wrap(text, width) {
        text.each(function() {
          let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 1.1,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        })
    }


    function lolipop(){
        drawDial();
        drawAffirm();
        drawLabels();
        drawStats();
        updateScales();
        draw_chart();
    }


    function ang2rad(ang){
        return ang* Math.PI/180
    }

    function updateScales(){        

        data = config.criteria.filter(d=> d.county == selection )[0]
        data.chartData.forEach(function(d){
            d.id = d.fips + "-" + d.date
            d.timestamp = parseTime( d.date).getTime()
        })
        

        

        x.domain(data.chartData.map(d=> d.dateFormatted))
        fieldMax = d3.max(data.chartData, d=> d[field])*1.5

        xLinear.domain(d3.extent(data.chartData, d=> d.timestamp))

        y.domain([0, fieldMax])

        // x_axis.scale(x)
        y_axis.scale(y)

        y_axis_grid.scale(y)


        var ticks = x.domain().filter(function(d, i){ return !( i % 2 ); });
        x_axis.scale(x).tickValues( ticks );


        
        xAxisCall.call(x_axis)
            // .selectAll("text")
            // .attr("transform", "translate(-10,0)rotate(-45)")
            // .style("text-anchor", "end");

        yAxisCall.transition().duration(dur).call(y_axis)
        yGridCall.transition().duration(dur).call(y_axis_grid)


        var x1 = x.domain()[0]
        var x2 = x.domain()[x.domain().length -1]
        var y1 = data.newCaseSlopeDouble + data.newCaseInterceptDouble
        var y2 = data.newCaseSlopeDouble * data.chartData.length + data.newCaseInterceptDouble
    
        if (data.newCaseSlopeDouble == 0 && data.newCaseRsqDouble == 0){
            noNewCases = true;
            dial
                .transition().duration(dur)
                .attr("opacity", 0)

            affirmBox
                .transition().duration(dur)
                .attr("opacity", 1)
        }
        else {
            noNewCases = false
            dial
                .transition().duration(dur)
                .attr("opacity", 1)

            affirmBox
                .transition().duration(dur)
                .attr("opacity", 0)
        }



        if (data.caseAvg <= 4){
            flag.transition().duration(dur)
                .attr("opacity", 1)

        } else {
            flag.transition().duration(dur)
            .attr("opacity", 0)
        }


        trendData = [[x1,y1,x2,y2]]
        wiperPosition(data.newCaseSlopeDouble)

        avgDeathText.text(data.deathAvg.toFixed(2))
        avgCaseText.text(data.caseAvg.toFixed(2))

        // slopeText.text("Slope: " + data.newCaseSlope.toFixed(2))
        // rSqText.text("R-Squared: " + data.newCaseRsq.toFixed(2))
    }

    function draw_chart(){

        var trendline = svg.selectAll(".trendline")
            .data(trendData)
    
        trendline.exit().remove()

        trendline
            .raise()
            .transition().duration(dur)
            .attr("stroke", function(){ 
                if (noNewCases) return colors(colors.domain()[2])
                return colors(data.newCaseSlopeDouble)
            })
            .attr("y1", d=> y(d[1]))
            .attr("y2", d=> y(d[3]))


        trendline.enter()
            .append('line')
                .attr("class", "trendline")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("stroke", function(){ 
                    if (noNewCases) return colors(colors.domain()[2])
                    return colors(data.newCaseSlopeDouble)
                })
                .attr("y1", d=> y(0))
                .attr("y2", d=> y(0))
                .transition().duration(dur)
                    .attr("y1", d=> y(d[1]))
                    .attr("y2", d=> y(d[3]))



        var doubleDayLine = svg.selectAll(".double-day-line")
            .data([data.chartData], d=>d.timestamp)

        doubleDayLine
            .transition().duration(dur)
            .attr("d", d3.line()
                .x(function(d){ return x(d.dateFormatted) + x.bandwidth()/2; })
                .y(function(d){ return y(d[field]); })
                .curve(d3.curveMonotoneX) )

        doubleDayLine
            .enter()
            .append("path")
            .attr("class", "double-day-line")
            .attr("d", d3.line()
                .x(function(d){ return x(d.dateFormatted); })
                .y(y(0))
                .curve(d3.curveMonotoneX))

            .transition().duration(dur)
                .attr("d", d3.line()
                    .x(function(d){ return x(d.dateFormatted) + x.bandwidth()/2; })
                    .y(function(d){ return y(d[field]); })
                    .curve(d3.curveMonotoneX))


        var circles = svg.selectAll(".lolicircle")
            .data(data.chartData, d=> d.id)

        circles.exit().remove()

        circles
            .transition().duration(dur)
            .attr("cx", d=> x(d.dateFormatted)  + x.bandwidth()/2)
            .attr("cy", d=> y( Math.min(d[field]), y.domain()[1]))

        circles.enter()
            .append('circle')
            .attr("class", "lolicircle")
            .attr("cx", d=> x(d.dateFormatted)  + x.bandwidth()/2)
            .attr("cy", y(0))
            .attr("r", 5)
            .transition().duration(dur)
                .attr("cy", d=> y( Math.min(d[field]), y.domain()[1]))

    }
    
    function wiperPosition(val){
        val = Math.max(Math.min(val, pos.domain()[1]), pos.domain()[0])
        ang = pos(val)
        x2 = Math.sin(ang) * wiperRad    
        y2 = -Math.cos(ang) * wiperRad
        wiper.transition().duration(dur)
            .attr("x2", x2)
            .attr("y2", y2)
    }


    lolipop.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return lolipop;
    }

    lolipop.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return lolipop;
    }

    lolipop.selection = function(value){
        if (!arguments.length) return selection;
        selection = value;
        updateScales();
        draw_chart();
        return lolipop;
    }


    return lolipop;
}


