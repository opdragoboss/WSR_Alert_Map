const airQualityService = require('../services/airQualityService');

/**
 * Get air quality readings
 */
exports.getAirQuality = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50000, bbox, limit } = req.query;

    // Validate input based on search type
    if (bbox) {
      // Bounding box search
      const coords = bbox.split(',').map(parseFloat);
      if (coords.length !== 4 || coords.some(isNaN)) {
        return res.status(400).json({
          error: 'Invalid bbox parameter',
          message: 'Bounding box must be in format: minLng,minLat,maxLng,maxLat'
        });
      }

      const data = await airQualityService.getAirQualityByBounds({
        minLng: coords[0],
        minLat: coords[1],
        maxLng: coords[2],
        maxLat: coords[3]
      });

      return res.json({
        success: true,
        data,
        metadata: {
          count: data.length,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Radius search
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Either provide lat/lng for radius search or bbox for bounds search'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius, 10);
    if (Number.isNaN(radiusNum) || radiusNum <= 0) {
      return res.status(400).json({
        error: 'Invalid radius parameter',
        message: 'Radius must be a positive number (meters)'
      });
    }
    const limitNumRaw = limit != null ? parseInt(limit, 10) : undefined;
    const limitNum = Number.isNaN(limitNumRaw) || limitNumRaw <= 0 ? undefined : limitNumRaw;

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const data = await airQualityService.getAirQualityByRadius({
      lat: latNum,
      lng: lngNum,
      radius: radiusNum,
      limit: limitNum
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

