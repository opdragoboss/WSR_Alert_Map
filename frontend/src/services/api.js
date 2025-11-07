import axios from 'axios';

// API base URL - uses proxy in development
const API_BASE = process.env.REACT_APP_API_URL || '/api';

/**
 * API Client for Wildfire Smoke Alert backend
 */

/**
 * Fetch active wildfires
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Wildfire data
 */
export const fetchWildfires = async (options = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/wildfires`, {
      params: options
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching wildfires:', error);
    return getMockWildfires();
  }
};

/**
 * Fetch air quality data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} Air quality data
 */
export const fetchAirQuality = async (lat, lng, radius = 50000) => {
  try {
    const response = await axios.get(`${API_BASE}/air-quality`, {
      params: { lat, lng, radius }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching air quality:', error);
    return getMockAirQuality();
  }
};

/**
 * Fetch smoke forecast
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Smoke forecast data
 */
export const fetchSmokeForecast = async (options = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/smoke-forecast`, {
      params: options
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching smoke forecast:', error);
    return getMockSmokeForecast();
  }
};

/**
 * Fetch wind data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Wind data
 */
export const fetchWindData = async (lat, lng) => {
  try {
    const response = await axios.get(`${API_BASE}/wind-data`, {
      params: { lat, lng }
    });
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching wind data:', error);
    return getMockWindData();
  }
};

/**
 * Fetch alerts for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Object>} Alert data
 */
export const fetchAlerts = async (lat, lng, radius = 100000) => {
  try {
    const response = await axios.get(`${API_BASE}/alerts`, {
      params: { lat, lng, radius }
    });
    return response.data.alerts || null;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return getMockAlerts();
  }
};

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

// Mock data functions for offline/demo mode
function getMockWildfires() {
  return [
    {
      id: 'fire_001',
      latitude: 37.7749,
      longitude: -122.4194,
      brightness: 330.5,
      confidence: 95,
      frp: 45.2,
      timestamp: new Date().toISOString()
    },
    {
      id: 'fire_002',
      latitude: 38.5816,
      longitude: -121.4944,
      brightness: 315.8,
      confidence: 88,
      frp: 38.7,
      timestamp: new Date().toISOString()
    }
  ];
}

function getMockAirQuality() {
  return [
    {
      id: 'aq_001',
      location: 'Downtown Station',
      latitude: 37.7849,
      longitude: -122.4094,
      aqi: 85,
      status: 'moderate',
      timestamp: new Date().toISOString()
    },
    {
      id: 'aq_002',
      location: 'North District',
      latitude: 37.7549,
      longitude: -122.4294,
      aqi: 165,
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }
  ];
}

function getMockSmokeForecast() {
  return [
    {
      forecastHour: 1,
      timestamp: new Date(Date.now() + 3600000).toISOString(),
      areas: [
        { latitude: 37.8, longitude: -122.4, smokeDensity: 50, level: 'moderate' }
      ]
    }
  ];
}

function getMockWindData() {
  return {
    current: {
      windSpeed: 15,
      windDirection: 225,
      windDirectionCardinal: 'SW',
      timestamp: new Date().toISOString()
    }
  };
}

function getMockAlerts() {
  return {
    overallRiskLevel: 'moderate',
    riskScore: 45,
    alerts: [
      {
        severity: 'warning',
        title: 'Active Wildfire Nearby',
        message: 'There are 2 active wildfires within your area.'
      }
    ],
    recommendations: [
      'Monitor air quality updates',
      'Limit prolonged outdoor activities'
    ]
  };
}

