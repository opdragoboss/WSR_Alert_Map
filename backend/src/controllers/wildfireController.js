const wildfireService = require('../services/wildfireService');

/**
 * Get active wildfire locations
 */
exports.getWildfires = async (req, res, next) => {
  try {
    const { bbox, days = 1, source, area } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 10) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 10'
      });
    }

    // Parse bounding box if provided
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

    // Fetch wildfire data
    const data = await wildfireService.getActiveWildfires({
      bounds,
      days: daysNum,
      source,
      area
    });

    res.json({
      success: true,
      data,
      metadata: {
        count: data.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

