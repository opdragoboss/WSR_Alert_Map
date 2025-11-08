import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import AlertPanel from './components/Alerts/AlertPanel';
import AlertBanner from './components/Alerts/AlertBanner';
import LayerControl from './components/Layers/LayerControl';
import Welcome from './components/Welcome/Welcome';
import Chatbot from './components/Chatbot/Chatbot';
import { fetchWildfires, fetchAirQuality, fetchAlerts, fetchWindData } from './services/api';
import { deriveAlertSummary } from './utils/alerts';
import { DisasterProvider } from './context/DisasterContext';

const DEFAULT_LOCATION = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_RADIUS = 100000; // 100km radius
const DEFAULT_FIRE_AREA = 'USA_contiguous_and_Hawaii';
const DEFAULT_FIRE_DATASET = 'VIIRS_SNPP_NRT';

function App() {
  // App state
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'dashboard', 'alerts', 'chatbot'
  const [showLayers, setShowLayers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    wildfires: { status: 'unknown', usingMock: false },
    airQuality: { status: 'unknown', usingMock: false },
    alerts: { status: 'unknown', usingMock: false }
  });

  // Data state
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
    smokeForecast: false,
    disasters: true
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Use default location (San Francisco) if geolocation fails
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      // Use default location if geolocation not supported
      setUserLocation(DEFAULT_LOCATION);
    }
  }, []);

  // Fetch real-time data
  useEffect(() => {
    if (!userLocation) return; // Wait for location

    const fetchData = async () => {
      setIsLoading(true);
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Fetching real-time data...', {
          location: userLocation,
          timestamp: new Date().toISOString()
        });

        // Fetch all data in parallel - try to get wind data if available
        const fetchPromises = [
          fetchWildfires({ area: DEFAULT_FIRE_AREA, days: 1, source: DEFAULT_FIRE_DATASET }).catch(() => fetchWildfires()),
          fetchAirQuality(userLocation.lat, userLocation.lng, DEFAULT_RADIUS),
          fetchAlerts(userLocation.lat, userLocation.lng, DEFAULT_RADIUS).catch(() => null)
        ];

        // Try to fetch wind data if the function exists
        try {
          const windData = await fetchWindData(userLocation.lat, userLocation.lng);
          setWind(windData);
        } catch (err) {
          console.log('Wind data not available:', err);
        }

        const [wildfiresData, airQualityData, alertsData] = await Promise.all(fetchPromises);

        // Log API responses
        console.log('📊 API Response Data:', {
          wildfires: {
            count: wildfiresData.length,
            data: wildfiresData.slice(0, 2) // Log first 2 for debugging
          },
          airQuality: {
            count: airQualityData.length,
            data: airQualityData.slice(0, 2)
          },
          alerts: alertsData
        });

        setApiStatus({
          wildfires: { 
            status: 'success', 
            count: wildfiresData.length
          },
          airQuality: { 
            status: 'success', 
            count: airQualityData.length
          },
          alerts: { 
            status: 'success'
          }
        });

        console.log('✅ Using real-time API data');

        // Transform wildfires data to match component expectations
        const transformedWildfires = wildfiresData.map((fire, index) => ({
          id: fire.id || `fire_${index}`,
          lat: fire.latitude || fire.lat,
          lng: fire.longitude || fire.lng,
          name: fire.name || `Fire ${index + 1}`,
          severity: fire.severity || (fire.confidence > 80 ? 'high' : fire.confidence > 50 ? 'medium' : 'low'),
          brightness: fire.brightness,
          confidence: fire.confidence,
          frp: fire.frp,
          timestamp: fire.timestamp
        }));

        // Transform air quality data to match component expectations
        const transformedAirQuality = airQualityData.map((aq, index) => ({
          id: aq.id || `aq_${index}`,
          location: aq.location || `Station ${index + 1}`,
          aqi: aq.aqi || 0,
          status: aq.status || 'moderate',
          lat: aq.latitude || aq.lat,
          lng: aq.longitude || aq.lng,
          timestamp: aq.timestamp
        }));

        // Transform alerts data - use deriveAlertSummary if available, otherwise use fetched alerts
        let transformedAlerts;
        if (alertsData) {
          transformedAlerts = {
            level: alertsData.overallRiskLevel || 'moderate',
            messages: alertsData.alerts?.map(alert => alert.message || alert.title) || [],
            riskScore: alertsData.riskScore,
            recommendations: alertsData.recommendations || []
          };
        } else {
          // Fallback to deriveAlertSummary if available
          try {
            transformedAlerts = deriveAlertSummary({
              wildfires: transformedWildfires,
              airQuality: transformedAirQuality,
              wind: wind
            });
          } catch (err) {
            transformedAlerts = null;
          }
        }

        setData({
          wildfires: transformedWildfires,
          airQuality: transformedAirQuality,
          alerts: transformedAlerts
        });
        
        setLastUpdated(new Date());
        console.log('✅ Data updated successfully at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Unable to load live data. Showing latest known view.');
        setApiStatus({
          wildfires: { status: 'error', usingMock: true },
          airQuality: { status: 'error', usingMock: true },
          alerts: { status: 'error', usingMock: true }
        });
        // Keep existing data or use empty arrays on error
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [userLocation]);

  // Close drawers when switching tabs
  useEffect(() => {
    setShowLayers(false);
  }, [activeTab]);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Show welcome screen first
  if (showWelcome) {
    return (
      <DisasterProvider>
        <div className="App mobile-app">
          <Welcome onGetStarted={() => setShowWelcome(false)} />
        </div>
      </DisasterProvider>
    );
  }

  // Check if there are nearby alerts to show banner
  const hasNearbyAlerts = data.alerts && data.alerts.messages && data.alerts.messages.length > 0;

  // Show loading state
  if (isLoading && !showWelcome) {
    return (
      <DisasterProvider>
        <div className="App mobile-app">
          <div className="app-header-wrapper">
            <Header onLayersClick={() => setShowLayers(!showLayers)} />
          </div>
          <div className="mobile-content">
            <div className="loading-screen">
              <div className="loading-spinner">⏳</div>
              <p>Loading real-time data...</p>
            </div>
          </div>
        </div>
      </DisasterProvider>
    );
  }

  return (
    <DisasterProvider>
      <div className="App mobile-app">
        <div className="app-header-wrapper">
          <Header onLayersClick={() => setShowLayers(!showLayers)} />
          
          {/* Alert Banner - positioned below header */}
          {hasNearbyAlerts && (
            <AlertBanner alerts={data.alerts} />
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="mobile-content">
          {activeTab === 'map' && (
            <div className="map-screen">
              <MapView data={data} layers={layers} loading={loading} error={error} wind={wind} />
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div className="dashboard-screen">
              <Dashboard data={data} wind={wind} lastUpdated={lastUpdated} apiStatus={apiStatus} />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="alerts-screen">
              <AlertPanel alerts={data.alerts} />
            </div>
          )}
          
          {activeTab === 'chatbot' && (
            <div className="chatbot-screen">
              <Chatbot />
            </div>
          )}
        </div>

        {/* Layer Control Drawer */}
        <div className={`drawer drawer-right ${showLayers ? 'open' : ''}`}>
          <div className="drawer-overlay" onClick={() => setShowLayers(false)}></div>
          <div className="drawer-content">
            <div className="drawer-header">
              <h2>Map Layers</h2>
              <button className="drawer-close" onClick={() => setShowLayers(false)}>✕</button>
            </div>
            <LayerControl layers={layers} onToggle={toggleLayer} />
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Map</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Stats</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <span className="nav-icon">⚠️</span>
            <span className="nav-label">Alerts</span>
          </button>
        </nav>

        {/* Floating Chatbot Button - Only show on Map tab */}
        {!showWelcome && activeTab === 'map' && (
          <button 
            className="floating-chatbot-button"
            onClick={() => setActiveTab('chatbot')}
            aria-label="Open AI Assistant"
          >
            <span className="chatbot-icon">🤖</span>
          </button>
        )}
      </div>
    </DisasterProvider>
  );
}

export default App;
