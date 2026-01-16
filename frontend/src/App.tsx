import { useState } from "react";
import { LoginPage } from "./components/LoginPage.tsx";
/*import { SearchPage } from './components/SearchPage';
import { TravelDiary } from './components/TravelDiary';*/

type Page = "login" | "search" | "diary";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    setUser(email);
    setCurrentPage("search");
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // If user is not logged in, always show LoginPage
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render pages based on currentPage
  return (
    <div>
      {/* Example nav */}
      <nav className="flex gap-4 p-4 bg-gray-100">
        <button onClick={() => handleNavigate("search")}>Search</button>
        <button onClick={() => handleNavigate("diary")}>Travel Diary</button>
        <button
          onClick={() => {
            setUser(null); // logout
            setCurrentPage("login");
          }}
        >
          Logout
        </button>
      </nav>

      <main className="p-4">
        {currentPage === "search" && (
          <div>
            <h2>Search Page</h2>
            {/* <SearchPage /> */}
          </div>
        )}
        {currentPage === "diary" && (
          <div>
            <h2>Travel Diary</h2>
            {/* <TravelDiary /> */}
          </div>
        )}
      </main>
    </div>
  );
}
