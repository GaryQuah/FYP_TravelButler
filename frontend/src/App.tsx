import { Routes, Route } from "react-router-dom";

import { LoginPage } from "./views/LoginPage";
import { HomePage } from "./views/HomePage";
import { OnboardingPage } from "./views/OnboardingPage";
import { TripsPage } from "./views/TripsPage";
import { SuggestionsPage } from "./views/SuggestionsPage";

import { UserProvider } from "./models/UserContext";

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Setup" element={<OnboardingPage />} />
        <Route path="/Trips" element={<TripsPage />} />
        <Route path="/Suggestions" element={<SuggestionsPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
