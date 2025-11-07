import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import AlertPanel from './components/Alerts/AlertPanel';
import LayerControl from './components/Layers/LayerControl';

function App() {
  // Mock data
  const [data, setData] = useState({
    wildfires: [
      { id: 1, lat: 37.7749, lng: -122.4194, name: 'Fire 1', severity: 'high' },
      { id: 2, lat: 38.5816, lng: -121.4944, name: 'Fire 2', severity: 'medium' }
    ],
    airQuality: [
      { id: 1, location: 'San Francisco', aqi: 85, status: 'moderate' },
      { id: 2, location: 'Sacramento', aqi: 165, status: 'unhealthy' }
    ],
    alerts: {
      level: 'moderate',
      messages: ['Wildfire smoke detected in area', 'Air quality moderate']
    }
  });

  const [layers, setLayers] = useState({
    wildfires: true,
    airQuality: true,
    smokeForecast: false
  });

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="App">
      <Header />
      
      <div className="main-content">
        <aside className="sidebar">
          <Dashboard data={data} />
          <LayerControl layers={layers} onToggle={toggleLayer} />
        </aside>

        <main className="map-container">
          <MapView data={data} layers={layers} />
        </main>

        <aside className="alert-sidebar">
          <AlertPanel alerts={data.alerts} />
        </aside>
      </div>
    </div>
  );
}

export default App;

