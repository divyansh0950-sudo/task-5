const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const cloudCover = document.getElementById("cloudCover");
const precipitation = document.getElementById("precipitation");

const localTime = document.getElementById("localTime");


const weatherDescriptions = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Moderate Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Moderate Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Rain Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with Hail", "⛈️"],
    99: ["Thunderstorm with Hail", "⛈️"]
};


const corrections = {
    "banglore": "Bangalore",
    "bangalore": "Bangalore",
    "bengaluru": "Bengaluru",
    "ambedkarnagar": "Ambedkar Nagar",
    "ambedkar nagar": "Ambedkar Nagar",
    "bombay": "Mumbai",
    "calcutta": "Kolkata",
    "madras": "Chennai",
    "newyork": "New York",
    "new york": "New York"
};


async function searchLocation(query) {

    message.textContent = "Searching location...";

    let searchQuery = query.trim().toLowerCase();

    if (corrections[searchQuery]) {
        searchQuery = corrections[searchQuery];
    }

    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            "?q=" + encodeURIComponent(searchQuery) +
            "&format=jsonv2" +
            "&addressdetails=1" +
            "&limit=5" +
            "&accept-language=en";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Location search failed");
        }

        const results = await response.json();

        if (!results || results.length === 0) {
            message.textContent =
                "Location not found. Try adding state or country.";
            return;
        }

        const location = results[0];

        const latitude = parseFloat(location.lat);
        const longitude = parseFloat(location.lon);

        const address = location.address || {};

        const name =
            location.name ||
            address.village ||
            address.town ||
            address.city ||
            address.county ||
            searchQuery;

        const country =
            address.country || "";

        await getWeather(
            latitude,
            longitude,
            name,
            country,
            location.display_name
        );

    } catch (error) {

        message.textContent =
            "Unable to find this location. Try again.";

    }
}


async function getWeather(
    latitude,
    longitude,
    name,
    country,
    fullLocation
) {

    message.textContent = "Loading weather...";

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "weather_code," +
            "cloud_cover," +
            "wind_speed_10m," +
            "precipitation" +
            "&timezone=auto";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        if (!data.current) {
            throw new Error("Weather data unavailable");
        }

        const current = data.current;

        cityName.textContent = name;

        countryName.textContent =
            country || "Location";

        temperature.textContent =
            Math.round(current.temperature_2m);

        feelsLike.textContent =
            Math.round(current.apparent_temperature) + "°C";

        humidity.textContent =
            current.relative_humidity_2m + "%";

        windSpeed.textContent =
            Math.round(current.wind_speed_10m) + " km/h";

        cloudCover.textContent =
            current.cloud_cover + "%";

        precipitation.textContent =
            current.precipitation + " mm";

        const weather =
            weatherDescriptions[current.weather_code] ||
            ["Unknown", "🌡️"];

        condition.textContent =
            weather[0];

        weatherIcon.textContent =
            weather[1];

        updateLocalTime(data.timezone);

        message.textContent = "";

    } catch (error) {

        message.textContent =
            "Weather data unavailable. Try again.";

    }
}


function updateLocalTime(timezone) {

    if (!timezone) {
        localTime.textContent = "--:--";
        return;
    }

    try {

        const time =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }
            ).format(new Date());

        localTime.textContent = time;

    } catch (error) {

        localTime.textContent = "--:--";

    }
}


searchBtn.addEventListener("click", function() {

    const query =
        cityInput.value.trim();

    if (query === "") {

        message.textContent =
            "Please enter a city, village, district or location.";

        cityInput.focus();

        return;
    }

    searchLocation(query);
});


cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});


locationBtn.addEventListener("click", function() {

    if (!navigator.geolocation) {

        message.textContent =
            "Geolocation is not supported.";

        return;
    }

    message.textContent =
        "Getting your location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            try {

                const url =
                    "https://nominatim.openstreetmap.org/reverse" +
                    "?lat=" + latitude +
                    "&lon=" + longitude +
                    "&format=jsonv2" +
                    "&addressdetails=1" +
                    "&accept-language=en";

                const response =
                    await fetch(url);

                const data =
                    await response.json();

                const address =
                    data.address || {};

                const name =
                    address.village ||
                    address.town ||
                    address.city ||
                    address.county ||
                    "Your Location";

                const country =
                    address.country || "";

                await getWeather(
                    latitude,
                    longitude,
                    name,
                    country,
                    data.display_name
                );

            } catch (error) {

                await getWeather(
                    latitude,
                    longitude,
                    "Your Location",
                    "",
                    ""
                );

            }

        },

        function() {

            message.textContent =
                "Location permission was denied.";

        }

    );

});


getWeather(
    28.6139,
    77.2090,
    "Delhi",
    "India",
    "Delhi, India"
);