import React from 'react';
import './AlertPanel.css';

function AlertPanel({ alerts }) {
  if (!alerts) {
    return (
      <div className="alert-panel">
        <h2 className="panel-title">⚠️ Alerts</h2>
        <div className="no-alerts">
          <p>No alerts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <h2 className="panel-title">⚠️ Alerts</h2>
      
      <div className="alert-summary">
        <div className={`summary-badge risk-${alerts.level}`}>
          {alerts.level.toUpperCase()} RISK
        </div>
        <p className="summary-text">Current risk level for your area</p>
      </div>

      <div className="alerts-section">
        <h3>Active Alerts</h3>
        {alerts.messages?.map((message, index) => (
          <div key={index} className="alert-card">
            <div className="alert-header">
              <span className="alert-icon">⚠️</span>
              <span className="alert-title">Alert {index + 1}</span>
            </div>
            <p className="alert-message">{message}</p>
          </div>
        ))}
      </div>

      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <ul className="recommendations-list">
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
        </ul>
      </div>

      <div className="update-timestamp">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default AlertPanel;

