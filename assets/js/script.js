const url = 'https://mindicador.cl/api/';
let valorDolar, valorEuro, valorBitcoin;
const select = document.querySelector('#monedas-select');
const btn = document.getElementById('buscar');
const resultado = document.getElementById('resultado-conversion');
const cantidadInput = document.getElementById('inputPesos');
const graficaSection = document.querySelector('.grafica');

// Obtener los valores de las monedas
async function obtenerValores() {
    try {
        const res = await fetch(url);
        const datos = await res.json();
        valorDolar = datos.dolar.valor;
        valorEuro = datos.euro.valor;
        valorBitcoin = datos.bitcoin.valor;
        console.log('Valores obtenidos:', valorDolar, valorEuro, valorBitcoin);
    } catch (error) {
        
        console.error('Error al obtener los valores:', error);
    }
}

// Configurar la gráfica
function configurarGrafica(datosHistorial, nombreMoneda) {
    const fechas = datosHistorial.serie.map(d => d.fecha.split('T')[0]).reverse();
    const valores = datosHistorial.serie.map(d => d.valor).reverse();

    return {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: `Comportamiento de ${nombreMoneda}`,
                backgroundColor: 'blue',
                borderColor: 'blue',
                data: valores,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor en CLP'
                    }
                }
            }
        }
    }; //funcional
}

// Renderizar la gráfica
async function renderGrafica(moneda) {
    const datosHistorial = await obtenerDatosMoneda(moneda);
    if (!datosHistorial || !datosHistorial.serie) {
        console.error("Datos de la moneda seleccionada no disponibles.");
        return;
    }
    const config = configurarGrafica(datosHistorial, moneda);
    const chartDOM = document.getElementById('myChart');
    
    if (window.myChart instanceof Chart) window.myChart.destroy(); // Verifica si existe una instancia de Chart
    window.myChart = new Chart(chartDOM, config);
    graficaSection.style.display = 'block';
}

// Obtener datos de una moneda específica
async function obtenerDatosMoneda(moneda) {
    try {
        const res = await fetch(`${url}${moneda}`); //YA NO TOQUES ESTO!
        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error(`Error al obtener los datos de ${moneda}:`, error);
    }
}

// Funciones de conversión
function conversionADolar(cantidad) {
    const resultadoF = cantidad / valorDolar;
    mostrarResultado(resultadoF, '$');
}

function conversionAEuro(cantidad) {
    const resultadoF = cantidad / valorEuro;
    mostrarResultado(resultadoF, '€');
}

function conversionABitcoin(cantidad) {
    const resultadoF = cantidad / valorBitcoin;
    mostrarResultado(resultadoF, '$ (moneda usada para tasar el valor)');
}

function mostrarResultado(resultadoF, simbolo) {
    resultado.innerHTML = '';
    if (isNaN(resultadoF) || resultadoF === 0) {
        alert('Por favor ingrese una cantidad válida para hacer la conversión');
        return;
    }
    const pResultado = document.createElement('p');
    pResultado.textContent = `Resultado: ${resultadoF.toFixed(2)} ${simbolo}`;
    resultado.appendChild(pResultado);
}

// Manejar el evento de clic del botón
btn.addEventListener('click', async function() {
    const monedaElegida = select.value;
    const cantidad = parseFloat(cantidadInput.value);

    if (isNaN(cantidad) || cantidad === 0) {
        alert('Por favor ingrese una cantidad válida para hacer la conversión');
        return;
    }

    switch (monedaElegida) {
        case 'dolar':
            conversionADolar(cantidad);
            break;
        case 'euro':
            conversionAEuro(cantidad);
            break;
        case 'bitcoin':
            conversionABitcoin(cantidad);
            break;
    }

    // Renderizar gráfica para la moneda seleccionada
    await renderGrafica(monedaElegida);
});

// Inicializar valores al cargar la página
obtenerValores();
