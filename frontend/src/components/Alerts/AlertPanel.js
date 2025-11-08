import React from 'react';
import './AlertPanel.css';

const riskLabels = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very High',
  extreme: 'Extreme'
};

function AlertPanel({ alerts }) {
  const hasAlerts = Boolean(alerts);

  if (!hasAlerts) {
    return (
      <div className="alert-panel">
        <h2 className="panel-title">⚠️ Alerts</h2>
        <div className="no-alerts">
          <p>Gathering live risk insights…</p>
        </div>
      </div>
    );
  }

  const level = alerts.level || 'low';
  const badgeClass = `summary-badge risk-${level}`;
  const riskText = (riskLabels[level] || level).toUpperCase();

  return (
    <div className="alert-panel">
      <h2 className="panel-title">⚠️ Alerts</h2>
      
      <div className="alert-summary">
        <div className={badgeClass}>
          {riskText} RISK
        </div>
        <p className="summary-text">Live smoke & air quality assessment</p>
      </div>

      <div className="alerts-section">
        <h3>Priority Messages</h3>
        {alerts.messages?.map((message, index) => (
          <div key={index} className="alert-card severity-alert">
            <div className="alert-header">
              <span className="alert-icon">⚠️</span>
              <span className="alert-title">Update {index + 1}</span>
            </div>
            <p className="alert-message">{message}</p>
          </div>
        ))}
      </div>

      <div className="details-section">
        <h3>Live Metrics</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Highest AQI</span>
            <span className="detail-value">{alerts.highestAqi ?? 'n/a'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Unhealthy Stations</span>
            <span className="detail-value">{alerts.severeStations ?? 0}</span>
          </div>
          {alerts.windOverview && (
            <div className="detail-item">
              <span className="detail-label">Wind Snapshot</span>
              <span className="detail-value">{alerts.windOverview}</span>
            </div>
          )}
        </div>
      </div>

      <div className="recommendations-section">
        <h3>Recommended Actions</h3>
        <ul className="recommendations-list">
          {alerts.recommendations?.map((rec, index) => (
            <li key={index} className="recommendation-item">
              <span className="rec-icon">✓</span>
              <span>{rec}</span>
            </li>
          )) || (
            <>
              <li className="recommendation-item">
                <span className="rec-icon">✓</span>
                <span>Monitor air quality updates</span>
              </li>
              <li className="recommendation-item">
                <span className="rec-icon">✓</span>
                <span>Stay indoors if air quality worsens</span>
              </li>
              <li className="recommendation-item">
                <span className="rec-icon">✓</span>
                <span>Close windows and doors</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="update-timestamp">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default AlertPanel;

