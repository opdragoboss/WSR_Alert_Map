# Wildfire Smoke Risk Alert Map

**Real-Time Air Quality Hotspots & Smoke Prediction System**

## 🎯 Project Overview

A real-time map that predicts where wildfire smoke will spread next, helping families, schools, and responders protect health before air quality becomes dangerous.

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

### 3. NOAA Weather API
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

## 📄 License

This project uses open source and creative commons licensing as required by Reboot the Earth SV!

- **Code**: MIT License
- **Data**: Respective provider licenses (all public domain or open data)
- **Documentation**: CC BY 4.0

---

## 👥 Team

**Team Members**: [Nasya Ratra, Nagatanmayee Gunukula, Nechar KC Alvin Chen, Ethan Liu]

**Hackathon**: Reboot the Earth SV! Tech Challenge  
**Dates**: November 7-8, 2025




**Good luck with your hackathon! 🔥💨🗺️**

