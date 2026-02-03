import { Routes, Route } from "react-router-dom";

import { LoginPage } from "./views/LoginPage";
import { HomePage } from "./views/HomePage";
import { OnboardingPage } from "./views/OnboardingPage";
import { UserProvider } from "./models/UserContext";
import { Header } from "./views/Header";

function App() {
  return (
    <UserProvider>
      <Header />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Setup" element={<OnboardingPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
