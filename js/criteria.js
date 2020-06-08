function criteria_chart(config){
    // var margin = { 
    //     left:config.width * 0,
    //     right:config.width * 0, 
    //     top: config.height * 0.15, 
    //     bottom:config.height * 0.15 }
    

    var margin = {
        bottom: 39.75,
        left: 0,
        right: 0,
        top: 39.75
    }
    

    var dur= config.dur

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;


    defaultWidth = 1248
    defaultHeight = 265



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

    var casesGroup = svg.append('g')
        .attr("transform", "translate(" + 0 + "," + 0 + ")");
    

    svg.append('text')
        .attr("class", "criteria-title")
        .attr("x", width*0.25)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "2.5em")
        .attr("fill", "#fff")
        .text("Cases Criteria")

    svg.append('text')
        .attr("class", "criteria-title")
        .attr("x", width*0.75)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "2.5em")
        .attr("fill", "#fff")
        .text("Hospitals Criteria")

    svg.append("line")
        .attr("x1", width*0.05)
        .attr("x2", width*0.45)
        .attr("y1", height*0.2)
        .attr("y2", height*0.2)
        .attr("stroke", "grey")

    svg.append("line")
        .attr("x1", width*0.55)
        .attr("x2", width*0.95)
        .attr("y1", height*0.2)
        .attr("y2", height*0.2)
        .attr("stroke", "grey")


    
    

    

    x = d3.scaleBand()
        .domain(['0', '1','2','3'])
        .range([0, width])
        .padding(0.15)


    x1 = d3.scaleBand()
        .domain(['0', '1'])
        .range([0, width*0.45])
        .padding(0.15)

    x2 = d3.scaleBand()
        .domain(['2', '3'])
        .range([width *0.55, width])
        .padding(0.1)


    descriptions = [
        'Less than 25 new cases per 100,000 residents in the past 14 days',
        'Less than 8% testing positive in the past 7 days',
        'Stable hospitalizations of COVID individuals on a 7-day average of daily percent changing of less than 5%',
        'No more than 20 COVID hospitalizations on any single day in the past 14 days'
    ]
    ids = ['cases', 'testing', 'stab', 'hosp-max']

    rectHeight = height * 0.5
    rectWidth = width/8
    yrectStart = height * 0.55
    yIcon = height * 0.4

    var data = []
    var status = []
    x.domain().forEach(function(d, i){
        if (i < 2) tmpX = x1(String(i))
        else tmpX = x2(String(i))
        data.push({
            x: tmpX,
            y: yrectStart,
            height: rectHeight,
            text: descriptions[i]
        })
        status.push({
            x: tmpX + x1.bandwidth()/2,
            y: yIcon,
            status: 0,
            id: ids[i]
        })

    })
    rects = svg.selectAll("rect")
        .data(data, d=> d.x)

    rects.enter()
        .append('rect')
        .attr("x", d=> d.texts)
        .attr("y", d=> d.y)
        .attr("height", d=> d.height)
        .attr("width", x1.bandwidth())
        //.attr("stroke", "#fff")
        .attr("fill", "none")

    texts = svg.selectAll('.desc-texts')
        .data(data, d=> d.x)

    texts.enter()
        .append('text')
        .attr('class', 'desc-texts')
        .attr('x', d=> d.x + x1.bandwidth()/2)
        .attr("y", d=> d.y)
        .attr('fill', "#fff")
        .attr("text-anchor", "middle")
        .text(d=> d.text)
        .call(wrap, x1.bandwidth())






    function criteria(){        
        draw_chart();
    }



    function draw_chart(){
        var icons = svg.selectAll(".icon-text")
            .data(status, d=> d.x)

        icons.enter()
            .append('text')
            .attr('class', 'icons-text')
            .attr("id", d=> "icon-" + d.id)
            .attr('x', d=> d.x)
            .attr('y', d=> d.y)
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '2rem')
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("opacity", 1)
            .text('\uf00d')
            .attr("fill", '#f72c11')



    }

    criteria.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return criteria;
    }

    criteria.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return criteria;
    }

    criteria.update = function(sel, value){
        if (!arguments.length) return testSelection;
        
        
        d3.select("#icon-" + sel)
            .transition().duration(dur)
                .attr("opacity", 1)
                .text((!value ? '\uf00d' : '\uf00c'))
                .attr("fill", (!value ? "#f72c11" : '#2a9905'))

        return criteria;
    }


    return criteria;
}


