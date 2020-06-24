function criteria_chart(config){
    var margin = {
        bottom: 5,
        left: 0,
        right: 0,
        top: 39.75
    }
    

    var result = [0,0,0,0]

    var dur= config.dur

    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;


    defaultWidth = 1248
    defaultHeight = 205

    

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
        .attr("x", width*0.2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "3em")
        .attr("fill", "#fff")
        .text("Cases Criteria")

    svg.append('text')
        .attr("class", "criteria-title")
        .attr("x", width*0.7)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "3em")
        .attr("fill", "#fff")
        .text("Hospitals Criteria")

    svg.append("line")
        .attr("x1", width*0.05)
        .attr("x2", width*0.48)
        .attr("y1", height*0.2)
        .attr("y2", height*0.2)
        .attr("stroke", "grey")

    svg.append("line")
        .attr("x1", width*0.52)
        .attr("x2", width*0.95)
        .attr("y1", height*0.2)
        .attr("y2", height*0.2)
        .attr("stroke", "grey")


    x1 = d3.scaleBand()
        .domain(['0', '1'])
        .range([0, width*0.49])
        .padding(0.1)

    x2 = d3.scaleBand()
        .domain(['2', '3'])
        .range([width *0.51, width])
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
    yrectStart = height * 0.4
    yIcon = height * 0.4

    columns = ['0', '1','2','3']

    var data = []
    var status = []
    columns.forEach(function(d, i){
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
        .attr("text-anchor", "middle")
        .text(d=> d.text)
        .call(wrap, x1.bandwidth())






    function criteria(){        
        draw_chart();
    }



    function draw_chart(){

        casesIcon = svg.append("text")
            .attr("x", width * 0.35)
            .attr("id", "cases-icon")
            .attr("y", 0)
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '3.5rem')
            .attr("fill", "#fff")
            .text('\uf00d')

        hospIcon = svg.append('text')
            .attr("x", width * 0.87)
            .attr("id", "hosp-icon")
            .attr("y", 0)
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '3.5rem')
            .attr("fill", "#fff")
            
    }

    var colors = ['#e51b1b', '#25e83b']
    var icons = ['\uf00d', '\uf00c']

    function updateResults(sel, val){
        
        result[sel] = val
        d3.select("#cases-icon")
            .transition().duration(dur)
            .attr("fill", function(){
                if (result[0] || result[1]) return colors[1]
                else return colors[0]
            })
            .text(function(){
                if (result[0] || result[1]) return icons[1]
                else return icons[0]
            })

        d3.select("#hosp-icon")
            .transition().duration(dur)
            .attr("fill", function(){
                if (result[2] || result[3]) return colors[1]
                else return colors[0]
            })
            .text(function(){
                if (result[2] || result[3]) return icons[1]
                else return icons[0]
            })

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
        updateResults(sel, value)
        return criteria;
    }


    return criteria;
}


