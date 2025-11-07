import React from 'react';
import './MapView.css';

function MapView({ data, layers }) {
  return (
    <div className="map-view">
      <div className="map-placeholder">
        <h2>🗺️ Map View (Placeholder)</h2>
        <p>Interactive map will be displayed here</p>
        
        {layers.wildfires && (
          <div className="map-section">
            <h3>🔥 Active Wildfires</h3>
            {data.wildfires?.map(fire => (
              <div key={fire.id} className="map-item fire-item">
                <strong>{fire.name}</strong>
                <span>Lat: {fire.lat}, Lng: {fire.lng}</span>
                <span className={`severity severity-${fire.severity}`}>{fire.severity}</span>
              </div>
            ))}
          </div>
        )}

        {layers.airQuality && (
          <div className="map-section">
            <h3>💨 Air Quality</h3>
            {data.airQuality?.map(aq => (
              <div key={aq.id} className="map-item aq-item">
                <strong>{aq.location}</strong>
                <span>AQI: {aq.aqi}</span>
                <span className={`status status-${aq.status}`}>{aq.status}</span>
              </div>
            ))}
          </div>
        )}

        {layers.smokeForecast && (
          <div className="map-section">
            <h3>☁️ Smoke Forecast</h3>
            <p>Forecast data will be displayed here</p>
          </div>
        )}
      </div>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#00E400'}}></span>
          <span>Good (0-50)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FFFF00'}}></span>
          <span>Moderate (51-100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF7E00'}}></span>
          <span>Unhealthy (101-150)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF0000'}}></span>
          <span>Hazardous (151+)</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;

