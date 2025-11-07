const alertService = require('../services/alertService');

/**
 * Get combined risk alerts for a location
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const { lat, lng, radius = 100000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both lat and lng are required'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const alerts = await alertService.generateAlerts({
      lat: latNum,
      lng: lngNum,
      radius: radiusNum
    });

    res.json({
      success: true,
      alerts,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

