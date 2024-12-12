// API Keys and URLs
const WEATHER_API_KEY = '75ba5fbcede01f2bdfb39bb4481834eb';
const NASA_API_KEY = 'sZgNXj5beMfc4GcGT8hyWomqXfq6gLcaAvO6yGCk';

let map;
let weatherLayer;

// Function to get user's location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                }),
                error => resolve({ lat: 45.5244559467892, lon: 4.264752663592528 }) // school par défaut
            );
        } else {
            resolve({ lat: 45.5244559467892, lon: 4.264752663592528 }); // school par défaut
        }
    });
}

// Function to fetch weather data
async function fetchWeather(coords) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`
        );
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur météo:', error);
        return null;
    }
}

// Function to fetch NASA APOD
async function fetchNASAImage() {
    try {
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        console.log('NASA API response:', data); // Pour le débogage
        return data;
    } catch (error) {
        console.error('Erreur NASA:', error);
        return null;
    }
}

// Function to fetch flight data
async function fetchFlightData() {
    try {
        const bounds = '45.8389,5.9962,47.8084,10.4921'; // France bounds
        const response = await fetch(
            `https://opensky-network.org/api/states/all?lamin=45.8389&lomin=5.9962&lamax=47.8084&lomax=10.4921`
        );
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur vol:', error);
        return null;
    }
}

// Update weather display
function updateWeatherInfo(data) {
    const weatherInfo = document.getElementById('weather-info');
    if (data && data.main) {
        const weather = data.weather[0];
        weatherInfo.innerHTML = `
            <div class="weather-details">
                <h3>${data.name}</h3>
                <p class="temperature">${Math.round(data.main.temp)}°C</p>
                <p class="description">${weather.description}</p>
                <p>Humidité: ${data.main.humidity}%</p>
                <p>Vent: ${Math.round(data.wind.speed * 3.6)} km/h</p>
            </div>
        `;
    } else {
        weatherInfo.innerHTML = '<p>Données météo indisponibles</p>';
    }
}

// Update NASA image display
function updateNASAImage(data) {
    const nasaInfo = document.getElementById('nasa-info');
    if (data && data.url) {
        nasaInfo.innerHTML = `
            <h3>${data.title}</h3>
            <img src="${data.url}" alt="${data.title}">
            <p>${data.explanation}</p>
        `;
    } else {
        nasaInfo.innerHTML = '<p>Image NASA indisponible</p>';
    }
}

// Update flight info display
function updateFlightInfo(data) {
    const flightInfo = document.getElementById('flight-info');
    if (data && data.states) {
        const activeFlights = data.states.length;
        flightInfo.innerHTML = `
            <div class="flight-details">
                <p>Nombre d'avions en vol: ${activeFlights}</p>
                <p>Zone: France</p>
                <p>Dernière mise à jour: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
    } else {
        flightInfo.innerHTML = '<p>Données de vol indisponibles</p>';
    }
}

// Initialize map
function initMap(coords) {
    map = L.map('map').setView([coords.lat, coords.lon], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Update weather layer on map
function updateWeatherLayer(coords) {
    if (weatherLayer) {
        map.removeLayer(weatherLayer);
    }
    weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`, {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
    }).addTo(map);
}

// Main function to load all data
async function loadData() {
    // Get user location and fetch weather
    const coords = await getUserLocation();
    const weatherData = await fetchWeather(coords);
    updateWeatherInfo(weatherData);

    // Initialize and update map
    initMap(coords);
    updateWeatherLayer(coords);

    // Fetch NASA image
    const nasaData = await fetchNASAImage();
    console.log('NASA data:', nasaData); // Pour le débogage
    updateNASAImage(nasaData);

    // Fetch flight data
    const flightData = await fetchFlightData();
    updateFlightInfo(flightData);

    // Refresh data every 5 minutes
    setInterval(async () => {
        const newWeatherData = await fetchWeather(coords);
        updateWeatherInfo(newWeatherData);
        updateWeatherLayer(coords);

        const newFlightData = await fetchFlightData();
        updateFlightInfo(newFlightData);
    }, 300000);
}

// Start loading data when page is ready
document.addEventListener('DOMContentLoaded', loadData);

