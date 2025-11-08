import React, { useState } from 'react';
import './AlertBanner.css';

function AlertBanner({ alerts, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!alerts || !isVisible || !alerts.messages || alerts.messages.length === 0) {
    return null;
  }

  const getAlertLevel = () => {
    return alerts.level || 'moderate';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const alertLevel = getAlertLevel();
  const primaryMessage = alerts.messages[0];

  return (
    <div className={`alert-banner alert-banner-${alertLevel}`}>
      <div className="alert-banner-content">
        <div className="alert-banner-icon">⚠️</div>
        <div className="alert-banner-text">
          <div className="alert-banner-title">Nearby Alert</div>
          <div className="alert-banner-message">{primaryMessage}</div>
        </div>
        <button 
          className="alert-banner-close"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default AlertBanner;

