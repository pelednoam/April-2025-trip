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
        // Include activity, hike, sightseeing, AND lodging types if they have coordinates
        .filter(activity => activity.coordinates && 
            (activity.type === 'activity' || 
             activity.type === 'hike' || 
             activity.type === 'sightseeing' ||
             (activity.type === 'lodging' && !!activity.name) // Only include primary lodging entries with names
            )
         )
        .map(activity => ({ ...activity, dayNumber: day.day }))
    );

    if (currentDay !== undefined && currentDay > 0) {
      // --- Daily View ---
      // Filter activities for the current day
      const dailyActivities = allMapActivities.filter(loc => loc.dayNumber === currentDay);
      
      // Add lodging for the current day IF it exists and has coordinates
      const todaysLodging = itinerary
        .find(day => day.day === currentDay)?.activities
        .find(act => act.type === 'lodging' && act.coordinates);

      let combinedDaily = [...dailyActivities];
      if (todaysLodging && !dailyActivities.some(act => act.id === todaysLodging.id)) {
        combinedDaily.push({ ...todaysLodging, dayNumber: currentDay });
      }
      // Optionally find lodging from previous day if current day doesn't have primary one?
      // For now, keeps it simple.

      return combinedDaily;

    } else {
      // --- Full Trip Overview ---
      // Add Home manually only for the full overview map
       const homeLocation: MapLocation = {
            dayNumber: 0, // Use 0 for the start/end point
            description: "Home (Cambridge, MA)",
            time: '',
            type: 'activity', // Keep type as activity for consistency?
            coordinates: { lat: 42.3736, lng: -71.1097 },
       };
      // Combine home with all activities (including lodging) for the overview
      return [homeLocation, ...allMapActivities];
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
            // Optional: Use a different icon for lodging?
            // icon={location.type === 'lodging' ? lodgingIcon : undefined}
          >
            <Tooltip>
              {location.type === 'lodging' ? `Night${location.nights && location.nights.length > 1 ? 's' : ''} ${location.nights?.join(' & ')} Lodging: ` : (location.dayNumber > 0 ? `Day ${location.dayNumber}: ` : '')}
              {location.name || location.description} {/* Use lodging name if available */}
             </Tooltip>
            <Popup>
              <strong>{location.name || location.description}</strong>
              {location.location && <p>{location.location}</p>} {/* Show location for lodging */}
              {location.details && !location.location && <p>{location.details}</p>} {/* Show details if not lodging */}
              {location.link && location.type === 'lodging' && <a href={location.link} target="_blank" rel="noopener noreferrer">View Booking</a>} {/* Lodging Link */}
              {location.mapLink && location.type !== 'lodging' && <a href={location.mapLink} target="_blank" rel="noopener noreferrer">View Map</a>} {/* Non-lodging Map Link */}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default ItineraryMap; 