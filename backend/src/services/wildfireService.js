const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_WILDFIRES || 300 });

/**
 * Wildfire Service
 * Fetches active wildfire data from NASA FIRMS
 * API Documentation: https://firms.modaps.eosdis.nasa.gov/api/
 */

/**
 * Get active wildfires
 * @param {Object} options - Query options
 * @param {Object} options.bounds - Geographic bounds {minLng, minLat, maxLng, maxLat}
 * @param {number} options.days - Days to look back (1-10)
 * @param {string} options.source - Data source (VIIRS_SNPP_NRT, MODIS_NRT)
 * @returns {Promise<Array>} Array of wildfire data points
 */
exports.getActiveWildfires = async ({ bounds, days = 1, source }) => {
  try {
    const cacheKey = `wildfires_${bounds ? JSON.stringify(bounds) : 'world'}_${days}_${source || 'all'}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached wildfire data');
      return cached;
    }

    // TODO: Implement actual NASA FIRMS API call
    // Example API endpoint:
    // https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/VIIRS_SNPP_NRT/world/${days}
    
    const apiKey = process.env.NASA_FIRMS_API_KEY;
    
    if (!apiKey || apiKey === 'your_nasa_firms_api_key_here') {
      console.warn('NASA FIRMS API key not configured, returning mock data');
      return getMockWildfireData();
    }

    // Placeholder for actual API implementation
    // const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/...`);
    // const data = parseWildfireData(response.data);
    
    const data = getMockWildfireData();
    
    // Cache the result
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching wildfire data:', error.message);
    throw new Error('Failed to fetch wildfire data');
  }
};

/**
 * Mock wildfire data for template/testing
 */
function getMockWildfireData() {
  return [
    {
      id: 'fire_001',
      latitude: 37.7749,
      longitude: -122.4194,
      brightness: 330.5,
      confidence: 95,
      frp: 45.2, // Fire Radiative Power
      timestamp: new Date().toISOString(),
      source: 'VIIRS_SNPP_NRT'
    },
    {
      id: 'fire_002',
      latitude: 38.5816,
      longitude: -121.4944,
      brightness: 315.8,
      confidence: 88,
      frp: 38.7,
      timestamp: new Date().toISOString(),
      source: 'MODIS_NRT'
    }
  ];
}

/**
 * Parse CSV data from NASA FIRMS into JSON format
 * @param {string} csvData - Raw CSV data
 * @returns {Array} Parsed wildfire data
 */
function parseWildfireData(csvData) {
  // TODO: Implement CSV parsing
  // Expected CSV columns: latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
  return [];
}

