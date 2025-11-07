const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_WILDFIRES || 300 });

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api';
const DEFAULT_FIRMS_DATASET = process.env.NASA_FIRMS_DATASET || 'VIIRS_SNPP_NRT';
const DEFAULT_FIRMS_AREA = process.env.NASA_FIRMS_AREA || 'USA_contiguous_and_Hawaii';
const DEFAULT_USER_AGENT = process.env.FIRMS_USER_AGENT || 'WSR Alert Map (team@wsr-alert-map.local)';

const withinBounds = (point, bounds) => {
  if (!bounds) return true;
  const { lat, lng } = point;
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
};

const normalizeFireRecord = (record, index) => {
  if (!record) return null;
  const lat = Number(record.latitude ?? record.lat ?? record.latitud);
  const lng = Number(record.longitude ?? record.lon ?? record.longitud);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const confidenceRaw = record.confidence ?? record.confidence_level;

  return {
    id: record.id || record.fire_id || record.fid || `fire-${index}`,
    lat,
    lng,
    name: record.name || record.location || record.acq_date || `Fire ${index + 1}`,
    brightness: record.brightness ? Number(record.brightness) : null,
    confidence: typeof confidenceRaw === 'string' ? confidenceRaw : confidenceRaw != null ? Number(confidenceRaw) : null,
    frp: record.frp != null ? Number(record.frp) : null,
    acqDate: record.acq_date || record.acquired || null,
    acqTime: record.acq_time || null,
    daynight: record.daynight || null,
    source: record.satellite || record.source || DEFAULT_FIRMS_DATASET
  };
};

exports.getActiveWildfires = async ({ bounds, days = 1, source, area }) => {
  try {
    const cacheKey = `wildfires_${bounds ? JSON.stringify(bounds) : 'world'}_${days}_${source || 'all'}_${area || 'default'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiKey = process.env.NASA_FIRMS_API_KEY;
    if (!apiKey) {
      throw new Error('NASA FIRMS API key not configured');
    }

    const dataset = source || DEFAULT_FIRMS_DATASET;
    const targetArea = area || DEFAULT_FIRMS_AREA;
    const url = `${FIRMS_BASE_URL}/area/json/${apiKey}/${dataset}/${targetArea}/${days}`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
      timeout: Number(process.env.FIRMS_TIMEOUT_MS || 10000)
    });

    const rows = Array.isArray(response.data?.features)
      ? response.data.features.map((feature) => feature.attributes || feature.properties)
      : Array.isArray(response.data)
        ? response.data
        : [];

    const normalized = rows
      .map((record, index) => normalizeFireRecord(record, index))
      .filter(Boolean)
      .filter((record) => withinBounds(record, bounds));

    cache.set(cacheKey, normalized);
    return normalized;
  } catch (error) {
    console.error('Error fetching wildfire data:', error.message);
    throw new Error('Failed to fetch wildfire data');
  }
};
