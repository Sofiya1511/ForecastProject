const apiKey = "YOUR_API_KEY";

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
async function getAirQualityByCity(city) {
  try {
    const weatherData = await getWeather(city);

    if (weatherData && weatherData.coord) {
      const lat = weatherData.coord.lat;
      const lon = weatherData.coord.lon;

      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const data = await response.json();
      return data;
    } else {
      console.error("Error:", weatherData);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function displayAirQuality(airQualityData) {
  if (airQualityData) {
    const airQualityDiv = document.getElementById("airQuality");
    airQualityDiv.innerHTML = `
            <h3>Air Quality</h3>
            <p>AQI (Air Quality Index): ${airQualityData.list[0].main.aqi}</p>
            <p>Main Pollutant: ${airQualityData.list[0].components.pollution}</p>
        `;
  }
}

function displayTodayWeather(weatherData) {
  if (weatherData) {
    const temperature = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;

    const todayDiv = document.getElementById("today");
    todayDiv.innerHTML = `
            <p>Temprature: ${temperature}°C</p>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <img src="http://openweathermap.org/img/w/${icon}.png" alt="Погода">
        `;
  }
}

function displayForecastWeather(forecastData) {
  if (forecastData) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = `
            <ul id="forecast-list"></ul>
        `;
    const ul = forecastDiv.querySelector("#forecast-list");

    const dailyTemperatures = {};

    forecastData.list.forEach((hourlyData) => {
      const date = new Date(hourlyData.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dayOfMonth = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
      });
      const temperature = hourlyData.main.temp;
      const description = hourlyData.weather[0].description;
      const icon = hourlyData.weather[0].icon;

      if (!dailyTemperatures[day]) {
        dailyTemperatures[day] = [];
      }

      dailyTemperatures[day].push(temperature);

      const li = document.createElement("li");
      li.innerHTML = `
                <p>${day}, ${dayOfMonth}, ${time}: Temperature: ${temperature}°C</p>
                <p>${
                  description.charAt(0).toUpperCase() + description.slice(1)
                }</p>
                <img src="http://openweathermap.org/img/w/${icon}.png" alt="Погода">
            `;

      ul.appendChild(li);
    });
  }
}

function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.push(city);
  if (history.length > 10) {
    history.shift();
  }
  localStorage.setItem("searchHistory", JSON.stringify(history));
  displaySearchHistory(history);
}

function displaySearchHistory(history) {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  history.forEach((city, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            ${index + 1}. ${city}
            <button class="delete" data-index="${index}">x</button>
        `;
    historyList.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem("searchHistory");
  displaySearchHistory([]);
}

document.getElementById("historyList").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    displaySearchHistory(history);
  }
});

document.getElementById("clearHistory").addEventListener("click", () => {
  clearHistory();
});

document.getElementById("searchButton").addEventListener("click", async () => {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value;

  if (city) {
    const airQualityData = await getAirQualityByCity(city);

    if (airQualityData) {
      displayAirQuality(airQualityData);
    }
    const weatherData = await getWeather(city);
    displayTodayWeather(weatherData);
    saveToHistory(city);
    const weatherContainers =
      document.getElementsByClassName("weather-container");
    const searchHistoryContainers = document.getElementsByClassName(
      "search-history-container"
    );

    for (const container of weatherContainers) {
      container.style.display = "block";
    }

    for (const container of searchHistoryContainers) {
      container.style.display = "block";
    }

    const forecastData = await getForecast(city);
    displayForecastWeather(forecastData);

    cityInput.value = "";
  }
});
