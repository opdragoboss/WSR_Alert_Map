import React from 'react';
import './AlertPanel.css';

const RISK_LABELS = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very High',
  extreme: 'Extreme'
};

const DEFAULT_RECOMMENDATIONS = [
  'Monitor air quality updates every 1-2 hours',
  'Keep indoor air clean with filters or purifiers',
  'Plan alternative activities for sensitive groups'
];

function AlertPanel({ alerts }) {
  if (!alerts) {
    return (
      <div className="alert-panel">
        <h2 className="panel-title">⚠️ Alerts</h2>
        <div className="no-alerts">
          <p>Gathering live risk insights…</p>
        </div>
      </div>
    );
  }

  const riskLevel = (alerts.level || 'moderate').toLowerCase();
  const badgeClass = `summary-badge risk-${riskLevel}`;
  const riskText = (RISK_LABELS[riskLevel] || riskLevel).toUpperCase();
  const messages = alerts.messages && alerts.messages.length ? alerts.messages : ['Monitoring conditions in your area.'];
  const recommendations =
    alerts.recommendations && alerts.recommendations.length
      ? alerts.recommendations
      : riskLevel === 'high'
      ? [
          'Prepare for potential evacuation',
          'Pack essential documents and medications',
          'Check on neighbors and vulnerable family members',
          'Monitor official channels for evacuation guidance'
        ]
      : DEFAULT_RECOMMENDATIONS;

  return (
    <div className="alert-panel">
      <h2 className="panel-title">⚠️ Alerts</h2>

      <div className="alert-summary">
        <div className={badgeClass}>{riskText} RISK</div>
        <p className="summary-text">
          Real-time smoke and air quality assessment based on the latest satellite and ground sensors.
        </p>
      </div>

      <div className="alerts-section">
        <h3>Priority Messages</h3>
        {messages.map((message, index) => (
          <div key={index} className="alert-card">
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
          {recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              <span className="rec-icon">✓</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="update-timestamp">Last updated: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}

export default AlertPanel;
