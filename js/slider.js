function slider_chart(config){
    // var margin = { 
    //     left:config.width * 0.1,
    //     right:config.width *  0.1, 
    //     top: config.height * 0.05, 
    //     bottom:config.height * 0.2 }


    var margin = {
        bottom:80,
        left: 28,
        right: 28,
        top: 0
    }

    shifts = config.shifts

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var dur = config.duration
    var fillOpacity = 0.9

    defaultWidth = 282
    defaultHeight = 200



    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
        .classed("svg-content", true)
            .append("g")
                .attr("transform", "translate(" + (margin.left + shifts.left) + "," + margin.top + ")");
    

    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom

    sliderSelection = "Los Angeles"
    var thresholds = config.thresholds
    curAngle = 0
    var maxCases = thresholds.max
    var minCases = thresholds.min
    var dialText



    var colorRange = ['#f72c11', '#aee053', '#2a9905']

    if (config.type != "hosp"){
        var colors = d3.scaleLinear()
        .domain([maxCases, thresholds.thresh, minCases])
        .range(colorRange)
    } else {
        var colors = d3.scaleOrdinal()
            .domain(['Climbing', "Stable", "Declining"])
            .range(['#f72c11', '#aee053', '#40db0d'])
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
            .attr("fill-opacity", fillOpacity)
    } else if (config.type=="hosp") {
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
            .attr("fill-opacity", fillOpacity)
    } else if (config.type=="hospMax") {
        svg
        .append('defs')
        .append('marker')
        .attr('id', 'hospMax-arrow')
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
            .attr("fill-opacity", fillOpacity)
    }
   


    var radius = Math.min(width, height) * 0.6
    var radius = config.radius
        startAng = -85,
        endAng = 85
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
    var markerLine;

    spinner.append('path')
        .lower()
        .attr("class", "marker")
        .attr("id", "marker-" + config.type)
        .attr('marker-end', function(){
            if (config.type == "cases") return 'url(#cases-arrow)'
            else if (config.type == "hosp" ) return 'url(#hosp-arrow)'
            else if (config.type == "hospMax" ) return 'url(#hospMax-arrow)'
        })
        .attr("d", d3.line()([[0,0], [0,-radius * 0.63]]))
        .attr('fill-opacity', fillOpacity)

    function drawDial(){
        colorDial = []
        dialSegments = (config.type != "hosp" ? 17 : 3)
        pieceSize = (endRad - startRad) / dialSegments
        segmentPieces = (maxCases - minCases)/dialSegments

        var m = (config.type != "hosp" ? segmentPieces: minCases)
    
        for (var i=maxCases; i > m; i-= segmentPieces){
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
                return (config.type != "hosp" ? "dial-bg-cases" : "dial-bg-hosp")
            })
            .attr("fill-opacity", fillOpacity)

        dial.append("text")
            .attr("x", -Math.sin(endRad)*textRadius)
            .attr("y", -Math.cos(endRad)*textRadius)
            .attr("class", "whiteText")
            .attr("text-anchor", "end")
            .text("")

        markerLine = spinner.append('line')
            .lower()
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", -radius * 0.15)
            .attr("y2", -radius * 0.5)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)

        dial.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius * 0.15)
            .attr("id", "dial-circle-" + config.type)
            .attr("class", "dial-circle")
            .attr("fill", "#fff")
            .attr("opacity", fillOpacity)
            .attr("stroke", "#fff")




        // dialText = dial.append("text")
        //     .attr("x", 0)
        //     .attr("y", function(){ return (config.type=="cases" ? 0 : 0)})
        //     .attr("class", "slider-text")
        //     .attr("dominant-baseline", "middle")
        
        // dial.append("text")
        //     .attr("x", 0)
        //     .attr("y", 18)
        //     .attr("dominant-baseline", "middle")
        //     .attr("text-anchor", "middle")
        //     .text((config.type == "cases" ? "" : ""))
        //     .attr("font-size", "0.8em")
        //     .attr("fill", "#fff")

        // dial.append("text")
        //     .attr("x", 0)
        //     .attr("y", radius * 0.75)
        //     .attr("class", "small-labels")
        //     .attr("text-anchor", "middle")
        //     .text(config.type == "cases" ? "Cases Per 100,000 Residents" : "Hospital Occupation Trend")

    }

    var displayText;
    var iconText;

    function drawTexts(){
        textGroup = dial.append("g")
            .attr("transform", "translate(" + 0 + "," + (radius + 15) + ")")

        displayText = textGroup.append('text')
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#fff")
            .attr("font-size", "3.5em")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text('test')

        // iconText = textGroup.append('text')
        //     .attr("x", 5)
        //     .attr("y", 0)
        //     .attr("fill", "#fff")
        //     .attr('class', 'icons-text')
        //     .attr('font-family', 'FontAwesome')
        //     .attr("font-size", "3.5em")
        //     .attr("text-anchor", "start")
        //     .attr("dominant-baseline", "middle")
        //     .text('\uf00d')

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
            
            //dialText.text(Math.round(val)) 
            valText = Math.round(val) 
            val = Math.min(val, maxCases)
            
            casesIconStatus = (val <= 25 ? 1 : 0)

            updateCriteriaIcon('0', casesIconStatus)
            
            rotateSpinner(val)

        } else if (config.type == "hosp") {
            data = config.hospitalData[sliderSelection]
            data = data.filter(function(d, i){
                if (i >= data.length - 14) return d
            })

            percentMax = d3.max(data, d=> d.covidPercentChange)
            val = (percentMax >= 5 ? "Climbing" : "Decreasing")
            size = (thresholds.max - thresholds.min ) /3

            
            var xSeries = d3.range(0, data.map(d=> d.formattedDate).length)
            var ySeries = data.map(d=> d.covidPercentChange)
            var lsc = leastSquares(xSeries, ySeries)

            percentSlope = (+lsc[0].toFixed(3))
            percentIntercept = +lsc[1].toFixed(3)
            percentRsq = +lsc[2].toFixed(3)
    

            if (5 <= percentMax){
                val = "Climbing"
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


            if (val != "Climbing") stabIconStatus = 1
            else stabIconStatus = 0
            valText = val
            updateCriteriaIcon('2', stabIconStatus )

            //dialText.text(val)
            rotateSpinner(ang)

        } else if (config.type == "hospMax"){
            data = config.hospitalData[sliderSelection]

            val = d3.max(data, d=> d.covidPatientsIncrease)

            t = d3.select("#max-daily-hosp")
                .text(val)
                .style("color", col)  

            valText = val
            val = Math.min(maxCases, val)

            var col = colors(val)
            var maxIconStatus = (val <= thresholds.thresh ? 1 : 0) 


            updateCriteriaIcon('3', maxIconStatus )

            rotateSpinner(val)

        }

        displayText.text(valText)
            .transition().duration(dur)
            .attr("fill", colors(val))

        markerLine
            .transition().duration(dur)
            .attr("stroke", colors(val))

        svg.select("#dial-circle-" + config.type)
            .transition().duration(dur)
            .attr("fill", colors(val))

        svg.select("#dial-arrow-" + config.type)
            .transition().duration(dur)
            .attr("fill", colors(val))

    }

    function slider(){     
        drawDial(); 
        drawTexts();
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


