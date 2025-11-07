const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

/**
 * GET /api/alerts
 * Get combined risk alerts for a location
 * 
 * Query parameters:
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * - radius: Search radius in meters (default: 100000)
 */
router.get('/', alertController.getAlerts);

module.exports = router;

