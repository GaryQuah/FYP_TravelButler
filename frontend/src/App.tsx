import { Routes, Route } from "react-router-dom";

import { LoginPage } from "./views/LoginPage";
import { HomePage } from "./views/HomePage";
import { SuggestionsPage } from "./views/SuggestionsPage";
import AvailabilityPage from "./views/AvailabilityPage";
import { SettingsPage } from "./views/SettingsPage";
import {
  TripLayout,
  TripAssistancePage,
  TripItineraryPage,
  TripBudgetPage,
  TripPollPage,
  TripChatPage,
  TripDocumentPage,
} from "./views/Trip";

import { UserProvider } from "./models/UserContext";
import RequireAuth from "./components/auth/RequireAuth";

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Suggestions" element={<SuggestionsPage />} />
          <Route path="/availability/:trackerId" element={<AvailabilityPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Trip routes */}
          <Route path="/trip/:tripId" element={<TripLayout />}>
            <Route index element={<TripItineraryPage />} />
            <Route path="itinerary" element={<TripItineraryPage />} />
            <Route path="chat" element={<TripChatPage />} />
            <Route path="documents" element={<TripDocumentPage />} />
            <Route path="assistance" element={<TripAssistancePage />} />
            <Route path="budget" element={<TripBudgetPage />} />
            <Route path="poll" element={<TripPollPage />} />
          </Route>
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
