import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Services.css';

function ServiceCard({ id, title, category, location, rating, price, image, reviews }) {
  const reviewCount = reviews || Math.floor(Math.random() * 200) + 50; // Fallback for demo
  const categoryLabel =
    typeof category === "object"
      ? category?.name || category?.title || category?.slug || "Service"
      : category || "Service";
  
  return (
    <Link to={`/service/${id}`} className="service-card-link">
      <div className="service-card">
        <div className="card-image">
          <img src={image} alt={title} className="gallery-img" loading="lazy" />
          <span className="category-tag">{categoryLabel}</span>
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          <p className="card-location">📍 {location}</p>
          
          <div className="card-rating">
            <span className="stars">{"★".repeat(Math.floor(rating))}</span>
            <span className="rating-value">{rating}</span>
            <span className="rating-count">({reviewCount}+ Avis)</span>
          </div>

          <div className="card-footer">
            <div className="price-container">
              <span className="price-label">À partir de</span>
              <span className="price-tag">{price.toLocaleString()} MAD</span>
            </div>
            <div className="view-details-btn">
              Voir ↗
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;
