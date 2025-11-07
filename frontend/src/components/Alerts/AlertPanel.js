import React from 'react';
import './AlertPanel.css';

function AlertPanel({ alerts, loading }) {
  if (loading) {
    return (
      <div className="alert-panel">
        <h2 className="panel-title">⚠️ Alerts & Recommendations</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (!alerts) {
    return (
      <div className="alert-panel">
        <h2 className="panel-title">⚠️ Alerts & Recommendations</h2>
        <div className="no-alerts">
          <p>No alert data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <h2 className="panel-title">⚠️ Alerts & Recommendations</h2>
      
      <div className="alert-summary">
        <div className={`summary-badge risk-${alerts.overallRiskLevel}`}>
          {alerts.overallRiskLevel.toUpperCase()}
        </div>
        <p className="summary-text">
          Current risk level for your area
        </p>
      </div>

      {alerts.alerts && alerts.alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Active Alerts</h3>
          {alerts.alerts.map((alert, index) => (
            <div key={index} className={`alert-card severity-${alert.severity}`}>
              <div className="alert-header">
                <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
                <span className="alert-title">{alert.title}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {alerts.recommendations && alerts.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Recommendations</h3>
          <ul className="recommendations-list">
            {alerts.recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                <span className="rec-icon">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {alerts.details && (
        <div className="details-section">
          <h3>Details</h3>
          <div className="detail-grid">
            {alerts.details.nearbyFires !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Nearby Fires:</span>
                <span className="detail-value">{alerts.details.nearbyFires}</span>
              </div>
            )}
            {alerts.details.currentAQI !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Current AQI:</span>
                <span className="detail-value">{alerts.details.currentAQI}</span>
              </div>
            )}
            {alerts.details.windImpact && (
              <div className="detail-item">
                <span className="detail-label">Wind Impact:</span>
                <span className="detail-value">{alerts.details.windImpact}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="update-timestamp">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

function getSeverityIcon(severity) {
  switch(severity) {
    case 'danger': return '🚨';
    case 'alert': return '⚠️';
    case 'warning': return '⚡';
    default: return 'ℹ️';
  }
}

export default AlertPanel;

