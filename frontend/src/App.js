import React, { useState, useEffect } from 'react';
import './App.css';
import MapView from './components/Map/MapView';
import Dashboard from './components/Dashboard/Dashboard';
import AlertPanel from './components/Alerts/AlertPanel';
import LayerControl from './components/Layers/LayerControl';
import Header from './components/Header/Header';
import { fetchWildfires, fetchAirQuality, fetchSmokeForecast, fetchWindData, fetchAlerts } from './services/api';

function App() {
  // State management
  const [wildfires, setWildfires] = useState([]);
  const [airQuality, setAirQuality] = useState([]);
  const [smokeForecast, setSmokeForecast] = useState([]);
  const [windData, setWindData] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layer visibility toggles
  const [layers, setLayers] = useState({
    wildfires: true,
    airQuality: true,
    smokeForecast: false,
    windDirection: false
  });

  // Map center and zoom
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // San Francisco default
  const [mapZoom, setMapZoom] = useState(8);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mapCenter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [wildfiresData, airQualityData, smokeForecastData, windDataData, alertsData] = await Promise.all([
        fetchWildfires(),
        fetchAirQuality(mapCenter[0], mapCenter[1]),
        fetchSmokeForecast(),
        fetchWindData(mapCenter[0], mapCenter[1]),
        fetchAlerts(mapCenter[0], mapCenter[1])
      ]);

      setWildfires(wildfiresData);
      setAirQuality(airQualityData);
      setSmokeForecast(smokeForecastData);
      setWindData(windDataData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Using mock data for demonstration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerName) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  return (
    <div className="App">
      <Header />
      
      <div className="main-content">
        <aside className="sidebar">
          <Dashboard 
            wildfires={wildfires}
            airQuality={airQuality}
            alerts={alerts}
            loading={loading}
          />
          
          <LayerControl 
            layers={layers}
            onToggle={toggleLayer}
          />
        </aside>

        <main className="map-container">
          <MapView
            center={mapCenter}
            zoom={mapZoom}
            wildfires={wildfires}
            airQuality={airQuality}
            smokeForecast={smokeForecast}
            windData={windData}
            layers={layers}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
          />
        </main>

        <aside className="alert-sidebar">
          <AlertPanel 
            alerts={alerts}
            loading={loading}
          />
        </aside>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default App;

