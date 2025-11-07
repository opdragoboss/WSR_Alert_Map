import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import AlertPanel from './components/Alerts/AlertPanel';
import LayerControl from './components/Layers/LayerControl';
import { fetchWildfires, fetchAirQuality, fetchWindData } from './services/api';
import { deriveAlertSummary } from './utils/alerts';

const DEFAULT_LOCATION = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_RADIUS = 50000;
const DEFAULT_FIRE_AREA = 'USA_contiguous_and_Hawaii';
const DEFAULT_FIRE_DATASET = 'VIIRS_SNPP_NRT';

function App() {
  const [data, setData] = useState({
    wildfires: [],
    airQuality: [],
    alerts: null
  });
  const [wind, setWind] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [layers, setLayers] = useState({
    wildfires: true,
    airQuality: true,
    smokeForecast: false
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [wildfireData, airQualityData, windData] = await Promise.all([
          fetchWildfires({ area: DEFAULT_FIRE_AREA, days: 1, source: DEFAULT_FIRE_DATASET }),
          fetchAirQuality(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_RADIUS),
          fetchWindData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng)
        ]);

        setWind(windData);
        setData({
          wildfires: wildfireData,
          airQuality: airQualityData,
          alerts: deriveAlertSummary({
            wildfires: wildfireData,
            airQuality: airQualityData,
            wind: windData
          })
        });
      } catch (err) {
        console.error('Failed to load live data', err);
        setError('Unable to load live data. Showing latest known view.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="App">
      <Header />

      <div className="main-content">
        <aside className="sidebar">
          <Dashboard data={data} wind={wind} />
          <LayerControl layers={layers} onToggle={toggleLayer} />
        </aside>

        <main className="map-container">
          <MapView data={data} layers={layers} loading={loading} error={error} wind={wind} />
        </main>

        <aside className="alert-sidebar">
          <AlertPanel alerts={data.alerts} />
        </aside>
      </div>
    </div>
  );
}

export default App;

