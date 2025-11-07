import React from 'react';
import './Dashboard.css';

function Dashboard({ wildfires, airQuality, alerts, loading }) {
  // Calculate statistics
  const activeFireCount = wildfires.length;
  const avgAQI = airQuality.length > 0
    ? Math.round(airQuality.reduce((sum, aq) => sum + (aq.aqi || 0), 0) / airQuality.length)
    : 0;
  
  const affectedLocations = airQuality.filter(aq => aq.aqi > 100).length;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">📊 Dashboard</h2>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon fire">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{activeFireCount}</div>
                <div className="stat-label">Active Fires</div>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon aqi aqi-${getAQILevel(avgAQI)}`}>💨</div>
              <div className="stat-content">
                <div className="stat-value">{avgAQI || 'N/A'}</div>
                <div className="stat-label">Avg AQI</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{affectedLocations}</div>
                <div className="stat-label">Affected Areas</div>
              </div>
            </div>
          </div>

          {alerts && (
            <div className={`risk-banner risk-${alerts.overallRiskLevel}`}>
              <div className="risk-header">
                <span className="risk-icon">{getRiskIcon(alerts.overallRiskLevel)}</span>
                <span className="risk-level">{alerts.overallRiskLevel.toUpperCase()} RISK</span>
              </div>
              <div className="risk-score">Risk Score: {alerts.riskScore}/100</div>
            </div>
          )}

          <div className="quick-stats">
            <h3>Quick Stats</h3>
            <div className="quick-stat-item">
              <span className="label">Sensors Reporting:</span>
              <span className="value">{airQuality.length}</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Last Updated:</span>
              <span className="value">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Status:</span>
              <span className="value status-active">● Active</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getAQILevel(aqi) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  return 'hazardous';
}

function getRiskIcon(level) {
  switch(level) {
    case 'hazardous': return '🚨';
    case 'unhealthy': return '⚠️';
    case 'moderate': return '⚡';
    default: return '✅';
  }
}

export default Dashboard;

