export const classifyAqiStatus = (aqi) => {
  if (aqi == null) return 'unknown';
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

const milesBetween = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findClosestWildfire = (wildfires = [], reference = null) => {
  if (!wildfires.length) return null;
  if (!reference) {
    return wildfires[0];
  }
  let minFire = wildfires[0];
  let minDistance = milesBetween(reference.lat, reference.lng, minFire.lat, minFire.lng);
  wildfires.slice(1).forEach((fire) => {
    const distance = milesBetween(reference.lat, reference.lng, fire.lat, fire.lng);
    if (distance < minDistance) {
      minDistance = distance;
      minFire = fire;
    }
  });
  return { fire: minFire, distance: minDistance };
};

export const deriveAlertSummary = ({ wildfires = [], airQuality = [], wind, userLocation = null }) => {
  const highestAqi = airQuality.reduce((max, item) => (item.aqi != null ? Math.max(max, item.aqi) : max), 0);
  const severeStations = airQuality.filter((item) => item.aqi != null && item.aqi >= 151);
  let level = 'low';
  if (highestAqi >= 301) level = 'extreme';
  else if (highestAqi >= 201) level = 'very-high';
  else if (highestAqi >= 151) level = 'high';
  else if (highestAqi >= 101) level = 'moderate';

  const messages = [];
  if (wildfires.length > 0) {
    messages.push(`${wildfires.length} active fire${wildfires.length > 1 ? 's' : ''} nearby`);
  }
  let closestDistance = null;
  if (wildfires.length > 0) {
    const result = findClosestWildfire(
      wildfires,
      userLocation ? { lat: userLocation.lat, lng: userLocation.lon ?? userLocation.lng } : null
    );
    if (result?.fire) {
      const distanceMiles = userLocation
        ? milesBetween(userLocation.lat, userLocation.lon ?? userLocation.lng, result.fire.lat, result.fire.lng)
        : null;
      if (distanceMiles != null) {
        closestDistance = distanceMiles;
        if (distanceMiles <= 50 && level !== 'extreme') {
          level = 'high';
        }
      }
    }
  }
  if (highestAqi >= 151) {
    messages.push('Air quality is unhealthy—limit outdoor exposure');
  } else if (highestAqi >= 101) {
    messages.push('Air quality is moderate—sensitive groups should take caution');
  }
  if (wind?.directionCardinal && wind?.speed) {
    messages.push(`Prevailing wind ${wind.directionCardinal} at ${wind.speed}, watch downwind areas`);
  }
  if (messages.length === 0) {
    messages.push('Conditions stable—continue monitoring');
  }

  return {
    level,
    messages,
    nearestFireMiles: closestDistance,
    highestAqi,
    severeStations: severeStations.length,
    windOverview: wind ? `${wind.directionCardinal || 'Variable'} ${wind.speed || ''}`.trim() : null
  };
};

