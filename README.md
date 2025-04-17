## Project Overview: Trip Itinerary Planner

This React application displays a detailed multi-day trip itinerary, featuring interactive maps for both the overall trip and individual days.

### Key Features

*   **Data-Driven Itinerary:** The entire trip plan is sourced from JSON files, making it easy to update or change the itinerary.
*   **Interactive Maps:**
    *   **Overview Map:** An interactive Leaflet map at the top shows the entire trip route, connecting all key locations with markers and a polyline. Clicking a marker scrolls the page to the corresponding day's details.
    *   **Daily Maps:** Each day's card includes a smaller map displaying only that day's activities with coordinates, connected by a distinct route line.
*   **Detailed Daily Breakdown:** Each day is presented in a card format, listing activities chronologically.
*   **Activity Details:** Each activity shows its time, description, and type (indicated by an icon). Optional details like notes, images, map links, and specific hike information (length, difficulty, external links) are also displayed.
*   **Optional Activities:** Activities with multiple choices (like optional hikes or walks) are presented with a dropdown menu, allowing the user to view the description and image for each option.
*   **Supplemental Information:** Certain activities can display additional fetched details (summary, location, hours, tickets, website) in an expandable section.
*   **Responsive Design:** Basic CSS is included for layout and styling.

### Project Structure

```
src/
├── App.css                # Main application styles
├── App.tsx                # Main application component, layout, and routing logic
├── index.css              # Global styles
├── index.tsx              # Application entry point
├── components/            # React components
│   ├── ActivityItem.tsx       # Displays a single activity item in the list
│   ├── HikeDetailsDisplay.tsx # Displays specific details for hike activities
│   ├── ItineraryMap.tsx       # Displays the main overview map for the entire trip
│   ├── MapDisplay.tsx         # Displays the map for a single day's activities
│   └── TripDayCard.tsx        # Displays the card for a single day, including map and activities
├── data/                  # Data files for the itinerary
│   ├── activityDetails.json # Supplemental details for specific activities (keyed by activity ID)
│   ├── imageUrls.json       # Key-value store mapping image keys to actual image URLs
│   ├── itinerary.ts         # Processes raw JSON data, resolves URLs, and exports the final itinerary
│   ├── trailUrls.json       # Key-value store mapping trail keys to actual trail info URLs
│   └── tripData.json        # The core itinerary data defining days and activities
└── types/                 # TypeScript type definitions
    └── trip.ts              # Defines interfaces for TripDay, Activity, HikeInfo, etc.
```

### Data Flow

1.  Raw itinerary data is defined in `src/data/tripData.json`.
2.  Image URLs, trail URLs, and supplemental activity details are stored in `src/data/imageUrls.json`, `src/data/trailUrls.json`, and `src/data/activityDetails.json` respectively.
3.  `src/data/itinerary.ts` imports these raw JSON files. It processes `tripData.json`, using keys like `imageUrlKey` and `trailUrlKey` to look up and embed the actual URLs from the corresponding JSON files into the final data structure. It exports the processed `tripItinerary` array.
4.  `src/App.tsx` imports `tripItinerary` and passes it to the main `ItineraryMap` component and also iterates over it to render `TripDayCard` components for each day.
5.  `TripDayCard.tsx` receives data for one day (`dayData`). It passes the activities with coordinates to `MapDisplay.tsx` and iterates through all activities, passing each one to `ActivityItem.tsx`.
6.  `ActivityItem.tsx` receives a single activity object. It displays the basic information. If the activity has an `id`, it looks up additional details in the imported `activityDetails.json` data and displays them in an expandable section. If the activity has `options`, it renders a dropdown to select and view details/images for each option. If it has `hikeInfo`, it renders `HikeDetailsDisplay.tsx`.
7.  `ItineraryMap.tsx` receives the full `tripItinerary` and renders the overview map.
8.  `MapDisplay.tsx` receives only the activities for a specific day and renders the daily map.

### Map Implementation

*   **Library:** `react-leaflet` is used as a wrapper around the Leaflet mapping library.
*   **Overview Map (`ItineraryMap.tsx`):** Displays markers for all activities across all days that have coordinates, plus a "Home" marker. Connects these with a blue `Polyline`. Fits the map bounds to show all markers. Handles marker clicks to scroll the page.
*   **Daily Map (`MapDisplay.tsx`):** Displays markers only for the activities of the current day that have coordinates. Connects these with a red `Polyline`. Fits the map bounds to the daily markers.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
