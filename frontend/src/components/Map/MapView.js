import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different severities
const createFireIcon = (severity) => {
  const colors = {
    high: '#ff0000',
    medium: '#ff8800',
    low: '#ffaa00'
  };
  
  return L.divIcon({
    className: 'custom-fire-icon',
    html: `<div style="
      background-color: ${colors[severity] || colors.medium};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">🔥</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom icon for air quality
const createAQIcon = (aqi) => {
  let color = '#00E400'; // Good
  if (aqi > 150) color = '#FF0000'; // Hazardous
  else if (aqi > 100) color = '#FF7E00'; // Unhealthy
  else if (aqi > 50) color = '#FFFF00'; // Moderate
  
  return L.divIcon({
    className: 'custom-aq-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">💨</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

function MapView({ data, layers }) {
  // Default center (San Francisco area)
  const defaultCenter = [37.7749, -122.4194];
  const defaultZoom = 6;

  // Calculate center based on data if available
  const getMapCenter = () => {
    if (data.wildfires && data.wildfires.length > 0) {
      const avgLat = data.wildfires.reduce((sum, f) => sum + f.lat, 0) / data.wildfires.length;
      const avgLng = data.wildfires.reduce((sum, f) => sum + f.lng, 0) / data.wildfires.length;
      return [avgLat, avgLng];
    }
    return defaultCenter;
  };

  return (
    <div className="map-view">
      <MapContainer
        center={getMapCenter()}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Wildfire Markers */}
        {layers.wildfires && data.wildfires?.map(fire => (
          <Marker
            key={fire.id}
            position={[fire.lat, fire.lng]}
            icon={createFireIcon(fire.severity)}
          >
            <Popup>
              <div className="map-popup">
                <h3>🔥 {fire.name}</h3>
                <p><strong>Severity:</strong> <span className={`severity severity-${fire.severity}`}>{fire.severity}</span></p>
                <p><strong>Location:</strong> {fire.lat.toFixed(4)}, {fire.lng.toFixed(4)}</p>
              </div>
            </Popup>
            <Circle
              center={[fire.lat, fire.lng]}
              radius={50000} // 50km radius
              pathOptions={{
                color: fire.severity === 'high' ? '#ff0000' : fire.severity === 'medium' ? '#ff8800' : '#ffaa00',
                fillColor: fire.severity === 'high' ? '#ff0000' : fire.severity === 'medium' ? '#ff8800' : '#ffaa00',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </Marker>
        ))}

        {/* Air Quality Markers */}
        {layers.airQuality && data.airQuality?.map(aq => {
          if (!aq.lat || !aq.lng) return null;
          return (
          <Marker
            key={aq.id}
            position={[aq.lat, aq.lng]}
            icon={createAQIcon(aq.aqi)}
          >
            <Popup>
              <div className="map-popup">
                <h3>💨 {aq.location}</h3>
                <p><strong>AQI:</strong> {aq.aqi}</p>
                <p><strong>Status:</strong> <span className={`status status-${aq.status}`}>{aq.status}</span></p>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#00E400'}}></span>
          <span>Good (0-50)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FFFF00'}}></span>
          <span>Moderate (51-100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF7E00'}}></span>
          <span>Unhealthy (101-150)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#FF0000'}}></span>
          <span>Hazardous (151+)</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;

