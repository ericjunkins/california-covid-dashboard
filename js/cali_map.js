function cali_map(config){
    var margin = { left:20, right:60, top:20, bottom:80 }
    var mapData = config.countyData,
        dur = config.duration
    var cal = config.cal
    var data = d3.map();
    var testData = d3.map();

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    


    var mode = "Choropleth"

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var projection = d3.geoMercator()
        .center([ -120, 37 ])
        .translate([ width/2, height*0.7 ])
        .scale([ width*4 ]);

    //Define path generator
    var path = d3.geoPath()
        .projection(projection);

    var radius_max = width/15


    config.criteria.forEach(function(d){
        //console.log(d)
        data[0 + String(d.fips)] =  d.newCaseSlope
    })



    var vals = config.criteria.map(function(d){ return d.newCaseSlope}).sort(function(a,b){ return d3.descending(a, b)})
    var maxVal = d3.max(config.criteria, function(d){ return d.newCaseSlope })
    var uniqueVals = d3.set(vals).values()

    function getColor(val){
        if (val == -999) return "#f2f2f2"
        else if (val <= - 1) return "#4fb6d3"
        else if (-1 < val && val <= 1) return "#f2df91"
        else return colors(Math.min(val, colors.domain()[2]))
    }

    var colors = d3.scaleLinear()
        .domain([
            1,
            5,
            10 
        ])
        .range([
            '#ffae43',
            '#ff6e0b',
            '#ce0a05'
        ])
        .interpolate(d3.interpolateRgb)

    var a = d3.scaleLinear()
        .range([0, radius_max])
        .domain([
            area2radius(+uniqueVals[uniqueVals.length - 2]), 
            area2radius(+uniqueVals[0])
        ])


    var paths =svg.append('g')
        .attr("class", "paths")

    var circlesGroup = svg.append('g')
        .attr("class", "circles-group")

    var legend = svg.append('g')
        .attr("class", "legend")
        .attr("transform", "translate(" + width * 0.1 + "," + height*0.15 + ")")

    // legendData = []
    // legBoxSize = 20;

    // for (var i=0; i < 6; i++){
    //     if (i==0){
    //         text = "Greater than 5"
    //         fill = colors(colors.domain()[colors.domain().length - 1])
    //     }
    //     else if (i == 5){
    //         text = "No New Cases"
    //         fill =  colors(colors.domain()[0])
    //     }
    //     else {
    //         dif = colors.domain()[2] - colors.domain()[1]/3
    //         text = String(5 - i)
    //         fill = colors(colors.domain()[2] - ((i) * dif))
    //     }
    //     legendData.push({
    //         x: 0,
    //         y: (legBoxSize * i),
    //         text: text,
    //         fill: fill
    //     })
    // }
    
    // svg.append('text')
    //     .attr("x", width/2)
    //     .attr("y", margin.top/2)
    //     .attr("font-size", "1.3rem")
    //     .attr("fill", "#fff")
    //     .attr("text-anchor", "middle")
    //     .text("Average Increase of new Cases per day ")


    var selectionGroup = svg.append('g')
        .attr("transform", "translate(0," + height * 0 + ")")
        .attr("class", "selection-tool")


    var xSel = d3.scaleBand()
        .domain(["Choropleth", "Bubbles"])
        .range([0, width])
        .padding(0.1)


    drawLegend()

    function drawLegend(w){
        rectWidth = 60
        rectHeight = 10
        spacing = 10

        legendData = [
            {
                x: 0,
                y: 0,
                fill: "#4fb6d3",
                text: "Falling"
            },
            {
                x: 70,
                y: 0,
                fill: "#f2df91",
                text: "About the same"
            },
            {
                x: 140,
                y: 0,
                fill: "#ffae43",
                text: ""
            },
            {
                x: 200,
                y: 0,
                fill: "#ff6e0b",
                text: "Rising"
            },
            {
                x: 260,
                y: 0,
                fill: "#ce0a05",
                text: ""
            },
            {
                x: 330,
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
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", d=> d.fill)

        var legendTexts = legend.selectAll('text')
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", d=> d.x + rectWidth/2)
            .attr("y", 25)
            .attr("fill", "#fff")
            .attr("font-size", "0.8rem")
            .attr("text-anchor", "middle")
            .text(d=> d.text)
    }


    function stateMap(){
        updateSelections();
        
        drawMap();
        //draw_chart();
    }


    function updateSelections(){
        selRects = selectionGroup.selectAll("rect")
            .data(xSel.domain())
    
        selRects
            .attr("stroke-width", d=> (mode == d ? 0.5 : 0.2))
            .attr("fill-opacity", d=> (mode == d ? 0.35 : 0.1))

        selRects
            .enter()
            .append("rect")
            .attr("class", "selection-rects")
            .attr("id", d=> "selection-rect-" + d)
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)
            .attr("x", d=> xSel(d))
            .attr("y", 0)
            .attr("rx", 5)
            .attr("height", 40)
            .attr("width", xSel.bandwidth())
            .attr("fill", config.defaultColor)
            .attr("stroke", "#fff")
            .attr("stroke-width", d=> (mode == d ? 0.5 : 0.2))
            .attr("fill-opacity", d=> (mode == d ? 0.35 : 0.1))



        selTexts = selectionGroup.selectAll("text")
            .data(xSel.domain())
    
        selTexts
            .attr("opacity", d=> (mode == d ? 1 : 0.5))

        selTexts
            .enter()
            .append("text")
            .attr("class", "selection-texts")
            .attr("id", d=> "selection-text-" + d)
                .on("mousemove", mousemove)
                .on("mouseenter", mouseover)
                .on("mouseout", mouseout)
                .on("click", clicked)
            .attr("x", d=> xSel(d) + xSel.bandwidth()/2)
            .attr("y", 20)
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("opacity", d=> (mode == d ? 1 : 0.5))
            .text(d=> d)
    }

    function area2radius(area){
        res = Math.sqrt(Math.abs(area))/Math.PI
        if (area < 0) res *= -1
        return res
    }


    function mousemove(d){

    }

    function mouseover(d){
        document.body.style.cursor = "pointer"
    }

    function mouseout(d){
        document.body.style.cursor = "default"
    }

    function clicked(d){
        mode = d
        updateSelections();
        drawMap();
        
    }
    
    function drawMap(){
        var counties = paths.selectAll("path")
            .data(cal.features)

        counties
            .transition().duration(dur)
            .attr("fill", function(d){
                return (mode == "Bubbles" ? "#badee8" : getColor(data[d.properties.GEOID]) )
            })

        counties.enter()
            .append("path")
            .attr("d", path)
            .attr("id", d=> "county-" + d.properties.NAME)

            .attr("stroke", "#1e2025")
            .attr("stroke-width", 1)
            .attr("fill", "#f2f2f2")
            .transition().duration(dur)
            .attr("fill", function(d){
                return (mode == "Bubbles" ? "#badee8" : getColor(data[d.properties.GEOID]) )
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
            .attr("fill-opacity", 0.5)
            .attr("stroke", "black")
            .attr("r", 0)
            .transition().duration(dur)
            .attr("r", function(d){
                val = area2radius(data[d.properties.GEOID])
                if (data[d.properties.GEOID] === -999){
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


