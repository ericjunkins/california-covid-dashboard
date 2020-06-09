function ranking_chart(config){
    // var margin = { 
    //     left:config.width * 0.05,
    //     right:config.width * 0.05, 
    //     top: config.height * 0, 
    //     bottom:config.height * 0.05}


    var margin = {
        bottom: 25,
        left: 0,
        right: 30,
        top: 0
    }

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right,
        dur = config.duration
    // var color = d3.scaleOrdinal(config.scheme);
    // var cur_color = 0;

    // append the svg object to the body of the page



    defaultWidth = 531
    defaultHeight = 594
    defaultX = defaultWidth - config.width
    defaultY = defaultHeight - config.height


    var rankingSel = "cases"
    var rankingSort = "Descending"
    var yLabels = []
    var rankingData = []
    var yLabel
    
    document.getElementById("outer1").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("outer1").setAttribute("style", "height:" + (height + margin.top + margin.bottom) + "px");

    document.getElementById("ranking").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("ranking").setAttribute("style", "height:" + (height + margin.top) + "px");
    
    const outerSvg = d3.select("#outer1").append('svg')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr('viewBox', -defaultX/2 + " " + -defaultY/2 + " " + defaultWidth + ' ' + defaultHeight)

    // outerSvg.append('text')
    //     .attr("x", 0)
    //     .attr("y", -100)
    //     .attr("class", "title")
    //     .text("Cases by County")

    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom

    var barHeight = height/25
    var width1 = config.width* 0.4,
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
            deaths: deaths,
            caseAvg: d.caseAvg,
            deathAvg: d.deathAvg,
            county: d.county,
            idName: d.county.replace(/\s/g, '')
        })

    })

    h = 2050

    const svg = d3.select(config.selection).append('svg')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + h)
        .classed("svg-content", true)
        
    var chart = svg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")

    var barsGroup = svg.append("g")
        .attr("transform", "translate(" + ( margin.left + width1 )  + "," + margin.top + ")")

    
    var axes = barsGroup.append("g")


    var x = d3.scaleLinear()
        .range([0, width2])
    
    var y = d3.scaleBand()
        .range([0, barHeight*rankingData.length])
        .padding(0.5)

    var y2 = d3.scaleBand()
        .domain(rankingData.map(d=> d.county ))
        .range([barHeight*rankingData.length, 0])
        .padding(0)

    var x2 = d3.scaleBand()
        .domain(["name", "value"])
        .range([0, width1 - 15])
        .padding(0)

    var yAxisCall = axes.append("g")
        .attr("class", "axis axis--y axisWhite")
        .attr("id", "yAxis")

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


    var x_axis = d3.axisBottom().ticks(6)
    var y_axis = d3.axisLeft().tickValues([])

    function rankChart(){
        updateScales();
        draw_chart();
    }

    function updateScales(){
        if (rankingSort == "Ascending"){
            rankingData = rankingData.sort((a,b) => d3.ascending(a[rankingSel], b[rankingSel]))
        } else {
            rankingData = rankingData.sort(function(a, b){
                return d3.descending(a[rankingSel], b[rankingSel])
            })
        }

        var maxX = d3.max(rankingData, d=> d[rankingSel])
        var minX = d3.min(rankingData, d=> d[rankingSel])
        x.domain([Math.min(0, minX), maxX])
        y.domain(rankingData.map(d=> d.county ))

        x_axis.scale(x)
        y_axis.scale(y)

        yAxisCall.transition().duration(dur).call(y_axis)

    }

    function draw_chart(){

        xCounty = width1 * 0.1
        xValue = width1 * 0.7

        var rects = barsGroup.selectAll("rect")
            .data(rankingData, d=> d.county)

        rects.exit().remove()

        rects
            .transition().duration(dur)
            .attr("y", function(d){ return y(d.county); })
            .attr("width", function(d){ return x(d[rankingSel]); })


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

        
        var countyTexts = chart.selectAll('.y-text-county')
            .data(yLabels)

        countyTexts.exit().remove()

        countyTexts
            .transition().duration(dur)
            .attr("y", d=> y(d.county) + y.bandwidth()/2)

        countyTexts.enter()
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
            .attr("opacity", 0)
            .transition().duration(dur)
                .attr("opacity", 1)

        var valueTexts = chart.selectAll('.y-text-value')
            .data(yLabels)

        valueTexts.exit().remove()

        valueTexts
            .transition().duration(dur)
            .attr("y", d=> y(d.county) + y.bandwidth()/2)
            .text(d=> numberWithCommas(d[rankingSel]))

        valueTexts.enter()
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
            .attr("opacity", 0)
            .transition().duration(dur)
                .attr("opacity", 1)


        
        var bgRects = chart.selectAll(".bg-rects")
            .data(yLabels)

        bgRects.exit().remove()

        bgRects
            .attr("y", d=> y(d.county) - y.bandwidth()/2)

        bgRects.enter()
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
        if (String(num).split(".").length == 2) return num.toFixed(2)
        if (num == 0) return "0.0"
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

    rankChart.sorting = function(value){
        if (!arguments.length) return sorting;
        rankingSort = value;
        updateScales();
        draw_chart();
        return rankChart;
    }

    rankChart.selection = function(value){
        if (!arguments.length) return selection;
        rankingSel = value;
        updateScales();
        draw_chart();
        return rankChart;
    }




    return rankChart;
}


