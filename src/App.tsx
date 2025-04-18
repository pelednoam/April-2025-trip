import React, { useState } from 'react';
import './App.css';
import { tripItinerary } from './data/itinerary';
import TripDayCard from './components/TripDayCard';
import ItineraryMap from './components/ItineraryMap';

interface HikeInfo {
  length: string;
  difficulty: string;
  notes?: string;
  sourceUrl?: string;
}

interface Activity {
  time: string;
  description: string;
  details?: string;
  type: 'drive' | 'activity' | 'food' | 'hike' | 'lodging' | 'sightseeing';
  mapLink?: string;
  imageUrl?: string;
  hikeInfo?: HikeInfo;
}

interface TripDay {
  day: number;
  title: string;
  activities: Activity[];
}

// Placeholder Image URLs - Replace with actual, hosted images
const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x200.png?text=Image+Not+Found';

const HikeDetailsDisplay: React.FC<{ hikeInfo: HikeInfo }> = ({ hikeInfo }) => {
  return (
    <div className="hike-details">
      <h4>Hike Info:</h4>
      <p><strong>Length:</strong> {hikeInfo.length}</p>
      <p><strong>Difficulty:</strong> {hikeInfo.difficulty}</p>
      {hikeInfo.notes && <p><em>Notes:</em> {hikeInfo.notes}</p>}
      {hikeInfo.sourceUrl && (
        <p><a href={hikeInfo.sourceUrl} target="_blank" rel="noopener noreferrer">More Info</a></p>
      )}
    </div>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  // Basic error handling for image URLs
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
  };

  return (
    <div className={`activity-item activity-type-${activity.type}`}>
      <span className="activity-time">{activity.time}</span>
      <div className="activity-content">
        <strong>{activity.description}</strong>
        {activity.details && <p>{activity.details}</p>}
        {activity.hikeInfo && <HikeDetailsDisplay hikeInfo={activity.hikeInfo} />}
        {activity.mapLink && <a href={activity.mapLink} target="_blank" rel="noopener noreferrer" className="activity-link">View Map</a>}
        {activity.imageUrl && (
          <img
            src={activity.imageUrl}
            alt={activity.description}
            className="activity-image"
            onError={handleImageError} // Use placeholder if image fails to load
          />
         )}
      </div>
    </div>
  );
};

function App() {
  const [activeDay, setActiveDay] = useState<number>(1);

  const handleMarkerClick = (dayNumber: number) => {
    setActiveDay(dayNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const activeDayData = tripItinerary.find(day => day.day === activeDay);

  return (
    <div className="App">
      <ItineraryMap 
        itinerary={tripItinerary} 
        onMarkerClick={handleMarkerClick} 
      />
      <h1>April 2025 - New England Loop</h1>
      
      {/* Tab Navigation */}
      <div className="tabs">
        {tripItinerary.map(dayData => (
          <button 
            key={dayData.day} 
            className={`tab-button ${dayData.day === activeDay ? 'active' : ''}`}
            onClick={() => setActiveDay(dayData.day)}
          >
            Day {dayData.day}
          </button>
        ))}
      </div>

      {/* Content Area - Render only the active day's card */}
      <div className="tab-content">
        {activeDayData ? (
          <TripDayCard dayData={activeDayData} itinerary={tripItinerary} />
        ) : (
          <p>Select a day to view the itinerary.</p> 
        )}
      </div>
    </div>
  );
}

export default App;
