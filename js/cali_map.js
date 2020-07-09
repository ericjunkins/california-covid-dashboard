function cali_map(config){
    var margin = { 
        left:config.width  * 0,
        right:config.width * 0, 
        top: config.height * 0.2, 
        bottom:config.height * 0.00
    }

    var margin = {
        bottom: 100,
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
    defaultHeight = 805

    
    var mode = "Choropleth"
    // var mode = "Bubbles"
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

    var mapSelection = 'normalizedCases'
    var countySelection = "Los Angeles"

    var mapTooltip = d3.select("#map-tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")

    var projection = d3.geoMercator()
        .center([ -120, 37 ])
        .translate([ width * 0.5, height*0.45 ])
        .scale([ Math.min(height, width) *4.5 ]);

    //Define path generator
    var path = d3.geoPath()
        .projection(projection);


    cal.features.forEach(function(d){
        vals = config.criteria.filter(v=> v.county == d.properties.NAME)[0]
        if (vals) d.totalNormalizedCases = vals.totalNormalizedCases
        else d.totalNormalizedCases = 0
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
        val = Math.min(colorAbove.domain()[2], val)
        if (val < 5) return colorRange[0]
        else if (5 <= val && val <= 25) return colorRange[1]
        else if (25 < val) return colorAbove(val)

        
    }

    normalizedMax = 250
    normalizedMin = 25
    normalizedMid = (normalizedMax + normalizedMin)/2
    var colorRange = ["#badee8", "#f2df91",  '#ffae43', '#ff6e0b', '#8c0804']
    var legTexts = ["None", "Less than 25", "25" , String(Math.round(normalizedMid)) ,'Over ' + normalizedMax]
    var colorAbove = d3.scaleLinear()
        .domain([normalizedMin, normalizedMid, normalizedMax])
        .range(colorRange.slice(2, 5))
        .interpolate(d3.interpolateRgb)


    var radius_max = 15
    var a = d3.scaleLinear()
        .range([0, radius_max])
        .domain([area2radius(0),area2radius(150)])


    var paths =svg.append('g')
        .attr("class", "paths")

    var circlesGroup = svg.append('g')
        .attr("class", "circles-group")



    

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
    


    function drawLegend(){

        var legend = svg.append('g')
            .attr("class", "legend")
            .attr("transform", "translate(" + (width * 0.1) + "," + (height + margin.bottom*0.3) + ")")

        colorLegend = legend.append("g")
            .attr("opacity", 0)


        bubblesLegend = legend.append('g')
            .attr("transform", "translate(" + (width * 0.35) + "," + (30) + ")")
            .attr("opacity", 0)
        

        legend.append('text')
            .attr("x", width*0.45)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", "1.3em")
            .text("Cases per 100,000 Residents in past 2 weeks")

        legendData = []
        legendBoxes = []
        legendHeight = 14
        legendWidth = 80
        spacing = 25
        numSpacings = 0
        offset = legendWidth*2 + spacing * 3
        positions = [
            legendWidth*0.5, 
            legendWidth*1.5 + spacing, 
            offset, 
            offset + legendWidth*3/2, 
            offset + legendWidth*3
        ]

        for (var i=0; i < 5; i++){
            legendData.push({
                x: positions[i],
                y: 0,
                text: legTexts[i],
                fill: colorRange[i]
            })
        }

        sections = 50
        fillSection = (normalizedMax - normalizedMin)/sections

        for (var i=0; i< sections; i++){
            legendBoxes.push({
                x: i * (3*legendWidth/sections) + offset,
                y: 0,
                width: 3*legendWidth/sections +1,
                height: legendHeight,
                fill: colorAbove(normalizedMin + fillSection * i)
            })
        }

        

        legendBoxes.push({x: 0, y: 0, width: legendWidth, height: legendHeight, fill: colorRange[0]})

        legendBoxes.push({x: legendWidth + spacing, y: 0, width: legendWidth, height: legendHeight, fill: colorRange[1]})

        var legendRects = colorLegend.selectAll('rect')
            .data(legendBoxes, d=> d.y)

        legendRects.enter()
            .append('rect')
            .attr("class", "legend-rect")
            .attr("x", d=> d.x)
            .attr("y", d=> d.y)
            .attr("width", d=> d.width)
            .attr("height", d=> d.height)
            .attr("fill", "#fff")
            .transition().duration(dur)
            .attr("fill", d=> d.fill)

        var texts = colorLegend.selectAll(".legend-labels")
            .data(legendData, d=> d.x)

        texts.enter()
            .append('text')
            // .attr("class", "legend-text")
            .attr("fill", "#fff")
            .attr("class", "legend-labels")
            .attr("text-anchor", "middle")
            .attr("x", d=> d.x)
            .attr("y", legendHeight + 30)
            .attr("dominant-baseline", "middle")
            .text(d=> d.text)




        colorLegend.append('line')
            .attr('x1', offset)
            .attr('x2', offset + legendWidth*3)
            .attr('y1', legendHeight+1)
            .attr('y2', legendHeight+1)
            .attr("stroke", '#fff')
            .attr("stroke-width",2)

        innerTick = legendHeight - 5
        outerTick = legendHeight + 8

        colorLegend.append('line')
            .attr('x1', positions[2])
            .attr('x2', positions[2])
            .attr('y1', innerTick)
            .attr('y2', outerTick)
            .attr("stroke", '#fff')
            .attr("stroke-width",2)

        colorLegend.append('line')
            .attr('x1', positions[3])
            .attr('x2', positions[3])
            .attr('y1', innerTick)
            .attr('y2', outerTick)
            .attr("stroke", '#fff')
            .attr("stroke-width",2)

        colorLegend.append('line')
            .attr('x1', positions[4])
            .attr('x2', positions[4])
            .attr('y1', innerTick)
            .attr('y2', outerTick)
            .attr("stroke", '#fff')
            .attr("stroke-width",2)


        bubblesLegend.append('circle')
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", a(area2radius(25)))
            .attr("fill", "red")
            .attr("opactiy", 0.3)
            .attr("fill-opacity", 0.3)
            .attr("stroke", "#000")

        bubblesLegend.append('circle')
            .attr("cx", 30)
            .attr("cy", 0)
            .attr("r", a(area2radius(75)))
            .attr("fill", "red")
            .attr("opactiy", 0.3)
            .attr("fill-opacity", 0.3)
            .attr("stroke", "#000")

        bubblesLegend.append('circle')
            .attr("cx", 70)
            .attr("cy", 0)
            .attr("r", a(area2radius(250)))
            .attr("fill", "red")
            .attr("opactiy", 0.3)
            .attr("fill-opacity", 0.3)
            .attr("stroke", "#000")

        bubblesLegend.append("text")
            .attr("x", - 20)
            .attr("y", 0)
            .attr("fill", "#ababab")
            .attr("text-anchor", "end")
            .attr("font-size", "1em")
            .attr("dominant-baseline", "middle")
            .text("25")

        bubblesLegend.append("text")
            .attr("x", 110)
            .attr("y", 0)
            .attr("fill", "#ababab")
            .attr("text-anchor", "start")
            .attr("font-size", "1em")
            .attr("dominant-baseline", "middle")
            .text("250")

    }


    function stateMap(){
        drawLegend()
        updateSelections();
        drawMap();
    }

    function updateSelections(){
        if (mode == "Choropleth"){
            leftRect
                .transition().duration(dur)
                .attr("fill", "#fff")

            rightRect
                .transition().duration(dur)
                .attr("fill", "#ababab")

            colorLegend
                .transition().duration(dur)
                .attr("opacity", 1)

            bubblesLegend
                .transition().duration(dur)
                .attr("opacity", 0)

        } else {
            leftRect
                .transition().duration(dur)
                .attr("fill", "#ababab")

            rightRect
                .transition().duration(dur)
                .attr("fill", "#fff")

            colorLegend
                .transition().duration(dur)
                .attr("opacity", 0)

            bubblesLegend
                .transition().duration(dur)
                .attr("opacity", 1)
        }
        

            
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
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)
            .attr("id", d=> "county-" + d.properties.NAME.replace(/\s/g, "-"))
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
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)
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
                tmp = d.totalNormalizedCases
                val = area2radius(tmp)
                return a(val)
            })
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
        mapTooltip
            .style("left", (event.pageX) + (30) + "px")
            .style("top", (event.pageY) + (0) + "px")
    }

    function mouseover(d){
        document.body.style.cursor = "pointer"
        if (d == undefined){
            tmp = this.id.split('-')
            id = "#selection-rects-" + tmp[tmp.length-1]
            d3.select(id)
                .attr("stroke", "#4fb6d3")
        } else {
            d3.select(this)
                .attr("stroke", "#fff")
                .attr("stroke-width", 4)
                .transition().duration(dur/2)
                .attr("stroke-width", 2)

            mapTooltip
                .transition().duration(250)
                .style("opacity", 1)

            table = d3.select("#map-table").selectAll("td")
            vals = [d.properties.NAME, d.totalNormalizedCases]
            table.each( function(d, i, f){
                d3.select(this).text(vals[i])
            })
        }
    }

    function mouseout(d){
        document.body.style.cursor = "default"
        if (d == undefined){
            tmp = this.id.split('-')
            id = "#selection-rects-" + tmp[tmp.length-1]
            d3.select(id)
                .attr("stroke", "#666666")

        } else {
            d3.select(this)
                .transition().duration(dur/2)
                .attr("stroke", "#1e2025")
                .attr("stroke-width", 1)

            mapTooltip
                .transition().duration(250)
                .style("opacity", 0)
        }
    }

    function clicked(d){
        if (d == undefined){
            tmp = this.id.split("-")
            mode = tmp[tmp.length -1]
            updateSelections();
            drawMap();
        } else {
            tmp = this.id.split("-")
            if (tmp.length == 3){
                county = tmp[1] + " " + tmp[2]
            } else {
                county = tmp[1]
            }
            countyClick(county)
        }

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


