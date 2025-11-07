const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_WIND_DATA || 600 });

/**
 * Wind Data Service
 * Fetches wind direction and speed from NOAA Weather API
 * API Documentation: https://www.weather.gov/documentation/services-web-api
 */

const NOAA_API_BASE = 'https://api.weather.gov';

/**
 * Get wind data for a location
 * @param {Object} options - Query options
 * @param {number} options.lat - Latitude
 * @param {number} options.lng - Longitude
 * @returns {Promise<Object>} Wind data
 */
exports.getWindData = async ({ lat, lng }) => {
  try {
    const cacheKey = `wind_${lat}_${lng}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached wind data');
      return cached;
    }

    // TODO: Implement actual NOAA Weather API call
    // Step 1: Get grid point data for coordinates
    // GET https://api.weather.gov/points/{lat},{lng}
    
    // Step 2: Use gridpoint forecast URL from response
    // GET {forecastGridData} endpoint
    
    // Placeholder for actual API implementation
    // const pointsResponse = await axios.get(`${NOAA_API_BASE}/points/${lat},${lng}`, {
    //   headers: { 'User-Agent': '(WildfireSmokeAlert, your-email@example.com)' }
    // });
    // const forecastUrl = pointsResponse.data.properties.forecastGridData;
    // const forecastResponse = await axios.get(forecastUrl);
    // const windData = extractWindData(forecastResponse.data);
    
    const data = getMockWindData(lat, lng);
    
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching wind data:', error.message);
    throw new Error('Failed to fetch wind data');
  }
};

/**
 * Mock wind data for template/testing
 */
function getMockWindData(lat, lng) {
  return {
    location: {
      latitude: lat,
      longitude: lng
    },
    current: {
      windSpeed: 15, // mph
      windDirection: 225, // degrees (0=N, 90=E, 180=S, 270=W)
      windDirectionCardinal: 'SW',
      gusts: 22, // mph
      timestamp: new Date().toISOString()
    },
    forecast: [
      {
        hour: 1,
        windSpeed: 16,
        windDirection: 230,
        windDirectionCardinal: 'SW',
        timestamp: new Date(Date.now() + 3600000).toISOString()
      },
      {
        hour: 2,
        windSpeed: 18,
        windDirection: 235,
        windDirectionCardinal: 'SW',
        timestamp: new Date(Date.now() + 7200000).toISOString()
      },
      {
        hour: 3,
        windSpeed: 17,
        windDirection: 240,
        windDirectionCardinal: 'WSW',
        timestamp: new Date(Date.now() + 10800000).toISOString()
      }
    ]
  };
}

/**
 * Extract wind data from NOAA forecast response
 */
function extractWindData(forecastData) {
  // TODO: Implement data extraction
  // NOAA returns time-series data with values and timestamps
  return {};
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function degreesToCardinal(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

