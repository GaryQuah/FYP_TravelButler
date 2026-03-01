interface ItineraryCardProps {
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
}

const ItineraryCard = ({
  activity_name,
  start_time,
  end_time,
  description,
}: ItineraryCardProps) => {
  // Formatting the date and time for display
  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <h3 className="mb-0">
          <a className="text-dark text-decoration-none" href="#">
            {activity_name}
          </a>
        </h3>

        <div className="mb-2 text-muted">
          {formatTime(start_time)} - {formatTime(end_time)}
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
