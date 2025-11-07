# Wildfire Smoke Risk Alert Map

**Real-Time Air Quality Hotspots & Smoke Prediction System**

## 🎯 Project Overview

A real-time map that predicts where wildfire smoke will spread next, helping families, schools, and responders protect health before air quality becomes dangerous.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Step-by-Step Development Guidelines](#step-by-step-development-guidelines)
- [Technology Stack](#technology-stack)
- [Data Sources](#data-sources)
- [Setup Instructions](#setup-instructions)
- [Development Roadmap](#development-roadmap)
- [API Integration Guide](#api-integration-guide)
- [License](#license)

---

## 📁 Project Structure

```
wildfire/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic & API integrations
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Main server file
│   ├── .env.example           # Environment variables template
│   └── package.json
│
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Map/          # Map-related components
│   │   │   ├── Alerts/       # Alert components
│   │   │   ├── Layers/       # Data layer controls
│   │   │   └── Dashboard/    # Dashboard components
│   │   ├── services/          # API client services
│   │   ├── utils/             # Utility functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # CSS/styling files
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   └── package.json
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_GUIDE.md
│   └── PRESENTATION.md
│
└── README.md                   # This file
```

---

## 🚀 Step-by-Step Development Guidelines

### Phase 1: Project Setup (30 minutes)

#### Step 1.1: Initialize Backend
1. Create backend folder structure
2. Initialize Node.js project with `npm init`
3. Install core dependencies:
   - `express` - Web server framework
   - `cors` - Enable cross-origin requests
   - `dotenv` - Environment variable management
   - `axios` - HTTP client for API calls
   - `node-cache` - In-memory caching
4. Create `.env` file for API keys
5. Set up basic Express server with CORS enabled

#### Step 1.2: Initialize Frontend
1. Create React app using Create React App or Vite
2. Install UI dependencies:
   - `react-leaflet` or `mapbox-gl` - Map visualization
   - `axios` - API communication
   - `recharts` or `chart.js` - Data visualization
   - `date-fns` - Date formatting
3. Set up folder structure for components
4. Configure proxy for backend API calls

### Phase 2: Data Layer Architecture (1 hour)

#### Step 2.1: Define Data Models
Create data structures for:
- **Wildfire Points**: `{ id, latitude, longitude, brightness, confidence, timestamp }`
- **Air Quality**: `{ location, aqi, pm25, pm10, status, timestamp }`
- **Smoke Forecast**: `{ latitude, longitude, smokeDensity, forecast_time }`
- **Wind Data**: `{ direction, speed, location, timestamp }`

#### Step 2.2: Create API Service Layer (Backend)
For each data source, create a service module:
- `firmsService.js` - NASA FIRMS wildfire data
- `airQualityService.js` - OpenAQ sensor data
- `smokeService.js` - NOAA HRRR smoke model
- `weatherService.js` - NOAA wind/weather data

Each service should:
1. Fetch data from external API
2. Transform to standardized format
3. Cache results (5-15 minute TTL)
4. Handle errors gracefully
5. Return consistent response structure

### Phase 3: Backend API Routes (1 hour)

#### Step 3.1: Create RESTful Endpoints
```
GET  /api/wildfires          - Get active wildfire locations
GET  /api/air-quality        - Get current air quality readings
GET  /api/smoke-forecast     - Get smoke movement predictions
GET  /api/wind-data          - Get wind direction/speed
GET  /api/alerts             - Get combined risk alerts
GET  /api/health             - Server health check
```

#### Step 3.2: Implement Query Parameters
Support filtering by:
- Geographic bounds (bbox)
- Time range
- Severity level
- Data freshness

### Phase 4: Frontend Map Component (2 hours)

#### Step 4.1: Set Up Base Map
1. Create `<MapContainer>` component
2. Configure map center and zoom
3. Add base tile layer (OpenStreetMap or similar)
4. Implement pan and zoom controls

#### Step 4.2: Create Data Layers
Each layer as a toggleable component:
- **WildfireLayer**: Red flame markers for active fires
- **AirQualityLayer**: Color-coded circles (green/yellow/orange/red)
- **SmokeForecastLayer**: Translucent overlay showing smoke density
- **WindLayer**: Arrows showing wind direction

#### Step 4.3: Add Layer Controls
- Checkboxes to toggle each layer
- Legend explaining color codes
- Time slider for forecast predictions

### Phase 5: Alert System (1.5 hours)

#### Step 5.1: Risk Calculation Logic
Create algorithm that combines:
1. Distance from active fire
2. Current air quality reading
3. Wind direction toward location
4. Smoke forecast density
5. Time until smoke arrival

#### Step 5.2: Alert Categories
- **Low Risk**: Green - Normal conditions
- **Moderate**: Yellow - Monitor conditions
- **Unhealthy**: Orange - Sensitive groups at risk
- **Hazardous**: Red - Everyone at risk

#### Step 5.3: Alert UI Components
- Banner notifications
- Location-based alerts
- "What to do" action items
- Timeline showing risk progression

### Phase 6: Dashboard & Visualization (1 hour)

#### Step 6.1: Create Dashboard Layout
- Summary statistics (# of fires, affected areas)
- Current air quality index
- Worst affected locations
- Forecast timeline

#### Step 6.2: Add Charts
- AQI trend over time
- Fire count by region
- Smoke density forecast

### Phase 7: Responsive Design & UX (1 hour)

#### Step 7.1: Mobile Optimization
- Responsive map sizing
- Touch-friendly controls
- Simplified mobile dashboard

#### Step 7.2: Loading & Error States
- Loading spinners during data fetch
- Friendly error messages
- Retry mechanisms
- Offline detection

### Phase 8: Testing & Polish (1 hour)

#### Step 8.1: Functionality Testing
- Test all API endpoints
- Verify data updates
- Check layer toggles
- Test on multiple devices

#### Step 8.2: Performance Optimization
- Implement data caching
- Optimize map rendering
- Lazy load components
- Compress assets

### Phase 9: Documentation & Presentation (1 hour)

#### Step 9.1: Code Documentation
- Add JSDoc comments
- Create API documentation
- Write component documentation

#### Step 9.2: Presentation Materials
- Create 7-10 slide deck
- Record demo video
- Prepare pitch script
- Screenshot key features

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Caching**: node-cache
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Map Library**: React-Leaflet (open source) or Mapbox GL
- **HTTP Client**: Axios
- **Styling**: CSS3 / TailwindCSS (optional)
- **Charts**: Recharts or Chart.js

### Development Tools
- **Package Manager**: npm or yarn
- **Version Control**: Git
- **Code Editor**: VS Code (recommended)

---

## 🌐 Data Sources

### 1. NASA FIRMS (Fire Information for Resource Management System)
- **Purpose**: Real-time wildfire detection
- **API**: https://firms.modaps.eosdis.nasa.gov/api/
- **Data**: Active fire locations from MODIS/VIIRS satellites
- **Update Frequency**: Every 3-6 hours
- **Format**: JSON, CSV, KML
- **Free Tier**: Yes (requires API key)

### 2. OpenAQ (Open Air Quality)
- **Purpose**: Ground-level air quality measurements
- **API**: https://api.openaq.org/v2/
- **Data**: PM2.5, PM10, CO, NO2, SO2, O3
- **Update Frequency**: Real-time (varies by sensor)
- **Format**: JSON
- **Free Tier**: Yes (open data)

### 3. NOAA HRRR Smoke Model
- **Purpose**: Smoke dispersion forecast
- **API**: NOMADS or weather.gov
- **Data**: Smoke density predictions (1-48 hours)
- **Update Frequency**: Hourly
- **Format**: GRIB2 (requires parsing)
- **Free Tier**: Yes (public data)

### 4. NOAA Weather API
- **Purpose**: Wind direction, speed, meteorological data
- **API**: https://api.weather.gov/
- **Data**: Forecasts, current conditions, wind patterns
- **Update Frequency**: Hourly
- **Format**: JSON
- **Free Tier**: Yes (no API key required)

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Git
- Text editor (VS Code recommended)
- Web browser (Chrome/Firefox recommended)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# NASA_FIRMS_API_KEY=your_key_here
# PORT=5000

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

---

## 🗺️ Development Roadmap

### Day 1 (November 7)
- **Morning (4 hours)**
  - ✅ Project setup and structure
  - ✅ Backend API scaffolding
  - ✅ Frontend React setup
  - ⏳ Integrate NASA FIRMS data
  - ⏳ Create basic map component

- **Afternoon (4 hours)**
  - ⏳ Integrate OpenAQ air quality data
  - ⏳ Add data visualization layers
  - ⏳ Implement layer toggles
  - ⏳ Create alert calculation logic

### Day 2 (November 8)
- **Morning (4 hours)**
  - ⏳ Integrate NOAA smoke forecast
  - ⏳ Add wind direction overlay
  - ⏳ Build alert notification system
  - ⏳ Create dashboard statistics

- **Afternoon (4 hours)**
  - ⏳ Responsive design polish
  - ⏳ Testing and bug fixes
  - ⏳ Create presentation slides
  - ⏳ Record demo video
  - ⏳ Prepare final pitch

---

## 📡 API Integration Guide

### Getting API Keys

#### NASA FIRMS
1. Visit: https://firms.modaps.eosdis.nasa.gov/api/
2. Click "Request API Key"
3. Fill out form with your email
4. Check email for API key

#### OpenAQ
- No API key required
- Rate limit: 10,000 requests/day
- Documentation: https://docs.openaq.org/

#### NOAA APIs
- No API key required
- Public domain data
- Documentation: https://www.weather.gov/documentation/services-web-api

### Sample API Calls

#### NASA FIRMS (Wildfires)
```javascript
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/VIIRS_SNPP_NRT/world/1`;
// Returns: CSV of fires detected in last 1 day globally
```

#### OpenAQ (Air Quality)
```javascript
const url = `https://api.openaq.org/v2/latest?limit=100&radius=1000&coordinates=37.7749,-122.4194`;
// Returns: Latest air quality readings near San Francisco
```

#### NOAA Weather (Wind)
```javascript
const url = `https://api.weather.gov/points/37.7749,-122.4194`;
// Returns: Forecast office and grid data for location
```

---

## 🎨 Color Coding Standards

### Air Quality Index (AQI) Colors
- **0-50 (Good)**: #00E400 (Green)
- **51-100 (Moderate)**: #FFFF00 (Yellow)
- **101-150 (Unhealthy for Sensitive)**: #FF7E00 (Orange)
- **151-200 (Unhealthy)**: #FF0000 (Red)
- **201-300 (Very Unhealthy)**: #8F3F97 (Purple)
- **301+ (Hazardous)**: #7E0023 (Maroon)

---

## 📄 License

This project uses open source and creative commons licensing as required by Reboot the Earth SV!

- **Code**: MIT License
- **Data**: Respective provider licenses (all public domain or open data)
- **Documentation**: CC BY 4.0

---

## 👥 Team & Contact

**Team Members**: [Add your team names]

**Hackathon**: Reboot the Earth SV! Tech Challenge  
**Dates**: November 7-8, 2025

---

## 🏆 Judging Criteria Alignment

| Criteria | How This Project Addresses It |
|----------|-------------------------------|
| **Climate Relevance** | Directly tackles wildfire smoke health impacts |
| **Feasibility** | Uses proven public APIs available today |
| **Scalability** | Works globally, no geographic limitations |
| **Social Impact** | Protects vulnerable populations with early warnings |
| **Innovation** | Combines multiple data sources into unified prediction system |
| **Demo Appeal** | Highly visual, interactive, easy to understand |

---

## 📞 Support & Resources

### Helpful Links
- React Documentation: https://react.dev/
- Express.js Guide: https://expressjs.com/
- Leaflet Maps: https://leafletjs.com/
- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- OpenAQ: https://openaq.org/
- NOAA Weather API: https://www.weather.gov/documentation/services-web-api

### Troubleshooting
- If CORS errors occur, ensure backend CORS is configured
- If map doesn't load, check Leaflet CSS import
- If API calls fail, verify API keys in .env file
- If data is stale, check cache TTL settings

---

**Good luck with your hackathon! 🔥💨🗺️**

