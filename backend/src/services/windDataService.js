const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL_WIND_DATA || 600 });

const NOAA_API_BASE = 'https://api.weather.gov';
const DEFAULT_USER_AGENT = process.env.NWS_USER_AGENT || 'WSR Alert Map (team@wsr-alert-map.local)';

const toCardinal = (degrees) => {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) return null;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % directions.length;
  return directions[index];
};

const normalizeSpeed = (entry) => {
  if (!entry || entry.value == null) return null;
  const unit = entry.unitCode?.split(':').pop() || '';
  const value = Number(entry.value);
  if (Number.isNaN(value)) return null;

  if (unit === 'km_h-1') {
    const mph = value * 0.621371;
    return { value: Math.round(mph), unit: 'mph' };
  }
  if (unit === 'm_s-1') {
    const mph = value * 2.23694;
    return { value: Math.round(mph), unit: 'mph' };
  }
  return { value: Math.round(value), unit: unit || 'mph' };
};

const pickFirstValid = (values = []) => values.find((entry) => entry?.value != null) || null;

const formatForecast = (speedValues = [], directionValues = []) => {
  const pairs = speedValues.slice(0, 6).map((speedEntry, index) => {
    const directionEntry = directionValues[index];
    const speed = normalizeSpeed(speedEntry);
    const directionDeg = directionEntry?.value != null ? Math.round(directionEntry.value) : null;
    return {
      timestamp: speedEntry?.validTime?.split('/')[0] || null,
      speed: speed ? `${speed.value} ${speed.unit}` : null,
      speedValue: speed?.value ?? null,
      directionDegrees: directionDeg,
      directionCardinal: directionDeg != null ? toCardinal(directionDeg) : null
    };
  });

  return pairs.filter((entry) => entry.timestamp);
};

exports.getWindData = async ({ lat, lng }) => {
  try {
    const cacheKey = `wind_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const requestConfig = {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'application/geo+json'
      },
      timeout: Number(process.env.NWS_TIMEOUT_MS || 10000)
    };

    const pointResponse = await axios.get(`${NOAA_API_BASE}/points/${lat},${lng}`, requestConfig);
    const pointProperties = pointResponse?.data?.properties || {};
    const { gridId, gridX, gridY, cwa, forecastOffice } = pointProperties;

    if (!gridId || gridX == null || gridY == null) {
      throw new Error('Unable to resolve NOAA grid point for provided coordinates');
    }

    const gridResponse = await axios.get(
      `${NOAA_API_BASE}/gridpoints/${gridId}/${gridX},${gridY}`,
      requestConfig
    );

    const gridProperties = gridResponse?.data?.properties || {};

    const windSpeedEntry = pickFirstValid(gridProperties.windSpeed?.values);
    const windDirectionEntry = pickFirstValid(gridProperties.windDirection?.values);
    const windGustEntry = pickFirstValid(gridProperties.windGust?.values);

    const speed = normalizeSpeed(windSpeedEntry);
    const gust = normalizeSpeed(windGustEntry);
    const directionDegrees = windDirectionEntry?.value != null ? Math.round(windDirectionEntry.value) : null;

    const result = {
      speed: speed ? `${speed.value} ${speed.unit}` : 'n/a',
      speedValue: speed?.value ?? null,
      directionDegrees,
      directionCardinal: directionDegrees != null ? toCardinal(directionDegrees) : null,
      gust: gust ? `${gust.value} ${gust.unit}` : null,
      gustValue: gust?.value ?? null,
      updatedAt: windSpeedEntry?.validTime?.split('/')[0] || new Date().toISOString(),
      office: cwa || forecastOffice || gridId,
      grid: { gridId, gridX, gridY },
      forecast: formatForecast(gridProperties.windSpeed?.values, gridProperties.windDirection?.values)
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching wind data:', error.message);
    throw new Error('Failed to fetch wind data');
  }
};
