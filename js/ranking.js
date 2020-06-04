function ranking_chart(config){
    var margin = { 
        left:config.width * 0.05,
        right:config.width * 0.05, 
        top: config.height * 0.1, 
        bottom:config.height * 0.1}


    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right,
        dur = config.duration
    // var color = d3.scaleOrdinal(config.scheme);
    // var cur_color = 0;

    // append the svg object to the body of the page

    var rankingSel = "cases"
    var yLabels = []
    var rankingData = []
    var yLabel
    
    document.getElementById("outer1").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("outer1").setAttribute("style", "height:" + (height + margin.top + margin.bottom) + "px");

    document.getElementById("ranking").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("ranking").setAttribute("style", "height:" + (height + margin.top) + "px");
    
    const outerSvg = d3.select("#outer1").append('svg')
        .attr("width", width + margin.left + margin.right)

    outerSvg.append('text')
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "title")
        .text("Cases by County")

    var barHeight = height/14
    var width1 = config.width* 0.35,
        width2 = width - width1

    config.criteria.forEach(function(d){
        cases = d.data[d.data.length -1].cases
        deaths = d.data[d.data.length -1].deaths
        rankingData.push({
            county: d.county,
            cases: cases,
            deaths: deaths,
            caseAvg: d.caseAvg,
            deathAvg: d.deathAvg
        })
        yLabels.push({
            cases: cases,
            county: d.county,
            idName: d.county.replace(/\s/g, '')
        })

    })

    rankingData = rankingData.sort((a,b) => d3.ascending(a[rankingSel], b[rankingSel]))
    var maxX = d3.max(rankingData, d=> d[rankingSel])


    const svg = d3.select(config.selection).append('svg')
        .attr("width", width)
        .attr("height", barHeight * rankingData.length + barHeight*0.5)
        
    var chart = svg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")

    var barsGroup = svg.append("g")
        .attr("transform", "translate(" + ( margin.left + width1 )  + "," + margin.top + ")")

    
    var axes = barsGroup.append("g")


    var x = d3.scaleLinear()
        .domain([0, maxX])
        .range([0, width2])
    
    var y = d3.scaleBand()
        .domain(rankingData.map(d=> d.county ))
        .range([barHeight*rankingData.length, 0])
        .padding(0.5)

    var y2 = d3.scaleBand()
        .domain(rankingData.map(d=> d.county ))
        .range([barHeight*rankingData.length, 0])
        .padding(0)

    var x2 = d3.scaleBand()
        .domain(["name", "value"])
        .range([0, width1 - 15])
        .padding(0)


    xCounty = width1 * 0.1
    xValue = width1 * 0.7

    //console.log(yLabels)

    var x_axis = d3.axisBottom(x).ticks(6)
    var y_axis = d3.axisLeft(y).tickValues([])

    function rankChart(){
        outerSvg.append("g")
            .attr("class", "axis axis--y axisWhite")
            .attr("transform", "translate(" + (margin.left + width1) + ",0)")
            //.call(x_axis)
        
        outerSvg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(" + (width1 + margin.left) + ",0)")
            .attr("y", 40)
            .attr("x",(width2/2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-size", "2rem")



        yAxis = axes.append("g")
            .attr("class", "axis axis--y axisWhite")
            .attr("id", "yAxis")
            .call(y_axis)


        draw_chart();
    }

    function draw_chart(){
        var rects = barsGroup.selectAll("rect")
            .data(rankingData, d=> d.county)

        rects.enter()
            .append("rect")
            .attr("class", "bar-color-2")
            .attr("id", function(d){ return "rank-rect-" + d.county; })
            .attr("x", 2)

            .attr("y", function(d){ return y(d.county); })
            .attr("height", y.bandwidth())
            .attr("opacity", 1)
            .attr("width", 0)
            .transition().duration(dur)
            .attr("width", function(d){ return x(d[rankingSel]); })

        
        chart.selectAll('.y-text-county')
            .data(yLabels)
            .enter()
                .append("text")
                .attr("class", "y-text-county")
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", clicked)
                .attr("x", xCounty)
                .attr("y", d=> y(d.county) + y.bandwidth()/2)
                .attr("fill", "#fff")
                .attr("dominant-baseline", "middle")
                .text(d=> d.county)

        chart.selectAll('.y-text-value')
            .data(yLabels)
            .enter()
                .append("text")
                .attr("class", "y-text-value")
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", clicked)
                .attr("x", xValue)
                .attr("y", d=> y(d.county) + y.bandwidth()/2)
                .attr("fill", "#fff")
                .attr("dominant-baseline", "middle")
                .text(d=> numberWithCommas(d[rankingSel]))

        bgRects = chart.selectAll(".bg-rects")
            .data(yLabels)
            .enter()
                .append("rect")
                .attr("class", "bg-rects")
                .attr("id", d=> "bg-rect-" + d.idName)
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", clicked)
                .attr("x", 0)
                .attr("y", d=> y(d.county) - y.bandwidth()/2)
                .attr("height", y.bandwidth()*2)
                .attr("width", width1)
                .attr("fill", "#fff")
                .attr("fill-opacity", 0)
    }


    function mouseover(d){
        document.body.style.cursor = "pointer"

        d3.select("#bg-rect-" + d.idName)
            .attr("fill-opacity", 0.2)

    }

    function mouseout(d){
        document.body.style.cursor = "default"
        d3.select("#bg-rect-" + d.idName)
            .attr("fill-opacity", 0)
    }

    function clicked(d){

    }

    function numberWithCommas(num) {
        //Retuns number seperated by commas
        if (typeof(num) == "string") return num
        if (num >= 1) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    rankChart.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return rankChart;
    }

    rankChart.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return rankChart;
    }


    return rankChart;
}


