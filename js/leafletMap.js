

function map(config){
    // var margin = { 
    //     left:config.width  * 0,
    //     right:config.width * 0, 
    //     top: config.height * 0.2, 
    //     bottom:config.height * 0.00
    // }

    // var margin = {
    //     bottom: 100,
    //     left: 0,
    //     right: 0,
    //     top: 132
    // }

    // var mapData = config.countyData,
    //     dur = config.duration
    // var cal = config.cal
    // var data = d3.map();
    // var testData = d3.map();

    // var height = config.height - margin.top - margin.bottom, 
    //     width = config.width - margin.left - margin.right;

    // defaultWidth = 564
    // defaultHeight = 805

    
    // var mode = "Choropleth"
    // // var mode = "Bubbles"
    // // append the svg object to the body of the page
    // var svg = d3.select(config.selection)
    //     .append("svg")
    //         .attr("preserveAspectRatio", "xMidYMid meet")
    //         .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + defaultHeight)
    //         .classed("svg-content", true)
    //         .append("g")
    //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // width = defaultWidth - margin.left - margin.right
    // height = defaultHeight  - margin.top - margin.bottom

    dataByCity = d3.nest()
        .key(function(d){ return d.place})
        .object(config.cityData['Los Angeles'])

    laCities = d3.keys(dataByCity)


    covidMax = 0
    config.boundaries.features.forEach(function(d){
        if (!laCities.includes(d.properties.name)) d.properties.covid == undefined
        else {
            d.properties.covid = dataByCity[d.properties.name]
            if ( + d.properties.covid[0]["cases"] >= covidMax) covidMax =  + d.properties.covid[0]["cases"]
        }
    })

    


    var current = []

    var selection = 'newCases'

    current = config.cityData['Los Angeles'].data.map(function(d){
        if (d.values[0].x != "" && d.values[0].y != "") return d.values[0]
    }).sort(function(a,b){ return d3.descending(a[selection], b[selection])})
    current = current.filter(d=> d != undefined)
    

    currentMax = d3.max(current, function(d){
        return d[selection]
    })

    radius_max = 40
    current.forEach(function(d){
        if (d.x != "" && d.y != ""){
            d.LatLng = new L.LatLng(d.y, d.x)
        }
    })

    var color = d3.scaleLinear()
        .domain([0, currentMax*0.2, currentMax*0.4, currentMax*0.6, currentMax*1])
        .range(['#FFEDA0', '#FEB24C', '#FD8D3C', '#FC4E2A', "#800026"])


    token = "l10mWfnbqOc1N3B1Rj8IS4prb7TmeEXsEwhNnbS3p2W9KHXjfgdhEjbMJdxSj6An"


    var myMap = L.map('la-map').setView([34.0522, -118.2437], 11);
    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    // L.tileLayer(
    //     'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    //     {
    //         attribution: '&copy; ' + mapLink + ' Contributors',
    //         maxZoom: 18,
    //     })
    //     .addTo(map);
    

    L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=l10mWfnbqOc1N3B1Rj8IS4prb7TmeEXsEwhNnbS3p2W9KHXjfgdhEjbMJdxSj6An', {
        attribution: '<a href="https://www.jawg.io" target="_blank">&copy; Jawg</a> | <a href="https://www.openstreetmap.org" target="_blank">&copy; OpenStreetMap</a>&nbsp;contributors',
        maxZoom: 22,
        accessToken: token
    }).addTo(myMap);
    L.geoJson(config.boundaries.features, {style: style}).addTo(myMap)
    /* Initialize the SVG layer */
    myMap._initPathRoot()    
    /* We simply pick up the SVG from the map object */
    var svg = d3.select("#la-map").select("svg"),
    g = svg.append("g");	


    

    var a = d3.scaleLinear()
        .range([0, radius_max])
        .domain([area2radius(0),area2radius(currentMax)]) 

    // var bubbles = g.selectAll("circle")
    //     .data(current, d=> d.place)
    //     .enter()
    //     .append("circle")
    //     .style("stroke", "#000")
    //     .style("opacity", 0.6)
    //     .style("fill", "red")
    //     .attr("r", function(d){
    //         return Math.max(0, a(area2radius(d[selection])))
    //     })

    // myMap.on("viewreset", update)
    // update();

    // function update(){
    //     bubbles.attr("transform", function(d){
    //         return "translate("+
    //             myMap.latLngToLayerPoint(d.LatLng).x +","+ 
    //             myMap.latLngToLayerPoint(d.LatLng).y +")";
    //     })
    // }

    function getColor(d){
        return  d > 2000 ? '#800026' :
                d > 300  ? '#FC4E2A' :
                d > 100   ? '#FD8D3C' :
                d > 50   ? '#FEB24C' :
                d > 10   ? '#FED976' :
                        '#FFEDA0';
    }
    function style(feature){
        // feature.properties.name
        test = current.filter(d=> d.place == feature.properties.name)
        
        if (!test.length) fill = "lightsteelblue"
        else {
            fill = color(test[0][selection])
        }
        return {
            fillColor: fill,
            weight: 0.3,
            opacity: 1,
            color: '#000',
            fillOpacity: 0.3
        }
    }

    function mapChart(){
        //drawMap();
    }

    function drawMap(){
       


    }



    function area2radius(area){
        res = Math.sqrt(Math.abs(area))/Math.PI
        if (area < 0) res *= -1
        return res
    }

    mapChart.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return mapChart;
    }

    mapChart.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return mapChart;
    }

    return mapChart;

}



