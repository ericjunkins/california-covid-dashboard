function la_map(config){
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

    dataByCity = d3.nest()
        .key(function(d){ return d.place})
        .object(config.cityData['Los Angeles'])

    laCities = d3.keys(dataByCity)
    

    covidMax = 0
    config.boundaries.features.forEach(function(d){
        if (!laCities.includes(d.properties.name)) d.properties.covid == undefined
        else {
            d.properties.covid = dataByCity[d.properties.name]
            if ( + d.properties.covid[0]["confirmed_cases"] >= covidMax) covidMax =  + d.properties.covid[0]["confirmed_cases"]
        }
    })

    var color = d3.scaleLinear()
        .domain([0, covidMax])
        .range(['#f2df91', "#8c0804"])


    var projection = d3.geoMercator()
        .center([ -118.2437, 34.0522 ])
        .translate([ width * 0.5, height*0.35 ])
        .scale([ Math.min(height, width) *70 ]);

    //Define path generator
    var path = d3.geoPath()
        .projection(projection);


    var paths =svg.append('g')
        .attr("class", "paths")


    function laMap(){
        drawMap();
    }


    function drawMap(){
        var cityPath = paths.selectAll(".city-path")
            .data(config.boundaries.features, function(d){
                return d.properties.name
            })
        cityPath.enter()
            .append("path")
            .attr("d", path)
            .attr("class", "city-path")
            .attr("id", d=> "city-"+ d.properties.name.replace(/\s/g, "-"))
            .attr("stroke", "#1e2025")
            .attr("fill", function(d){
                covid = d.properties.covid
                if (covid == undefined) return "lightsteelblue"
                else return (color(+covid[0]["confirmed_cases"]))
            })
            .attr("opacity", d=> (d.properties.covid == undefined ? 0.5: 1))
    }


    function area2radius(area){

    }

    function mousemove(d){

    }

    function mouseover(d){

    }

    function mouseout(d){

    }

    function clicked(d){

    }
    


    laMap.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return laMap;
    }

    laMap.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return laMap;
    }



    return laMap;
}


