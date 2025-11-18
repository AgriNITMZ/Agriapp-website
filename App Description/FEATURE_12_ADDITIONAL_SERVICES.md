# Feature Description: Additional Services

## Feature Overview
This feature provides supplementary agricultural services beyond the core e-commerce functionality, including IoT sensor data monitoring for precision farming, real-time weather information with forecasts, farming tips and best practices, and loan/financial services information. These services enhance the platform's value proposition by providing farmers with comprehensive tools for data-driven decision making, weather-based planning, educational resources, and financial support information. The feature integrates external APIs (OpenWeatherMap, IoT sensors) and provides mobile-optimized interfaces for easy access to critical farming information.

---

## Architecture Components

### Backend Components
1. **Routes** (API Endpoints)
   - Sensor Routes (`routes/Sensor.js`) - IoT sensor data endpoints

2. **External API Integrations**
   - OpenWeatherMap API (weather data)
   - IoT Sensor API (farm sensor data)

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Sensor Dashboard (`screens/Sensor/Sensor.js`)
   - Weather Page (`screens/services/WeatherPage.js`)
   - Farming Tips Page (`screens/services/FarmingTipsPage.js`)
   - Loan Screen (`screens/services/LoanScreen.js`)

2. **Components** (Reusable UI)
   - WeatherTopBar (weather search header)
   - CustomTopBar (standard header)

---

## Detailed Component Analysis

### 1. IOT SENSOR MONITORING

#### 1.1 Sensor Routes (`agri_backend/routes/Sensor.js`)

**Purpose**: API endpoints for IoT sensor data (currently in development)

**Route: GET `/api/v1/sensor/sensor-ids`**
- **Purpose**: Fetch list of available sensor IDs
- **Status**: 503 (Service Unavailable)
- **Response**:
```json
{
  "status": "error",
  "message": "Sensor feature is still in development and will be available soon"
}
```

**Route: GET `/api/v1/sensor/sensor-data`**
- **Purpose**: Fetch sensor data for specific sensor
- **Status**: 503 (Service Unavailable)
- **Response**:
```json
{
  "status": "error",
  "message": "Sensor feature is still in development and will be available soon"
}
```

**Planned Implementation**:
- Integration with IoT sensor network
- Real-time sensor data streaming
- Historical data storage
- Data aggregation and analytics

---

#### 1.2 Sensor Dashboard Screen (`agri-app/src/screens/Sensor/Sensor.js`)

**Purpose**: Display and monitor IoT sensor data from farm sensors

**State Management**:
- `sensorIds`: Array of available sensor IDs
- `selectedSensor`: Currently selected sensor
- `sensorData`: Array of sensor readings
- `loading`: Loading state for sensor IDs
- `dataLoading`: Loading state for sensor data
- `currentPage`: Current pagination page
- `totalPages`: Total number of pages
- `refreshing`: Pull-to-refresh state

**Data Fetching**:
```javascript
const fetchSensorIds = async () => {
    const response = await fetch(`${apiUrl}/sensor/sensor-ids`);
    const json = await response.json();
    if (json.status === 'success' && json.sensor_ids) {
        setSensorIds(json.sensor_ids);
    }
};

const fetchSensorData = async () => {
    const response = await fetch(
        `${apiUrl}/sensor/sensor-data?table=${selectedSensor}&limit=20&page=${currentPage}`
    );
    const json = await response.json();
    setSensorData(json.data);
};
```

---

**Sensor Data Structure**:
```javascript
{
  id: Number,
  soil_moisture: Number,
  soil_temp: Number,
  soil_conductivity: Number,
  temperature: Number,
  humidity: Number,
  raindrop: Number,
  atm_light: Number,
  soil_ph: Number,
  soil_nitrogen: Number,
  soil_phosphorus: Number,
  soil_potassium: Number,
  loc0: String,
  loc1: String,
  loc2: String,
  loc3: String,
  timestamp: String
}
```

---

**UI Components**:

**1. Sensor Selector Dropdown**:
- Picker component for sensor selection
- Lists all available sensor IDs
- Auto-selects first sensor on load
- Disabled during loading

**2. Sensor Data List**:
- FlatList of sensor readings
- Card-based layout
- Displays all sensor parameters
- Paginated results (20 per page)
- Pull-to-refresh functionality

**3. Data Card Display**:
- Record ID header
- Soil metrics (moisture, temp, conductivity, pH, NPK)
- Environmental metrics (temperature, humidity, raindrop, light)
- Location information
- Timestamp

**4. Pagination Controls**:
- Previous/Next buttons
- Current page indicator
- Total pages display
- Disabled state for boundary pages

---

**Key Features**:
- Multi-sensor support
- Real-time data display
- Pagination for large datasets
- Pull-to-refresh
- Comprehensive sensor metrics
- Location tracking
- Timestamp for each reading

**Sensor Metrics Displayed**:
- **Soil Metrics**: Moisture, Temperature, Conductivity, pH, Nitrogen, Phosphorus, Potassium
- **Environmental**: Air Temperature, Humidity, Raindrop, Atmospheric Light
- **Location**: 4-level location hierarchy
- **Metadata**: Record ID, Timestamp

---

### 2. WEATHER INFORMATION

#### 2.1 Weather Page Screen (`agri-app/src/screens/services/WeatherPage.js`)

**Purpose**: Real-time weather information and forecasts for farming decisions

**State Management**:
- `location`: User's GPS location
- `city`: City name for search
- `weatherData`: Current weather data
- `forecast`: Hourly forecast data
- `selectedDay`: Selected day for detailed forecast
- `isloading`: Loading state
- `isError`: Error state

**External API**: OpenWeatherMap API
- **API Key**: Configured in environment
- **Endpoints**:
  - Current Weather: `/data/2.5/weather`
  - Forecast: `/data/2.5/forecast`

---

**Data Fetching**:

**By GPS Location**:
```javascript
const fetchWeatherData = async (lat, lon) => {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    setWeatherData(response.data);
    
    const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const groupedForecast = groupForecastByDay(forecastResponse.data.list);
    setForecast(groupedForecast);
};
```

**By City Name**:
```javascript
const fetchWeatherByCity = async () => {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    setWeatherData(response.data);
    
    const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    // Process forecast data
};
```

---

**Weather Data Structure**:
```javascript
{
  name: String,              // City name
  sys: {
    country: String          // Country code
  },
  main: {
    temp: Number,            // Temperature (°C)
    humidity: Number,        // Humidity (%)
    temp_min: Number,        // Min temperature
    temp_max: Number         // Max temperature
  },
  weather: [{
    description: String,     // Weather description
    icon: String            // Weather icon code
  }],
  wind: {
    speed: Number           // Wind speed (m/s)
  }
}
```

---

**UI Components**:

**1. Weather Top Bar**:
- City search input
- Search button
- GPS location button
- Back navigation

**2. Current Weather Card**:
- City name and country
- Current temperature (large display)
- Weather description
- Humidity percentage
- Wind speed
- Green gradient background

**3. Hourly Forecast**:
- Horizontal scrollable list
- Time labels
- Weather icons
- Temperature
- Weather description
- Next 24 hours

**4. Daily Forecast**:
- Vertical list of days
- Day name
- Weather icon
- Day temperature
- Weather description
- Min/Max temperatures
- Humidity
- Expandable for details

---

**Key Features**:
- GPS-based location detection
- City name search
- Current weather display
- Hourly forecast (24 hours)
- Daily forecast (5 days)
- Weather icons
- Temperature in Celsius
- Humidity and wind information
- Farming-themed green color scheme

**Farming Relevance**:
- Plan irrigation based on rainfall
- Schedule planting based on temperature
- Protect crops from extreme weather
- Optimize harvesting timing
- Monitor humidity for disease prevention

---

### 3. FARMING TIPS & EDUCATION

#### 3.1 Farming Tips Page (`agri-app/src/screens/services/FarmingTipsPage.js`)

**Purpose**: Educational content and best practices for farmers

**Content Categories**:
1. **Crop Management**: Planting, growing, harvesting tips
2. **Pest Control**: Identification and management
3. **Soil Health**: Soil testing, fertilization, pH management
4. **Water Management**: Irrigation techniques, water conservation
5. **Seasonal Advice**: Season-specific farming tips
6. **Government Schemes**: Information about support programs

**Content Structure**:
```javascript
{
  id: String,
  title: String,
  summary: String,
  content: String,
  imageUrl: String,
  category: String
}
```

**UI Components**:
- Card-based tip list
- Category filters
- Search functionality
- Detailed tip view
- Image support
- Bookmark/favorite option

**Key Features**:
- Curated farming content
- Category-based organization
- Search and filter
- Visual content with images
- Practical actionable advice
- Local context (Mizoram-specific)

---

### 4. LOAN & FINANCIAL SERVICES

#### 4.1 Loan Screen (`agri-app/src/screens/services/LoanScreen.js`)

**Purpose**: Information about agricultural loans and financial services

**Content Sections**:
1. **Available Loan Schemes**:
   - Government loans
   - Bank loans
   - Microfinance options
   - Subsidy programs

2. **Eligibility Criteria**:
   - Land ownership requirements
   - Income criteria
   - Documentation needed
   - Credit score requirements

3. **Application Process**:
   - Step-by-step guide
   - Required documents
   - Application forms
   - Contact information

4. **Loan Calculators**:
   - EMI calculator
   - Interest calculation
   - Repayment schedule

**UI Components**:
- Loan scheme cards
- Eligibility checker
- Document checklist
- EMI calculator
- Application links
- Contact information

**Key Features**:
- Comprehensive loan information
- Eligibility assessment
- EMI calculation
- Application guidance
- Government scheme details
- Bank contact information

---

## DATA FLOW DIAGRAMS

### Sensor Data Flow
```
User (Mobile App)
    ↓ [Opens Sensor Dashboard]
fetchSensorIds()
    ↓ [GET /sensor/sensor-ids]
Sensor API
    ↓ [Return list of sensor IDs]
Display Sensor Dropdown
    ↓ [User selects sensor]
fetchSensorData()
    ↓ [GET /sensor/sensor-data?table=sensor1&page=1]
Sensor API
    ↓ [Return sensor readings]
Display Sensor Data
    ↓ [Show soil, environmental metrics]
User
    ↓ [Swipes to refresh or changes page]
Refresh Data
```

### Weather Data Flow
```
User (Mobile App)
    ↓ [Opens Weather Page]
Request Location Permission
    ↓ [User grants permission]
Get GPS Location
    ↓ [latitude, longitude]
fetchWeatherData(lat, lon)
    ↓ [GET OpenWeatherMap API]
OpenWeatherMap
    ↓ [Return current weather]
    ↓ [Return forecast data]
Process Forecast
    ↓ [Group by day]
    ↓ [Group by hour]
Display Weather
    ↓ [Current weather card]
    ↓ [Hourly forecast]
    ↓ [Daily forecast]
User
    ↓ [Searches by city name]
fetchWeatherByCity(city)
    ↓ [GET OpenWeatherMap API]
Update Display
```

### Farming Tips Flow
```
User
    ↓ [Opens Farming Tips]
Load Tips
    ↓ [Fetch from local/remote]
Display Tip Cards
    ↓ [Show categories]
User
    ↓ [Selects category filter]
Filter Tips
    ↓ [Show filtered results]
User
    ↓ [Taps on tip]
Show Tip Detail
    ↓ [Full content, images]
User
    ↓ [Bookmarks tip]
Save to Favorites
```

---

## KEY FEATURES & CAPABILITIES

### 1. IoT Sensor Integration
- Multi-sensor support
- Real-time data monitoring
- Comprehensive metrics (soil, environmental)
- Historical data access
- Pagination for large datasets
- Location tracking

### 2. Weather Information
- GPS-based location
- City search
- Current weather
- Hourly forecast (24 hours)
- Daily forecast (5 days)
- Weather icons and descriptions

### 3. Farming Education
- Curated farming tips
- Category-based organization
- Search and filter
- Visual content
- Practical advice
- Local context

### 4. Financial Services
- Loan scheme information
- Eligibility criteria
- Application guidance
- EMI calculator
- Government schemes
- Bank contacts

### 5. Data Visualization
- Card-based layouts
- Charts and graphs (planned)
- Weather icons
- Color-coded metrics
- Responsive design

### 6. User Experience
- Pull-to-refresh
- Loading states
- Error handling
- Offline support (planned)
- Intuitive navigation

---

## BUSINESS RULES

### Sensor Data
1. Sensor feature currently in development
2. Will support multiple sensors per farm
3. Data updated in real-time
4. Historical data retained
5. Pagination: 20 records per page

### Weather Data
1. Uses OpenWeatherMap API
2. Free tier limitations apply
3. Data updated every 3 hours
4. Forecast: 5 days ahead
5. Temperature in Celsius
6. Wind speed in m/s

### Farming Tips
1. Content curated by experts
2. Mizoram-specific advice
3. Regular content updates
4. Category-based organization
5. User can bookmark tips

### Loan Information
1. Information only (not application processing)
2. Government schemes highlighted
3. Eligibility criteria clearly stated
4. EMI calculator for planning
5. Links to official sources

---

## SECURITY FEATURES

### 1. API Key Management
- Weather API key in environment variables
- Sensor API authentication (planned)
- No keys in client code
- Secure key rotation

### 2. Location Privacy
- User permission required
- Location not stored permanently
- Used only for weather data
- Can search by city instead

### 3. Data Privacy
- Sensor data farmer-specific
- No sharing without consent
- Secure data transmission
- HTTPS only

### 4. Input Validation
- City name validation
- Sensor ID validation
- Pagination parameter validation
- Error handling

---

## PERFORMANCE OPTIMIZATIONS

### 1. Data Caching
- Cache weather data (30 minutes)
- Cache sensor data (5 minutes)
- Cache farming tips locally
- Reduce API calls

### 2. Pagination
- Limit sensor data (20 per page)
- Lazy loading
- Efficient scrolling
- Memory management

### 3. Image Optimization
- Lazy load images
- Compressed weather icons
- CDN for tip images
- Placeholder images

### 4. API Efficiency
- Batch requests where possible
- Minimize API calls
- Use appropriate intervals
- Handle rate limits

---

## TESTING CONSIDERATIONS

### Unit Tests

**Sensor Data**:
- Test data parsing
- Test pagination logic
- Test sensor selection
- Test error handling

**Weather Data**:
- Test API integration
- Test location services
- Test city search
- Test forecast grouping

**Farming Tips**:
- Test content loading
- Test filtering
- Test search
- Test bookmarking

### Integration Tests

**API Integration**:
- Test OpenWeatherMap API
- Test sensor API (when available)
- Test error responses
- Test rate limiting

**Location Services**:
- Test GPS permission
- Test location accuracy
- Test fallback to city search

### E2E Tests

**Complete User Journey**:
- User opens weather page
- Grants location permission
- Views current weather
- Checks forecast
- Searches different city
- Opens sensor dashboard
- Selects sensor
- Views sensor data
- Reads farming tips

---

## FUTURE ENHANCEMENTS

1. **Advanced Sensor Analytics**: Trend analysis, anomaly detection, predictive insights

2. **Weather Alerts**: Push notifications for severe weather, frost warnings

3. **Crop-Specific Advice**: Weather-based recommendations for specific crops

4. **Irrigation Scheduling**: Automated irrigation recommendations based on sensor + weather

5. **Disease Prediction**: ML-based disease prediction from weather patterns

6. **Satellite Imagery**: NDVI and crop health monitoring from satellites

7. **Soil Testing Integration**: Lab results integration and recommendations

8. **Pest Alerts**: Location-based pest outbreak warnings

9. **Market Prices**: Real-time crop market prices

10. **Expert Consultation**: Video call with agricultural experts

11. **Community Forum**: Farmer-to-farmer knowledge sharing

12. **Offline Mode**: Access tips and cached data offline

13. **Voice Assistant**: Voice-based weather and tip queries

14. **AR Crop Scanner**: Identify crops and diseases using camera

15. **Drone Integration**: Aerial farm monitoring data

16. **Water Quality Monitoring**: Water pH, TDS, contamination alerts

17. **Yield Prediction**: ML-based yield forecasting

18. **Carbon Credits**: Track and monetize carbon sequestration

19. **Insurance Integration**: Crop insurance recommendations and claims

20. **Supply Chain Tracking**: Track produce from farm to market

---

## EXTERNAL API DEPENDENCIES

### OpenWeatherMap API
- **Purpose**: Weather data and forecasts
- **Endpoints**: Current weather, 5-day forecast
- **Rate Limit**: 60 calls/minute (free tier)
- **Cost**: Free tier available, paid plans for higher limits
- **Documentation**: https://openweathermap.org/api

### IoT Sensor API (Planned)
- **Purpose**: Farm sensor data
- **Endpoints**: Sensor IDs, sensor data
- **Authentication**: API key or OAuth
- **Real-time**: WebSocket support planned
- **Data Format**: JSON

---

## ENVIRONMENT VARIABLES

```env
# Weather API
OPENWEATHER_API_KEY=your_api_key_here

# Sensor API (Planned)
SENSOR_API_URL=https://sensor-api.example.com
SENSOR_API_KEY=your_sensor_api_key

# API Base URL
API_BASE=http://your-backend-url:4000/api/v1
```

---

## CONCLUSION

The Additional Services feature extends the platform beyond e-commerce to provide comprehensive farming support tools. By integrating IoT sensors, weather data, educational content, and financial information, the platform becomes a one-stop solution for farmers' needs.

**Key Strengths**:
- IoT sensor integration for precision farming
- Real-time weather information with forecasts
- Educational farming tips and best practices
- Financial services information and guidance
- Mobile-optimized interfaces
- Pull-to-refresh functionality
- Pagination for large datasets
- Location-based services
- External API integrations

The system successfully provides farmers with data-driven tools for better decision making. Weather information helps with planning, sensor data enables precision farming, tips provide education, and loan information facilitates financial access.

**Current Limitations**:
- Sensor feature still in development
- Weather data requires internet connection
- No offline mode for tips
- Limited to information (no loan processing)
- No advanced analytics
- No alerts/notifications
- No expert consultation
- No community features

These limitations present significant opportunities for future enhancements that would transform the platform into a comprehensive smart farming ecosystem with AI-powered insights, expert support, and community collaboration.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Feature Status**: Partial Implementation (Weather: Complete, Sensors: In Development, Tips: Basic, Loans: Informational)
