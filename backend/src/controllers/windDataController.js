const windDataService = require('../services/windDataService');

/**
 * Get wind direction and speed data
 */
exports.getWindData = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both lat and lng are required'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const data = await windDataService.getWindData({
      lat: latNum,
      lng: lngNum
    });

    res.json({
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

