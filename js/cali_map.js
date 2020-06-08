function cali_map(config){
    var margin = { 
        left:config.width  * 0,
        right:config.width * 0, 
        top: config.height * 0.2, 
        bottom:config.height * 0.00
    }

    var margin = {
        bottom: 0,
        left: 0,
        right: 0,
        top: 132
    }

    var mapData = config.countyData,
        dur = config.duration
    var cal = config.cal
    var data = d3.map();
    var testData = d3.map();

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;

    defaultWidth = 564
    defaultHeight = 605

    
    var mode = "Choropleth"

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

    var projection = d3.geoMercator()
        .center([ -120, 37 ])
        .translate([ width * 0.5, height*0.45 ])
        .scale([ Math.min(height, width) *4.5 ]);

    //Define path generator
    var path = d3.geoPath()
        .projection(projection);

    var radius_max = 16

    cal.features.forEach(function(d){
        vals = config.criteria.filter(v=> v.county == d.properties.NAME)[0]
        d.totalNormalizedCases = vals.totalNormalizedCases

    })

    cal.features = cal.features.sort(function(a,b){
        return d3.descending(a.totalNormalizedCases, b.totalNormalizedCases)
    })

    config.criteria.forEach(function(d){
        data[0 + String(d.fips)] =  d.totalNormalizedCases
    })


    var vals = config.criteria.map(function(d){ return d.newCaseSlope}).sort(function(a,b){ return d3.descending(a, b)})
    var maxVal = d3.max(config.criteria, function(d){ return d.newCaseSlope })
    var uniqueVals = d3.set(vals).values()

    function getColor(val){
        val = Math.min(colorAbove.domain()[0], val)
        if (val < 5) return "#badee8"
        else if (5 <= val && val <= 25) return "#f2df91"
        else if (25 < val) return colorAbove(val)

        
    }

    var colorRange = ['#f72c11', '#ab994f', '#2a9905']
    var c1 = ['#8c0804', '#ff6e0b', '#ffae43']

    var colorAbove = d3.scaleLinear()
        .domain([150, 75/2, 25])
        .range(c1)
        .interpolate(d3.interpolateRgb)

    var colors = d3.scaleLinear()
        .domain([100, 50, 25])
        .range(colorRange)
        .interpolate(d3.interpolateRgb)

    var a = d3.scaleLinear()
        .range([radius_max, 0])
        .domain([area2radius(150),area2radius(25)])


    var paths =svg.append('g')
        .attr("class", "paths")

    var circlesGroup = svg.append('g')
        .attr("class", "circles-group")

    var rectLegendSize = width * 0.08
    var rectHeight = rectLegendSize *0.15
    var spacing = rectLegendSize * 0.2
    offset = (width - (rectLegendSize * 6 + spacing*3))/2 

    var legend = svg.append('g')
        .attr("class", "legend")
        .attr("transform", "translate(" + (offset - width*0.0) + "," + height*0.05 + ")")

    var selectionGroup = svg.append('g')
        .attr("transform", "translate(0," + (- margin.top * 0.8) + ")")
        .attr("class", "selection-tool")

    var xSel = d3.scaleBand()
        .domain(["Choropleth", "Bubbles"])
        .range([width*0.15, width*0.85])
        .padding(0)

    buttonHeight = 27


    leftRect = selectionGroup.append('path')
        .attr("d", leftRoundedRect(xSel("Choropleth"), 0, xSel.bandwidth(), buttonHeight, 6))
        .attr("class", "sel-rects")
        .attr("id", "selection-rects-Choropleth")
        .attr("fill", "#fff")
        .attr("stroke", "#666666")
        .attr("stroke-width", 2)
            .on("mousemove", mousemove)
            .on("mouseenter", mouseover)
            .on("mouseout", mouseout)
            .on("click", clicked)

    rightRect = selectionGroup.append('path')
        .attr("d", rightRoundedRect(xSel("Bubbles"), 0, xSel.bandwidth(), buttonHeight, 6))
        .attr("class", "sel-rects")
        .attr("id", "selection-rects-Bubbles")
        .attr("fill", "#fff")
        .attr("stroke", "#666666")
        .attr("stroke-width", 2)
            .on("mousemove", mousemove)
            .on("mouseenter", mouseover)
            .on("mouseout", mouseout)
            .on("click", clicked)

    // svg.append('text')
    //     .attr("x", width/2)
    //     .attr("y", -margin.top * 0.1)
    //     .attr("class", "title")
    //     .text("California County Map")


    selTexts = selectionGroup.selectAll("text")
        .data(xSel.domain())
            .enter()
            .append("text")
            .attr("class", "selection-texts")
            .attr("id", d=> "selection-text-" + d)
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)
            .attr("x", d=> xSel(d) + xSel.bandwidth()/2)
            .attr("y", buttonHeight/2)
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d=> d)

    selectionGroup.append('text')
        .attr("y", -7)
        .attr("x", width/2)
        .attr("class", "small-labels")
        .text("Select map display:")
        .attr("text-anchor", "middle")
    //drawLegend()

    function drawLegend(){
        legendData = [
            {
                x: 0,
                y: 0,
                fill: "#4fb6d3",
                text: "Falling"
            },
            {
                x: rectLegendSize + spacing,
                y: 0,
                fill: "#f2df91",
                text: "About the same"
            },
            {
                x: rectLegendSize * 2 + spacing*2,
                y: 0,
                fill: "#ffae43",
                text: ""
            },
            {
                x: rectLegendSize * 3 + spacing*2,
                y: 0,
                fill: "#ff6e0b",
                text: "Rising"
            },
            {
                x: rectLegendSize * 4 + spacing*2,
                y: 0,
                fill: "#ce0a05",
                text: ""
            },
            {
                x: rectLegendSize * 5 + spacing*3,
                y: 0,
                fill: "#f2f2f2",
                text: "Few or No cases"
            }
        ]
   
        var legendRects = legend.selectAll('rect')
            .data(legendData)
            .enter()
                .append("rect")
                .attr("x", d=> d.x)
                .attr("y", d=> d.y)
                .attr("width", rectLegendSize)
                .attr("height", rectHeight)
                .attr("fill", d=> d.fill)

        var legendTexts = legend.selectAll('text')
            .data(legendData)
            .enter()
                .append("text")
                .attr("x", d=> d.x + rectLegendSize/2)
                .attr("y", -rectHeight)
                .attr("fill", "#fff")
                .attr("font-size", "0.7em")
                .attr("text-anchor", "middle")
                .text(d=> d.text)
    }


    function stateMap(){
        updateSelections();
        updateScales();

        drawMap();
    }


    function updateScales(){
        mapSelection = 'normalizedCases'

    }

    function updateSelections(){
        if (mode == "Choropleth"){
            leftRect
                .transition().duration(dur)
                .attr("fill", "#fff")

            rightRect
                .transition().duration(dur)
                .attr("fill", "#ababab")
        } else {
            leftRect
                .transition().duration(dur)
                .attr("fill", "#ababab")

            rightRect
                .transition().duration(dur)
                .attr("fill", "#fff")
        }
            
    }


    function rightRoundedRect(x, y, width, height, radius){
        return "M" + x + "," + y
            + "h" + (width - radius)
            + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
            + "v" + (height - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
            + "h" + (radius - width)
            + "z";

    }

    function leftRoundedRect(x, y, width, height, radius){
        return "M" + (x + radius) + "," + y
            + "h" + (width)
            + "v" + (height)
            + "h" + (radius - width)
            + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius
            + "v" + -(height - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius
            + "z";

    }

    function area2radius(area){
        res = Math.sqrt(Math.abs(area))/Math.PI
        if (area < 0) res *= -1
        return res
    }


    function mousemove(d){

    }

    function mouseover(){
        document.body.style.cursor = "pointer"
        tmp = this.id.split('-')
        id = "#selection-rects-" + tmp[tmp.length-1]
        d3.select(id)
            .attr("stroke", "#4fb6d3")
        
    }

    function mouseout(d){
        document.body.style.cursor = "default"
        tmp = this.id.split('-')
        id = "#selection-rects-" + tmp[tmp.length-1]
        d3.select(id)
            .attr("stroke", "#666666")
    }

    function clicked(d){
        tmp = this.id.split("-")
        mode = tmp[tmp.length -1]
        updateSelections();
        drawMap();
        
    }
    
    function drawMap(){
        var counties = paths.selectAll(".county-path")
            .data(cal.features)

        counties
            .transition().duration(dur)
            .attr("fill", function(d){
                return (mode == "Bubbles" ? "#c5dbe0" : getColor(d.totalNormalizedCases) )
            })

        counties.enter()
            .append("path")
            .attr("d", path)
            .attr("class", "county-path")
            .attr("id", d=> "county-" + d.properties.NAME)

            .attr("stroke", "#1e2025")
            .attr("stroke-width", 1)
            .attr("fill", "#f2f2f2")
            .transition().duration(dur)
            .attr("fill", function(d){
                return (mode == "Bubbles" ? "#c5dbe0" : getColor(d.totalNormalizedCases) )
            })


        circData = (mode == "Bubbles" ? cal.features : [])
        var circles = circlesGroup.selectAll("circle")
            .data(circData,  d=> d.properties.NAME)
        
        circles.exit()
            .transition().duration(dur)
            .attr("r", 0)
            .remove()

        circles.enter()
            .append('circle')
            .attr("cx", function(d){
                coord = config.coordinates[d.properties.GEOID].coords
                return projection(coord)[0]
            })
            .attr("cy", function(d){
                coord = config.coordinates[d.properties.GEOID].coords
                return projection(coord)[1]
            })

            .attr("fill", "red")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "black")
            .attr("r", 0)
            .transition().duration(dur)
            .attr("r", function(d){
                val = area2radius(d.totalNormalizedCases)
                if (d.totalNormalizedCases <25){
                    return 0
                } 
                else return a(val)
            })
    }

    function draw_chart(){
        

        legRect = legend.selectAll("rect")
            .data(legendData, d=> d.y)

        legRect.enter()
            .append("rect")
            .attr('x', d=> d.x)
            .attr('y', d=> d.y)
            .attr('width', legBoxSize  * 0.85)
            .attr('height', legBoxSize * 0.85)
            .attr('fill', d=> d.fill)
        

        legText = legend.selectAll(".title-text")
            .data(legendData, d=> d.y)

        legText.enter()
            .append('text')
            .attr("class", "title-text")
            .attr("x", legBoxSize + 10)
            .attr('font-size', "0.5em")
            .attr("y", d=> d.y + legBoxSize/2)
            .attr("dominant-baseline", "middle")
            .attr("fill" , "#fff")
            .text(d=> d.text)


       

    }


    stateMap.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return stateMap;
    }

    stateMap.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return stateMap;
    }



    return stateMap;
}


