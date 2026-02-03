import { HomePageViewModel } from "../viewmodels/HomePageViewModel";
import "../assets/css/HomePage.css";

export function HomePage() {
  const {} = HomePageViewModel();

  return (
    <div className="home-container" style={{ marginTop: "60px" }}>
      <h1 className="title">Welcome to Home Page</h1>
    </div>
  );
}
