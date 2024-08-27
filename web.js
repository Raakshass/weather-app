const apiKey = '30d5d048c864af731912b3f6bf41243c'; // Replace with your OpenWeatherMap API key

function getWeather(location) {
    const locationInput = document.getElementById('locationInput').value;
    const query = location || locationInput;
    const weatherContainer = document.getElementById('currentWeather');
    const forecastContainer = document.getElementById('forecast');
    const mapContainer = document.getElementById('map');
    const recentSearchesContainer = document.getElementById('recentSearches');
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                weatherContainer.innerHTML = `
                    <h2>Current Weather</h2>
                    <p>${data.name}, ${data.sys.country}</p>
                    <p>${data.main.temp} °C</p>
                    <p>${data.weather[0].description}</p>
                    <p>Humidity: ${data.main.humidity} %</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                `;
                // Save to recent searches
                saveRecentSearch(data.name);
                // Display map
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                const map = L.map('map').setView([lat, lon], 13);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`${data.name}, ${data.sys.country}`)
                    .openPopup();
                // Fetch and display forecast
                getForecast(lat, lon);
            } else {
                weatherContainer.innerHTML = `<p>${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching the weather data:', error);
        });
}

function getForecast(lat, lon) {
    const forecastContainer = document.getElementById('forecast');
    
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            let forecastHTML = '<h2>3-Day Forecast</h2>';
            for (let i = 1; i <= 3; i++) {
                const day = data.daily[i];
                forecastHTML += `
                    <p>Day ${i}: ${day.temp.day} °C, ${day.weather[0].description}</p>
                `;
            }
            forecastContainer.innerHTML = forecastHTML;
        })
        .catch(error => {
            console.error('Error fetching the forecast data:', error);
        });
}

function saveRecentSearch(location) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!searches.includes(location)) {
        searches.push(location);
        if (searches.length > 5) {
            searches.shift();
        }
        localStorage.setItem('recentSearches', JSON.stringify(searches));
        displayRecentSearches();
    }
}

function displayRecentSearches() {
    const recentSearchesContainer = document.getElementById('recentSearches');
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentSearchesContainer.innerHTML = '';
    searches.forEach(search => {
        let li = document.createElement('li');
        li.textContent = search;
        li.onclick = () => getWeather(search);
        recentSearchesContainer.appendChild(li);
    });
}

// Load recent searches on page load
document.addEventListener('DOMContentLoaded', displayRecentSearches);
