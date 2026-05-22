import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Services.css";

function PrestataireCard({
  nomEntreprise,
  adresse,
  categorie,
  primaryService,
  rating,
  reviews = 0,
  image = "",
}) {
  const targetPath = primaryService?.id ? `/service/${primaryService.id}` : "/services";
  const displayName = primaryService?.name || nomEntreprise;

  return (
    <Link to={targetPath} className="service-card-link">
      <article className="service-card prestataire-card">
        <div className="card-image">
          {image ? (
            <img
              src={image}
              alt={nomEntreprise}
              className="gallery-img"
              loading="lazy"
            />
          ) : (
            <div className="gallery-img service-card-image-empty" aria-hidden="true" />
          )}
          <p className="card-category-overlay">
            {categorie || primaryService?.category || "Service"}
          </p>
        </div>

        <div className="card-content">
          <h3 className="card-title">{displayName}</h3>
          <p className="card-location">{adresse}</p>

          <div className="card-rating">
            <span className="stars">
              {"*".repeat(Math.max(1, Math.floor(Number(rating || 0))))}
            </span>
            <span className="rating-value">{Number(rating || 0).toFixed(1)}</span>
            <span className="rating-count">({reviews} avis)</span>
          </div>

          <div className="card-footer">
            <div className="price-container">
              <span className="price-label">A partir de</span>
              <span className="price-tag">
                {Number(primaryService?.price || 0).toLocaleString("fr-FR")} MAD
              </span>
            </div>
            <div className="view-details-btn">Voir</div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PrestataireCard;
