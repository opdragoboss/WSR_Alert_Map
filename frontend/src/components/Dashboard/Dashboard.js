import React from 'react';
import './Dashboard.css';

function Dashboard({ data }) {
  const fireCount = data.wildfires?.length || 0;
  const avgAQI = data.airQuality?.length > 0
    ? Math.round(data.airQuality.reduce((sum, aq) => sum + aq.aqi, 0) / data.airQuality.length)
    : 0;

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
            <div className="stat-value">{data.airQuality?.filter(aq => aq.aqi > 100).length || 0}</div>
            <div className="stat-label">Affected Areas</div>
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

