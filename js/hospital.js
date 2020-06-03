function hospital_chart(config){
    var margin = { 
        left:config.width * 0.1,
        right:config.width * 0.08, 
        top: config.height * 0.15, 
        bottom:config.height * 0.15 }
    var dur = config.duration
    var hospSelection = "Los Angeles"
    var hospData;
    var stackedData;

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

    var area = d3.area()
        .x(function(d, i){
            return x(d.data.key); })
        .y0(function(d){ return y(d[0]); })
        .y1(function(d){ return y(d[1]); })

    var color = d3.scaleOrdinal()
        .domain(myGroups)
        .range(["#adc6e9", "#ffbc72"])
    
    var x = d3.scaleTime()
        .range([0, width])
        
    var y = d3.scaleLinear()
        .range([height, 0])

    
    var x_axis = d3.axisBottom().ticks(5)
    var y_axis = d3.axisLeft().ticks(6)

    var y_axis_grid = d3.axisLeft().tickSize(-width).tickFormat('').ticks(6)

    var hospLabels = svg.append('g')
        .attr("class", "axis")
    

    var xAxisCall = hospLabels.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .attr("class", "axisWhite axis--x")

    var yAxisCall = hospLabels.append("g")
        .attr("class", "axisWhite axis--y")


    var yGridCall = hospLabels.append('g')
        .attr("class", "axisGrid axis--y")


    hospLabels.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left/2)
        .attr("class", "axis-label")
        .text("Percent of Hospital beds")

    hospLabels.append('text')
        .attr("x", width/2)
        .attr("y", -margin.top*0.5)
        .attr("font-size", "1.8rem")
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .text("Percent of Hospital Beds Occupied by COVID-19 Patients")


    drawLegend();

    function drawLegend(){
        var hospLegend = svg.append('g')
        .attr("transform", "translate(" + width*0.05 + "," + height*0.03 + ")")

        hospLegend.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", color(myGroups[1]))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)

        hospLegend.append('rect')
            .attr("x", 0)
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", color(myGroups[0]))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)

        hospLegend.append("text")
            .attr("x", 30)
            .attr("y", 10)
            .attr("dominant-baseline", "middle")
            .attr("font-size", "1rem")
            .attr("fill", "#fff")
            .text("Standard Hospital Care")

        hospLegend.append("text")
            .attr("x", 30)
            .attr("y", 40)
            .attr("dominant-baseline", "middle")
            .attr("font-size", "1rem")
            .attr("fill", "#fff")
            .text("ICU Hospital Care")
    }

    

    function hospital(){
        updateScales()
        draw_chart();
    }


    function updateScales(){
        hospData = config.hospitalData[hospSelection]
        dates = d3.extent(hospData, d=> d.date)
        x.domain(dates)

        b = config.bedData.filter(function(d){
            return d["COUNTY_NAME"] == hospSelection.toUpperCase()
        })[0]

        y.domain([0, 100])

        hospData.forEach(function(d){
           tmp = (d.icuPos + d.icuSus)/b.covidAvailableBeds * 100

            d.values = [
                {
                    name: 'ICU Covid-19 Patients', val: (d.icuPos + d.icuSus + d.patients + d.suspected)/b.covidAvailableBeds * 100
                },
                {
                    name: 'Covid-19 Patients', val: (d.patients + d.suspected)/b.covidAvailableBeds * 100
                }
            ]
        })

        y_axis.scale(y)
        x_axis.scale(x)
        y_axis_grid.scale(y)
        
        xAxisCall.call(x_axis)
        yAxisCall.call(y_axis)
        yGridCall.transition().duration(dur).call(y_axis_grid)


        stackedData = d3.stack()
            .keys([0,1])
            .value(function(d, key){
                if (key < 2) return d.values[key].val
            })
            (hospData)
    }

    function draw_chart(){
        stacks = svg.selectAll(".layers")
            .data(stackedData)
        
        stacks
            .transition().duration(dur)
            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data.date); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )

        stacks.enter()
            .append("path")
            .attr("class", "layers")
            .style("fill", function(d){
                return color(myGroups[d.key]);
            })

            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data.date); })
                .y0(y(0))
                .y1(y(0))
            )   
            .transition().duration(dur)

            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data.date); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )
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


