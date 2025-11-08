import React from 'react';
import './Welcome.css';

function Welcome({ onGetStarted }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-overlay" />
      <div className="welcome-content">
        <div className="welcome-badge">Wildfire Smoke Risk</div>
        <h1>Protect your community before smoke becomes hazardous</h1>
        <p>
          Real-time wildfire detection, air quality alerts, and AI assistance to help families,
          schools, and responders stay safe.
        </p>
        <button className="welcome-button" onClick={onGetStarted}>
          Get Started
        </button>
        <div className="welcome-footer">
          <span>Powered by NASA FIRMS • OpenAQ • NOAA Weather</span>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

