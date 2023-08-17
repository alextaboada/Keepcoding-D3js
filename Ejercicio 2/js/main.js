//Constantes globales
const diCaprioBirthYear = 1974;
const age = function(year) { return year - diCaprioBirthYear}
const today = new Date().getFullYear()
const ageToday = age(today)

const width = window.innerWidth
const height = window.innerHeight
const margin = {
    top:40,
    right: 40,
    bottom: 40,
    left: 40
}

//Creacion del area del grafico y conjuntos de elementos
const svg = d3.select('#chart').append('svg').attr('width',width).attr('height',height)
const elementGroup = svg.append('g').attr('class','elementGroup').attr('transform', `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append('g').attr('class','axisGroup')
const xAxisGroup = axisGroup.append('g').attr('class', 'xAxisGroup').attr('transform', `translate(${margin.left}, ${height - margin.bottom })`)
const yAxisGroup = axisGroup.append('g').attr('class', 'yAxisGroup').attr('transform', `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(0.1)
const y0 = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])
const y1 = d3.scaleLinear().range([height - margin.top - margin.bottom,0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y0)
const y1Axis = d3.axisLeft().scale(y1)

const textPhoto = svg.append('text')
    .attr('class','text')
    .text('Selecciona una de las parejas de Leonardo')
    .attr('x',margin.left +10)
    .attr('y',margin.top - 10)

const rectPhoto = svg.append('rect')
    .attr('class','photo')
    .attr('width', 300)
    .attr('height', 300)
    .attr('x', margin.left + 10)
    .attr('y',margin.top)

const image = svg.append('svg:image')
    .attr('width', 300)
    .attr('height', 300)
    .attr('x', margin.left + 10)
    .attr('y',margin.top)



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
        .on('mouseover', (d) => {
            elementGroup.selectAll(`.${d.name}`).style('opacity',1);
            image.attr('xlink:href', `images/${d.name}-${d.age}.jpg`)
            if(25-d.age ===0){
                image.attr('xlink:href', 'images/old.jpg')
            }
            textPhoto.text(`Asi es como veía Leonardo a ${d.name} con ${d.age} años de edad`)
        })
        .on('mouseout',d =>{
            image.attr('xlink:href', '')
            elementGroup.selectAll(`.${d.name}`).style('opacity',0.5);
            textPhoto.text('Selecciona una de las parejas de Leonardo')
        })
        

    elementGroup.datum(data)
        .append('path')
        .attr('id', 'linea')
        .attr('d', d3.line()
            .x(d => x(d.year))
            .y(d => y1(age(d.year))))

    elementGroup.append( 'line' )
        .attr('x1', 0 )
        .attr('x2', width - margin.left - margin.right )
        .attr('y1', y1(25))   // whatever the y-val should be
        .attr('y2', y1(25))
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5);
})