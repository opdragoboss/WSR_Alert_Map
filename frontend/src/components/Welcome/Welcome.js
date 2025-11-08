import React from 'react';
import './Welcome.css';

function Welcome({ onGetStarted }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">🔥</div>
        <h1 className="welcome-title">Wildfire Alert</h1>
        <p className="welcome-subtitle">Real-Time Air Quality & Smoke Prediction</p>
        <p className="welcome-description">
          Stay informed about wildfire smoke risks and air quality in your area. 
          Get real-time alerts and forecasts to protect your health.
        </p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">🗺️</span>
            <span className="feature-text">Interactive Maps</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Real-Time Data</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚠️</span>
            <span className="feature-text">Smart Alerts</span>
          </div>
        </div>

        <button className="welcome-button" onClick={onGetStarted}>
          Get Started
          <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default Welcome;

