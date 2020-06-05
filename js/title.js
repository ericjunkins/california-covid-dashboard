function title_chart(config){
    var margin = { 
        left:config.width * 0.05,
        right:config.width * 0.1, 
        top: config.height * 0, 
        bottom:config.height * 0 }


    var height = config.height - margin.top - margin.bottom, 
        width = config.width - margin.left - margin.right;


    // append the svg object to the body of the page
    var svg = d3.select(config.selection)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    dropdownX = (margin.left + width * 0.1)
    dropdownY = (height - 45)



    svg.append('text')
        .attr("transform", "translate(" + (-margin.left + dropdownX) + "," + (dropdownY-margin.top) + ")")
        .attr('x', 3)
        .attr("y", -8)
        .attr("fill", "#fff")
        .attr("font-size", "0.8rem")
        .text("Select ranking criteria:")

    svg.append('text')
        .attr("transform", "translate(" + (-margin.left + dropdownX + width/2) + "," + (dropdownY-margin.top) + ")")
        .attr('x', 3)
        .attr("y", -8)
        .attr("fill", "#fff")
        .attr("font-size", "0.8rem")
        .text("Select sorting:")

    var dropdownSel = d3.select(config.selection)
        .append("select")
            .attr("class", "select-css")
            .attr("id", "ranking-sel")
            .style("position", "absolute")
            .style("top", dropdownY + "px")
            .style("left", dropdownX + "px")
            .style("width", (width*0.45 + "px"))
                .on("change", dropdownChange)

    var dropdownSort = d3.select(config.selection)
        .append("select")
            .attr("class", "select-css")
            .attr("id", "sorting-sel")
            .style("position", "absolute")
            .style("top", dropdownY + "px")
            .style("left", (dropdownX + width/2 + 0.05) + "px")
            .style("width", (width*0.45 + "px"))
                .on("change", dropdownChange)

    function dropdownChange(d){
        updateRanking(this.id, this.value)
    }


    selectionData = [
        {name: "Current Total Cases", value: 'cases'},
        {name: 'Current Total Deaths', value: 'deaths'},
        {name: 'Recent Average Cases per Day', value: 'caseAvg'},
        {name: 'Recent Average Deaths per Day', value: 'deathAvg'}
    ]

    dropdownSel.selectAll("option")
        .data(selectionData)
        .enter()
            .append("option")
            .attr("value", d=> d.value)
            .text(d=> d.name)

    dropdownSort.selectAll("option")
        .data(["Descending", "Ascending"])
        .enter()
            .append("option")
            .attr("value", d=> d)
            .text(d=> d)


    svg.append('text')
        .attr("x", width/2)
        .attr("y", height * 0.25)
        .attr("class", "title")
        .text("County Breakdown")

    function title(){        

    }

    function draw_chart(){
    }

    title.width = function(value){
        if (!arguments.length) return width;
        width = value;
        return title;
    }

    title.height = function(value){
        if (!arguments.length) return height;
        height = value;
        return title;
    }

    title.selection = function(value){
        if (!arguments.length) return testSelection;
        testSelection = value;
        updateScales();
        updateLabels();
        draw_chart();
        return title;
    }


    return title;
}


