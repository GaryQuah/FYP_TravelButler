import { Routes, Route } from "react-router-dom";

import { LoginPage } from "./views/LoginPage";
import { HomePage } from "./views/HomePage";
import { SuggestionsPage } from "./views/SuggestionsPage";

import {
  TripLayout,
  TripChatPage,
  TripItineraryPage,
  TripBudgetPage,
  TripPollPage,
} from "./views/Trip";

import { UserProvider } from "./models/UserContext";

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Suggestions" element={<SuggestionsPage />} />

        {/* Trip routes */}
        <Route path="/trip/:tripId" element={<TripLayout />}>
          <Route index element={<TripItineraryPage />} />
          <Route path="itinerary" element={<TripItineraryPage />} />
          <Route path="chat" element={<TripChatPage />} />
          <Route path="budget" element={<TripBudgetPage />} />
          <Route path="poll" element={<TripPollPage />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
