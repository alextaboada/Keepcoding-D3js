const totalWidth = window.innerWidth;
const totalHeight = window.innerHeight*0.97;
const margin = { top : 10, left : 70, bottom : 30 , right : 10 }
const width = totalWidth- margin.right - margin.left;
const height = totalHeight;
const parseDate = d3.timeParse('%d/%m/%Y')
const formatTime = d3.timeFormat('%d/%m/%Y');

const candleHeight = height * 0.70
const volumeHeight = height * 0.30


//Añadimos el svg de velas a #chart y lo configuramos, tanto svg como grupos como ejes
const svg = d3.select('#chart').append('svg').attr('width', width).attr('height', candleHeight-margin.bottom)
const elementGroup = svg.append('g').attr('class', 'elementGroup').attr('transform', `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append('g').attr('class', 'axisGroup')
const xAxisGroup = axisGroup.append('g').attr('class', 'xAxisGroup').attr('transform', `translate(${margin.left}, ${candleHeight - margin.bottom})`)
const yAxisGroup = axisGroup.append('g').attr('class', 'yAxisGroup').attr('transform', `translate(${margin.left}, ${margin.top})`)

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

const xVolumeAxis = d3.axisBottom().scale(xVolume).tickFormat(formatTime)
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
    x.domain(data.map(d => d.date))
    y.domain([d3.min(data.map(d => d.low)), d3.max(data.map(d => d.high))])
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    xVolume.domain(data.map(d => d.date))
    yVolume.domain(d3.extent(data.map(d=>d.volume)))
    xVolumeAxis.tickValues(xVolume.domain().filter(function(d,i){ return !(i%10)}))
    volumeXAxisGroup.call(xVolumeAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-25)' )
    volumeYAxisGroup.call(yVolumeAxis)

    //Para cada linea del csv, dibujamos los valores
    let previousclose = 0
    data.forEach(d => {
        //Definimos el tooltip y las funciones de movimiento
        const tooltip = d3.select('#chart')
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')

        const mouseover = function() {
            tooltip
                .style('opacity', 1)
            d3.select(this)
                .style('stroke', 'black')
                .style('opacity', 1)
        }
        const mousemove = function() {
            tooltip
                .html(`Fecha:<b>${d.date.toLocaleDateString('es-ES')}</b><br>Open:<b>${d.open}</b><br>Close:<b>${d.close}</b><br>High:<b>${d.high}</b><br>Low:<b>${d.low}</b><br>Volume:<b>${d.volume}</b>`)
                .style('left', (d3.mouse(this)[0]+70)+'px')
                .style('top', (d3.mouse(this)[1])+'px') 
           }
        const mouseleave = function() {
            tooltip
                .style('opacity', 0)
            d3.select(this)
                .style('stroke', 'none')
                .style('opacity', 0.8)
        }

        //Pintamos cada rectangulo correspondiente a la relacion open/close
        const rect = elementGroup.append('rect')
            .attr('class','rect')
            .attr('x', x(d.date))
            .attr('width', x.bandwidth())
            .attr('height',y(Math.min(d.open,d.close)) - y(Math.max(d.open, d.close)))
            .attr('y',y(Math.max(d.open,d.close)))
            .style('fill', (d.open > d.close ? 'red' : 'green'))
            .style('stroke', 'none')
            .style('opacity','0.8')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave)
        
        //Pintamos las lineas de high/low
        const line = elementGroup.append('line')
            .attr('class','line')
            .attr('x1', x(d.date)+ (width/x.domain().length)/2)
            .attr('x2', x(d.date)+ (width/x.domain().length)/2)		    
            .attr('y1', y(d.high))
            .attr('y2', y(d.low))
            .attr('stroke', d.open > d.close ? 'red' : 'green')
            .attr('stroke-width',1)

            
        //para calcular los volumenes, guardamos el valor anterior
        const volumeRect = volumeElementGroup.append('rect')
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
