const totalWidth = window.innerWidth;
const totalHeight = window.innerHeight;
var margin = { top : 10, left : 100, bottom : 30 , right : 10 }
const width = totalWidth - margin.left - margin.right;
const height = totalHeight - margin.top - margin.bottom;
const parseDate = d3.timeParse("%d/%m/%Y")

const candleHeight = height * 0.70
const volumeHeight = height * 0.30


//Añadimos el svg de velas a #chart y lo configuramos, tanto svg como grupos como ejes
const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", candleHeight)
const elementGroup = svg.append("g").attr("class", "elementGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append("g").attr("class", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${candleHeight - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleBand().range([0, width - margin.left - margin.right])
const y = d3.scaleLinear().range([candleHeight - margin.top - margin.bottom ,0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

//Añadimos el svg de volumenes a #chart y lo configuramos, tanto svg como grupos como ejes
const volumeSvg = d3.select('#chart').append('svg').attr('width',width).attr('height',volumeHeight)
const volumeElementGroup = volumeSvg.append('g').attr('class','volumeElementGroup').attr('transform',`translate(${margin.left},${margin.top})`)
const volumeAxisGroup = volumeSvg.append('g').attr('class','volumeAxisGroup')
const volumeXAxisGroup = volumeAxisGroup.append('g').attr('class','volumeXAxisGroup').attr('transform',`translate(${margin.left}, ${volumeHeight- margin.bottom})`)
const volumeYAxisGroup = volumeAxisGroup.append('g').attr('class','volumeYAxisGroup').attr('transform',`translate(${margin.left},${margin.top})`)

const xVolume = d3.scaleBand().range([0, width - margin.left - margin.right])
const yVolume = d3.scaleLinear().range([volumeHeight - margin.bottom - margin.top, 0])

const xVolumeAxis = d3.axisBottom().scale(xVolume)
const yVolumeAxis = d3.axisLeft().scale(yVolume)

d3.csv('data/ibex.csv').then(data =>{
    //Transformamos valores
    data.map(d=>{
        d.date = parseDate(d.date)
        d.open = +d.open
        d.high = +d.high
        d.low = +d.low
        d.close = +d.close
        d.volume = +d.volume
    })
    //Definimos los dominios y llamamos a los ejes
    //TODO: revisar doominios de velas. debe ser el menor y mayor de ambos ejes
    x.domain(data.map(d => d.date))
    y.domain(d3.extent(data.map(d=>d.open)))
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    xVolume.domain(data.map(d => d.date))
    yVolume.domain(d3.extent(data.map(d=>d.volume)))
    volumeXAxisGroup.call(xVolumeAxis)
    volumeYAxisGroup.call(yVolumeAxis)
    
    //Para cada linea del csv, dibujamos los valores
    let previousclose = 0
    data.forEach(d => {
        
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
        let volumeRect = volumeElementGroup.append('rect')
            .attr('class','volumeRect')
            .attr('x', xVolume(d.date))
            .attr('y', yVolume(d.volume))
            .attr('width',xVolume.bandwidth())
            .attr('height',volumeHeight- margin.top - margin.bottom - yVolume(d.volume))


        if (d.close == previousclose){
            volumeRect.attr('fill','black')
        }else if(d.close<previousclose){
            volumeRect.attr('fill','red')
        }else{
            volumeRect.attr('fill', 'green')
        }
        previousclose = d.close

    });
})
