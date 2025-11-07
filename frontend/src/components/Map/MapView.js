import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Custom icons
const fireIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgZmlsbD0iI2ZmNGQxYSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxNiIgeT0iMjEiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkqU8L3RleHQ+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

function MapView({ center, zoom, wildfires, airQuality, smokeForecast, windData, layers, onCenterChange, onZoomChange }) {
  return (
    <div className="map-view">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Wildfire Layer */}
        {layers.wildfires && wildfires.map((fire) => (
          <Marker
            key={fire.id}
            position={[fire.latitude, fire.longitude]}
            icon={fireIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3>🔥 Active Wildfire</h3>
                <p><strong>Brightness:</strong> {fire.brightness}K</p>
                <p><strong>Confidence:</strong> {fire.confidence}%</p>
                <p><strong>FRP:</strong> {fire.frp} MW</p>
                <p><strong>Source:</strong> {fire.source}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Air Quality Layer */}
        {layers.airQuality && airQuality.map((aq) => (
          <Circle
            key={aq.id}
            center={[aq.latitude, aq.longitude]}
            radius={5000}
            pathOptions={{
              color: getAQIColor(aq.aqi),
              fillColor: getAQIColor(aq.aqi),
              fillOpacity: 0.4
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3>💨 Air Quality</h3>
                <p><strong>Location:</strong> {aq.location}</p>
                <p><strong>AQI:</strong> <span style={{color: getAQIColor(aq.aqi), fontWeight: 'bold'}}>{aq.aqi}</span></p>
                <p><strong>Status:</strong> {aq.status}</p>
                <p className="popup-timestamp">Updated: {new Date(aq.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Smoke Forecast Layer - Placeholder */}
        {layers.smokeForecast && smokeForecast.length > 0 && (
          <>
            {/* TODO: Implement smoke overlay visualization */}
          </>
        )}

        {/* Wind Direction Layer - Placeholder */}
        {layers.windDirection && windData && (
          <>
            {/* TODO: Implement wind direction arrows */}
          </>
        )}

        <MapEventHandler 
          onCenterChange={onCenterChange}
          onZoomChange={onZoomChange}
        />
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-icon fire">🔥</span>
          <span>Active Wildfire</span>
        </div>
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

// Component to handle map events
function MapEventHandler({ onCenterChange, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleMove = () => {
      const center = map.getCenter();
      onCenterChange([center.lat, center.lng]);
    };

    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleZoom);

    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleZoom);
    };
  }, [map, onCenterChange, onZoomChange]);

  return null;
}

// Helper function to get AQI color
function getAQIColor(aqi) {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#8F3F97';
  return '#7E0023';
}

export default MapView;

