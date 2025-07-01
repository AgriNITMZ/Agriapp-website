import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import WeatherTopBar from '../../components/topBar/WeatherTopBar';
const API_KEY = '4847a8e8b971aada91d76b104b8b2c7c';

export default function WeatherPage({ navigation }) {
    const [location, setLocation] = useState(null);
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [detailedForecast, setDetailedForecast] = useState([]);
    const [isloading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const fetchWeatherData = async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );
            setWeatherData(response.data);
            setIsLoading(false);

            const forecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );
            const groupedForecast = groupForecastByDay(forecastResponse.data.list);
            setForecast(groupedForecast);
            setSelectedDay(Object.keys(groupedForecast)[0]);
            setDetailedForecast(groupedForecast[Object.keys(groupedForecast)[0]]);
        } catch (error) {
            setIsLoading(false)
            setIsError(true)
            console.error("Error fetching weather data: ", error);
        }
    };

    const groupForecastByDay = (forecastList) => {
        const grouped = forecastList.reduce((acc, current) => {
            const date = new Date(current.dt * 1000).toLocaleDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(current);
            return acc;
        }, {});
        return grouped;
    };

    const getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            fetchWeatherData(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            setIsLoading(false)
            setIsError(true)
            console.error("Error getting location: ", error);
        }
    };

    const fetchWeatherByCity = async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            console.log(response.data);
            setWeatherData(response.data);

            const forecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
            );
            setIsLoading(false);
            const groupedForecast = groupForecastByDay(forecastResponse.data.list);
            setForecast(groupedForecast);
            setSelectedDay(Object.keys(groupedForecast)[0]);
            setDetailedForecast(groupedForecast[Object.keys(groupedForecast)[0]]);
        } catch (error) {
            setIsLoading(false)
            setIsError(true)
            console.error("Error fetching weather data: ", error);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const handleDaySelect = (day) => {
        setSelectedDay(day);
        setDetailedForecast(forecast[day]);
    };
    return (
        <><WeatherTopBar navigation={navigation} city={city} setCity={setCity} fetchWeatherByCity={fetchWeatherByCity} getLocation={getLocation} />

            <View style={styles.container}>
                {/* Search Section */}
                {(isError && !weatherData) && <View style={styles.weatherCard}>
                    <Text style={styles.cityName}> Some Error Occured.. </Text>
                    <Text style={styles.details}> Please try again later..! </Text>
                </View>}
                {isloading && <View style={styles.weatherCard}>
                    <Text style={styles.cityName}> Loading...</Text>
                </View>}
                {/* Current Weather Display */}
                {weatherData && (
                    <View style={styles.weatherCard}>
                        <Text style={styles.cityName}>{weatherData.name}, {weatherData.sys.country}</Text>
                        <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
                        <Text style={styles.description}>{weatherData.weather[0].description}</Text>
                        <Text style={styles.details}>Humidity: {weatherData.main.humidity}%</Text>
                        <Text style={styles.details}>Wind: {weatherData.wind.speed} m/s</Text>
                    </View>
                )}

                {/* Forecast Slider for Selected Day */}
                {(!isloading && !isError) && <Text style={styles.sectionTitle}>Forecast for {selectedDay}</Text>}
                <ScrollView horizontal style={styles.forecastContainer} showsHorizontalScrollIndicator={false}>
                    {detailedForecast.map((item, index) => (

                        <View key={index} style={styles.forecastItem}>
                            <Text style={styles.forecastTime}>{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            <Image
                                style={styles.icon}
                                source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                            />
                            <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                            <Text style={styles.forecastTime}>{item.weather[0].description}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Upcoming Days List */}
                {(!isloading && !isError) && <Text style={styles.sectionTitle}>Upcoming days Forecast</Text>}
                <ScrollView horizontal style={styles.daysList} showsHorizontalScrollIndicator={false}>
                    {Object.keys(forecast).map((day, index) => {
                        const dayForecast = forecast[day];
                        const firstItem = dayForecast[0]; // Get the first item of the day's forecast for highlights
                        const dayTemp = Math.round(firstItem.main.temp);
                        const weatherIcon = firstItem.weather[0].icon;
                        const weatherDescription = firstItem.weather[0].main;
                        const minTemp = Math.min(...dayForecast.map(item => item.main.temp_min));
                        const maxTemp = Math.max(...dayForecast.map(item => item.main.temp_max));
                        const humidity = firstItem.main.humidity;
                        const [dayPart, monthPart, yearPart] = day.split('/');
                        const formattedDate = new Date(`${yearPart}-${monthPart}-${dayPart}T00:00:00`);
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.dayItem, day === selectedDay && styles.selectedDayItem]}
                                onPress={() => handleDaySelect(day)}
                            >

                                <Text style={styles.dayText}>{formattedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                                <Image
                                    style={styles.dayIcon}
                                    source={{ uri: `https://openweathermap.org/img/wn/${weatherIcon}@2x.png` }}
                                />
                                <Text style={styles.dayTemp}>{dayTemp}°C</Text>
                                <Text style={styles.dayDescription}>{weatherDescription}</Text>
                                <Text style={styles.minMaxTemp}>Min: {Math.round(minTemp)}°C / Max: {Math.round(maxTemp)}°C</Text>
                                <Text style={styles.humidity}>Humidity: {humidity}%</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9', // Light green background for a fresh, outdoor feel
        padding: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA', // Light gray for contrast against the background
        borderRadius: 15,
        padding: 12,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#4CAF50', // Green text to blend with farming theme
    },
    weatherCard: {
        backgroundColor: '#b3e5b3',
        borderRadius: 20,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#55ca7c',
        alignItems: 'center',
    },
    cityName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#33691E', // Darker olive green for emphasis
    },
    temp: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#2E7D32', // Rich green for temperature
    },
    description: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#616161', // Neutral gray for weather descriptions
    },
    details: {
        fontSize: 15,
        color: '#6D4C41', // Brown for additional weather details, blending with nature
        marginVertical: 4,
    },
    sectionTitle: {
        paddingLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#33691E',
        borderLeftWidth: 5,
        borderLeftColor: '#81C784', // Fresh green accent for section headers
        marginBottom: 10,
        textShadowColor: '#C8E6C9',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
    },
    forecastContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        maxHeight: 140,
    },
    forecastItem: {
        backgroundColor: '#ffff',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        margin: 6,
        elevation: 1,
    },
    forecastTime: {
        fontSize: 14,
        color: '#0288D1', // Blue for timestamps, matching the forecast box
    },
    icon: {
        width: 45,
        height: 45,
    },
    forecastTemp: {
        fontSize: 16,
        color: '#2E7D32',
    },
    daysList: {
        marginTop: 5,
        maxHeight: 220,
    },
    dayItem: {
        backgroundColor: '#F1F8E9', // Soft pastel green, lighter than main container
        borderRadius: 12,
        padding: 10,
        margin: 8,
        alignItems: 'center',
        elevation: 2,
    },
    selectedDayItem: {
        backgroundColor: '#b3e5b3', // Brighter green to indicate selected day
        borderColor: '#33691E',
        borderWidth: 1.5,
    },
    dayText: {
        fontSize: 16,
        color: '#388E3C', // Green for day text to stay consistent with the theme
    },
    dayIcon: {
        width: 45,
        height: 45,
        marginVertical: 5,
    },
    dayTemp: {
        fontSize: 18,
        fontWeight: '700',
        color: '#33691E',
    },
    dayDescription: {
        fontSize: 14,
        color: '#558B2F',
    },
    minMaxTemp: {
        fontSize: 12,
        color: '#795548', // Earthy brown for min/max temperature details
        marginTop: 3,
    },
    humidity: {
        fontSize: 12,
        color: '#4E342E', // Dark brown to match earthy tones
    },
});
