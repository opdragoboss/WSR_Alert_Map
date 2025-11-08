import React from 'react';
import Map from './Map';
import './MapView.css';

function MapView({ data, layers, loading, error }) {
  return (
    <div className="map-view">
      <div className="map-canvas">
        <Map data={data} layers={layers} />

        {(loading || error) && (
          <div className={`map-status ${loading ? 'loading' : 'error'}`}>
            {loading ? 'Loading live environmental data…' : error}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
