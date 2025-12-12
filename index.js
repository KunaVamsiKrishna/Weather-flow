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

    // Reset cursor/UI states if needed
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("weather").innerHTML = ""; 

    showWeather(city);
}

async function showWeather(city) {
    const url = `https://open-weather13.p.rapidapi.com/city?city=${city}&lang=EN`;
    const options = {
        method: 'GET',
         headers: {
		'x-rapidapi-key': 'f24733bd44mshaeb6224bca07fa3p10af11jsn2cf56c05d41c',
		'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
	  }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("City not found or API error");
        }
        const result = await response.json();
        renderWeather(result);
        
        // --- TRIGGER ANIMATION CHANGE HERE ---
        updateBackground(result.weather[0].main);

    } catch (error) {
        console.error(error.message);
        document.getElementById("weather").innerHTML = `<p style="color: #ff6b6b; margin-top: 20px;">🚫 City not found.</p>`;
    } finally {
        document.getElementById("loader").classList.add("hidden");
    }
}

function updateBackground(condition) {
    const body = document.body;
    const iconSpan = document.getElementById("weather-icon");
    
    // Remove all previous weather classes
    body.classList.remove("sunny", "cloudy", "rainy", "snowy");

    // Normalize condition string (make lower case for comparison)
    const weather = condition.toLowerCase();

    if (weather.includes("clear")) {
        body.classList.add("sunny");
        iconSpan.innerText = "☀️";
    } else if (weather.includes("cloud") || weather.includes("haze") || weather.includes("mist")) {
        body.classList.add("cloudy");
        iconSpan.innerText = "☁️";
    } else if (weather.includes("rain") || weather.includes("drizzle") || weather.includes("thunder")) {
        body.classList.add("rainy");
        iconSpan.innerText = "🌧️";
    } else if (weather.includes("snow")) {
        body.classList.add("snowy");
        iconSpan.innerText = "❄️";
    } else {
        // Default / Night
        iconSpan.innerText = "🌙";
    }
}

function renderWeather(data) {
    let div = document.getElementById("weather");
    
    let temp = Math.round(data.main.temp);
    let max = Math.round(data.main.temp_max);
    let min = Math.round(data.main.temp_min);
    let desc = data.weather[0].description; // Get description (e.g., "light rain")

    div.innerHTML = `
        <div class="weather-info">
            <h3 class="city-name">📍 ${data.name}</h3>
            <div class="temp-big">${temp}°C</div>
            <p style="text-transform: capitalize; opacity: 0.8; margin-bottom: 10px;">${desc}</p>
            
            <div class="details-grid">
                <div class="detail-item">
                    <small>High</small>
                    <span>⬆ ${max}°</span>
                </div>
                <div class="detail-item">
                    <small>Low</small>
                    <span>⬇ ${min}°</span>
                </div>
            </div>
        </div>
    `;
}

// =============================
//  2. CURSOR ANIMATION LOGIC
// =============================

const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

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

const interactables = document.querySelectorAll("button, input");

interactables.forEach(el => {
    el.addEventListener("mouseenter", () => {
        document.body.classList.add("hovering");
    });
    el.addEventListener("mouseleave", () => {
        document.body.classList.remove("hovering");
    });
});