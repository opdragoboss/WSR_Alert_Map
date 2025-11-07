const smokeForecastService = require('../services/smokeForecastService');

/**
 * Get smoke dispersion forecast
 */
exports.getSmokeForecast = async (req, res, next) => {
  try {
    const { bbox, hours = 6 } = req.query;

    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 48) {
      return res.status(400).json({
        error: 'Invalid hours parameter',
        message: 'Hours must be between 1 and 48'
      });
    }

    let bounds = null;
    if (bbox) {
      const coords = bbox.split(',').map(parseFloat);
      if (coords.length !== 4 || coords.some(isNaN)) {
        return res.status(400).json({
          error: 'Invalid bbox parameter',
          message: 'Bounding box must be in format: minLng,minLat,maxLng,maxLat'
        });
      }
      bounds = {
        minLng: coords[0],
        minLat: coords[1],
        maxLng: coords[2],
        maxLat: coords[3]
      };
    }

    const data = await smokeForecastService.getSmokeForecast({
      bounds,
      hours: hoursNum
    });

    res.json({
      success: true,
      data,
      metadata: {
        forecastHours: hoursNum,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

