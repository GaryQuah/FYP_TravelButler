import React from "react";
import "../../assets/css/FeatureCard.css";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <h6>{title}</h6>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
