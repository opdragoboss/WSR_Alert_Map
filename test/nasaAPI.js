const NASA_EONET_API = 'https://eonet.gsfc.nasa.gov/api/v3';

export async function getNearbyDisasters(lat, lon, radiusMiles = 50) {
  try {
    const response = await fetch(`${NASA_EONET_API}/events`);
    const data = await response.json();
    
    return data.events.filter(event => {
      const eventCoords = event.geometry[0].coordinates;
      const distance = calculateDistance(lat, lon, eventCoords[1], eventCoords[0]);
      return distance <= radiusMiles;
    });
  } catch (error) {
    console.error('NASA API error:', error);
    return [];
  }
}


function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const toRad = (degrees) => degrees * (Math.PI / 180);

// NEW FUNCTION - Extract coordinates from NASA EONET event
function getEventCoordinates(event) {
  // NASA EONET events have geometry array with coordinates
  if (!event.geometry || event.geometry.length === 0) {
    return null;
  }
  
  // Get the most recent geometry entry
  const mostRecent = event.geometry[event.geometry.length - 1];
  
  if (!mostRecent.coordinates || mostRecent.coordinates.length < 2) {
    return null;
  }
  
  // NASA EONET format is [longitude, latitude]
  const [lon, lat] = mostRecent.coordinates;
  
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lon !== 'number' || 
      isNaN(lat) || isNaN(lon) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  
  return { lat, lon };
}

// NEW CONSTANT - Map common category names to NASA EONET category IDs
const CATEGORY_MAP = {
  'fire': 'wildfires',
  'storm': 'severeStorms',
  'earthquake': 'earthquakes',
  'volcano': 'volcanoes',
  'wildfire': 'wildfires',
  'wildfires': 'wildfires',
  'severe storms': 'severeStorms',
  'earthquakes': 'earthquakes',
  'volcanoes': 'volcanoes'
};

export async function getDisastersByType(category, lat, lon, radiusMiles = 50) {
  try {
    const categoryId = CATEGORY_MAP[category] || category;
    const response = await fetch(
      `${NASA_EONET_API}/events?status=open&category=${categoryId}&limit=100`
    );
    
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const disastersWithDistance = data.events
      .map(event => {
        const coords = getEventCoordinates(event);
        if (!coords) return null;
        
        const distance = calculateDistance(lat, lon, coords.lat, coords.lon);
        
        return {
          id: event.id,
          title: event.title,
          category: event.categories[0]?.title || 'Unknown',
          distance: distance,
          coordinates: coords,
          date: event.geometry[event.geometry.length - 1].date
        };
      })
      .filter(event => event !== null && event.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
    
    return disastersWithDistance;
  } catch (error) {
    console.error('Error fetching NASA data by type:', error);
    return [];
  }
}


export async function getAllActiveDisasters() {
  try {
    const response = await fetch(`${NASA_EONET_API}/events?status=open&limit=300`);
    
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.events.map(event => {
      const coords = getEventCoordinates(event);
      return {
        id: event.id,
        title: event.title,
        category: event.categories[0]?.title || 'Unknown',
        coordinates: coords,
        date: event.geometry[event.geometry.length - 1].date
      };
    }).filter(event => event.coordinates !== null);
  } catch (error) {
    console.error('Error fetching all disasters:', error);
    return [];
  }
}