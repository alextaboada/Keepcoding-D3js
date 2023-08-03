let totalWidth = window.innerWidth;
let totalHeight = window.innerHeight;
var margin = { top : 10, left : 50, bottom : 30 , right : 50 }
let width = totalWidth - margin.left - margin.right;
let height = totalHeight - margin.top - margin.bottom;
const parseDate = d3.timeParse("%d/%m/%Y")

const svg = d3.select("div#chart").append("svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("class", "elementGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append("g").attr("class", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height-margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleTime().range([0, width - margin.left - margin.right])
const y = d3.scaleLinear().range([height - margin.top - margin.bottom ,0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

d3.csv('data/ibex.csv').then(data =>{
    //Transformamos valores
    data.map(d=>{
        d.date = parseDate(d.date)
        d.open = +d.open
        d.high = +d.high
        d.low = +d.low
        d.close = +d.close
        d.volume = d.volume
    })
    console.log(data);
    x.domain(d3.extent(data.map(d=>d.date)))
    y.domain(d3.extent(data.map(d=>d.open)))

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    elementGroup.datum(data)
        .append("path")
        .attr("id", "linea")
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.open)))
})


