const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: Number(process.env.CACHE_TTL_AIR_QUALITY || 300) });

const openaq = axios.create({
  baseURL: 'https://api.openaq.org/v3',
  headers: process.env.OPENAQ_API_KEY ? { 'X-API-Key': process.env.OPENAQ_API_KEY } : {},
  timeout: Number(process.env.OPENAQ_TIMEOUT_MS || 10000),
});

const PM25_ID = 2;

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
  const v = Number(pm25);
  if (!Number.isFinite(v)) return null;
  if (v <= 12.0) return Math.round((50 / 12.0) * v);
  if (v <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (v - 12.1) + 51);
  if (v <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (v - 35.5) + 101);
  if (v <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (v - 55.5) + 151);
  if (v <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (v - 150.5) + 201);
  return Math.round(((500 - 301) / (500.4 - 250.5)) * (v - 250.5) + 301);
};

const isRecent = (utc, maxAgeHours) => {
  if (!utc) return false;
  const t = Date.parse(utc);
  return Number.isFinite(t) && Date.now() - t <= maxAgeHours * 3600 * 1000;
};

exports.getAirQualityByRadius = async ({ lat, lng, radius, limit = 25 }) => {
  const cacheKey = `aq_v3_${lat}_${lng}_${radius}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const maxAgeHours = Number(process.env.AIR_QUALITY_MAX_AGE_HOURS || 48);
  const sinceISO = new Date(Date.now() - maxAgeHours * 3600 * 1000).toISOString();
  const radiusClamped = Math.max(1, Math.min(Number(radius) || 10000, 25000));

  try {
    const { data: locs } = await openaq.get('/locations', {
      params: {
        coordinates: `${lat},${lng}`,
        radius: radiusClamped,
        parameters_id: PM25_ID,
        limit: Math.min(Number(limit) || 25, 100)
      }
    });

    const locations = locs?.results ?? [];
    if (!locations.length) {
      cache.set(cacheKey, []);
      return [];
    }

    const locById = new Map(locations.map((L) => [L.id, L]));
    const pm25SensorIds = new Set();
    locations.forEach((L) => {
      (L.sensors || []).forEach((sensor) => {
        if (sensor?.parameter?.id === PM25_ID) {
          pm25SensorIds.add(sensor.id);
        }
      });
    });

    const perLoc = await Promise.all(
      locations.map(async (L) => {
        try {
          const { data } = await openaq.get(`/locations/${L.id}/latest`, {
            params: { limit: 100, datetime_min: sinceISO }
          });
          return (data?.results || []).filter((reading) => pm25SensorIds.has(reading.sensorsId));
        } catch (err) {
          console.error('OpenAQ latest error', L.id, err.response?.status, err.message);
          return [];
        }
      })
    );

    const flat = perLoc.flat().filter((reading) => isRecent(reading?.datetime?.utc, maxAgeHours));
    const newestByLoc = new Map();

    flat.forEach((reading) => {
      const key = reading.locationsId;
      const prev = newestByLoc.get(key);
      if (!prev || Date.parse(reading.datetime.utc) > Date.parse(prev.datetime.utc)) {
        newestByLoc.set(key, reading);
      }
    });

    const stations = Array.from(newestByLoc.values()).map((reading, index) => {
      const location = locById.get(reading.locationsId);
      const value = reading.value;
      const aqi = calculateAQI(value);
      return {
        id: `aq-${reading.sensorsId}-${index}`,
        location: location?.name ?? `Location ${reading.locationsId}`,
        city: location?.locality ?? undefined,
        country: location?.country?.code ?? undefined,
        lat: reading.coordinates?.latitude ?? location?.coordinates?.latitude ?? null,
        lng: reading.coordinates?.longitude ?? location?.coordinates?.longitude ?? null,
        aqi,
        status: classifyAqiStatus(aqi),
        parameter: 'pm25',
        value,
        unit: 'µg/m³',
        lastUpdated: reading?.datetime?.utc ?? null,
        measurements: []
      };
    });

    cache.set(cacheKey, stations);
    return stations;
  } catch (error) {
    const status = error.response?.status;
    console.error('OpenAQ v3 error:', status, error.response?.data || error.message);
    const err = new Error(
      `Failed to fetch air quality data from OpenAQ (status ${status || 'n/a'})`
    );
    err.status = status === 401 ? 502 : status || 500;
    throw err;
  }
};

exports.getAirQualityByBounds = async (bounds) => {
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const approxRadius =
    Math.max(Math.abs(bounds.maxLat - bounds.minLat), Math.abs(bounds.maxLng - bounds.minLng)) *
    111000;
  return exports.getAirQualityByRadius({ lat: centerLat, lng: centerLng, radius: approxRadius });
};
