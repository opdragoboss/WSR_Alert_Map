export const classifyAqiStatus = (aqi) => {
  if (aqi == null) return 'unknown';
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

export const deriveAlertSummary = ({ wildfires = [], airQuality = [], wind }) => {
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
    highestAqi,
    severeStations: severeStations.length,
    windOverview: wind ? `${wind.directionCardinal || 'Variable'} ${wind.speed || ''}`.trim() : null
  };
};

