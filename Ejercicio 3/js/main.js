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

const x = d3.scaleBand().range([0, width - margin.left - margin.right])
const y = d3.scaleLinear().range([height - margin.top - margin.bottom ,0])

const xAxis = d3.axisBottom().scale(x).ticks(258)
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
    //Definimos los dominios y llamamos a los ejes
    x.domain(data.map(d => d.date))
    y.domain(d3.extent(data.map(d=>d.open)))
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    //Para cada linea del csv, dibujamos los valores
    let previousclose = 0
    data.forEach(d => {
        console.log(d);
        previousclose = d.close
        
        //Pintamos cada rectangulo correspondiente a la relacion open/close
        let rect = elementGroup.append('rect')
            .attr('class','rect')
            .attr('x', x(d.date))
            .attr('width', x.bandwidth())
            .attr('height',y(Math.min(d.open,d.close)) - y(Math.max(d.open, d.close)))
            .attr('y',y(Math.max(d.open,d.close)))
            .attr('fill', (d.open > d.close ? 'red' : 'green'))
            .attr('stroke', 'black')
        
        //Pintamos las lineas de high/low
        let line = elementGroup.append('line')
            .attr('class','line')
            .attr('x1', x(d.date)+ (width/x.domain().length)/2)
            .attr('x2', x(d.date)+ (width/x.domain().length)/2)		    
            .attr('y1', y(d.high))
            .attr('y2', y(d.low))
            .attr("stroke", d.open > d.close ? 'red' : 'green')
            .attr('stroke-width',1)

            
            //para calcular los volumenes, guardamos el valor anterior
    });
})
