
var parseTime = d3.timeParse("%Y-%m-%d")
var today = new Date()
var compTime = d3.timeDay.offset(today, -16)
var calCoordinates = {}
var default_color = '#42d5c6'
var doubleCap = 60

let testingWindow = 7;
let windowSize = 2;
let doublingWindow = 3;

const unavailableBedtypes = ['ACUTE PSYCHIATRIC CARE', 'INTENSIVE CARE NEWBORN NURSERY', 'LABOR AND DELIVERY', 'PEDIATRIC', 'PEDIATRIC INTENSIVE CARE UNIT', 'PERINATAL', 'REHABILITATION', 'RENAL TRANSPLANT', 'INTENSIVE CARE']


var promises = [
    d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"),
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.json("data/cb_2014_us_county_5m.json"),
    //d3.json("https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-county-boundaries&q=CA&rows=100&facet=stusab")
    d3.json("data/us-county-boundaries.json"),
    d3.csv("data/covid19data.csv"),
    d3.csv("data/ca_county_beds.csv"),
    d3.csv("data/la_testing.csv")
]


Promise.all(promises).then(ready)



d3.select("#county-select")
    .on("change", dropdownChange)

d3.select("#testing-select")
    .on("change", dropdownChange)


function dropdownChange(){
    var id = d3.select(this).property("id");
    var sel = d3.select(this).property('value')
    if (id == "county-select"){
        lolipopVis.selection(sel)
        hospitalVis.selection(sel)
    } else if (id == "testing-select"){
        testingVis.selection(sel)
    }
}

function ready([covidData, us, caliCounty, coords, hosp, beds, laTesting]){
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
        movingWindow = []
        d.values.forEach(function(v, j){
            movingWindow.push(v)
            if (movingWindow.length > windowSize){
                movingWindow.shift()
            }
            v.binnedCase = Math.ceil(d3.sum(movingWindow.map(v=> v.cases ))/movingWindow.length)
            t = Math.min(j, doublingWindow)

            prevInd = j - t
            prevCases = d.values[prevInd].binnedCase
            if (t == 0 || prevCases == v.binnedCase) v.doubleDays = doubleCap
            else v.doubleDays = Math.min(doubleCap, t/(Math.log2(v.binnedCase) - Math.log2(prevCases))) 
        })
        var twoWeekPeriod = d.values.filter( v=> compTime <= parseTime(v.date) )
        if (d.key != "Unknown"){
            criteriaData.push({
                data: twoWeekPeriod,
                county: d.key,
                fips: d.values[0].fips,
                state: d.values[0].state
            })
        }
    })

    criteriaData.sort(function(a,b){
        return d3.ascending(a.county, b.county)
    })
    criteriaData.forEach(function(d){
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
        })
        d.caseAvg = d3.sum(d.data, d=> d.caseIncrease)/14
        d.deathAvg = d3.sum(d.data, d=> d.deathIncrease)/14
        d.derivAvg = d3.sum(d.data, d=> d.deriv)/14
        d.chartData = d.data.slice(1, d.data.length)


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
    var row1 = windowHeight * 0.4
    var row2 = windowHeight * 0.38


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

    lolipopConfig = {
        'selection': "#lolipop-chart",
        'height': row1,
        'width': parseInt(d3.select("#lolipop-chart").style("width"), 10),
        'duration': 750,
        'criteria': criteriaData,
        'defaultColor' : default_color

    }

    rankingConfig = {
        'selection': "#ranking",
        'height': windowHeight * 0.5,
        'width': parseInt(d3.select("#ranking").style("width"), 10),
        'duration': 750,
        'countyData': dateData[dateData.length -1].values,
        'cal': caliCounty,
        'criteria': criteriaData,
        'coordinates' : calCoordinates,
        'defaultColor' : default_color
    }


    hospitalConfig = {
        'selection': "#hospital-chart",
        'height': row1,
        'width': parseInt(d3.select("#hospital-chart").style("width"), 10),
        'duration': 750,
        'hospitalData': hospByCounty,
        'bedData': beds,
        'defaultColor' : default_color
    }

    testingConfig = {
        'selection': "#testing-chart",
        'height': windowHeight * 0.3,
        'width': parseInt(d3.select("#testing-chart").style("width"), 10),
        'duration': 750,
        'testingData': testingData,
        'defaultColor' : default_color
    }



    caliMapVis = cali_map(mapConfig)
    lolipopVis = lolipop_chart(lolipopConfig)
    rankingVis = ranking_chart(rankingConfig)
    hospitalVis = hospital_chart(hospitalConfig)
    testingVis = testing_chart(testingConfig)

    caliMapVis();
    lolipopVis();
    rankingVis();
    hospitalVis();
    testingVis();

}


// var xSeries = d3.range(0, selection.chartData.map(d=> d.date).length)
// var ySeries = selection.chartData.map(d=> d.caseIncrease)

// var leastSquaresCoeff = leastSquares(xSeries, ySeries)






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