const express = require('express');
const router = express.Router();
const smokeForecastController = require('../controllers/smokeForecastController');

/**
 * GET /api/smoke-forecast
 * Get smoke dispersion forecast
 * 
 * Query parameters:
 * - bbox: Bounding box (minLng,minLat,maxLng,maxLat)
 * - hours: Forecast hours ahead (default: 6)
 */
router.get('/', smokeForecastController.getSmokeForecast);

module.exports = router;

