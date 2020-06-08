function slider_chart(config){
    // var margin = { 
    //     left:config.width * 0.1,
    //     right:config.width *  0.1, 
    //     top: config.height * 0.05, 
    //     bottom:config.height * 0.2 }


    var margin = {
        bottom: 32,
        left: 28,
        right: 28,
        top: 8
    }

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var dur = config.duration


    defaultWidth = 282
    defaultHeight = 177


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

    sliderSelection = "Los Angeles"
    thresholds = config.thresholds
    curAngle = 0
    var maxCases = thresholds.max
    var minCases = thresholds.min
    var dialText

    var colorRange = ['#f72c11', '#ab994f', '#2a9905']

    if (config.type == "cases"){
        var colors = d3.scaleLinear()
        .domain([maxCases, maxCases/2, minCases])
        .range(colorRange)
    } else {
        var colors = d3.scaleOrdinal()
            .domain(['High', "Stable", "Declining"])
            .range(['#f72c11', '#ab994f', '#2a9905'])
    }
    
    
    
    // Define the arrowhead marker variables
    const markerBoxWidth = 22;
    const markerBoxHeight = 22;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [0, 20], [20, 10]];

    // Add the arrowhead marker definition to the svg element
    if (config.type == "cases"){
        svg
        .append('defs')
        .append('marker')
        .attr('id', 'cases-arrow')
        .attr('viewBox', [0, 0, markerBoxWidth/1.5, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr("id", "dial-arrow-" + config.type)
            .attr("class", "dial-arrow")
            .attr('d', d3.line()(arrowPoints))
            .attr("fill", "#fff")
    } else {
        svg
        .append('defs')
        .append('marker')
        .attr('id', 'hosp-arrow')
        .attr('viewBox', [0, 0, markerBoxWidth/1.5, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr("id", "dial-arrow-" + config.type)
            .attr("class", "dial-arrow")
            .attr('d', d3.line()(arrowPoints))
            .attr("fill", "#fff")
    }
   


    var radius = Math.min(width, height) * 0.6,
        startAng = -105,
        endAng = 105
        startRad = ang2rad(startAng)
        endRad = ang2rad(endAng)
        textRadius = radius * 1.25
        innerTick = radius * 1.05
        outerTick = radius * 1.2,
        wiperRad = radius * 1.15

    var pos = d3.scaleLinear()
        .domain([maxCases, minCases])
        .range([startRad, endRad])


    var rot = d3.scaleLinear()
        .domain(pos.domain())
        .range([startAng, endAng])


    var arc = d3.arc()
        .innerRadius(radius*0.75)
        .outerRadius(radius)
        .startAngle(startRad)
        .endAngle(endRad)

    var colorArc = d3.arc()
        .innerRadius(radius*0.75)
        .outerRadius(radius)
        .startAngle(d=> d.start)
        .endAngle(d=> d.end)


    
    
    var dial = svg.append('g')
        .attr("transform", "translate(" + width/2 + "," + (height*0.75) + ")")
        .attr("opacity", 1)

    var spinner = dial.append("g")
        .append('path')
        .lower()
        .attr("class", "marker")
        .attr("id", "marker-" + config.type)
        .attr('marker-end', function(){
            return (config.type == "cases" ? 'url(#cases-arrow)' : 'url(#hosp-arrow')
        })
        .attr("d", d3.line()([[0,0], [0,-radius * 0.63]]))

    function drawDial(){
        colorDial = []
        dialSegments = (config.type == "cases" ? 25 : 3)
        pieceSize = (endRad - startRad) / dialSegments
        segmentPieces = (maxCases - minCases)/dialSegments


    
        for (var i=maxCases; i > minCases; i-= segmentPieces){
            colorDial.push({
                start: pos(i),
                end: pos(i) + pieceSize,
                color: colors(i),
                id: i,
                type: 'high'
            })
        }

        dialBg = dial.selectAll(".dial")
            .data(colorDial, d=> d.id)
            .enter()
            .append('path')
            .attr("d", d=> colorArc(d))
            .attr("fill", d=> d.color)
            .attr("class", function(){
                return (config.type == "cases" ? "dial-bg-cases" : "dial-bg-hosp")
            })

        dial.append("text")
            .attr("x", -Math.sin(endRad)*textRadius)
            .attr("y", -Math.cos(endRad)*textRadius)
            .attr("class", "whiteText")
            .attr("text-anchor", "end")
            .text("")

        dial.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius * 0.45)
            .attr("id", "dial-circle-" + config.type)
            .attr("class", "dial-circle")
            .attr("fill", "#fff")

        dialText = dial.append("text")
            .attr("x", 0)
            .attr("y", function(){ return (config.type=="cases" ? 0 : 0)})
            .attr("class", "slider-text")
            .attr("dominant-baseline", "middle")
        
        dial.append("text")
            .attr("x", 0)
            .attr("y", 18)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .text((config.type == "cases" ? "" : ""))
            .attr("font-size", "0.8em")
            .attr("fill", "#fff")

        dial.append("text")
            .attr("x", 0)
            .attr("y", radius * 0.75)
            .attr("class", "small-labels")
            .attr("text-anchor", "middle")
            .text(config.type == "cases" ? "Cases Per 100,000 Residents" : "Hospital Occupation Trend")

    }

    function ang2rad(ang){
        return ang* Math.PI/180
    }

    function rotateSpinner(val){
        targetAngle = rot(val)
        spinner
            .transition().duration(dur)
            .attr("transform", "rotate(" + targetAngle + ")")

    }

    function updateScales(){
        if (config.type == "cases"){
            data = config.criteria.filter(d=> d.county == sliderSelection)[0]
            val = d3.sum(data.chartData, d=> d.normalizedCases)
            
            dialText.text(Math.round(val))  
            val = Math.min(val, maxCases)
            
            casesIconStatus = (val <= 25 ? 1 : 0)

            updateCriteriaIcon('cases', casesIconStatus)



            rotateSpinner(val)

        } else {
            data = config.hospitalData[sliderSelection]
            data = data.filter(function(d, i){
                if (i >= data.length - 14) return d
            })

            percentMax = d3.max(data, d=> d.covidPercentChange)
            val = (percentMax >= 5 ? "Increasing" : "Decreasing")
            size = (thresholds.max - thresholds.min ) /3

            
            var xSeries = d3.range(0, data.map(d=> d.formattedDate).length)
            var ySeries = data.map(d=> d.covidPercentChange)
            var lsc = leastSquares(xSeries, ySeries)

            percentSlope = (+lsc[0].toFixed(3))
            percentIntercept = +lsc[1].toFixed(3)
            percentRsq = +lsc[2].toFixed(3)
    

            if (5 <= percentMax){
                val = "High"
                ang = thresholds.max - size/2
            } else {
                if (percentSlope < 0){
                    val = "Declining"
                    ang = thresholds.min + size/2
                } else {
                    val = "Stable"
                    ang = 0
                }

            }


            maxHosp = Math.max(d3.max(data, d=> d.covidPatientsIncrease), 0)
            if (maxHosp > 20) {
                col = colors("High")
                maxIconStatus = 0
            }
            else{
                col = colors("Declining")
                maxIconStatus = 1
            } 
            t = d3.select("#max-daily-hosp")
                .text(maxHosp)
                .style("color", col)  


            if (val != "High") stabIconStatus = 1
            else stabIconStatus = 0



            updateCriteriaIcon('stab', stabIconStatus )
            updateCriteriaIcon('hosp-max', maxIconStatus )

            dialText.text(val)

            rotateSpinner(ang)

        }

        svg.select("#dial-circle-" + config.type)
            .transition().duration(dur)
            .attr("fill", colors(val))

        svg.select("#dial-arrow-" + config.type)
            .transition().duration(dur)
            .attr("fill", colors(val))

    }

    function slider(){     
        drawDial(); 
        updateScales();
        draw_chart();

    }
    
    function draw_chart(){
    }

    slider.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return slider;
    }

    slider.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return slider;
    }

    slider.selection = function(value){
        if (!arguments.length) return testSelection;
        sliderSelection = value;
        updateScales();
        draw_chart();
        return slider;
    }


    return slider;
}


