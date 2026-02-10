import { HomePageViewModel } from "../viewmodels/HomePageViewModel";

import Navbar from "../components/Navbar";
import Card from "../components/TripCard";

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
];

export function TripsPage() {
  const {} = HomePageViewModel();

  return (
    <>
      <div className="container">
        {/* Navigation */}
        <Navbar />

        {/* Featured trips */}
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
