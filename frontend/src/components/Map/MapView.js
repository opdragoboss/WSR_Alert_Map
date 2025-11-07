import React from 'react';
import Map from './Map';
import './MapView.css';

function MapView({ data, layers, loading, error, wind }) {
  const windLabel = wind?.directionCardinal
    ? `${wind.directionCardinal}${wind.directionDegrees != null ? ` (${wind.directionDegrees}°)` : ''}`
    : 'Variable';

  return (
    <div className="map-view">
      <div className="map-canvas">
        <Map data={data} layers={layers} />

        {(loading || error) && (
          <div className={`map-status ${loading ? 'loading' : 'error'}`}>
            {loading ? 'Loading live environmental data…' : error}
          </div>
        )}

        {wind?.speed && !loading && !error && (
          <div className="map-callout wind-callout">
            <div className="callout-label">Surface Wind</div>
            <div className="callout-value">{wind.speed}</div>
            <div className="callout-subtext">Direction: {windLabel}</div>
          </div>
        )}
      </div>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#00E400'}}></span>
          <span>Good AQI (0-50)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FFFF00'}}></span>
          <span>Moderate AQI (51-100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF7E00'}}></span>
          <span>Unhealthy AQI (101-150)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF0000'}}></span>
          <span>Hazardous AQI (151+)</span>
        </div>
        <div className="legend-item">
          <span role="img" aria-label="wildfire" className="legend-icon">🔥</span>
          <span>Active Wildfire</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
