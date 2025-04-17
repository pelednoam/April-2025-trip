import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import mapLocations from '../data/mapLocations.json'; // Removed import
import { TripDay, Activity } from '../types/trip'; // Need TripDay and Activity types

// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define a type for the location data used internally by the map
interface MapLocation extends Activity {
  dayNumber: number;
}

interface ItineraryMapProps {
  itinerary: TripDay[]; // Accept the full itinerary again
  onMarkerClick: (dayNumber: number) => void;
  currentDay?: number; // Optional: Filter map to only this day
}

// Helper component to set map bounds
const SetBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30] }); // Add some padding
    }
  }, [map, bounds]);
  return null; // This component doesn't render anything
};

const ItineraryMap: React.FC<ItineraryMapProps> = ({ itinerary, onMarkerClick, currentDay }) => {

  // Filter locations based on whether currentDay is provided
  const locations: MapLocation[] = React.useMemo(() => {
    const allMapActivities = itinerary.flatMap(day =>
      day.activities
        .filter(activity => activity.coordinates && (activity.type === 'activity' || activity.type === 'hike' || activity.type === 'sightseeing'))
        .map(activity => ({ ...activity, dayNumber: day.day }))
    );

    if (currentDay !== undefined && currentDay > 0) {
      // --- Daily View ---
      // Filter activities for the current day
      const dailyActivities = allMapActivities.filter(loc => loc.dayNumber === currentDay);
      // Simple approach: Return just the day's activities.
      // Consider edge cases: what if a day has 0 or 1 point? Bounds/Polyline might need adjustment.
      return dailyActivities;

    } else {
      // --- Full Trip Overview ---
      // Add Home manually only for the full overview map
       const homeLocation: MapLocation = {
            dayNumber: 0, // Use 0 for the start/end point
            description: "Home (Cambridge, MA)",
            time: '',
            type: 'activity',
            coordinates: { lat: 42.3736, lng: -71.1097 },
       };
      // Combine home with all activities for the overview
      return [homeLocation, ...allMapActivities];
      // Potentially add Home again at the end if Day 4 ends there explicitly in data?
      // For now, keeping existing logic which connects back to start.
    }
  }, [itinerary, currentDay]);

  // Calculate bounds from the filtered locations (Moved BEFORE early return)
  const bounds = React.useMemo(() => {
     const validLocations = locations.filter(loc => loc.coordinates);
     if (!validLocations.length) return null;
     return L.latLngBounds(validLocations.map(loc => [loc.coordinates!.lat, loc.coordinates!.lng]));
  }, [locations]);

  // Handle case with only one point (don't draw polyline or fit bounds aggressively)
  const hasMultiplePoints = locations.length > 1;

  // Extract positions for the Polyline from filtered locations (Moved BEFORE early return)
  const polylinePositions: L.LatLngExpression[] = React.useMemo(() => {
    if (!hasMultiplePoints) return [];
    const positions = locations
      .filter(loc => loc.coordinates)
      .map(loc => [loc.coordinates!.lat, loc.coordinates!.lng] as L.LatLngExpression);
    if (currentDay === undefined && positions.length > 0 && locations[0]?.coordinates) {
       positions.push([locations[0].coordinates.lat, locations[0].coordinates.lng]);
    }
    return positions;
  }, [locations, currentDay, hasMultiplePoints]);

  // Early return check (Now AFTER all top-level hooks)
  if (!locations || locations.length === 0) { // Need at least 1 location for daily map
     return <div>No map locations found for {currentDay ? `Day ${currentDay}` : 'this itinerary'}.</div>;
  }

  // Define Polyline options (color, weight)
  const polylineOptions = { color: 'blue', weight: 3 };

  // Handle cases where bounds might not be calculable (e.g., no locations)
  // This check might be less critical now as bounds calculation handles empty locations
  // if (!bounds && hasMultiplePoints) {
  //    console.warn("Could not calculate map bounds.");
  // }

  return (
    // Use key to force remount when currentDay changes, ensuring bounds recalculate properly
    <MapContainer key={currentDay ?? 'overview'} scrollWheelZoom={true} style={{ height: '400px', width: '100%' }} center={bounds ? undefined : [43.5, -72.5]} zoom={bounds ? undefined : 7}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bounds && <SetBounds bounds={bounds} />}
      {hasMultiplePoints && polylinePositions.length > 1 && <Polyline pathOptions={polylineOptions} positions={polylinePositions} />}
      {locations.map((location) => (
        // Ensure coordinates exist before rendering marker
        location.coordinates && (
          <Marker
            // Use a more robust key if description isn't unique enough, maybe include activity id if available
            key={`${location.dayNumber}-${location.id || location.description}`}
            position={[location.coordinates.lat, location.coordinates.lng]}
            eventHandlers={{
              click: () => {
                // Only trigger navigation if it's not the 'Home' marker or if overview map allows it
                 if (location.dayNumber > 0) {
                   onMarkerClick(location.dayNumber);
                 }
              },
            }}
          >
            <Tooltip>{location.dayNumber > 0 ? `Day ${location.dayNumber}: ` : ''}{location.description}</Tooltip>
            <Popup>
              <strong>{location.description}</strong>
              {location.details && <p>{location.details}</p>}
              {location.mapLink && <a href={location.mapLink} target="_blank" rel="noopener noreferrer">View Map</a>}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default ItineraryMap; 