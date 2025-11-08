import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllActiveDisasters } from '../services/nasaAPI';

const DisasterContext = createContext();

export function DisasterProvider({ children }) {
  const [disasters, setDisasters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  // Fetch disasters on mount and every 5 minutes
  useEffect(() => {
    fetchDisasters();
    const interval = setInterval(fetchDisasters, 5 * 60 * 1000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const fetchDisasters = async () => {
    setIsLoading(true);
    try {
      const data = await getAllActiveDisasters();
      setDisasters(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching disasters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for chatbot
  const getDisastersNearLocation = (lat, lon, radiusMiles = 100) => {
    return disasters
      .map(disaster => {
        if (!disaster.coordinates) return null;
        
        const distance = calculateDistance(
          lat, lon,
          disaster.coordinates.lat,
          disaster.coordinates.lon
        );
        
        return { ...disaster, distance };
      })
      .filter(d => d && d.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  };

  const getDisastersByType = (category, lat = null, lon = null, radiusMiles = 50) => {
    let filtered = disasters.filter(d => 
      d.category.toLowerCase().includes(category.toLowerCase())
    );

    if (lat && lon) {
      filtered = filtered
        .map(disaster => {
          if (!disaster.coordinates) return null;
          
          const distance = calculateDistance(
            lat, lon,
            disaster.coordinates.lat,
            disaster.coordinates.lon
          );
          
          return { ...disaster, distance };
        })
        .filter(d => d && d.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  };

  const value = {
    disasters,
    userLocation,
    isLoading,
    lastUpdated,
    fetchDisasters,
    getDisastersNearLocation,
    getDisastersByType
  };

  return (
    <DisasterContext.Provider value={value}>
      {children}
    </DisasterContext.Provider>
  );
}

export function useDisasters() {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisasters must be used within DisasterProvider');
  }
  return context;
}

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

