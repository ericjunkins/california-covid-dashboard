
var parseTime = d3.timeParse("%Y-%m-%d")
var today = new Date()
var compTime = d3.timeDay.offset(today, -16)
var calCoordinates = {}
var default_color = '#42d5c6'
var doubleCap = 60

let testingWindow = 7;
let windowSize = 2;
let doublingWindow = 3;
let hospWindowSize = 7;

const unavailableBedtypes = ['ACUTE PSYCHIATRIC CARE', 'INTENSIVE CARE NEWBORN NURSERY', 'LABOR AND DELIVERY', 'PEDIATRIC', 'PEDIATRIC INTENSIVE CARE UNIT', 'PERINATAL', 'REHABILITATION', 'RENAL TRANSPLANT', 'INTENSIVE CARE']


var promises = [
    d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"),
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.json("data/cb_2014_us_county_5m.json"),
    //d3.json("https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-county-boundaries&q=CA&rows=100&facet=stusab")
    d3.json("data/us-county-boundaries.json"),
    d3.csv("data/covid19data.csv"),
    d3.csv("data/ca_county_beds.csv"),
    d3.csv("data/la_testing.csv"),
    d3.tsv("data/population.tsv")
]


Promise.all(promises).then(ready)



d3.select("#county-select")
    .on("change", dropdownChange)

d3.select("#testing-select")
    .on("change", dropdownChange)

d3.select("#sorting-select")
    .on("change", dropdownChange)

d3.select("#ranking-select")
    .on("change", dropdownChange)


function dropdownChange(){
    var id = d3.select(this).property("id");
    var sel = d3.select(this).property('value')
    if (id == "county-select"){
        casesSliderVis.selection(sel)
        casesChartVis.selection(sel)
        hospChartVis.selection(sel)
        hospSliderVis.selection(sel)
        hospMaxSliderVis.selection(sel)

    } else if (id == "testing-select"){
        testingVis.selection(sel)
    } else if (id == "sorting-select"){
        rankingVis.sorting(sel) 
    } else if (id == "ranking-select"){
        rankingVis.selection(sel)
    }
}

function updateCriteriaIcon(sel, value){
    criteriaVis.update(sel, value)
}



function ready([covidData, us, caliCounty, coords, hosp, beds, laTesting, population]){
    bedKeys = d3.keys(beds[0])
    beds.forEach(function(d){
        bedKeys.forEach(function(v){
            tmp = + d[v]
            if (!isNaN(tmp)) d[v] = tmp
        })
        d.covidAvailableBeds = d.BED_CAPACITY
        unavailableBedtypes.forEach(function(j){
            d.covidAvailableBeds -= d[j]
        })
    })

    hosp.forEach(function(d){
        d.date = d3.timeParse("%m/%d/%Y")(d['Most Recent Date'])
        d.formattedDate = d3.timeFormat("%m/%d")(d.date)
        d.county    =  d["County Name"]
        d.icuPos    = +d["ICU COVID-19 Positive Patients"]
        d.icuSus    = +d["ICU COVID-19 Suspected Patients"]
        d.patients  = +d["COVID-19 Positive Patients"]
        d.suspected = +d["Suspected COVID-19 Positive Patients"]
        d.confirmed = +d["Total Count Confirmed"]
        d.death     = +d["Total Count Deaths"]

        delete d["County Name"]
        delete d['Most Recent Date']
        delete d["ICU COVID-19 Positive Patients"]
        delete d["ICU COVID-19 Suspected Patients"]
        delete d["COVID-19 Positive Patients"]
        delete d["Suspected COVID-19 Positive Patients"]
        delete d["Total Count Confirmed"]
        delete d["Total Count Deaths"]
    })

    hospByCounty = d3.nest()
        .key(d => d.county)
        .object(hosp)

    for (var[key, value] of Object.entries(hospByCounty)){
        movingWindow = []
        value.forEach(function(d, i){
            d.covidPatients = d.icuPos + d.icuSus + d.patients + d.suspected
            movingWindow.push(d)
            if (movingWindow.length > hospWindowSize) movingWindow.shift()
            d.covidPatientsAvg = d3.sum(movingWindow, e=> e.covidPatients)/movingWindow.length

            if (i){
                prev = value[i-1].covidPatientsAvg
                d.covidPatientsIncreaseAvg = d.covidPatientsAvg - prev
                d.covidPatientsIncrease = d.covidPatients - value[i-1].covidPatients
                if (prev == 0 && d.covidPatientsIncrease == 0) d.covidPercentChange = 0
                else if (prev == 0) d.covidPercentChange = 100
                else d.covidPercentChange = 100 * (d.covidPatientsIncreaseAvg)/prev
                d.covidPercentThresh = prev * 1.05

            } else {
                d.covidPatientsIncrease = 0
                d.averagePercent = 0
                d.covidPercentChange = 0
            }
        })
    }
        
    coords.forEach(function(d){
        calCoordinates[d.fields.geoid] = {
            county: d.fields.name,
            state: d.fields.stusab,
            latitude: d.fields.geo_point_2d[0],
            longitude: d.fields.geo_point_2d[1],
            lsad: d.fields.lsad,
            coords: [d.fields.geo_point_2d[1], d.fields.geo_point_2d[0]]
        }
    })

    laTesting.sort(function(a,b){
        return d3.descending(+a[""], +b[""])
    })

    var testingData = { 'Cumulative': [], 'Daily': [], 'Weekly': []}
    laTesting.forEach(function(d, i){
        //console.log(d['total_cases'])
        
        if (!(i % testingWindow)) {
            tmpArr = []
            tmpDate = d3.timeParse("%Y-%m-%d")(d['date_dt'])
            tmpArr.push(d)
        } else if ((i % testingWindow) == testingWindow - 1) {
            tmpArr.push(d)
            testingData.Weekly.push({
                date: tmpDate,
                formattedDate: d3.timeFormat("%m/%d")(tmpDate),
                cases: d3.sum(tmpArr, d=> d['new_case']),
                deaths: d3.sum(tmpArr, d=> d['new_deaths']),
                tests: d3.sum(tmpArr, d=> d['new_persons_tested'])
            })
        } else  tmpArr.push(d)
        var date = d3.timeParse("%Y-%m-%d")(d['date_dt'])

        testingData.Cumulative.push({
            date: date,
            formattedDate: d3.timeFormat("%m/%d")(date),
            cases: +d['total_cases'],
            deaths: +d['total_deaths'], 
            tests: +d['total_persons_tested']
        })

        testingData.Daily.push({
            date: date,
            formattedDate: d3.timeFormat("%m/%d")(date),
            cases: +d['new_case'],
            deaths: +d['new_deaths'], 
            tests: +d['new_persons_tested']
        })
    }) 

    caliData = covidData.filter(d=> d.state == "California")

    caliData.forEach(function(d){
        d.fips = +d.fips
        d.cases = +d.cases
        d.deaths = +d.deaths
    })

    countyData = d3.nest()
        .key(function(d){ return d.county })
        .entries(caliData)
    
    dateData = d3.nest()
        .key(function(d){ return d.date })
        .entries(caliData)

    counties = countyData.map(d=> d.key).sort((a,b) => d3.ascending(a, b))
    counties.forEach(function(d){
        if (d!= "Unknown") $("#county-select").append(new Option(d, d))
    })

    $(function(){
        $("#county-select").val("Los Angeles")
    })


    criteriaData = []

    countyData.forEach(function(d, i){
        if (d.key == "Unknown") return 
        movingWindow = []
        twoWeekWindow = []
        barsData = []
        previousCases = 0
        prevCaseAvg = 0
        pop = population.filter(e => e.county == d.key)[0].population
        d.values.forEach(function(v, j){
            movingWindow.push(v)
            if (movingWindow.length > windowSize){
                movingWindow.shift()
            }
            
            v.newCases = v.cases - previousCases
            
            twoWeekWindow.push(v)
            if (twoWeekWindow.length > 14) twoWeekWindow.shift();

            v.newCasesAvg = Math.ceil(d3.sum(twoWeekWindow, e=> e.newCases)/twoWeekWindow.length) * (100000/pop)
            v.growthStatus = getIncreasingStatus(prevCaseAvg, v.newCasesAvg, previousCases)
            v.prevCaseAvg = prevCaseAvg
            v.binnedCase = Math.ceil(d3.sum(movingWindow.map(v=> v.cases ))/movingWindow.length)
            t = Math.min(j, doublingWindow)

            prevInd = j - t
            prevCases = d.values[prevInd].binnedCase

            if (t == 0 || prevCases == v.binnedCase) v.doubleDays = doubleCap
            else v.doubleDays = Math.min(doubleCap, t/(Math.log2(v.binnedCase) - Math.log2(prevCases)))
            
            prevCaseAvg = v.newCasesAvg
            previousCases = v.cases

            if (!(j % 1)) barsData.push(v)

            

        })
        barsData = barsData.filter(v => parseTime("2020-03-01") <= parseTime(v.date))

        var twoWeekPeriod = d.values.filter( v=> compTime <= parseTime(v.date) )
        if (d.key != "Unknown"){
            criteriaData.push({
                data: twoWeekPeriod,
                county: d.key,
                fips: d.values[0].fips,
                state: d.values[0].state,
                population: +pop,
                fullData: barsData
            })
        }
    })



    criteriaData.sort(function(a,b){
        return d3.ascending(a.county, b.county)
    })

    criteriaData.forEach(function(d){
        // caseThreshold = 25 * (d.population/100000)
        d.data.forEach(function(v, i){
            if ( i!= 0){ 
                v.caseIncrease = v.cases - prevCase
                v.deathIncrease = v.deaths - prevDeath
                v.deriv = v.caseIncrease - d.data[i-1].caseIncrease
                v.caseIncreasePercent = v.caseIncrease/v.cases * 100
            } else {
                v.deriv = 0
                v.caseIncrease = 0
                v.deathIncrease = 0
            }
            prevCase = v.cases
            prevDeath = v.deaths
            v.casesPerCapita = v.cases/d.population
            v.deathsPerCapita = v.deaths/d.population
            v.formattedDate = d3.timeFormat("%m/%d")(parseTime(v.date))
            v.normalizedCases = Math.max(0, v.caseIncrease * (100000/d.population))
            v.population = d.population

            if (i == d.data.length -1){
                d.currentCases = v.cases
                d.currentDeaths = v.deaths
                d.currentCasesNormalized = Math.round(v.cases * (100000/d.population))
                d.currentDeathsNormalized = Math.round(v.deaths * (100000/d.population))
            }

        })



        d.caseAvg = d3.sum(d.data, d=> d.caseIncrease)/14
        d.deathAvg = d3.sum(d.data, d=> d.deathIncrease)/14
        d.derivAvg = d3.sum(d.data, d=> d.deriv)/14
        d.chartData = d.data.slice(1, d.data.length)
        d.totalNormalizedCases = Math.ceil(d3.sum(d.chartData, e=> e.normalizedCases))

        if (d.chartData.length <= 1){
            d.newCaseSlope = 0
            d.newCaseIntercept = 0
            d.newCaseRsq = 0
        } else {
            var xSeries = d3.range(0, d.chartData.map(d=> d.date).length)
            var ySeries = d.chartData.map(d=> d.caseIncrease)
            var lsc = leastSquares(xSeries, ySeries)

            var ySeriesPercent = d.chartData.map(d=> d.caseIncreasePercent)
            var lscPercent = leastSquares(xSeries, ySeriesPercent)

            var ySeriesDouble = d.chartData.map(d=> d.doubleDays)
            var lscDouble = leastSquares(xSeries, ySeriesDouble)

            d.newCaseSlope = (d.caseAvg == 0 && lsc[0] == 0 ? -999 : +lsc[0].toFixed(3))
            d.newCaseIntercept = +lsc[1].toFixed(3)
            d.newCaseRsq = +lsc[2].toFixed(3)

            d.newCaseSlopePercent = (d.caseAvg == 0 && lscPercent[0] == 0 ? -999 : +lscPercent[0].toFixed(3))
            d.newCaseInterceptPercent = +lscPercent[1].toFixed(3)
            d.newCaseRsqPercent = +lscPercent[2].toFixed(3)

            if (d.caseAvg == 0){
                d.newCaseSlopeDouble = 0
                d.newCaseInterceptDouble = doubleCap
                d.newCaseRsqDouble = 0

            } else {
                d.newCaseSlopeDouble = +lscDouble[0].toFixed(3)
                d.newCaseInterceptDouble = +lscDouble[1].toFixed(3)
                d.newCaseRsqDouble = +lscDouble[2].toFixed(3)
            }
        }
    })

    var windowHeight = window.innerHeight;

    twoWeekData = dateData.slice(dateData.length - 15, dateData.length -1)
    //var row0 = windowHeight * 0.25
    var casesRow = 2000
    var hospRow = 2000
    var row1 = windowHeight * 0.2
    var row2 = windowHeight * 0.3


    mapConfig = {
        'selection': "#map-chart",
        'height': windowHeight * 0.5,
        'width': parseInt(d3.select("#map-chart").style("width"), 10),
        'duration': 750,
        'countyData': dateData[dateData.length -1].values,
        'cal': caliCounty,
        'criteria': criteriaData,
        'coordinates' : calCoordinates,
        'defaultColor' : default_color
    }

    casesThresholds = {
        max: 100,
        min: 0,
        thresh: 25
    }

    hospThresholds = {
        max: 10,
        min: -10,
        thresh: 5
    }

    hospMaxThresholds = {
        max: 80,
        min: 0,
        thresh: 20
    }

    sliderRadius = 70

    

    criteriaConfig = {
        'selection': "#criteria-chart",
        'height': parseInt(d3.select("#criteria-row").style("height"), 10),
        'width': parseInt(d3.select("#criteria-chart").style("width"), 10),
        'duration': 750,
        'criteria': criteriaData,
        'thresholds': casesThresholds,
        'type': 'cases'
    }

    

    casesSliderConfig = {
        'selection': "#cases-slider",
        'height':  casesRow*0.6,
        'width': parseInt(d3.select("#cases-slider").style("width"), 10),
        'duration': 750,
        'criteria': criteriaData,
        'thresholds': casesThresholds,
        'radius': sliderRadius,
        'type': 'cases',
        'shifts': {left: 10}
    }

    testingSliderConfig = {
        'selection': "#testing-slider",
        'height':  casesRow*0.6,
        'width': parseInt(d3.select("#testing-slider").style("width"), 10),
        'duration': 750,
        'criteria': criteriaData,
        'thresholds': casesThresholds,
        'radius': sliderRadius,
        'type': 'null',
        'shifts': {left: -5}
    }

    hospSliderConfig = {
        'selection': "#hosp-slider",
        'height': hospRow*0.6,
        'width': parseInt(d3.select("#cases-slider").style("width"), 10),
        'duration': 750,
        'hospitalData': hospByCounty,
        'thresholds': hospThresholds,
        'radius': sliderRadius,
        'type': 'hosp',
        'shifts': {left: 10}
    }

    hospMaxSliderConfig = {
        'selection': "#hosp-max-slider",
        'height':  casesRow*0.6,
        'width': parseInt(d3.select("#cases-slider").style("width"), 10),
        'duration': 750,
        'hospitalData': hospByCounty,
        'thresholds': hospMaxThresholds,
        'radius': sliderRadius,
        'type': 'hospMax',
        'shifts': {left: -15}
    }

    casesChartConfig = {
        'selection': "#cases-chart",
        'height': casesRow,
        'width': parseInt(d3.select("#cases-chart").style("width"), 10),
        'duration': 750,
        'countyData': dateData[dateData.length -1].values,
        'criteria': criteriaData,
        'hospitalData': hospByCounty,
        'defaultColor' : default_color
    }

    hospChartConfig = {
        'selection': "#hosp-chart",
        'height': hospRow,
        'width': parseInt(d3.select("#hosp-chart").style("width"), 10),
        'duration': 750,
        'countyData': dateData[dateData.length -1].values,
        'criteria': criteriaData,
        'hospitalData': hospByCounty,
        'defaultColor' : default_color
    }



    rankingConfig = {
        'selection': "#ranking",
        'height': windowHeight * 0.4,
        'width': parseInt(d3.select("#ranking").style("width"), 10),
        'duration': 750,
        'countyData': dateData[dateData.length -1].values,
        'cal': caliCounty,
        'criteria': criteriaData,
        'coordinates' : calCoordinates,
        'defaultColor' : default_color
    }


    testingConfig = {
        'selection': "#testing-chart",
        'height': windowHeight * 0.35,
        'width': parseInt(d3.select("#testing-chart").style("width"), 10),
        'duration': 750,
        'testingData': testingData,
        'defaultColor' : default_color
    }

    rankingLegendConfig = {
        'selection': "#ranking-legend",
        'height': windowHeight * 0.35,
        'width': parseInt(d3.select("#ranking-legend").style("width"), 10),
        'duration': 750,
        'testingData': testingData,
        'defaultColor' : default_color
    }




    caliMapVis = cali_map(mapConfig)
    rankingVis = ranking_chart(rankingConfig)
    testingVis = testing_chart(testingConfig)
    casesSliderVis = slider_chart(casesSliderConfig)
    casesChartVis = cases_line_chart(casesChartConfig)
    testingSliderVis = slider_chart(testingSliderConfig)
    hospChartVis = hospital_line_chart(hospChartConfig)
    hospSliderVis = slider_chart(hospSliderConfig)
    criteriaVis = criteria_chart(criteriaConfig)
    hospMaxSliderVis = slider_chart(hospMaxSliderConfig)
    rankingLegendVis = rankingLegend_chart(rankingLegendConfig)

    criteriaVis();
    caliMapVis();
    rankingVis();
    testingVis();

    casesSliderVis();
    casesChartVis();
    hospChartVis();
    hospSliderVis();
    hospMaxSliderVis();
    rankingLegendVis();
    testingSliderVis();
}

function updateRanking(selection, value){
    if (selection == "ranking-sel") rankingVis.selection(value)
    else if (selection == "sorting-sel"){
        rankingVis.sorting(value);
    }

}
// var xSeries = d3.range(0, selection.chartData.map(d=> d.date).length)
// var ySeries = selection.chartData.map(d=> d.caseIncrease)

// var leastSquaresCoeff = leastSquares(xSeries, ySeries)


var statusThresholds = {
    
    flat: 0.025,
    rising1: 0.25,
    rising2: 0.3,
}

function getIncreasingStatus(prev, cur, total){
    // if (cur == 0 || total == 0 || cur - prev < 0) return "falling"
    // else if (prev < 5) return "flat"
    // else if (cur - prev < prev * statusThresholds.flat) status = "flat"
    // else if (cur - prev < prev * statusThresholds.rising1) stats = "significant"
    // else if (cur - prev < prev * statusThresholds.rising2) status = "moderate"
    // else status = "extreme"
    // return status

    if (cur == 0 || total == 0) return "falling"
    else if (Math.abs(cur - prev) <= 0.01) return "flat"
    else if (cur - prev < statusThresholds.rising1) return "significant"
    else if (cur - prev  < statusThresholds.rising2) return "moderate"
    else return "extreme"

}


function leastSquares(xSeries, ySeries){
    var reduceSumFunc = function(prev, cur){ return prev + cur; };

    xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length
    yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);
    
    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);
        
    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);
        
    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
    
    return [slope, intercept, rSquare];

}


function wrap(text, width) {
    text.each(function() {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    })
}