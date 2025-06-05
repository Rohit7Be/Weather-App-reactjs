import React, { useRef, useState } from 'react'
import './Weather.css'
import { useEffect } from 'react'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import location_icon from '../assets/location.png'
import max_temp from '../assets/hot.png'
import min_temp from '../assets/cold.png'
import day from '../assets/day.jpg'
import night from '../assets/night.jpg'
import pressure from '../assets/pressure.png'
import visibility from '../assets/visibility.png'

const Weather = () => {

    const inputRef = useRef();
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [background, setBackground] = useState("");
    const [localTime, setLocalTime] = useState("");





    const [weatherData, setWeatherData] = useState(false)

    const allIcons = {
        "01d": "https://openweathermap.org/img/wn/01d@2x.png",
        "01n": "https://openweathermap.org/img/wn/01n@2x.png",
        "02d": "https://openweathermap.org/img/wn/02d@2x.png",
        "02n": "https://openweathermap.org/img/wn/02n@2x.png",
        "03d": "https://openweathermap.org/img/wn/03d@2x.png",
        "03n": "https://openweathermap.org/img/wn/03n@2x.png",
        "04d": "https://openweathermap.org/img/wn/04d@2x.png",
        "04n": "https://openweathermap.org/img/wn/04n@2x.png",
        "09d": "https://openweathermap.org/img/wn/09d@2x.png",
        "09n": "https://openweathermap.org/img/wn/09n@2x.png",
        "10d": "https://openweathermap.org/img/wn/10d@2x.png",
        "10n": "https://openweathermap.org/img/wn/10n@2x.png",
        "13d": "https://openweathermap.org/img/wn/13d@2x.png",
        "13n": "https://openweathermap.org/img/wn/13n@2x.png",
    }
    // -----these functions are for getting users current location (nearby city)---
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(fetchCity, showError);

        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };
    const fetchAQI = async (lat, lon) => {
        const apiKey = import.meta.env.VITE_APP_ID;
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(data.list[0].main.aqi);
        return data.list[0].main.aqi; // returns 1-5
    };

    const fetchCity = (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = "bda4775b2efbd8737344a14de18f3f68";
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setCity(data.name);
                console.log(data.name)
                // now searching the city name from the location button 
                search(data.name)
                setError("");
            })
            .catch((err) => setError("Error fetching city name."));
    };
    const showError = () => {
        setError("Please allow location access.");
    };

    // this is the main function that fetches the data from the api about the city weather conditions 

    const search = async (city) => {
        if (city === "") {
            return alert("Please enter a city name");
        }
        try {
            // Fetch current weather data to get sunrise, sunset, and other details
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const currentRes = await fetch(currentWeatherUrl);
            const currentData = await currentRes.json();

            const utcTime = currentData.dt; // Current UTC time in seconds
            const timezoneOffset = currentData.timezone; // Offset in seconds from UTC

            const localTimestamp = (utcTime + timezoneOffset) * 1000; // Convert to milliseconds
            const localDate = new Date(localTimestamp);
            const localTimeObj = new Date(localTimestamp);
            const localHour = localDate.getUTCHours();// getting the local hour of the city 


            const formattedLocalTime = localTimeObj.toUTCString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            setLocalTime(formattedLocalTime);
            console.log("local hour: ", localHour)
            console.log("LocalTime UTC String:", localTimeObj.toUTCString());
            console.log("currentdata")
            console.log(currentData)



            if (!currentRes.ok) {
                alert(currentData.message);
                return;
            }

            const lat = currentData.coord.lat;
            const lon = currentData.coord.lon;
            const aqi = await fetchAQI(lat, lon);

            // in seconds












            // Fetch forecast data for hourly data (next 5 days)
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const forecastRes = await fetch(forecastUrl);
            const forecastData = await forecastRes.json();
            console.log("forecast data")
            console.log(forecastData);


            if (!forecastRes.ok) {
                alert(forecastData.message);
                return;
            }

            const icon = allIcons[currentData.weather[0].icon] || clear_icon;

            if (localHour >= 18 || localHour <= 6) {
                setBackground(night)
            } else {
                setBackground(day)
            }


            // Extract hourly forecast data for the next 12 hours
            const hourlyForecast = forecastData.list.slice(0, 11).map(item => ({
                time: item.dt_txt,
                temp: Math.floor(item.main.temp),
                icon: allIcons[item.weather[0].icon],
                weatherDescription: item.weather[0].description,
            }));

            setWeatherData({
                humidity: currentData.main.humidity,
                feelslike: Math.floor(currentData.main.feels_like),
                windspeed: currentData.wind.speed,
                temperature: Math.floor(currentData.main.temp),
                location: currentData.name,
                icon: icon,
                weatherinfo: currentData.weather[0].description,
                maxtmp: Math.floor(currentData.main.temp_max),
                mintmp: Math.floor(currentData.main.temp_min),
                pressure: currentData.main.pressure,
                visibility: currentData.visibility / 1000, //convert to km
                hourlyForecast: hourlyForecast,
                aqi: aqi,  // Add hourly forecast data[]
            });

            setError("");


        } catch (error) {
            setWeatherData(false);
            console.error("Error while fetching the data", error);
        }
    };




    useEffect(() => {
        getLocation()



    }, [])

    const getAQIColor = (aqi) => {
        switch (aqi) {
            case 1: return "#009966"; // Good (Green)
            case 2: return "#ffde33"; // Fair (Yellow)
            case 3: return "#ff9933"; // Moderate (Orange)
            case 4: return "#cc0033"; // Poor (Red)
            case 5: return "#660099"; // Very Poor (Purple)
            default: return "#888888"; // Unknown (Gray)
        }
    };

    const getAQIDescription = (aqi) => {
        switch (aqi) {
            case 1: return "Very Good";
            case 2: return "Good";
            case 3: return "Moderate";
            case 4: return "Poor";
            case 5: return "Very Poor";
            default: return "Unknown";
        }
    };






    return (

        <div className='weather'
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                minHeight: '100vh'
            }}
        >
            <h1 className='title'>Weathery</h1>
            <div className="search-bar">
                <img src={location_icon} alt="" onClick={() => { getLocation() }} />
                <input type="text" placeholder='Search' ref={inputRef} />
                <img src={search_icon} alt="" onClick={() => { search(inputRef.current.value) }} />
            </div>
            <img src={weatherData.icon} alt="" className='weather-icon' />
            <p className='temperature'>{weatherData.temperature}°c</p>
            <p className='feelslike'>Feels like {weatherData.feelslike}°c</p>
            <p className='weatherinfo'>{weatherData.weatherinfo}</p>
            {weatherData.aqi && (
                <div className="aqi-info" style={{ color: getAQIColor(weatherData.aqi) }}>
                    <p>
                        AQI : {getAQIDescription(weatherData.aqi)}
                    </p>
                </div>
            )}


            <p className='location'>{weatherData.location}</p>

            <button className='mapbtn' onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${weatherData.location}`, '_blank')}>
                📍 Map
            </button>



            <p className="local-time"> {localTime.slice(0, 17)}</p>
            <p className="local-time">Current Time : {localTime.slice(17, 19)} Hour</p>





            <div className="weather-data">
                <div className="col">
                    <img src={humidity_icon} alt="" />
                    <div>
                        <p>{weatherData.humidity}%</p>
                        <span>Humidity</span>
                    </div>

                </div>

                <div className="col">
                    <img src={wind_icon} alt="" />
                    <div>
                        <p>{weatherData.windspeed} Km/h </p>
                        <span>Wind Speed</span>
                    </div>
                </div>
            </div>
            {/* this second weather data for temp max and min  */}
            <div className="weather-data">
                <div className="col">
                    <img src={max_temp} alt="" className='invert_img' />
                    <div>
                        <p>{weatherData.maxtmp}°c</p>
                        <span>MAX</span>
                    </div>

                </div>

                <div className="col">
                    <img src={min_temp} alt="" className='invert_img' />
                    <div>
                        <p>{weatherData.mintmp}°c</p>
                        <span>MIN</span>
                    </div>
                </div>
            </div>
            <div className="weather-data">
                <div className="col">
                    <img src={pressure} alt="" className='invert_img' />
                    <div>
                        <p>{weatherData.pressure} Hpa</p>
                        <span>Pressure</span>
                    </div>

                </div>

                <div className="col">
                    <img src={visibility} alt="" className='invert_img' />
                    <div>
                        <p>{weatherData.visibility} Km</p>
                        <span>Visibility</span>
                    </div>
                </div>
            </div>
            <div className="hourly-forecast">
                <h2>Hourly Forecast</h2>
                <div className="forecast-container">
                    {weatherData && Array.isArray(weatherData.hourlyForecast) ? (
                        weatherData.hourlyForecast.map((forecast, index) => (
                            <div key={index} className="forecast-item">
                                <p>{new Date(forecast.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>{forecast.time.slice(5, 10)}</p>
                                <img src={forecast.icon} alt={forecast.weatherDescription} />
                                <p>{forecast.temp}°C</p>
                                <p>{forecast.weatherDescription}</p>
                            </div>
                        ))
                    ) : (
                        <p>Loading forecast...</p>
                    )}
                </div>

            </div>
            


            <h5 className='footer'>Created By Rohit Singh</h5>

        </div>
    )
}

export default Weather
