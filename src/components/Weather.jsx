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

const Weather = () => {

    const inputRef = useRef();
    const [city, setCity] = useState("");
    const [error, setError] = useState("");

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
            return alert("Please enter a city name")
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
            const res = await fetch(url)

            const data = await res.json()
            if (!res.ok) {
                alert(data.message);
                return;
            }
            console.log(data)

            const icon = allIcons[data.weather[0].icon] || clear_icon
            setWeatherData({
                humidity: data.main.humidity,
                feelslike: Math.floor(data.main.feels_like),
                windspeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon,
                weatherinfo: data.weather[0].description,
                maxtmp: Math.floor(data.main.temp_max),
                mintmp: Math.floor(data.main.temp_min),

            })


        } catch (error) {
            setWeatherData(false)
            console.error("error while fetching the data", error)
        }
    }

    useEffect(() => {
        search("new delhi")



    }, [])



    return (

        <div className='weather'>
            <h1 className='title'>Weather App</h1>
            <div className="search-bar">
                <img src={location_icon} alt="" onClick={()=>{ getLocation()}}/>
                <input type="text" placeholder='Search' ref={inputRef} />
                <img src={search_icon} alt="" onClick={() => { search(inputRef.current.value) }} />
            </div>
            <img src={weatherData.icon} alt="" className='weather-icon' />
            <p className='temperature'>{weatherData.temperature}°c</p>
            <p className='feelslike'>Feels like {weatherData.feelslike}°c</p>
            <p className='weatherinfo'>{weatherData.weatherinfo}</p>
            <p className='location'>{weatherData.location}</p>
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
                    <img src={max_temp} alt="" className='invert_img'/>
                    <div>
                        <p>{weatherData.maxtmp}°c</p>
                        <span>MAX</span>
                    </div>
                    
                </div>
                
                <div className="col">
                    <img src={min_temp} alt="" className='invert_img'/>
                    <div>
                        <p>{weatherData.mintmp}°c</p>
                        <span>MIN</span>
                    </div>
                </div>
            </div>
            <h5 className='footer'>Created By Rohit Singh</h5>

        </div>
    )
}

export default Weather
