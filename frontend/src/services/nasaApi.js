const NASA_EONET_API = 'https://eonet.gsfc.nasa.gov/api/v3';

const CATEGORY_MAP = {
  fire: 'wildfires',
  wildfire: 'wildfires',
  wildfires: 'wildfires',
  storm: 'severeStorms',
  storms: 'severeStorms',
  'severe storms': 'severeStorms',
  earthquake: 'earthquakes',
  earthquakes: 'earthquakes',
  volcano: 'volcanoes',
  volcanoes: 'volcanoes'
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WILDFIRE_CATEGORY = 'Wildfires';

export async function getAllActiveDisasters() {
  try {
    const response = await fetch(`${NASA_EONET_API}/events?status=open&limit=300`);
    if (!response.ok) {
      throw new Error(`NASA EONET error: ${response.status}`);
    }
    const data = await response.json();
    return data.events
      .map((event) => {
        const coordinates = getEventCoordinates(event);
        const mostRecentDate = event.geometry?.[event.geometry.length - 1]?.date;
        const categoryTitle = event.categories?.[0]?.title || 'Unknown';
        if (!coordinates || categoryTitle !== WILDFIRE_CATEGORY || !isWithinLastWeek(mostRecentDate)) {
          return null;
        }
        return {
          id: event.id,
          title: event.title,
          category: categoryTitle,
          coordinates,
          date: mostRecentDate
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching NASA disasters:', error);
    return [];
  }
}

export async function getDisastersByType(category, lat, lon, radiusMiles = 50) {
  try {
    const categoryId = CATEGORY_MAP[category?.toLowerCase?.()] || category;
    const response = await fetch(
      `${NASA_EONET_API}/events?status=open&category=${categoryId}&limit=100`
    );
    if (!response.ok) {
      throw new Error(`NASA EONET error: ${response.status}`);
    }
    const data = await response.json();
    return data.events
      .map((event) => {
        const coordinates = getEventCoordinates(event);
        if (!coordinates || lat == null || lon == null) {
          return null;
        }
        const mostRecentDate = event.geometry?.[event.geometry.length - 1]?.date;
        if (!isWithinLastWeek(mostRecentDate)) {
          return null;
        }
        const distance = calculateDistance(lat, lon, coordinates.lat, coordinates.lon);
        return {
          id: event.id,
          title: event.title,
          category: event.categories?.[0]?.title || 'Unknown',
          coordinates,
          date: mostRecentDate,
          distance
        };
      })
      .filter((event) => event && event.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching NASA disasters by type:', error);
    return [];
  }
}

function getEventCoordinates(event) {
  if (!event.geometry || event.geometry.length === 0) {
    return null;
  }
  const mostRecent = event.geometry[event.geometry.length - 1];
  const [lon, lat] = mostRecent.coordinates || [];
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }
  return { lat, lon };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function isWithinLastWeek(dateString) {
  if (!dateString) return false;
  const eventDate = new Date(dateString);
  if (Number.isNaN(eventDate.getTime())) return false;
  return Date.now() - eventDate.getTime() <= ONE_WEEK_MS;
}

