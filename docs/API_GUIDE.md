# API Integration Guide

## Overview

This guide explains how to integrate external data sources into the Wildfire Smoke Alert Map.

## API Endpoints

### 1. NASA FIRMS (Fire Information for Resource Management System)

**Purpose**: Real-time wildfire detection from satellites

**Getting Started**:
1. Visit https://firms.modaps.eosdis.nasa.gov/api/
2. Click "Request API Key"
3. Fill out the form with your email
4. Check email for API key

**API Endpoints**:
```
# Get fires in an area
https://firms.modaps.eosdis.nasa.gov/api/area/csv/{API_KEY}/{SOURCE}/{AREA}/{DAY_RANGE}

# Get fires by country
https://firms.modaps.eosdis.nasa.gov/api/country/csv/{API_KEY}/{SOURCE}/{COUNTRY}/{DAY_RANGE}
```

**Parameters**:
- `SOURCE`: `VIIRS_SNPP_NRT`, `VIIRS_NOAA20_NRT`, `MODIS_NRT`, or `LANDSAT_NRT`
- `AREA`: `world` or specific area code
- `DAY_RANGE`: 1-10 (days to look back)
- `COUNTRY`: Two-letter country code (e.g., `US`)

**Example Request**:
```javascript
const API_KEY = 'your_api_key';
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/VIIRS_SNPP_NRT/world/1`;

const response = await axios.get(url);
// Returns CSV data
```

**CSV Columns**:
- `latitude`, `longitude`: Fire location
- `brightness`: Brightness temperature (Kelvin)
- `scan`, `track`: Size of fire pixel
- `acq_date`, `acq_time`: Acquisition date/time
- `satellite`: Satellite name
- `confidence`: Detection confidence (0-100)
- `version`: Algorithm version
- `bright_t31`: Channel 31 brightness
- `frp`: Fire Radiative Power (MW)
- `daynight`: D=day, N=night

**Implementation Tips**:
- Cache responses for 5-15 minutes
- Parse CSV to JSON
- Filter by confidence level (>70% recommended)
- Use bbox filtering if needed

---

### 2. OpenAQ (Open Air Quality)

**Purpose**: Ground-level air quality measurements

**API Base**: `https://api.openaq.org/v2`

**No API Key Required** (but rate limited to 10,000 requests/day)

**Key Endpoints**:

#### Get Latest Measurements
```javascript
GET /v2/latest
```

**Parameters**:
- `coordinates`: lat,lng (e.g., `37.7749,-122.4194`)
- `radius`: Search radius in meters
- `limit`: Max results (default 100)
- `parameter`: Filter by parameter (pm25, pm10, o3, etc.)

**Example Request**:
```javascript
const response = await axios.get('https://api.openaq.org/v2/latest', {
  params: {
    coordinates: '37.7749,-122.4194',
    radius: 50000,
    limit: 100
  }
});
```

**Response Structure**:
```json
{
  "results": [
    {
      "location": "Station Name",
      "city": "City Name",
      "country": "US",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "measurements": [
        {
          "parameter": "pm25",
          "value": 35.5,
          "unit": "µg/m³",
          "lastUpdated": "2025-11-07T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Implementation Tips**:
- Cache for 5-10 minutes
- Calculate AQI from PM2.5 values
- Handle missing data gracefully
- Use radius search for map views

---

### 3. NOAA Weather API

**Purpose**: Wind direction, speed, and meteorological data

**API Base**: `https://api.weather.gov`

**No API Key Required**

**Two-Step Process**:

#### Step 1: Get Grid Point
```javascript
GET /points/{latitude},{longitude}
```

**Example**:
```javascript
const response = await axios.get('https://api.weather.gov/points/37.7749,-122.4194', {
  headers: {
    'User-Agent': '(WildfireSmokeAlert, your-email@example.com)'
  }
});

const forecastUrl = response.data.properties.forecastGridData;
```

#### Step 2: Get Forecast Data
```javascript
GET {forecastGridData URL}
```

**Response Structure**:
```json
{
  "properties": {
    "windSpeed": {
      "values": [
        {
          "validTime": "2025-11-07T12:00:00+00:00/PT1H",
          "value": 7.2
        }
      ],
      "uom": "wmoUnit:m_s-1"
    },
    "windDirection": {
      "values": [
        {
          "validTime": "2025-11-07T12:00:00+00:00/PT1H",
          "value": 225
        }
      ],
      "uom": "wmoUnit:degree_(angle)"
    }
  }
}
```

**Implementation Tips**:
- Always include User-Agent header
- Cache for 10-15 minutes
- Convert wind speed from m/s to mph if needed
- Parse ISO8601 time intervals

---

### 4. NOAA HRRR Smoke Model

**Purpose**: Smoke dispersion forecast

**API Access**: NOMADS Server or weather.gov

**More Complex Integration**:

HRRR Smoke data is in GRIB2 format, which requires special handling:

**Option A: Use NOMADS GRIB2 Data**
```
https://nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod/
```

**Option B: Use Processed Data Services**
- Consider using third-party services that pre-process GRIB2 data
- Or implement Python script with `pygrib` library

**Option C: Simplified Approach for Hackathon**
- Use existing fire locations + wind data
- Calculate smoke dispersion manually
- Create simple smoke plume models

**Example Simplified Logic**:
```javascript
// Calculate smoke impact based on fire location and wind
function calculateSmokeImpact(fire, windData, targetLocation) {
  const distance = calculateDistance(fire, targetLocation);
  const bearing = calculateBearing(fire, targetLocation);
  const windBearing = windData.direction;
  
  // If wind is blowing toward target
  const bearingDiff = Math.abs(windBearing - bearing);
  const isDownwind = bearingDiff < 45 || bearingDiff > 315;
  
  if (isDownwind && distance < 100000) { // 100km
    return {
      impactLevel: 'high',
      estimatedArrival: distance / (windData.speed * 1000) // hours
    };
  }
  
  return { impactLevel: 'low' };
}
```

---

## Rate Limiting & Caching

### Recommended Cache Times

| Data Source | Cache Duration | Reason |
|------------|----------------|---------|
| NASA FIRMS | 5-15 minutes | Updates every 3-6 hours |
| OpenAQ | 5-10 minutes | Real-time but changes slowly |
| NOAA Weather | 10-15 minutes | Updated hourly |
| HRRR Smoke | 15-30 minutes | Model runs every hour |

### Implementation Example

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default

async function getCachedData(key, fetchFunction) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await fetchFunction();
  cache.set(key, data);
  return data;
}
```

---

## Error Handling

### Best Practices

1. **Always use try-catch**:
```javascript
try {
  const data = await fetchWildfires();
  return data;
} catch (error) {
  console.error('Error:', error);
  return fallbackData; // Return cached or mock data
}
```

2. **Handle timeouts**:
```javascript
const response = await axios.get(url, {
  timeout: 5000 // 5 seconds
});
```

3. **Graceful degradation**:
```javascript
// If real API fails, use mock data for demo
if (!apiKey || error) {
  console.warn('Using mock data');
  return getMockData();
}
```

---

## Testing

### Test Mode

Create a test mode that uses mock data:

```javascript
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && !process.env.NASA_FIRMS_API_KEY;

if (USE_MOCK_DATA) {
  return getMockWildfires();
}
```

### API Health Checks

```javascript
// Test all APIs on startup
async function testAPIs() {
  const tests = {
    firms: testFIRMS(),
    openaq: testOpenAQ(),
    noaa: testNOAA()
  };
  
  const results = await Promise.allSettled(Object.values(tests));
  console.log('API Health:', results);
}
```

---

## Production Deployment

### Environment Variables

```bash
# Backend .env
NASA_FIRMS_API_KEY=your_key_here
CACHE_TTL_WILDFIRES=300
CACHE_TTL_AIR_QUALITY=300
CACHE_TTL_SMOKE_FORECAST=900
CACHE_TTL_WIND_DATA=600
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET'],
  credentials: true
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Quick Start Checklist

- [ ] Get NASA FIRMS API key
- [ ] Test OpenAQ endpoints (no key needed)
- [ ] Test NOAA Weather API (no key needed)
- [ ] Implement caching layer
- [ ] Add error handling
- [ ] Create mock data fallbacks
- [ ] Test with real coordinates
- [ ] Verify CORS settings
- [ ] Document any API issues

---

## Resources

- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- OpenAQ Docs: https://docs.openaq.org/
- NOAA Weather API: https://www.weather.gov/documentation/services-web-api
- HRRR Smoke: https://rapidrefresh.noaa.gov/hrrr/
- AQI Calculator: https://www.airnow.gov/aqi/aqi-basics/

