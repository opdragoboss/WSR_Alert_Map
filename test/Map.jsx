import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDisasters } from './DisasterContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different disaster types
const getDisasterIcon = (category) => {
  const iconColors = {
    'Wildfires': '🔥',
    'Severe Storms': '🌩️',
    'Volcanoes': '🌋',
    'Earthquakes': '🌍'
  };
  
  const emoji = iconColors[category] || '⚠️';
  
  return L.divIcon({
    html: `<div style="font-size: 24px;">${emoji}</div>`,
    className: 'custom-disaster-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function Map() {
  const { disasters, userLocation, isLoading } = useDisasters();
  
  // Default center (will be overridden if user location available)
  const defaultCenter = [20, 0];
  const center = userLocation ? [userLocation.lat, userLocation.lon] : defaultCenter;
  const zoom = userLocation ? 6 : 2;

  if (isLoading) {
    return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading disasters...
    </div>;
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]}>
          <Popup>
            📍 You are here
          </Popup>
        </Marker>
      )}
      
      {/* Disaster markers */}
      {disasters.map((disaster) => {
        if (!disaster.coordinates) return null;
        
        return (
          <Marker
            key={disaster.id}
            position={[disaster.coordinates.lat, disaster.coordinates.lon]}
            icon={getDisasterIcon(disaster.category)}
          >
            <Popup>
              <strong>{disaster.title}</strong><br />
              <em>{disaster.category}</em><br />
              {disaster.date && <small>Date: {new Date(disaster.date).toLocaleDateString()}</small>}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;