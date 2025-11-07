import React from 'react';
import './Dashboard.css';

function Dashboard({ data, wind }) {
  const fireCount = data.wildfires?.length || 0;
  const validAqiStations = (data.airQuality || []).filter((aq) => typeof aq.aqi === 'number');
  const avgAQI = validAqiStations.length > 0
    ? Math.round(validAqiStations.reduce((sum, aq) => sum + aq.aqi, 0) / validAqiStations.length)
    : '—';
  const windSpeedDisplay = wind?.speed ?? 'n/a';
  const windDirectionDisplay = wind?.directionCardinal
    ? `${wind.directionCardinal}${wind.directionDegrees != null ? ` (${wind.directionDegrees}°)` : ''}`
    : 'Variable';
  const affectedAreas = validAqiStations.filter((aq) => aq.aqi > 100).length;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">📊 Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{fireCount}</div>
            <div className="stat-label">Active Fires</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💨</div>
          <div className="stat-content">
            <div className="stat-value">{avgAQI}</div>
            <div className="stat-label">Avg AQI</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{affectedAreas}</div>
            <div className="stat-label">Affected Areas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌬️</div>
          <div className="stat-content">
            <div className="stat-value">{windSpeedDisplay}</div>
            <div className="stat-label">Wind {windDirectionDisplay}</div>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <h3>Quick Stats</h3>
        <div className="quick-stat-item">
          <span className="label">Status:</span>
          <span className="value status-active">● Active</span>
        </div>
        <div className="quick-stat-item">
          <span className="label">Last Updated:</span>
          <span className="value">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

