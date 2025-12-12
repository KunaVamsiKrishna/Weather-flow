// =============================
//  1. WEATHER APP LOGIC
// =============================

document.getElementById("main").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        getdata();
    }
});

function getdata() {
    let input = document.getElementById("main");
    let city = input.value.trim();
    
    if(!city) return; 

    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("weather").innerHTML = ""; 

    fetchGeocoding(city);
}

async function fetchGeocoding(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    try {
        const response = await fetch(geoUrl);
        if (!response.ok) throw new Error("Geocoding API error");
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error("City not found");
        }

        const location = data.results[0];
        fetchWeather(location.latitude, location.longitude, location.name, location.country);

    } catch (error) {
        console.error(error);
        showError("🚫 City not found. Please try again.");
    }
}

async function fetchWeather(lat, lon, cityName, country) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error("Weather API error");

        const data = await response.json();
        renderWeather(data, cityName, country);
        
        // --- UPDATED CALL: Pass Temperature AND Weather Code ---
        updateBackground(data.current.temperature_2m, data.current.weather_code, data.current.is_day);

    } catch (error) {
        console.error(error);
        showError("⚠️ Unable to fetch weather data.");
    } finally {
        document.getElementById("loader").classList.add("hidden");
    }
}

function renderWeather(data, cityName, country) {
    let div = document.getElementById("weather");

    const current = data.current;
    const daily = data.daily;
    const weatherCode = current.weather_code;

    const weatherInfo = getWeatherInfo(weatherCode, current.is_day);

    div.innerHTML = `
        <div class="weather-info">
            <h3 class="city-name">📍 ${cityName} <span style="font-size:0.6em; opacity:0.7;">${country || ''}</span></h3>
            <div class="temp-big">${Math.round(current.temperature_2m)}°C</div>
            <div style="font-size: 1.2rem; margin-bottom: 10px;">${weatherInfo.icon} ${weatherInfo.description}</div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <small>High</small>
                    <span>⬆ ${Math.round(daily.temperature_2m_max[0])}°</span>
                </div>
                <div class="detail-item">
                    <small>Low</small>
                    <span>⬇ ${Math.round(daily.temperature_2m_min[0])}°</span>
                </div>
                <div class="detail-item">
                    <small>Wind</small>
                    <span>💨 ${current.wind_speed_10m} km/h</span>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    document.getElementById("weather").innerHTML = `<p style="color: #ff6b6b; margin-top: 20px;">${message}</p>`;
    document.getElementById("loader").classList.add("hidden");
}

// =============================
//  2. HELPER: WMO Code Mapping
// =============================

function getWeatherInfo(code, isDay) {
    const descriptions = {
        0: "Clear Sky",
        1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing Rime Fog",
        51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
        71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
        77: "Snow Grains",
        80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
        85: "Slight Snow Showers", 86: "Heavy Snow Showers",
        95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Heavy Thunderstorm"
    };

    const text = descriptions[code] || "Unknown";
    
    let icon = "☁️";
    if (code === 0) icon = isDay ? "☀️" : "🌙";
    else if ([1, 2, 3].includes(code)) icon = "⛅";
    else if ([45, 48].includes(code)) icon = "🌫️";
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) icon = "🌧️";
    else if ([71, 73, 75, 77, 85, 86].includes(code)) icon = "❄️";
    else if ([95, 96, 99].includes(code)) icon = "⚡";

    return { description: text, icon: icon };
}

// =============================
//  3. BACKGROUND ANIMATION LOGIC (Temperature Based)
// =============================

function updateBackground(temp, code, isDay) {
    const body = document.body;
    const weatherIcon = document.getElementById("weather-icon");
    
    // Remove all old classes
    body.classList.remove("hot", "warm", "cool", "cold", "freezing");

    // --- ICON LOGIC (Keep existing icon logic based on weather code) ---
    if (code === 0) weatherIcon.innerText = isDay ? "☀️" : "🌙";
    else if (code <= 48) weatherIcon.innerText = "☁️";
    else if (code >= 51 && code <= 67) weatherIcon.innerText = "🌧️";
    else if (code >= 71 && code <= 77) weatherIcon.innerText = "❄️";
    else if (code >= 95) weatherIcon.innerText = "⚡";
    else weatherIcon.innerText = "🌤️";

    // --- COLOR THEME LOGIC (Based on Temperature) ---
    if (temp >= 30) {
        body.classList.add("hot");       // > 30°C
    } else if (temp >= 20) {
        body.classList.add("warm");      // 20-29°C
    } else if (temp >= 10) {
        body.classList.add("cool");      // 10-19°C
    } else if (temp >= 0) {
        body.classList.add("cold");      // 0-9°C
    } else {
        body.classList.add("freezing");  // < 0°C
    }
}

// =============================
//  4. CURSOR LOGIC
// =============================

const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

if (cursorDot && cursorOutline) {
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });
}

const interactables = document.querySelectorAll("button, input");

interactables.forEach(el => {
    el.addEventListener("mouseenter", () => {
        document.body.classList.add("hovering");
    });
    el.addEventListener("mouseleave", () => {
        document.body.classList.remove("hovering");
    });
});
