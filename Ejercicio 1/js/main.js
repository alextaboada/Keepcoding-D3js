const width = 800
const height = 600
const margin = {
    top:10, 
    right: 40,
    bottom: 40,
    left:40,
}

//Definición de grafico
const svg = d3.select('#chart').append('svg').attr('width',width).attr('height',height)
const elementGroup = svg.append('g').attr('class','elementGroup').attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append('g').attr('class','axisGroup')
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

//Definimos los ejes, el tipo de escala y el rango
const x = d3.scaleBand().range([0, width - margin.left - margin.top]).padding(0.1)
const y = d3.scaleLinear().range([ height - margin.top - margin.bottom,0 ])

//Definimos los ejes y asignamos escalas para los valores
const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

let years;
let winners;
let originalData;

//Leemos la data por primera vez
d3.csv("data/WorldCup.csv").then(data => {
    //Conversion de tipos
    data.map(d =>{
        d.Year = +d.Year
    })
    //Inicializar valores para cargar slider
    years = data.map(d=> d.Year)
    originaldata=data

    //dibujar dominio de y y ticks de yAxis, ya que será constante en cualquier filtro
    y.domain([0,calculate_max_y_value(data)]) 
    yAxis.ticks(calculate_max_y_value(data))

    update(data)
    slider()
})

function calculate_max_y_value(data){
    const total_winners = data.map(d => d.Winner)
    return d3.max(total_winners, d => total_winners.filter(item => item === d).length)
}

// update:
function update(data) {
    winners = data.map(d => d.Winner)

    x.domain(winners)

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    const elements = elementGroup.selectAll("rect").data(winners)
    elements.enter()
        .append("rect")
        .attr("x", d => x(d))
        .attr("y", d => y(winners.filter(item => item === d).length))
        .attr("width", x.bandwidth()) //Acto de fe
        .attr("height", d => height - margin.top - margin.bottom - y(winners.filter(item => item === d).length))


    elements
        .attr("x", d => x(d))
        .attr("width", x.bandwidth())
        .transition()
        .duration(500)
        .attr("height", d => height - margin.top - margin.bottom - y(winners.filter(item => item === d).length))
        .attr("y", d => y(winners.filter(item => item === d).length))   

    elements.exit().remove()

}

function filterDataByYear(year) { 
    filtered_data = originaldata.filter(d => d.Year <= year)
    update(filtered_data)
    d3.select('p#value-time').text('Has seleccionado el año: ' + year);
}

function slider() {    
    // esta función genera un slider:
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  // cada cuánto aumenta el slider (4 años)
        .width(580)  // ancho de nuestro slider en px
        .ticks(years.length)  
        .default(years[years.length -1])  // punto inicio del marcador
        .on('onchange', val => {
            // 5. AQUÍ SÓLO HAY QUE CAMBIAR ESTO:
            filterDataByYear(val)
            // hay que filtrar los datos según el valor que marquemos en el slider y luego actualizar la gráfica con update
        });

        // contenedor del slider
        var gTime = d3 
            .select('div#slider-time')  // div donde lo insertamos
            .append('svg')
            .attr('width', width - margin.left - margin.right)
            .attr('height', 100)
            .append('g')
            .attr('class','slider')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);  // invocamos el slider en el contenedor

        d3.select('p#value-time').text('Has seleccionado el año: ' + sliderTime.value());  // actualiza el año que se representa
}