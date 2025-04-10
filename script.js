const API_KEY = "a6f76c2769c89c14d9297df937ab2d32"; //  API key

// Add event listener for Enter key
document.getElementById("city-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchWeather();
    }
});

document.getElementById("search-btn").addEventListener("click", searchWeather);
document.getElementById("refresh-btn").addEventListener("click", refreshWeather);

function searchWeather() {
    const city = document.getElementById("city-input").value;
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    } else {
        displayError("Please enter a city name.");
    }
}

function refreshWeather() {
    const city = document.getElementById("city-input").value;
    if (city) {
        searchWeather();
        showRefreshAnimation();
    }
}

function showRefreshAnimation() {
    const refreshBtn = document.getElementById("refresh-btn");
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    setTimeout(() => {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }, 1000);
}

function fetchWeather(city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            localStorage.setItem('lastCity', city);
            updateBackground(data.weather[0].main);
        })
        .catch(error => displayError(error.message));
}

function fetchForecast(city) {
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    
    fetch(forecastURL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast not available");
            }
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => console.error("Error fetching forecast:", error));
}

function displayWeather(data) {
    document.getElementById("error-message").textContent = "";
    
    // Main weather info
    document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("description").textContent = data.weather[0].description;
    
    // Weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const weatherIcon = document.getElementById("weather-icon");
    weatherIcon.innerHTML = `<img src="${iconUrl}" alt="Weather icon">`;
    
    // Additional weather details
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;
    document.getElementById("pressure").textContent = `Pressure: ${data.main.pressure} hPa`;
    
    // Convert sunrise timestamp to local time
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    document.getElementById("sunrise").textContent = `Sunrise: ${sunriseTime.toLocaleTimeString()}`;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (every 24 hours)
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    }
}

function updateBackground(weatherCondition) {
    const body = document.body;
    const app = document.getElementById("weather-app");
    
    // Remove existing weather classes
    body.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm');
    app.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm');
    
    // Add appropriate class based on weather condition
    const condition = weatherCondition.toLowerCase();
    if (condition.includes('clear')) {
        body.classList.add('clear');
        app.classList.add('clear');
    } else if (condition.includes('cloud')) {
        body.classList.add('clouds');
        app.classList.add('clouds');
    } else if (condition.includes('rain')) {
        body.classList.add('rain');
        app.classList.add('rain');
    } else if (condition.includes('snow')) {
        body.classList.add('snow');
        app.classList.add('snow');
    } else if (condition.includes('thunder')) {
        body.classList.add('thunderstorm');
        app.classList.add('thunderstorm');
    }
}

function displayError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.style.animation = 'none';
    errorElement.offsetHeight; // Trigger reflow
    errorElement.style.animation = 'shake 0.5s ease-in-out';
    
    // Clear weather data
    document.getElementById("city-name").textContent = "";
    document.getElementById("temperature").textContent = "";
    document.getElementById("description").textContent = "";
    document.getElementById("weather-icon").innerHTML = "";
    document.getElementById("humidity").textContent = "";
    document.getElementById("wind").textContent = "";
    document.getElementById("pressure").textContent = "";
    document.getElementById("sunrise").textContent = "";
    document.getElementById("forecast-container").innerHTML = "";
}

// Theme toggle functionality
document.getElementById("theme-toggle").addEventListener("click", () => {
    const body = document.body;
    const isDark = body.classList.contains("dark");
    
    if (isDark) {
        body.classList.remove("dark");
        body.classList.add("light");
        document.getElementById("theme-toggle").innerHTML = '<i class="fas fa-moon"></i> Toggle Dark Mode';
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        document.getElementById("theme-toggle").innerHTML = '<i class="fas fa-sun"></i> Toggle Light Mode';
    }
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// Load saved preferences
window.addEventListener('load', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(savedTheme);
    document.getElementById("theme-toggle").innerHTML = 
        savedTheme === 'dark' ? '<i class="fas fa-sun"></i> Toggle Light Mode' : 
        '<i class="fas fa-moon"></i> Toggle Dark Mode';
    
    // Load last searched city
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        document.getElementById("city-input").value = lastCity;
        fetchWeather(lastCity);
        fetchForecast(lastCity);
    }
});