function hospital_chart(config){
    var margin = { 
        left:config.width * 0.1,
        right:config.width * 0.08, 
        top: config.height * 0.25, 
        bottom:config.height * 0.2 }
    var dur = config.duration
    var hospSelection = "Los Angeles"
    var hospData;
    var icuStack,
        genStack

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;
    
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%m/%d/%y")

    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    //console.log(config.hospitalData)

    myGroups = ["ICU Covid-19 Patients", "Covid-19 Patients"]
    icuGroup = ['ICU Covid-19 Patients', 'ICU Average Occupancy']
    genGroup = ['General Covid Patients', 'General Average Occupancy']


    chartSpacing = 0.2 * height
    height1 = height * 0.5 - chartSpacing/2
    height2 = height * 0.5 + chartSpacing/2

    var averageIcuOccupancy = 58
    var averageGenOccupacty = 54


    var area = d3.area()
        .x(function(d, i){
            return x(d.data.key); })
        .y0(function(d){ return y(d[0]); })
        .y1(function(d){ return y(d[1]); })

    var color = d3.scaleOrdinal()
        .domain(['0', '1'])
        .range(["#adc6e9", "#ffbc72"])
    
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        
    var y = d3.scaleLinear()
        .domain([0,100])
        .range([height1, 0])

    var y2 = d3.scaleLinear()
        .domain([100, 0])
        .range([height2, height])

    var x_axis = d3.axisBottom().ticks(5).tickPadding(10)
    var y_axis = d3.axisLeft(y).ticks(4)
    var y2_axis = d3.axisLeft(y2).ticks(4)

    var y_axis_grid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(6)
    var y2_axis_grid = d3.axisLeft(y2).tickSize(-width).tickFormat('').ticks(6)


    var upperChart = svg.append('g')

    var lowerChart = svg.append('g')
        .attr("transform", "translate(0," + height2 + ")")

    var upperLabels = svg.append('g')
        .attr("class", "axis")
    
    var xAxisCall = upperLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height1 + ")")
        .attr("class", "axisWhite axis--x")

    var yAxisCall = upperLabels.append("g")
        .attr("class", "axisWhite axis--y")
        .call(y_axis)

    var yGridCall = upperLabels.append('g')
        .attr("class", "axisGrid axis--y")
        .call(y_axis_grid)


    var lowerLabels = svg.append('g')
            .attr("class", "axis")

    var x2AxisCall = lowerLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")


    var y2AxisCall = lowerLabels.append("g")
        .attr("class", "axisWhite axis--y")
        .call(y2_axis)


    var y2GridCall = lowerLabels.append('g')
        .attr("class", "axisGrid axis--y")
        .call(y2_axis_grid)

    upperLabels.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x", -height1/2)
        .attr("y", -margin.left/2)
        .attr("class", "axis-label")
        .text("ICU")

    upperLabels.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x", -height*0.75)
        .attr("y", -margin.left/2)
        .attr("class", "axis-label")
        .text("General")
    

    // upperLabels.append('text')
    //     .attr("transform", "rotate(-90)")
    //     .attr("x", -height1/2)
    //     .attr("y", -margin.left/2)
    //     .attr("class", "axis-label")
    //     .text("ICU")

    svg.append('text')
        .attr("x", width/2)
        .attr("y", -margin.top*0.65)
        .attr("class", "title")
        // .attr("font-size", "1.8em")
        // .attr("fill", "#fff")
        // .attr("text-anchor", "middle")
        .text("Percent Occupancy by COVID-19 Patients")


    drawLegend();

    function drawLegend(){

        rectSize = 25
        lineStart = width*0.18
        spacing = 10
        legendGroup = svg.append("g")
            .attr("transform", "translate(" + (width *0.31) + "," + (-margin.top * 0.25) + ")")

        legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", -rectSize/2)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("class", "bar-color-2")


        legendGroup.append("text")
            .attr("x", rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Occupied Beds")



        legendGroup.append("line")
            .attr("x1", lineStart)
            .attr("x2", lineStart + rectSize)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("class", "hosp-thresh-line")

        legendGroup.append("text")
            .attr("x", lineStart + rectSize + spacing)
            .attr("y", 0)
            .attr("class", "legend-text")
            .attr("dominant-baseline", "middle")
            .text("Average Open Hospital Beds*")
    
        svg.append('g')
            .attr("transform", "translate(" + (0) + "," + (height + margin.bottom*0.8) + ")")
            .append('text')
            .attr("x", width * 0.05)
            .attr("y", 0)
            .attr("font-size", "1em")
            .attr("fill", "#fff")
            .text("*Average values based on average hospital utilization accross all of CA. Later I hope to replace with data for each county on a day-by-day basis")

    }

    drawAverageLines()

    function drawAverageLines(){        

        upperChart.append("line")
            .attr("class", "hosp-thresh-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(100 -averageIcuOccupancy))
            .attr("y2", y(100 - averageIcuOccupancy))

        svg.append("line")
            .attr("class", "hosp-thresh-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y2(100 -averageGenOccupacty))
            .attr("y2", y2(100 - averageGenOccupacty))
    }
    

    function hospital(){
        updateScales()
        draw_chart();
    }


    function updateScales(){
        hospData = config.hospitalData[hospSelection]
        //dates = d3.extent(hospData, d=> d.date)
        dates = hospData.map(function(d){ return d.formattedDate; })
        b = config.bedData.filter(function(d){
            return d["COUNTY_NAME"] == hospSelection.toUpperCase()
        })[0]

        hospData.forEach(function(d){            
            averageIcuOccupancy = 58
            covidIcuPatients = d.icuPos + d.icuSus
            averageGenOccupacty = 68
            covidGenPatients = d.patients + d.suspected
            d.covidIcuPatients = (d.icuPos + d.icuSus)/b['INTENSIVE CARE'] * 100
            d.covidGenPatients = (d.patients + d.suspected)/b.covidAvailableBeds * 100
            d.icu = [
                {
                    name: 'ICU Covid Patients', 
                    val: covidIcuPatients/b['INTENSIVE CARE'] * 100
                    
                },
                {
                    name: 'ICU Average Occupancy', 
                    val: averageIcuOccupancy
                }
            ]

            d.general = [
                {
                    name: 'General Covid Patients', 
                    val: covidGenPatients/b.covidAvailableBeds * 100
                },
                {
                    name: 'General Average Occupancy', 
                    val: averageGenOccupacty
                }
            ]
        })
        
        x.domain(dates)

        var ticks = x.domain().filter(function(d, i){ return !( i % 7 ); });

        x_axis.scale(x).tickValues( ticks );
        
        xAxisCall.transition().duration(dur).call(x_axis)
        x2AxisCall.transition().duration(dur).call(x_axis)

        icuStack = d3.stack()
            .keys([0,1])
            .value(function(d, i){ return d.icu[i].val })
            (hospData)
        
        genStack = d3.stack()
            .keys([0,1])
            .value(function(d, i){ return d.general[i].val })
            (hospData)

        icuStack.forEach(function(d, i){
            d.key = icuGroup[i]
            d.index = i
        })

        genStack.forEach(function(d, i){
            d.key = genGroup[i]
            d.index = i
        })
    }

    function draw_chart(){
        drawUpperChart();
        drawLowerChart();
    }

    function drawUpperChart(){
        icuMax = d3.max(hospData, d=> d.covidIcuPatients )
        if (!icuMax) data = []
        else data = hospData

        icuRect = upperChart.selectAll(".icu-rect")
            .data(data, d=> d.formattedDate)

        icuRect.exit().remove()

        icuRect
            .transition().duration(dur)
            .attr("x", d=> x(d.formattedDate))
            .attr("width", x.bandwidth())
            .attr("y", d=> y(d.covidIcuPatients))
            .attr("height", d=> y(0) - y(d.covidIcuPatients))

        icuRect.enter()
            .append("rect")
            .attr("class", "icu-rect bar-color-2")
            .attr("x", d=> x(d.formattedDate))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition().duration(dur)
                .attr("y", d=> y(d.covidIcuPatients))
                .attr("height", d=> y(0) - y(d.covidIcuPatients))
        
    }

    function drawLowerChart(){
        genMax = d3.max(hospData, d=> d.covidGenPatients )
        if (!genMax) data = []
        else data = hospData

        genRect = upperChart.selectAll(".gen-rect")
            .data(data, d=> d.formattedDate)

        genRect.exit().remove()

        genRect
            .transition().duration(dur)
            .attr("x", d=> x(d.formattedDate))
            .attr("width", x.bandwidth())
            .attr("y", d=> y2(d.covidGenPatients))
            .attr("height", d=> y2(0) - y2(d.covidGenPatients))

        genRect.enter()
            .append("rect")
            .attr("class", "gen-rect bar-color-2")
            .attr("x", d=> x(d.formattedDate))
            .attr("y", y2(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition().duration(dur)
                .attr("y", d=> y2(d.covidGenPatients))
                .attr("height", d=> y2(0) - y2(d.covidGenPatients))
    }


    hospital.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return hospital;
    }

    hospital.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return hospital;
    }

    hospital.selection = function(value){
        if (!arguments.length) return hospSelection;
        hospSelection = value;
        updateScales();
        draw_chart();
        return hospital;
    }


    return hospital;
}


