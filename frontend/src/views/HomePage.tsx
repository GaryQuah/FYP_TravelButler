import { HomePageViewModel } from "../viewmodels/HomePageViewModel";

import Navbar from "../components/Navbar";

export function HomePage() {
  const {} = HomePageViewModel();

  return (
    <>
      <div className="container">
        {/* Navigation */}
        <Navbar />

        {/*Main text section */}
        <div className="p-4 p-md-5 mb-4 text-white rounded bg-dark">
          <div className="col-md-6 px-0">
            <h1 className="display-5 fst-italic">Welcome to TravelMate</h1>
            <p className="lead my-3">
              Plan, collaborate with friends, and explore smarter ✈️
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-top mt-5">
        <a href="#">Back to top</a>
      </footer>
    </>
  );
}
