import { Routes, Route } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { OnboardingPage } from "./pages/OnboardingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/Home" element={<HomePage />} />
      <Route path="/Setup" element={<OnboardingPage />} />
    </Routes>
  );
}

export default App;
