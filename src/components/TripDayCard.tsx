import React from 'react';
import { TripDay, Activity } from '../types/trip';
import ActivityItem from './ActivityItem';
import MapDisplay from './MapDisplay';

interface TripDayCardProps {
  dayData: TripDay;
  itinerary: TripDay[]; // Add full itinerary to props
}

const TripDayCard: React.FC<TripDayCardProps> = ({ dayData, itinerary }) => {
  // Define home location (used as potential start point)
  const homeLocation: Activity = {
    time: '',
    description: 'Home (Cambridge, MA)',
    type: 'drive', // Type doesn't matter much here
    coordinates: { lat: 42.3736, lng: -71.1097 },
    id: 'home-start'
  };

  // --- Find coordinates of the previous day's lodging OR home --- 
  const previousLodgingCoords = React.useMemo(() => {
    if (dayData.day === 1) {
      return homeLocation.coordinates;
    } else {
      const previousDay = itinerary.find(day => day.day === dayData.day - 1);
      const lodgingActivity = previousDay?.activities.find(act => act.type === 'lodging' && act.coordinates && !!act.name);
      return lodgingActivity?.coordinates;
    }
  }, [dayData.day, itinerary, homeLocation.coordinates]);

  // --- Determine the actual starting location object for the map ---
  const startLocation = React.useMemo(() => {
    if (dayData.day === 1) {
      return homeLocation;
    } else {
      // Find the previous day's lodging activity itself
      const previousDay = itinerary.find(day => day.day === dayData.day - 1);
      const lodgingActivity = previousDay?.activities.find(act => act.type === 'lodging' && act.coordinates && !!act.name);
      if (lodgingActivity) {
        // Create a simplified activity object for the map start point
        return { 
            ...lodgingActivity, 
            time: '', // Time isn't relevant for start point
            description: `Start: ${lodgingActivity.name}`, // Clarify it's the start
            id: `${lodgingActivity.id || lodgingActivity.name}-start`
        };
      }
    }
    return undefined; // Should ideally not happen if previousLodgingCoords logic is sound
  }, [dayData.day, itinerary, homeLocation]);

  // --- Prepare activities for the MapDisplay: Start point + all day activities ---
  const activitiesForMap = React.useMemo(() => {
    const activities = [...dayData.activities];
    if (startLocation) {
        // Add start location to the beginning ONLY IF it has coords
        if (startLocation.coordinates) {
            return [startLocation, ...activities];
        }
    }
    return activities; // Return day's activities if no start location found
  }, [dayData.activities, startLocation]);

  return (
    <div className="trip-day-card">
      <h2>Day {dayData.day}: {dayData.title}</h2>

      {/* Pass the combined list to MapDisplay */}
      {activitiesForMap.filter(a => !!a.coordinates).length > 0 ? (
        <MapDisplay activities={activitiesForMap} dayId={dayData.day} mapHeight="250px" />
      ) : (
        <div className="map-placeholder">No map available for this day.</div>
      )}

      {/* Map over original activities and pass necessary props to ActivityItem */}
      {dayData.activities.map((activity, index) => (
        <ActivityItem 
          key={`${dayData.day}-${index}-${activity.description}`} 
          activity={activity} 
          dayActivities={dayData.activities} 
          activityIndex={index} 
          previousLodgingCoords={previousLodgingCoords} 
        />
      ))}
    </div>
  );
};

export default TripDayCard; 