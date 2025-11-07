const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_AIR_QUALITY || 300 });

/**
 * Air Quality Service
 * Fetches air quality data from OpenAQ
 * API Documentation: https://docs.openaq.org/
 */

const OPENAQ_API_BASE = 'https://api.openaq.org/v2';

/**
 * Get air quality by radius
 * @param {Object} options - Query options
 * @param {number} options.lat - Latitude
 * @param {number} options.lng - Longitude
 * @param {number} options.radius - Search radius in meters
 * @returns {Promise<Array>} Array of air quality readings
 */
exports.getAirQualityByRadius = async ({ lat, lng, radius }) => {
  try {
    const cacheKey = `airquality_${lat}_${lng}_${radius}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached air quality data');
      return cached;
    }

    // TODO: Implement actual OpenAQ API call
    // Example: GET https://api.openaq.org/v2/latest?limit=100&radius=${radius}&coordinates=${lat},${lng}
    
    // Placeholder for actual API implementation
    // const response = await axios.get(`${OPENAQ_API_BASE}/latest`, {
    //   params: { limit: 100, radius, coordinates: `${lat},${lng}` }
    // });
    // const data = transformAirQualityData(response.data.results);
    
    const data = getMockAirQualityData(lat, lng);
    
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    throw new Error('Failed to fetch air quality data');
  }
};

/**
 * Get air quality by bounding box
 * @param {Object} bounds - Geographic bounds {minLng, minLat, maxLng, maxLat}
 * @returns {Promise<Array>} Array of air quality readings
 */
exports.getAirQualityByBounds = async (bounds) => {
  try {
    const cacheKey = `airquality_bounds_${JSON.stringify(bounds)}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Implement bounding box search
    // OpenAQ doesn't directly support bbox, so this might require multiple radius searches
    // or implementing client-side filtering
    
    const data = getMockAirQualityData(
      (bounds.minLat + bounds.maxLat) / 2,
      (bounds.minLng + bounds.maxLng) / 2
    );
    
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    throw new Error('Failed to fetch air quality data');
  }
};

/**
 * Mock air quality data for template/testing
 */
function getMockAirQualityData(lat, lng) {
  return [
    {
      id: 'aq_001',
      location: 'Downtown Station',
      city: 'San Francisco',
      country: 'US',
      latitude: lat + 0.01,
      longitude: lng + 0.01,
      parameters: {
        pm25: { value: 55.3, unit: 'µg/m³' },
        pm10: { value: 68.2, unit: 'µg/m³' },
        o3: { value: 42.1, unit: 'ppm' }
      },
      aqi: 85,
      status: 'moderate',
      timestamp: new Date().toISOString()
    },
    {
      id: 'aq_002',
      location: 'North District',
      city: 'San Francisco',
      country: 'US',
      latitude: lat - 0.02,
      longitude: lng - 0.01,
      parameters: {
        pm25: { value: 125.7, unit: 'µg/m³' },
        pm10: { value: 145.3, unit: 'µg/m³' }
      },
      aqi: 165,
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }
  ];
}

/**
 * Transform OpenAQ data to our standard format
 */
function transformAirQualityData(results) {
  // TODO: Implement data transformation
  return results.map(result => ({
    id: result.location,
    location: result.location,
    city: result.city,
    country: result.country,
    latitude: result.coordinates.latitude,
    longitude: result.coordinates.longitude,
    parameters: result.measurements.reduce((acc, m) => {
      acc[m.parameter] = { value: m.value, unit: m.unit };
      return acc;
    }, {}),
    timestamp: result.lastUpdated
  }));
}

/**
 * Calculate AQI from PM2.5
 * Using EPA AQI calculation
 */
function calculateAQI(pm25) {
  // TODO: Implement proper AQI calculation
  // Reference: https://www.airnow.gov/aqi/aqi-basics/
  if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
}

