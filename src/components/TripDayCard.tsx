import React from 'react';
import { TripDay, Activity } from '../types/trip';
import ActivityItem from './ActivityItem';
import MapDisplay from './MapDisplay';

interface TripDayCardProps {
  dayData: TripDay;
  itinerary: TripDay[]; // Add full itinerary to props
}

const TripDayCard: React.FC<TripDayCardProps> = ({ dayData, itinerary }) => {
  const activitiesWithCoords = dayData.activities.filter(act => !!act.coordinates);

  const homeLocation: Activity = {
    time: '',
    description: 'Home (Cambridge, MA)',
    type: 'drive',
    coordinates: { lat: 42.3736, lng: -71.1097 },
    id: 'home-start'
  };

  const activitiesForMap = dayData.day === 1
    ? [homeLocation, ...activitiesWithCoords]
    : activitiesWithCoords;

  // --- Find coordinates of the previous day's lodging --- 
  const previousLodgingCoords = React.useMemo(() => {
    if (dayData.day === 1) {
      // For Day 1, the 'previous lodging' is home.
      return homeLocation.coordinates;
    } else {
      // Find the previous day's data
      const previousDay = itinerary.find(day => day.day === dayData.day - 1);
      if (previousDay) {
        // Find the primary lodging activity in the previous day
        const lodgingActivity = previousDay.activities.find(act => act.type === 'lodging' && act.coordinates && !!act.name);
        if (lodgingActivity) {
          return lodgingActivity.coordinates;
        }
      }
    }
    return undefined; // No previous lodging coords found
  }, [dayData.day, itinerary, homeLocation.coordinates]);
  // --- End previous lodging logic ---

  return (
    <div className="trip-day-card">
      <h2>Day {dayData.day}: {dayData.title}</h2>

      {activitiesForMap.length > 0 && (
        <MapDisplay activities={activitiesForMap} dayId={dayData.day} mapHeight="250px" />
      )}

      {/* Map over activities and pass necessary props to ActivityItem */}
      {dayData.activities.map((activity, index) => (
        <ActivityItem 
          key={`${dayData.day}-${index}-${activity.description}`} 
          activity={activity} 
          dayActivities={dayData.activities} // Pass all activities of the current day
          activityIndex={index} // Pass the index of the current activity
          previousLodgingCoords={previousLodgingCoords} // Pass the calculated coords
        />
      ))}
    </div>
  );
};

export default TripDayCard; 