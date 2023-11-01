/// global vars
//#region 
const APIKEY = 'fb78b53d623d22b51dfcf6a5963908ad'

// html elements
const searchInput = document.querySelector('#search-input')
const searchButton = document.querySelector('#search-button')
const quickLinks = document.querySelector('#quick-links')
const currentWeatherSection = document.querySelector('#current-weather')
const forecastSection = document.querySelector('#forecast')
//#endregion


/// build api endpoints
//#region 
function getGeocodingEndpoint(cityName, apiKey) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`
}

function getCurrentWeatherEndpoint(lat, lon, apiKey) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
}

function getForecastEndpoint(lat, lon, apiKey) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
}
//#endregion


/// fetch requests
//#region 

// fetch helpers
function formatWeatherObject(weatherObject) {
    let date = new Date(weatherObject.dt * 1000) // converts to ms as date comes down in unix format (seconds, instead of ms like javascript), then create new date object
    let icon = `https://openweathermap.org/img/w/${weatherObject.weather[0].icon}.png`
    let temp = `${Math.round(weatherObject.main.temp)} °F`
    let wind = `${Math.round(weatherObject.wind.speed)} MPH`
    let humidity = `${weatherObject.main.humidity} %`
    return {
        date,
        icon,
        temp,
        wind,
        humidity
    }
}


// building blocks
async function fetchCityLatLon(cityName) {
    try {
        let endpoint = getGeocodingEndpoint(cityName, APIKEY)
        let response = await fetch(endpoint)
        let data = await response.json()
        let lat = data[0].lat
        let lon = data[0].lon
        return { lat, lon }
    } catch (error) {
        alert(error)
    }
}

async function fetchLatLonCurrentWeather(lat, lon) {
    try {
        let endpoint = getCurrentWeatherEndpoint(lat, lon, APIKEY)
        let response = await fetch(endpoint)
        let data = await response.json()
        return formatWeatherObject(data)
    } catch (error) {
        alert(error)
    }
}

async function fetchLatLonForecast(lat, lon) {
    try {
        let endpoint = getForecastEndpoint(lat, lon, APIKEY)
        let response = await fetch(endpoint)
        let data = await response.json()
        let forecastArray = data.list.map(forecast => formatWeatherObject(forecast))
        return forecastArray
    } catch (error) {
        alert(error)
    }
}

// main function
async function getCityWeather(cityName) {
    let { lat, lon } = await fetchCityLatLon(cityName)
    let currentWeather = await fetchLatLonCurrentWeather(lat, lon)
    let forecast = await fetchLatLonForecast(lat, lon)
    return { currentWeather, forecast }
}
//#endregion


/// render functions
//#region 
function renderCurrentWeather(weatherObject) {
    currentWeatherSection.innerHTML = `
        <h2>Current Weather</h2>
        <div class="weather-card">
            <h3>${weatherObject.date.toLocaleDateString()}</h3>
            <img src="${weatherObject.icon}" alt="weather icon">
            <p>Temperature: ${weatherObject.temp}</p>
            <p>Wind: ${weatherObject.wind}</p>
            <p>Humidity: ${weatherObject.humidity}</p>
        </div>
    `
}

function renderForecast(forecastArray) {
    forecastSection.innerHTML = `
        <h2>5 Day Forecast</h2>
    `
    for (let i = 4; i < 40; i += 8) { // only render one forecast per day
        let forecast = forecastArray[i]
        forecastSection.innerHTML += `
            <div class="weather-card">
                <h3>${forecast.date.toLocaleDateString()}</h3>
                <img src="${forecast.icon}" alt="weather icon">
                <p>Temperature: ${forecast.temp}</p>
                <p>Wind: ${forecast.wind}</p>
                <p>Humidity: ${forecast.humidity}</p>
            </div>
        `
    }
}

function renderQuickLinks() {
    let cities = JSON.parse(localStorage.getItem('cities'))
    if (!cities) {
        cities = []
        localStorage.setItem('cities', JSON.stringify(cities))
    }
    quickLinks.innerHTML = ''
    for (let city of cities) {
        quickLinks.innerHTML += `
            <button class="quick-link">${city}</button>
        `
    }
}
renderQuickLinks()

renderLoadingSpinner = () => {
    currentWeatherSection.innerHTML = `
        <div class="loading-spinner">
            <img src='./loading.gif' alt='Loading Spinner'>
        </div>
    `
    forecastSection.innerHTML = `
        <div class="loading-spinner">
            <img src='./loading.gif' alt='Loading Spinner'>
        </div>
    `
}
//#endregion


/// event listeners
//#region 

// event listener helpers
function updateLocalStorageArray(key, value) {
    let currentValue = JSON.parse(localStorage.getItem(key))
    currentValue.push(value)
    localStorage.setItem(key, JSON.stringify(currentValue))
}

// search input keyup listener, will enable search button if input has text, will click search button if enter key is pressed 
searchInput.addEventListener('keyup', (e) => {
    // if enter key is pressed, click search button
    if (e.key === 'Enter') {
        searchButton.click()
    }
    // if search input has text, enable search button
    if (searchInput.value.length > 0) {
        searchButton.disabled = false
    } else {
        searchButton.disabled = true
    }
})

// search button click listener, will fetch weather data and render to page
searchButton.addEventListener('click', async () => {
    let cityName = searchInput.value
    searchInput.value = ''
    searchButton.disabled = true
    updateLocalStorageArray('cities', cityName)
    renderQuickLinks()
    renderLoadingSpinner()
    let { currentWeather, forecast } = await getCityWeather(cityName)
    renderCurrentWeather(currentWeather)
    renderForecast(forecast)
})

// quick links click listener, will fetch weather data and render to page
quickLinks.addEventListener('click', async (e) => {
    if (e.target.classList.contains('quick-link')) {
        let cityName = e.target.textContent
        searchInput.value = ''
        searchButton.disabled = true
        renderLoadingSpinner()
        let { currentWeather, forecast } = await getCityWeather(cityName)
        renderCurrentWeather(currentWeather)
        renderForecast(forecast)
    }
})
//#endregion