import React, { useState } from 'react';
import { Activity, ActivityOption } from '../types/trip';
import { PLACEHOLDER_IMG } from '../data/itinerary'; // Re-added import
import HikeDetailsDisplay from './HikeDetailsDisplay';
import { FaCar, FaCameraRetro, FaUtensils, FaHiking, FaBed, FaEye, FaMapMarkerAlt, FaInfoCircle, FaExternalLinkAlt, FaDirections } from 'react-icons/fa';
import activityDetailsData from '../data/activityDetails.json'; // Import the details JSON

// Define an interface for the structure of activity details
interface ActivityDetail {
  summary?: string;
  location?: string;
  hours?: string;
  tickets?: string;
  website?: string;
  notes?: string;
  source?: string;
}

// Type assertion for the imported JSON to specify the keys are strings and values are ActivityDetail
const activityDetails: { [key: string]: ActivityDetail } = activityDetailsData;

interface ActivityItemProps {
  activity: Activity;
  dayActivities: Activity[]; // All activities for the current day
  activityIndex: number;    // Index of this activity within the day
  previousLodgingCoords?: { lat: number; lng: number }; // Coords of previous night's lodging
}

// Helper function to get icon based on type
const getActivityIcon = (type: Activity['type']): React.ReactElement => {
  switch (type) {
    case 'drive': return <FaCar title="Drive" />;
    case 'activity': return <FaCameraRetro title="Activity" />;
    case 'food': return <FaUtensils title="Food" />;
    case 'hike': return <FaHiking title="Hike" />;
    case 'lodging': return <FaBed title="Lodging" />;
    case 'sightseeing': return <FaEye title="Sightseeing" />;
    default: return <FaMapMarkerAlt title="Location" />; // Default icon
  }
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, dayActivities, activityIndex, previousLodgingCoords }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State for expansion
  // State to track the selected option index, default to 0 if options exist
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(activity.options && activity.options.length > 0 ? 0 : -1);

  // Function to toggle expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get details for the current activity if available
  const details = activity.id ? activityDetails[activity.id] : undefined;

  // Basic error handling for image URLs - Re-added
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
  };

  // Handler for dropdown change
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOptionIndex(parseInt(event.target.value, 10));
  };

  // Determine if the activity is the primary lodging entry (has name, image etc.) 
  // vs a reference entry (like on Day 2 which refers back to Day 1)
  const isPrimaryLodging = activity.type === 'lodging' && !!activity.name;

  // --- Logic to find origin coordinates for directions ---
  const originCoords = React.useMemo(() => {
    if (activityIndex === 0) {
      return previousLodgingCoords;
    } else {
      for (let i = activityIndex - 1; i >= 0; i--) {
        if (dayActivities[i].coordinates) {
          return dayActivities[i].coordinates;
        }
      }
      // Fallback to previous lodging if no prior activity had coords (less likely)
      return previousLodgingCoords; 
    }
  }, [dayActivities, activityIndex, previousLodgingCoords]);

  // --- Construct Google Maps Directions URL ---
  const directionsUrl = React.useMemo(() => {
    if (originCoords && activity.coordinates) {
      return `https://www.google.com/maps/dir/?api=1&origin=${originCoords.lat},${originCoords.lng}&destination=${activity.coordinates.lat},${activity.coordinates.lng}`;
    }
    return undefined;
  }, [originCoords, activity.coordinates]);
  // --- End Directions Logic ---

  return (
    <div className={`activity-item activity-type-${activity.type}${isPrimaryLodging ? ' activity-lodging-primary' : ''}`}>
      <div className="activity-icon-time-wrapper">
        <span className="activity-icon">{getActivityIcon(activity.type)}</span>
        <span className="activity-time">{activity.time}</span>
      </div>
      <div className="activity-content">
        <strong>
          {isPrimaryLodging ? activity.name : activity.description}
          {/* Add Directions Link if URL exists */} 
          {directionsUrl && (
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="activity-link directions-link" title="Get Directions" style={{ marginLeft: '0.5em', verticalAlign: 'middle' }}>
              <FaDirections />
            </a>
          )}
          {activity.type === 'lodging' && activity.link && (
            <a href={activity.link} target="_blank" rel="noopener noreferrer" className="activity-link" title="View Booking" style={{ marginLeft: '0.5em', verticalAlign: 'middle' }}>
              <FaExternalLinkAlt />
            </a>
          )}
        </strong>

        {/* Add a button to toggle details if they exist */}
        {details && (
          <button onClick={toggleExpand} className="details-toggle-button" aria-expanded={isExpanded}>
            <FaInfoCircle /> {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        )}

        {/* Render lodging details if it's the primary lodging entry */}
        {isPrimaryLodging && (
          <div className="lodging-details">
            <p>{activity.location}</p>
            {/* Display image only for the primary lodging entry */}
            {activity.image && (
              <img
                src={activity.image}
                alt={activity.name || 'Lodging image'}
                className="activity-image lodging-image"
                onError={handleImageError}
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Render dropdown for options or standard details for other types */}
        {!isPrimaryLodging && activity.options && activity.options.length > 0 ? (
          <div className="activity-options-dropdown">
            <label htmlFor={`options-select-${activity.id || Math.random()}`} style={{ marginRight: '0.5em' }}>Choose Option:</label>
            <select
              id={`options-select-${activity.id || Math.random()}`}
              value={selectedOptionIndex}
              onChange={handleOptionChange}
            >
              {activity.options.map((option, index) => (
                <option key={index} value={index}>
                  {option.name}
                </option>
              ))}
            </select>
            {/* Display description of the selected option */}
            {selectedOptionIndex >= 0 && activity.options[selectedOptionIndex] && (
              <p className="option-description">
                {activity.options[selectedOptionIndex].description}
              </p>
            )}
            {/* Display image of the selected option */}
            {selectedOptionIndex >= 0 && activity.options[selectedOptionIndex]?.imageUrl && (
              <img
                src={activity.options[selectedOptionIndex].imageUrl}
                alt={activity.options[selectedOptionIndex].name}
                className="activity-image option-image" // Added option-image class for potential specific styling
                onError={handleImageError}
                loading="lazy"
              />
            )}
          </div>
        ) : (
          !isPrimaryLodging && activity.details && <p>{activity.details}</p>
        )}

        {/* Render hike details only if not primary lodging */}
        {!isPrimaryLodging && activity.hikeInfo && <HikeDetailsDisplay hikeInfo={activity.hikeInfo} />}

        {/* Conditionally render the fetched details */}
        {isExpanded && details && (
          <div className="activity-fetched-details">
            {details.summary && <p><strong>Summary:</strong> {details.summary}</p>}
            {details.location && <p><strong>Location:</strong> {details.location}</p>}
            {details.hours && <p><strong>Hours:</strong> {details.hours}</p>}
            {details.tickets && <p><strong>Tickets:</strong> {details.tickets}</p>}
            {details.notes && <p><strong>Notes:</strong> {details.notes}</p>}
            {details.website && <p><strong>Website:</strong> <a href={details.website} target="_blank" rel="noopener noreferrer">{details.website}</a></p>}
            {details.source && <p><small><em>Source: <a href={details.source} target="_blank" rel="noopener noreferrer">{details.source}</a></em></small></p>}
          </div>
        )}
        
        {/* Render map link only if not primary lodging (link handled separately) */}
        {!isPrimaryLodging && activity.mapLink && <a href={activity.mapLink} target="_blank" rel="noopener noreferrer" className="activity-link">View Map</a>}
        
        {/* Render generic image only if NOT primary lodging AND imageUrl exists */}
        {!isPrimaryLodging && activity.imageUrl && (
           <img
             src={activity.imageUrl}
             alt={activity.description}
             className="activity-image"
             onError={handleImageError} // Re-added error handler
             loading="lazy" // Add lazy loading for images
           />
         )}
      </div>
    </div>
  );
};

export default ActivityItem; 