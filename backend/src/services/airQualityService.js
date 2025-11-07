const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_AIR_QUALITY || 300 });

const OPENAQ_API_BASE = 'https://api.openaq.org/v2';

const classifyAqiStatus = (aqi) => {
  if (aqi == null) return 'unknown';
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

const calculateAQI = (pm25) => {
  if (pm25 == null) return null;
  const value = Number(pm25);
  if (Number.isNaN(value)) return null;

  if (value <= 12.0) return Math.round((50 / 12.0) * value);
  if (value <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (value - 12.1) + 51);
  if (value <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (value - 35.5) + 101);
  if (value <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (value - 55.5) + 151);
  if (value <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (value - 150.5) + 201);
  return Math.round(((500 - 301) / (500.4 - 250.5)) * (value - 250.5) + 301);
};

const transformAirQualityData = (results = []) =>
  results.map((station, index) => {
    const pm25Measurement =
      station.measurements?.find((m) => m.parameter === 'pm25') ?? station.measurements?.[0];
    const pm25Value = pm25Measurement?.value;
    const aqi = calculateAQI(pm25Value);
    return {
      id: station.id || station.locationId || `aq-${index}`,
      location: station.location,
      city: station.city,
      country: station.country,
      lat: station.coordinates?.latitude ?? null,
      lng: station.coordinates?.longitude ?? null,
      aqi,
      status: classifyAqiStatus(aqi),
      parameter: pm25Measurement?.parameter,
      value: pm25Measurement?.value,
      unit: pm25Measurement?.unit,
      lastUpdated: pm25Measurement?.lastUpdated || station.date?.utc,
      measurements: station.measurements || []
    };
  });

exports.getAirQualityByRadius = async ({ lat, lng, radius, limit = 25 }) => {
  try {
    const cacheKey = `airquality_${lat}_${lng}_${radius}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await axios.get(`${OPENAQ_API_BASE}/latest`, {
      params: {
        coordinates: `${lat},${lng}`,
        radius,
        limit,
        sort: 'desc',
        order_by: 'measurements.value'
      },
      timeout: Number(process.env.OPENAQ_TIMEOUT_MS || 10000)
    });

    const transformed = transformAirQualityData(response?.data?.results);
    cache.set(cacheKey, transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    throw new Error('Failed to fetch air quality data');
  }
};

exports.getAirQualityByBounds = async (bounds) => {
  try {
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const approximateRadiusMeters = Math.max(
      Math.abs(bounds.maxLat - bounds.minLat),
      Math.abs(bounds.maxLng - bounds.minLng)
    ) * 111_000; // rough conversion degrees -> meters

    return exports.getAirQualityByRadius({
      lat: centerLat,
      lng: centerLng,
      radius: approximateRadiusMeters
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    throw new Error('Failed to fetch air quality data');
  }
};
