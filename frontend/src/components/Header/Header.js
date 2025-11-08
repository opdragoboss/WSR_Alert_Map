import React from 'react';
import './Header.css';

function Header({ onLayersClick }) {
  return (
    <header className="header mobile-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo-icon">🔥</span>
          <div className="title-group">
            <h1 className="title">Wildfire Alert</h1>
            <div className="subtitle">Air Quality & Smoke</div>
          </div>
        </div>
        
        <button className="header-button layers-button" onClick={onLayersClick} aria-label="Layers">
          <span>⚙️</span>
        </button>
      </div>
    </header>
  );
}

export default Header;

