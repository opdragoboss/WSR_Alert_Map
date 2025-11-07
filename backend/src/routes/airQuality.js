const express = require('express');
const router = express.Router();
const airQualityController = require('../controllers/airQualityController');

/**
 * GET /api/air-quality
 * Get current air quality readings
 * 
 * Query parameters:
 * - lat: Latitude (required if using radius search)
 * - lng: Longitude (required if using radius search)
 * - radius: Search radius in meters (default: 50000)
 * - bbox: Bounding box (minLng,minLat,maxLng,maxLat)
 */
router.get('/', airQualityController.getAirQuality);

module.exports = router;

