const wildfireService = require('./wildfireService');
const airQualityService = require('./airQualityService');
const smokeForecastService = require('./smokeForecastService');
const windDataService = require('./windDataService');
const { calculateDistance, calculateBearing } = require('../utils/geoUtils');

/**
 * Alert Service
 * Combines data from multiple sources to generate risk alerts
 */

/**
 * Generate alerts for a location
 * @param {Object} options - Query options
 * @param {number} options.lat - Latitude
 * @param {number} options.lng - Longitude
 * @param {number} options.radius - Search radius in meters
 * @returns {Promise<Object>} Alert information
 */
exports.generateAlerts = async ({ lat, lng, radius }) => {
  try {
    // Fetch all relevant data
    const [wildfires, airQuality, smokeForecast, windData] = await Promise.all([
      wildfireService.getActiveWildfires({ days: 1 }),
      airQualityService.getAirQualityByRadius({ lat, lng, radius }),
      smokeForecastService.getSmokeForecast({ hours: 6 }),
      windDataService.getWindData({ lat, lng })
    ]);

    // Calculate risk level
    const riskAnalysis = calculateRiskLevel({
      location: { lat, lng },
      wildfires,
      airQuality,
      smokeForecast,
      windData,
      radius
    });

    // Generate alert messages
    const alertMessages = generateAlertMessages(riskAnalysis);

    // Generate recommendations
    const recommendations = generateRecommendations(riskAnalysis);

    return {
      location: { lat, lng },
      overallRiskLevel: riskAnalysis.level,
      riskScore: riskAnalysis.score,
      alerts: alertMessages,
      recommendations,
      details: {
        nearbyFires: riskAnalysis.nearbyFires,
        currentAQI: riskAnalysis.currentAQI,
        forecastedAQI: riskAnalysis.forecastedAQI,
        windImpact: riskAnalysis.windImpact
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating alerts:', error.message);
    throw new Error('Failed to generate alerts');
  }
};

/**
 * Calculate overall risk level
 */
function calculateRiskLevel({ location, wildfires, airQuality, smokeForecast, windData, radius }) {
  let riskScore = 0;
  const factors = {};

  // 1. Check for nearby fires
  const nearbyFires = wildfires.filter(fire => {
    const distance = calculateDistance(
      location.lat, location.lng,
      fire.latitude, fire.longitude
    );
    return distance <= radius;
  });
  
  factors.nearbyFires = nearbyFires.length;
  
  if (nearbyFires.length > 0) {
    const closestFire = nearbyFires.reduce((closest, fire) => {
      const distance = calculateDistance(
        location.lat, location.lng,
        fire.latitude, fire.longitude
      );
      return distance < closest.distance ? { fire, distance } : closest;
    }, { distance: Infinity });
    
    // Score based on distance (closer = higher risk)
    if (closestFire.distance < 10000) riskScore += 40; // < 10km
    else if (closestFire.distance < 50000) riskScore += 25; // < 50km
    else riskScore += 10; // < radius
    
    factors.closestFireDistance = closestFire.distance;
  }

  // 2. Check current air quality
  if (airQuality && airQuality.length > 0) {
    const avgAQI = airQuality.reduce((sum, aq) => sum + (aq.aqi || 0), 0) / airQuality.length;
    factors.currentAQI = Math.round(avgAQI);
    
    if (avgAQI > 150) riskScore += 30; // Unhealthy
    else if (avgAQI > 100) riskScore += 20; // Unhealthy for sensitive
    else if (avgAQI > 50) riskScore += 10; // Moderate
  }

  // 3. Check smoke forecast
  if (smokeForecast && smokeForecast.length > 0) {
    // Check if smoke is forecasted to worsen
    const futureSmoke = smokeForecast[smokeForecast.length - 1];
    if (futureSmoke && futureSmoke.areas) {
      const maxSmoke = Math.max(...futureSmoke.areas.map(a => a.smokeDensity || 0));
      factors.forecastedSmokeDensity = maxSmoke;
      
      if (maxSmoke > 100) riskScore += 20;
      else if (maxSmoke > 50) riskScore += 10;
    }
  }

  // 4. Check wind direction
  if (windData && nearbyFires.length > 0) {
    const wind = windData.current;
    const closestFire = nearbyFires[0];
    
    // Calculate if wind is blowing from fire toward location
    const fireToLocationBearing = calculateBearing(
      closestFire.latitude, closestFire.longitude,
      location.lat, location.lng
    );
    
    const windBearing = wind.windDirection;
    const bearingDiff = Math.abs(windBearing - fireToLocationBearing);
    
    // If wind is blowing toward location (within 45 degrees)
    if (bearingDiff < 45 || bearingDiff > 315) {
      riskScore += 15;
      factors.windImpact = 'high';
    } else {
      factors.windImpact = 'low';
    }
  }

  // Determine risk level
  let level, color;
  if (riskScore >= 70) {
    level = 'hazardous';
    color = 'red';
  } else if (riskScore >= 50) {
    level = 'unhealthy';
    color = 'orange';
  } else if (riskScore >= 30) {
    level = 'moderate';
    color = 'yellow';
  } else {
    level = 'low';
    color = 'green';
  }

  return {
    level,
    color,
    score: riskScore,
    ...factors
  };
}

/**
 * Generate human-readable alert messages
 */
function generateAlertMessages(riskAnalysis) {
  const messages = [];

  if (riskAnalysis.nearbyFires > 0) {
    messages.push({
      severity: 'warning',
      title: 'Active Wildfire Nearby',
      message: `There ${riskAnalysis.nearbyFires === 1 ? 'is' : 'are'} ${riskAnalysis.nearbyFires} active wildfire${riskAnalysis.nearbyFires > 1 ? 's' : ''} within your area.`
    });
  }

  if (riskAnalysis.currentAQI > 100) {
    messages.push({
      severity: 'alert',
      title: 'Poor Air Quality',
      message: `Current Air Quality Index is ${riskAnalysis.currentAQI}. Air quality is unhealthy.`
    });
  }

  if (riskAnalysis.windImpact === 'high') {
    messages.push({
      severity: 'warning',
      title: 'Wind Direction Alert',
      message: 'Wind is blowing smoke from nearby fires toward your location.'
    });
  }

  if (riskAnalysis.level === 'hazardous') {
    messages.push({
      severity: 'danger',
      title: 'Hazardous Conditions',
      message: 'Air quality is expected to be hazardous. Take immediate protective action.'
    });
  }

  return messages;
}

/**
 * Generate recommendations based on risk level
 */
function generateRecommendations(riskAnalysis) {
  const recommendations = [];

  if (riskAnalysis.level === 'hazardous' || riskAnalysis.level === 'unhealthy') {
    recommendations.push('Stay indoors and keep windows and doors closed');
    recommendations.push('Use air purifiers with HEPA filters if available');
    recommendations.push('Avoid strenuous outdoor activities');
    recommendations.push('Wear N95 masks if you must go outside');
    recommendations.push('Monitor local emergency alerts');
  } else if (riskAnalysis.level === 'moderate') {
    recommendations.push('Limit prolonged outdoor activities');
    recommendations.push('Close windows if smoke odor is detected');
    recommendations.push('Monitor air quality updates');
    recommendations.push('People with respiratory conditions should take precautions');
  } else {
    recommendations.push('Conditions are currently safe');
    recommendations.push('Continue to monitor air quality');
    recommendations.push('Have an emergency plan ready');
  }

  return recommendations;
}

