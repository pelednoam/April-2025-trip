import React from 'react';
import { TripDay } from '../types/trip';
import ActivityItem from './ActivityItem';
import MapDisplay from './MapDisplay';

const TripDayCard: React.FC<{ dayData: TripDay }> = ({ dayData }) => {
  const activitiesWithCoords = dayData.activities.filter(act => !!act.coordinates);

  return (
    <div className="trip-day-card">
      <h2>Day {dayData.day}: {dayData.title}</h2>

      {activitiesWithCoords.length > 0 && (
        <MapDisplay activities={activitiesWithCoords} dayId={dayData.day} mapHeight="250px" />
      )}

      {dayData.activities.map((activity, index) => (
        <ActivityItem key={`${dayData.day}-${index}-${activity.description}`} activity={activity} />
      ))}
    </div>
  );
};

export default TripDayCard; 