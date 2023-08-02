//Constantes globales
const diCaprioBirthYear = 1974;
const age = function(year) { return year - diCaprioBirthYear}
const today = new Date().getFullYear()
const ageToday = age(today)

const width = 800
const height = 600
const margin = {
    top:40,
    right: 40,
    bottom: 40,
    left: 40
}

//Creacion del area del grafico y conjuntos de elementos
const svg = d3.select('#chart').append('svg').attr('width',width).attr('height',height)
const elementGroup = svg.append('g').attr('class','elementGroup').attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append('g').attr('class','axisGroup')
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleBand().range([0, width - margin.left - margin.right])
const y0 = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])
const y1 = d3.scaleLinear().range([height - margin.top - margin.bottom,0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y0)
const y1Axis = d3.axisLeft().scale(y1)

d3.csv('data/data.csv').then(data => {
    data.map(d => {
        d.name = d.name.replace(' ','-')
        d.year = +d.year
        d.age = +d.age
    })
    console.log(data);
    x.domain(data.map(d => d.year))
    y0.domain([15,45])
    y1.domain([15, 45])

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)
    yAxisGroup.call(y1Axis)

    const elements = elementGroup.selectAll('rect').data(data)
    elements.enter()
        .append('rect')
        .attr('class',d=> `${d.name} bar`)
        .attr('x', d=> x(d.year))
        .attr('y', d=> y0(d.age))
        .attr('height', d => height - margin.top - margin.bottom - y0(d.age))
        .attr('width',x.bandwidth())
        

    elementGroup.datum(data)
        .append("path")
        .attr("id", "linea")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y1(age(d.year))))
})