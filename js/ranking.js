function ranking_chart(config){
    // var margin = { 
    //     left:config.width * 0.05,
    //     right:config.width * 0.05, 
    //     top: config.height * 0, 
    //     bottom:config.height * 0.05}


    var margin = {
        bottom: 20,
        left: 30,
        right: 30,
        top: 40
    }

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right,
        dur = config.duration
    // var color = d3.scaleOrdinal(config.scheme);
    // var cur_color = 0;

    // append the svg object to the body of the page



    defaultWidth = 900
    defaultHeight = 320
    defaultX = defaultWidth 
    defaultY = defaultHeight


    var rankingSel = "cases"
    var rankingSort = "Descending"
    var yLabels = []
    var rankingData = []

    var startDataText
    var endDateText
    
    width = defaultWidth - margin.left - margin.right
    height = defaultHeight  - margin.top - margin.bottom

    document.getElementById("outer1").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("outer1").setAttribute("style", "height:" + (defaultHeight + margin.top + margin.bottom) + "px");

    document.getElementById("ranking").setAttribute("style", "width:" + (width +margin.left + margin.right) + "px");
    document.getElementById("ranking").setAttribute("style", "height:" + (defaultHeight + margin.top) + "px");
    
    h = 2050

    const svg = d3.select(config.selection).append('svg')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr('viewBox', 0 + " " + 0 + " " + defaultWidth + ' ' + h)
        .classed("svg-content", true)

    const outerSvg = d3.select("#outer1").append('svg')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr('viewBox', -defaultX/2 + " " + -defaultY/2 + " " + defaultWidth + ' ' + defaultHeight)


    var barHeight = height/10
    var width1 = width* 0.5,
        width2 = width - width1

    //console.log(config.criteria)



    var textArray = []

    var textColumns = ['county', 'currentCases', 'currentCasesNormalized', 'currentDeaths', 'currentDeathsNormalized']
    var textColumNames = ['County', 'Cases', 'Per 100k', 'Deaths', 'Per 100k']


    config.criteria.forEach(function(d){
        if (d.data.length){
            cases = d.data[d.data.length -1].cases
            deaths = d.data[d.data.length -1].deaths
            rankingData.push({
                county: d.county,
                cases: cases,
                deaths: deaths,
                caseAvg: d.caseAvg,
                deathAvg: d.deathAvg
            })
        }
        yLabels.push({
            cases: cases,
            deaths: deaths,
            currentCases: d.currentCases,
            currentDeaths: d.currentDeaths,
            currentCasesNormalized: d.currentCasesNormalized,
            currentDeathsNormalized: d.currentDeathsNormalized,
            caseAvg: d.caseAvg,
            deathAvg: d.deathAvg,
            county: d.county,
            idName: d.county.replace(/\s/g, '')
        })

        for (var i=0; i<5; i++){
            textArray.push({
                x: textColumns[i],
                y: d.county,
                text: d[textColumns[i]],
                id: d.county + "-" + textColumns[i]
            })
        }
        
    })


    var chart = svg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")

    var barsGroup = svg.append("g")
        .attr("transform", "translate(" + ( margin.left)  + "," + margin.top + ")")

    var barChart = barsGroup.append("g")
    
    var labels = chart.append('g')
    var columnData = labels.append('g')

    var axes = barsGroup.append("g")

    var xOrdinal = d3.scaleOrdinal()
        .domain(textColumns)
        .range([0, width1 * 0.5, width1 * 0.64, width1 * 0.83, width1*0.95])

    var x = d3.scaleLinear()
        .range([0, width2])
    
    var y = d3.scaleBand()
        .range([0, barHeight*rankingData.length])
        .padding(0)

    var y2 = d3.scaleBand()
        .range(y.range())
        .padding(0)

    var x2 = d3.scaleBand()
        .domain(["name", "value"])
        .range([0, width1 - 15])
        .padding(0)


    var colors = d3.scaleOrdinal()
        .domain(['falling', 'flat', 'significant', 'moderate', 'extreme'])
        .range(["#ababab", "#badee8", "#f2df91",  '#ffae43', '#ff6e0b', '#8c0804'])

    var colorLinear = d3.scaleLinear()
        .domain([0.05, 0.1, 0.5])
        .range(['#ffae43', '#ff6e0b', '#8c0804'])
    
    var xTime = d3.scaleBand()
        .range([width1+10, width])
        .padding(0.0)

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
        drawLabels();
        drawTexts();
        drawBars();
        drawDividers();
    }

    rectTest = []


    

    function updateScales(){
        if (rankingSort == "Ascending"){
            yLabels = yLabels.sort((a,b) => d3.ascending(a[rankingSel], b[rankingSel]))
        } else {
            yLabels = yLabels.sort(function(a, b){
                return d3.descending(a[rankingSel], b[rankingSel])
            })
        }

        var maxX = d3.max(yLabels, d=> d[rankingSel])
        var minX = d3.min(yLabels, d=> d[rankingSel])
        x.domain([Math.min(0, minX), maxX])
        y.domain(yLabels.map(d=> d.county ))

        x_axis.scale(x)
        y_axis.scale(y)
        y2.domain(y.domain())
        // yAxisCall.transition().duration(dur).call(y_axis)

        rectTest = config.criteria.filter(d=> d.county=="Los Angeles")[0]
        dates = rectTest.fullData.map(d=> d.date)
        

        xTime.domain(dates)

        config.criteria.forEach(function(d){
            // console.log(d)
            countyDates = d.fullData.map(v=> v.date)
            dates.forEach(function(v){
                if (!countyDates.includes(v)){
                    d.fullData.push({
                        date: v,
                        newCasesAvg: 0,
                        prevCaseAvg: 0,
                        county: d.county
                    })
                }
            })
        })
    }

    var threshold = {
        flat: 0.025,
        significant: 0.05,
        moderate: 0.25,
        extreme: 0.4
    }

    function getColor(cur, prev){
        if (cur == 0) return "#c4c4c4"
        else if (cur - prev <= -threshold.moderate) return "#badee8"
        else if (Math.abs(cur - prev) <= threshold.significant) return "#f2df91"
        else if (cur - prev <= threshold.moderate) return '#ffae43'
        else if (cur - prev <= threshold.extreme) return '#ff6e0b'
        else return '#8c0804'
    }

    function drawLabels(){
        var columnLabels = labels.selectAll("text")
            .data(textColumns)

        columnLabels.enter()
            .append('text')
            .attr("fill", "#838383")
            .text(function(d, i){ 
                return textColumNames[i]
            })
            .attr("y", function(d, i){
                offset =  (d == 'county' || d == "currentCases" || d == "currentDeaths" ?  15 : 23)
                return -y.bandwidth()/2 - offset
            })
            // .attr("y", -y.bandwidth()/2 - 15)
            .attr("font-size", "0.6em")
            .attr("x", function(d){ return xOrdinal(d) })
            .attr("text-anchor", d=> (d != "county" ? "end" : "start"))
            .call(wrap, 30)
            // .text(function(d, i){ return })
            

        startDataText = labels.append("text")
            .attr("x", width1 + 10)
            .attr("y", -y.bandwidth()/2 - 5 )
            .attr("class", "stat-td-minor")

        endDateText = labels.append('text')
            .attr("x", width)
            .attr("y", -y.bandwidth()/2 - 5 )
            .attr("text-anchor", "end")
            .attr("class", "stat-td-minor")
    }

    function drawTexts(){

        minDate = d3.timeParse("%Y-%m-%d")(xTime.domain()[0])
        maxDate = d3.timeParse("%Y-%m-%d")(xTime.domain()[xTime.domain().length -1])
        startDataText.text(d3.timeFormat("%b %d")(minDate))
        endDateText.text(d3.timeFormat("%b %d")(maxDate))

        var texts = columnData.selectAll("text")
            .data(textArray, d=> d.id)

        texts.enter()
            .append('text')
            .attr("class", d=> (d.x == 'county' || d.x == "currentCases" || d.x == "currentDeaths" ? "stat-td-major" : "stat-td-minor"))
            .attr("x", d=> xOrdinal(d.x))
            .attr("y", d=> y(d.y))
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", d=> (d.x != "county" ? "end" : "start"))
            .text(d=>d.text)

    }

    function drawDividers(){
        var lines = chart.selectAll("line")
            .data(config.criteria,  d=> d.county)

        lines.enter()
            .append('line')
            .attr("class", "ranking-gridlines")
            .attr("x1", -margin.left/2)
            .attr("x2", width + margin.right/2)
            .attr("y1", d=> y2(d.county) - y2.bandwidth()/2)
            .attr("y2", d=> y2(d.county) - y2.bandwidth()/2)

    }

    function drawBars(){
        // barsHeight = 25
        // testRectangles = barChart.selectAll("rect")
        //     .data(rectTest.fullData, d=> d.date)

        // testRectangles.enter()
        //     .append("rect")
        //     .attr("y", y("Los Angeles") -y.bandwidth()/2)
        //     .attr("x", d=> xTime(d.date))
        //     .attr("height", y.bandwidth())
        //     .attr("width", xTime.bandwidth()+1)
        //     .attr("fill", d=> getColor(d.newCasesAvg, d.prevCaseAvg))

        var bars = barChart.selectAll("g")
            .data(config.criteria, d=> d.county)

        g = bars.enter()
            .append("g")
            .attr('id', d=> 'group-' + d.county)
            .attr('transform', d=> 'translate(0,' + (y(d.county)) + ")")

        // g
        //     .transition().duration(dur)
        //     .attr('transform', d=> 'translate(0,' + y(d.county) + ")")

    
        barHeight = y.bandwidth()/3

        rects = g
            .each(function(d, i, f){ 
                d3.select(f[i]).selectAll('rect')
                    .data(d.fullData, function(v){
                        return v.date
                    })
                    .enter()
                    .append("rect")
                        .attr("y", y("Los Angeles") - barHeight/2)
                        .attr("x", function(v){
                            return xTime(v.date)
                        })
                        .attr("height", barHeight)
                        .attr("width", xTime.bandwidth()+1)
                        .attr("fill", v=> getColor(v.newCasesAvg, v.prevCaseAvg))
            })
    }

    function draw_chart(){
        return;
        xCounty = width1 * 0.1
        xValue = width1 * 0.5

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


