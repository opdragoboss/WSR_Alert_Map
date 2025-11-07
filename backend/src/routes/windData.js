const express = require('express');
const router = express.Router();
const windDataController = require('../controllers/windDataController');

/**
 * GET /api/wind-data
 * Get wind direction and speed data
 * 
 * Query parameters:
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 */
router.get('/', windDataController.getWindData);

module.exports = router;

