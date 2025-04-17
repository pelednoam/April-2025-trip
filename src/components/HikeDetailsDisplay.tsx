import React from 'react';
import { HikeInfo } from '../types/trip';

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

export default HikeDetailsDisplay; 