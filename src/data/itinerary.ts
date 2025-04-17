import { TripDay, Activity, HikeInfo } from '../types/trip';
import rawTripData from './tripData.json';
import imageUrls from './imageUrls.json';
import trailUrls from './trailUrls.json';

// Define types for the raw JSON data structure (optional but good practice)
interface RawHikeInfo {
  length: string;
  difficulty: string;
  notes?: string;
  trailUrlKey?: keyof typeof trailUrls; // Reference key
}

// Define type for the options array elements
interface RawActivityOption {
  name: string;
  description: string;
  imageUrlKey?: keyof typeof imageUrls | null; // Added optional image key
}

interface RawActivity {
  id?: string; // Add optional ID from JSON
  time: string;
  description: string;
  details?: string;
  type: 'drive' | 'activity' | 'food' | 'hike' | 'lodging' | 'sightseeing';
  mapLink?: string | null;
  imageUrlKey?: keyof typeof imageUrls; // Reference key
  coordinates?: { lat: number; lng: number } | null;
  hikeInfo?: RawHikeInfo | null;
  options?: RawActivityOption[] | null; // Add the optional options field
}

interface RawTripDay {
  day: number;
  title: string;
  activities: RawActivity[];
}

// Type assertion for the imported JSON
const typedRawTripData = rawTripData as RawTripDay[];

// Process the raw data to create the final typed itinerary
export const tripItinerary: TripDay[] = typedRawTripData.map(rawDay => ({
  ...rawDay,
  activities: rawDay.activities.map(rawActivity => {
    // Resolve image URL
    const imageUrl = rawActivity.imageUrlKey ? imageUrls[rawActivity.imageUrlKey] : undefined;

    // Resolve hike info source URL
    let hikeInfo: HikeInfo | undefined = undefined;
    if (rawActivity.hikeInfo) {
      const sourceUrl = rawActivity.hikeInfo.trailUrlKey ? trailUrls[rawActivity.hikeInfo.trailUrlKey] : undefined;
      hikeInfo = {
        ...rawActivity.hikeInfo,
        sourceUrl: sourceUrl,
      };
    }

    // Handle the options array, resolving image URLs
    const options = rawActivity.options?.map(option => ({
      ...option,
      imageUrl: option.imageUrlKey ? imageUrls[option.imageUrlKey] : undefined,
    })) ?? undefined;

    // Construct the final Activity object
    return {
      ...rawActivity,
      imageUrl: imageUrl,
      hikeInfo: hikeInfo,
      options: options, // Include the options field
      // Ensure coordinates are passed correctly (handle potential null)
      coordinates: rawActivity.coordinates ?? undefined,
      mapLink: rawActivity.mapLink ?? undefined,
    } as Activity; // Assert type here
  }),
}));

// Export the placeholder image URL (sourced from the JSON)
export const PLACEHOLDER_IMG = imageUrls.placeholder; 