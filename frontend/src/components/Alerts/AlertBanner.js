import React from 'react';
import './AlertBanner.css';

function AlertBanner({ alerts, onClose }) {
  const message = alerts?.messages?.[0];
  if (!message) {
    return null;
  }

  return (
    <div className="alert-banner">
      <div className="banner-content">
        <div className="banner-icon">🚨</div>
        <div className="banner-text">
          <h3>Nearby Smoke Alert</h3>
          <p>{message}</p>
        </div>
      </div>
      <div className="banner-chip">
        <span>Stay Safe</span>
      </div>
      {onClose && (
        <button type="button" className="banner-close" onClick={onClose} aria-label="Dismiss alert">
          ✕
        </button>
      )}
    </div>
  );
}

export default AlertBanner;

