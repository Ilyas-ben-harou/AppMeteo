import React, { useState } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

// Import des features
import { fetchForecast, ForecastDisplay } from './ForecastFeature';
import { useFavorites, FavoritesDisplay, AddToFavoritesButton } from './FavoritesFeature';
import { useGeolocation, LocationButton } from './LocationFeature';
// import { useDayNightMode, DayNightModeIcon } from './DayNightModeFeature';

function Grp204WeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        loading: false,
        data: {},
        error: false,
    });
    const [forecast, setForecast] = useState([]);
    const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
    const { isDayMode, updateDayNightMode } = useDayNightMode();

    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    const toDateFunction = () => {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const currentDate = new Date();
        const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
        return date;
    };

    const fetchWeather = async (params) => {
        setWeather({ ...weather, loading: true });
        const url = 'https://api.openweathermap.org/data/2.5/weather';
        try {
            const res = await axios.get(url, { params: { ...params, units: 'metric', appid: api_key } });
            setWeather({ data: res.data, loading: false, error: false });
            updateDayNightMode(res.data.dt, res.data.sys.sunrise, res.data.sys.sunset);
            const forecastData = await fetchForecast(res.data.name, api_key);
            setForecast(forecastData);
        } catch (error) {
            setWeather({ ...weather, data: {}, error: true });
            setForecast([]);
        }
    };

    const handleSearch = (event) => {
        if (event.key === 'Enter') {
            fetchWeather({ q: input });
            setInput('');
        }
    };

    const getUserLocation = useGeolocation((latitude, longitude) => {
        fetchWeather({ lat: latitude, lon: longitude });
    });

    return (
        <div className={`App ${isDayMode ? 'day-mode' : 'night-mode'}`}>
            <h1 className="app-name">Application Météo grp204</h1>
            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Entrez le nom de la ville..."
                    name="query"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyPress={handleSearch}
                />
                <LocationButton onClick={getUserLocation} />
                <DayNightModeIcon isDayMode={isDayMode} />
            </div>
            <FavoritesDisplay
                favorites={favorites}
                onSelectFavorite={(city) => fetchWeather({ q: city })}
                onRemoveFavorite={removeFromFavorites}
            />
            {weather.loading && (
                <Oval type="Oval" color={isDayMode ? "black" : "white"} height={100} width={100} />
            )}
            {weather.error && (
                <span className="error-message">
                    <FontAwesomeIcon icon={faFrown} />
                    <span>Ville introuvable</span>
                </span>
            )}
            {weather && weather.data && weather.data.main && (
                <div>
                    <h2>{weather.data.name}, {weather.data.sys.country}</h2>
                    <span>{toDateFunction()}</span>
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                        alt={weather.data.weather[0].description}
                    />
                    <p>{Math.round(weather.data.main.temp)}°C</p>
                    <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
                    <AddToFavoritesButton onClick={addToFavorites} city={weather.data.name} />
                </div>
            )}
            <ForecastDisplay forecast={forecast} />
        </div>
    );
}

export default Grp204WeatherApp;
