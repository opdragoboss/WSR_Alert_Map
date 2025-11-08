import React from 'react';
import './Dashboard.css';

const formatLastUpdated = (lastUpdated) => {
  if (!lastUpdated) return 'Never';
  const diffSeconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  return lastUpdated.toLocaleTimeString();
};

const summarizeStatus = (status) => {
  if (!status) return 'Unknown';
  if (status.usingMock) return 'Mock data';
  if (status.status === 'success' || status.status === 'derived') return 'Live data';
  if (status.status === 'error') return 'Unavailable';
  return status.status;
};

function Dashboard({ data, wind, lastUpdated, apiStatus }) {
  const wildfires = data.wildfires || [];
  const airQuality = data.airQuality || [];
  const alerts = data.alerts;

  const fireCount = wildfires.length;
  const numericStations = airQuality.filter((aq) => typeof aq.aqi === 'number');
  const avgAQI =
    numericStations.length > 0
      ? Math.round(numericStations.reduce((sum, aq) => sum + aq.aqi, 0) / numericStations.length)
      : '—';
  const affectedAreas = numericStations.filter((aq) => aq.aqi > 100).length;

  const windSpeedDisplay = wind?.speed ?? 'n/a';
  const windDirectionDisplay = wind?.directionCardinal
    ? `${wind.directionCardinal}${
        wind.directionDegrees != null ? ` (${wind.directionDegrees}°)` : ''
      }`
    : 'Variable';

  const riskLevel = alerts?.level || 'moderate';
  const primaryMessage =
    alerts?.messages?.length ? alerts.messages[0] : 'Monitoring conditions in your area.';

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

      {alerts && (
        <div className={`risk-banner risk-${riskLevel}`}>
          <div className="risk-header">
            <span className="risk-icon">🚨</span>
            <span>{riskLevel.toUpperCase()} RISK</span>
          </div>
          <div className="risk-score">{primaryMessage}</div>
        </div>
      )}

      <div className="quick-stats">
        <h3>Live Status</h3>
        <div className="quick-stat-item">
          <span className="label">Last Updated</span>
          <span className="value">{formatLastUpdated(lastUpdated)}</span>
        </div>
        <div className="quick-stat-item">
          <span className="label">Wildfire Feed</span>
          <span className="value">
            {summarizeStatus(apiStatus?.wildfires)} •{' '}
            {apiStatus?.wildfires?.count ?? fireCount} active
          </span>
        </div>
        <div className="quick-stat-item">
          <span className="label">Air Quality Sensors</span>
          <span className="value">
            {summarizeStatus(apiStatus?.airQuality)} •{' '}
            {apiStatus?.airQuality?.count ?? airQuality.length} stations
          </span>
        </div>
        <div className="quick-stat-item">
          <span className="label">Alerts Feed</span>
          <span className="value">{summarizeStatus(apiStatus?.alerts)}</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
