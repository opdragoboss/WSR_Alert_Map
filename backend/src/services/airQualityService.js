// airQualityService.js (v3)
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
  return Number.isFinite(t) && (Date.now() - t) <= maxAgeHours * 3600 * 1000;
};

exports.getAirQualityByRadius = async ({ lat, lng, radius, limit = 25 }) => {
  const cacheKey = `aq_v3_${lat}_${lng}_${radius}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const maxAgeHours = Number(process.env.AIR_QUALITY_MAX_AGE_HOURS || 48);
  const sinceISO = new Date(Date.now() - maxAgeHours * 3600 * 1000).toISOString();

  // OpenAQ v3 radius: (0, 25000], default ~10km if missing
  const radiusClamped = Math.max(1, Math.min(Number(radius) || 10000, 25000));

  try {
    // 1) Nearby locations that actually measure PM2.5
    const { data: locs } = await openaq.get('/locations', {
      params: {
        coordinates: `${lat},${lng}`,
        radius: radiusClamped,
        parameters_id: PM25_ID,
        limit: Math.min(Number(limit) || 25, 100),
      },
    });

    const locations = locs?.results ?? [];
    if (!locations.length) { cache.set(cacheKey, []); return []; }

    // Index for joins
    const locById = new Map(locations.map((L) => [L.id, L]));
    const pm25SensorIds = new Set();
    for (const L of locations) {
      for (const s of (L.sensors || [])) {
        if (s?.parameter?.id === PM25_ID) pm25SensorIds.add(s.id);
      }
    }

    // 2) Latest for each location, with recency guard
    const perLoc = await Promise.all(
      locations.map(async (L) => {
        try {
          const { data } = await openaq.get(`/locations/${L.id}/latest`, {
            params: { limit: 100, datetime_min: sinceISO },
          });
          return (data?.results || []).filter((r) => pm25SensorIds.has(r.sensorsId));
        } catch (e) {
          console.error('OpenAQ latest error', L.id, e.response?.status, e.message);
          return [];
        }
      })
    );

    // Flatten, keep only recent
    const flat = perLoc.flat().filter((r) => isRecent(r?.datetime?.utc, maxAgeHours));

    // 3) Dedupe by location: keep the newest PM2.5 reading per location
    const newestByLoc = new Map();
    for (const r of flat) {
      const k = r.locationsId;
      const prev = newestByLoc.get(k);
      if (!prev || Date.parse(r.datetime.utc) > Date.parse(prev.datetime.utc)) {
        newestByLoc.set(k, r);
      }
    }

    // 4) Transform to your schema (use LOCATION name, not sensor)
    const stations = Array.from(newestByLoc.values()).map((r, i) => {
      const L = locById.get(r.locationsId);
      const value = r.value;
      const aqi = calculateAQI(value);
      return {
        id: `aq-${r.sensorsId}-${i}`,
        location: L?.name ?? `Location ${r.locationsId}`,
        city: L?.locality ?? undefined,
        country: L?.country?.code ?? undefined,
        lat: r.coordinates?.latitude ?? L?.coordinates?.latitude ?? null,
        lng: r.coordinates?.longitude ?? L?.coordinates?.longitude ?? null,
        aqi,
        status: classifyAqiStatus(aqi),
        parameter: 'pm25',
        value,
        unit: 'µg/m³',
        lastUpdated: r?.datetime?.utc ?? null,
        measurements: [],
      };
    });

    cache.set(cacheKey, stations);
    return stations;
  } catch (error) {
    const status = error.response?.status;
    console.error('OpenAQ v3 error:', status, error.response?.data || error.message);
    const err = new Error(`Failed to fetch air quality data from OpenAQ (status ${status || 'n/a'})`);
    err.status = status === 401 ? 502 : (status || 500);
    throw err;
  }
};

exports.getAirQualityByBounds = async (bounds) => {
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const approxRadius =
    Math.max(Math.abs(bounds.maxLat - bounds.minLat), Math.abs(bounds.maxLng - bounds.minLng)) * 111000;
  return exports.getAirQualityByRadius({ lat: centerLat, lng: centerLng, radius: approxRadius });
};
