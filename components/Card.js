import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ icon, title, description, to }) => {
  return (
    <Link to={to} className="card">
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </Link>
  );
};

export default Card;