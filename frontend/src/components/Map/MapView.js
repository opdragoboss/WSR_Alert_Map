import React from 'react';
import Map from './Map';
import './MapView.css';

function MapView({ data, layers }) {
  return (
    <div className="map-view">
      <div className="map-canvas">
        <Map data={data} layers={layers} />
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
