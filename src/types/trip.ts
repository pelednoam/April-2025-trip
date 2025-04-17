export interface HikeInfo {
  length: string;
  difficulty: string;
  notes?: string;
  sourceUrl?: string;
}

// Define type for activity options
export interface ActivityOption {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Activity {
  id?: string;
  time: string;
  description: string;
  details?: string;
  type: 'drive' | 'activity' | 'food' | 'hike' | 'lodging' | 'sightseeing';
  mapLink?: string;
  imageUrl?: string;
  hikeInfo?: HikeInfo;
  coordinates?: { lat: number; lng: number };
  options?: ActivityOption[]; // Add the optional options array
}

export interface TripDay {
  day: number;
  title: string;
  activities: Activity[];
} 