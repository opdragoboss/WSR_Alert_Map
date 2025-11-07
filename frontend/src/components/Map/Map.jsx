import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure Leaflet marker assets load correctly in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const DEFAULT_CENTER = [37.7749, -122.4194];
const DEFAULT_ZOOM = 6;

function Map({ data = {}, layers = {} }) {
  const { wildfires = [], airQuality = [] } = data;
  const getAQColor = (status = '') => {
    const normalized = status.toLowerCase();
    if (normalized.includes('good')) return '#00E400';
    if (normalized.includes('moderate')) return '#FFFF00';
    if (normalized.includes('sensitive') || normalized.includes('unhealthy')) return '#FF7E00';
    if (normalized.includes('hazard')) return '#7E0023';
    return '#8F3F97';
  };

  const center = useMemo(() => {
    if (wildfires.length) {
      const latSum = wildfires.reduce((sum, fire) => sum + (fire.lat || 0), 0);
      const lngSum = wildfires.reduce((sum, fire) => sum + (fire.lng || 0), 0);
      return [latSum / wildfires.length, lngSum / wildfires.length];
    }
    return DEFAULT_CENTER;
  }, [wildfires]);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {layers.wildfires &&
        wildfires.map((fire) => (
          <Marker key={fire.id} position={[fire.lat, fire.lng]}>
            <Popup>
              <strong>{fire.name}</strong>
              <br />
              Severity: {fire.severity}
            </Popup>
          </Marker>
        ))}

      {layers.airQuality &&
        airQuality.map((aq) => (
          <CircleMarker
            key={aq.id}
            center={[aq.lat || center[0], aq.lng || center[1]]}
            radius={12}
            color="#333"
            fillColor={aq.color || getAQColor(aq.status)}
            fillOpacity={0.6}
            stroke={false}
          >
            <Popup>
              <strong>{aq.location}</strong>
              <br />
              AQI: {aq.aqi}
              <br />
              Status: {aq.status}
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

export default Map;