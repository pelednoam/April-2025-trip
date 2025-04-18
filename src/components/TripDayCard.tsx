import React from 'react';
import { TripDay, Activity } from '../types/trip';
import ActivityItem from './ActivityItem';
import MapDisplay from './MapDisplay';

const TripDayCard: React.FC<{ dayData: TripDay }> = ({ dayData }) => {
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

  return (
    <div className="trip-day-card">
      <h2>Day {dayData.day}: {dayData.title}</h2>

      {activitiesForMap.length > 0 && (
        <MapDisplay activities={activitiesForMap} dayId={dayData.day} mapHeight="250px" />
      )}

      {dayData.activities.map((activity, index) => (
        <ActivityItem key={`${dayData.day}-${index}-${activity.description}`} activity={activity} />
      ))}
    </div>
  );
};

export default TripDayCard; 