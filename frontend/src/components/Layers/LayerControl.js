import React from 'react';
import './LayerControl.css';

function LayerControl({ layers, onToggle }) {
  return (
    <div className="layer-control">
      <h3 className="control-title">🗺️ Map Layers</h3>
      
      <div className="layer-toggles">
        <div className="layer-toggle-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={layers.wildfires}
              onChange={() => onToggle('wildfires')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <span className="toggle-icon">🔥</span>
              Active Wildfires
            </span>
          </label>
        </div>

        <div className="layer-toggle-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={layers.airQuality}
              onChange={() => onToggle('airQuality')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <span className="toggle-icon">💨</span>
              Air Quality
            </span>
          </label>
        </div>

        <div className="layer-toggle-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={layers.smokeForecast}
              onChange={() => onToggle('smokeForecast')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <span className="toggle-icon">☁️</span>
              Smoke Forecast
            </span>
          </label>
        </div>

        <div className="layer-toggle-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={layers.disasters}
              onChange={() => onToggle('disasters')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <span className="toggle-icon">🛰️</span>
              NASA Disasters
            </span>
          </label>
        </div>
      </div>

      <div className="control-info">
        <p>Toggle layers to customize your view</p>
      </div>
    </div>
  );
}

export default LayerControl;

