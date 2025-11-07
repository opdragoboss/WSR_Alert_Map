const express = require('express');
const router = express.Router();
const wildfireController = require('../controllers/wildfireController');

/**
 * GET /api/wildfires
 * Get active wildfire locations
 * 
 * Query parameters:
 * - bbox: Bounding box (minLng,minLat,maxLng,maxLat)
 * - days: Number of days to look back (default: 1)
 * - source: Data source (VIIRS_SNPP_NRT, MODIS_NRT) - default: both
 */
router.get('/', wildfireController.getWildfires);

module.exports = router;

