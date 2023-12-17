const inputCLP = document.querySelector("#clp")
const selector = document.querySelector("#selector")
const btn = document.querySelector(".btn")
const result = document.querySelector(".result")

const getJSON = async (url) => {
    const res = await fetch(url)
    return await res.json()
}

const selectorOpt = async () => {
    try {
        const currencies = await getJSON("https://mindicador.cl/api/")
        template = `
        <option value="${currencies.dolar.codigo}">${currencies.dolar.nombre}</option>
        <option value="${currencies.uf.codigo}">${currencies.uf.nombre}</option>
        `
        selector.innerHTML = template
    } catch (e) {
        result.innerHTML = `¡Hubo un error! Intenta más tarde: ${e.message}`
    }
}

selectorOpt()

btn.addEventListener("click", async () => {
    if (inputCLP.value === "") {
        alert("Ingresa un monto en pesos chilenos")
    } else {
        try {
            const currencies = await getJSON("https://mindicador.cl/api/")
            const currencyValue = currencies[selector.value].valor
            const newValue = Number(inputCLP.value) / Number(currencyValue)
            result.innerHTML = currencies[selector.value].codigo === "dolar"? `Resultado: $${newValue.toLocaleString('es')} USD`: `Resultado: ${newValue.toLocaleString('es')} UF`
            renderGrafica()
        } catch(e) {
            result.innerHTML = `¡Hubo un error! Intenta más tarde: ${e.message}`
        }
    }
})

// GRÁFICA

const createDataToChart = async (currency) => {
    const currencyData = await getJSON(`https://www.mindicador.cl/api/${currency}`)

    const getValores = () => {
        const serie = currencyData.serie
        const valores = serie.map((e) => Number(e.valor))
        return valores.slice(0, 10).reverse()
    }

    const getFechas = () => {
        const serie = currencyData.serie
        const fechas = serie.map((e) => new Date(e.fecha).toDateString())
        return fechas.slice(0, 10).reverse()
    }

    const datasets = [{
        label: currency,
        borderColor: "rgb(255, 99, 132)",
        data: getValores()
    }]

    return {
        labels: getFechas(),
        datasets: datasets
    }
}

const renderGrafica = async () => {
    try {
        const data = await createDataToChart(selector.value)
        const config = {
            type: "line",
            data: data,
        }
        const chart = document.querySelector(".chart")
        chart.style.backgroundColor = "white"
        if (window.currChart) {
            currChart.destroy();
        }
        window.currChart = new Chart(chart, config)
    } catch (e) {
        result.innerHTML = `¡Hubo un error! Intenta más tarde: ${e.message}`
    }
}

