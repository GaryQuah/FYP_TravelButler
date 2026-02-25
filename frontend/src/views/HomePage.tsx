import { HomePageViewModel } from "../viewmodels/HomePageViewModel";

import Navbar from "../components/Navbar";
import Card from "../components/TripCard";

//TODO: Migrate these static data into the database & import from there
const cardsData = [
  {
    id: 1,
    title: "Singapore",
    date: "Nov 12",
    description: "This is a wider card with supporting text below.",
  },
  {
    id: 2,
    title: "Malaysia",
    date: "Nov 14",
    description: "Another example of supporting text.",
  },
  {
    id: 3,
    title: "Japan",
    date: "Nov 15",
    description: "Another example of supporting text.",
  },
  {
    id: 4,
    title: "Something else",
    date: "Nov 16",
    description: "Another example of supporting text.",
  },
  {
    id: 5,
    title: "Something else",
    date: "Nov 16",
    description: "Another example of supporting text.",
  },
];

const {} = HomePageViewModel();

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

      <div className="container">
        {/* User's current trips */}
        <div className="row mb-4">
          {cardsData.map((card) => (
            <div key={card.id} className="col-md-6">
              <Card
                title={card.title}
                date={card.date}
                description={card.description}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-top mt-5">
        <a href="#">Back to top</a>
      </footer>
    </>
  );
}
