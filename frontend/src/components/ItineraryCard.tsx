interface ItineraryCardProps {
  // title: string;
  // date: string;
  // description: string;
  activity_name: string;
  start_time: string;
  end_time: string;
  description: string;
  //image: string;
}

const ItineraryCard = ({
  activity_name,
  start_time,
  end_time,
  description,
}: ItineraryCardProps) => {
  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <h3 className="mb-0">
          <a className="text-dark text-decoration-none" href="#">
            {activity_name}
          </a>
        </h3>

        <div className="mb-2 text-muted">
          {start_time} - {end_time}
        </div>

        <p className="card-text mb-auto">{description}</p>

        {/*TODO: Add image upload support for the trip card, and display the image here if it exists*/}
        <a href="#" className="mt-3">
          Continue reading
        </a>
      </div>
    </div>
  );
};

export default ItineraryCard;
