interface CardProps {
  title: string;
  date: string;
  description: string;
}

const Card = ({ title, date, description }: CardProps) => {
  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <h3 className="mb-0">
          <a className="text-dark text-decoration-none" href="#">
            {title}
          </a>
        </h3>

        <div className="mb-2 text-muted">{date}</div>

        <p className="card-text mb-auto">{description}</p>

        <a href="#" className="mt-3">
          Continue reading
        </a>
      </div>
    </div>
  );
};

export default Card;
