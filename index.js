const APIKEY = 'fb78b53d623d22b51dfcf6a5963908ad'

/// build api endpoints
//#region 
function getGeocodingEndpoint(cityName, apiKey) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`
}

function getCurrentWeatherEndpoint(lat, lon, apiKey) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
}

function getForcastEndpoint(lat, lon, apiKey) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
}
//#endregion


/// fetch requests
//#region 

// fetch helpers
//#region 
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
//#endregion

async function fetchCityLatLon(cityName) {
    let endpoint = getGeocodingEndpoint(cityName, APIKEY)
    let response = await fetch(endpoint)
    let data = await response.json()
    let lat = data[0].lat
    let lon = data[0].lon
    return { lat, lon }
}

async function fetchLatLonCurrentWeather(lat, lon) {
    let endpoint = getCurrentWeatherEndpoint(lat, lon, APIKEY)
    let response = await fetch(endpoint)
    let data = await response.json()
    return formatWeatherObject(data)
}

async function fetchLatLonForcast(lat, lon) {
    let endpoint = getForcastEndpoint(lat, lon, APIKEY)
    let response = await fetch(endpoint)
    let data = await response.json()
    let forcastArray = data.list.map(forcast => formatWeatherObject(forcast))
    return forcastArray
}
//#endregion

async function getCityWeather(cityName) {
    let { lat, lon } = await fetchCityLatLon(cityName)
    let currentWeather = await fetchLatLonCurrentWeather(lat, lon)
    let forecast = await fetchLatLonForcast(lat, lon)
    return { currentWeather, forecast }
}
