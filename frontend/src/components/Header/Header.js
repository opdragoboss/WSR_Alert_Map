import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo-icon">🔥</span>
          <h1 className="title">Wildfire Smoke Risk Alert Map</h1>
        </div>
        <div className="subtitle">
          Real-Time Air Quality & Smoke Prediction
        </div>
      </div>
    </header>
  );
}

export default Header;

