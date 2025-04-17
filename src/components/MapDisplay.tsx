import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression, LatLngTuple, latLng, LatLngBounds } from 'leaflet';
import { Activity } from '../types/trip';

interface MapDisplayProps {
  activities: Activity[];
  mapHeight?: string; // e.g., '300px'
  dayId: number; // Add dayId for unique keys
}

// Component to adjust map bounds to fit all markers
const FitBounds: React.FC<{ bounds?: LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      try {
        // Add a check to ensure bounds are valid before fitting
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] }); // Add padding
        }
      } catch (error) {
        console.error("Error fitting map bounds:", error);
      }
    }
  }, [bounds, map]);
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ activities, mapHeight = '300px', dayId }) => {
  const pointsWithData = activities
    .filter(act => act.coordinates)
    .map((act, index) => ({
      ...act,
      position: [act.coordinates!.lat, act.coordinates!.lng] as LatLngTuple,
      id: `${dayId}-${index}` // Create unique id for key prop
    }));

  const positions = pointsWithData.map(p => p.position);

  // Calculate center using leaflet's LatLngBounds
  const bounds = positions.length > 0 ? new LatLngBounds(positions) : undefined;
  const center: LatLngExpression = bounds ? bounds.getCenter() : [43.8, -72.7]; // Default center (approx Vermont)

  // Define Polyline options (color, weight)
  const polylineOptions = { color: 'red', weight: 3 }; // Using red to distinguish from overview map


  if (pointsWithData.length === 0) {
    return <div className="map-placeholder">No locations with coordinates for this day.</div>;
  }

  return (
    // Add key to MapContainer to force re-render if center/bounds change significantly, helps with some redraw issues
    <MapContainer key={dayId} center={center} zoom={8} style={{ height: mapHeight, width: '100%' }} scrollWheelZoom={false} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pointsWithData.map((activity) => (
          <Marker key={activity.id} position={activity.position}>
            <Tooltip>{activity.description}</Tooltip>
            <Popup>
              <strong>{activity.description}</strong><br />
              {activity.time}
              {activity.details && <><br /><em>{activity.details}</em></>}
              {activity.mapLink && <><br /><a href={activity.mapLink} target="_blank" rel="noopener noreferrer">Open Map Link</a></>}
            </Popup>
          </Marker>
      ))}
      {/* Add the Polyline if there are 2 or more points */}
      {positions.length >= 2 && (
        <Polyline pathOptions={polylineOptions} positions={positions} />
      )}
      {bounds && <FitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default MapDisplay; 