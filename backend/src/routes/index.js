const express = require('express');
const router = express.Router();

const wildfireRoutes = require('./wildfires');
const airQualityRoutes = require('./airQuality');
const smokeForecastRoutes = require('./smokeForecast');
const windDataRoutes = require('./windData');
const alertRoutes = require('./alerts');
const healthRoutes = require('./health');

// Mount route modules
router.use('/wildfires', wildfireRoutes);
router.use('/air-quality', airQualityRoutes);
router.use('/smoke-forecast', smokeForecastRoutes);
router.use('/wind-data', windDataRoutes);
router.use('/alerts', alertRoutes);
router.use('/health', healthRoutes);

module.exports = router;

