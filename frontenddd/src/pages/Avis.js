import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublicAvis } from "../services/api";
import { getStoredUser, hasStoredToken } from "../services/authService";
import "../Styles/Avis.css";

function Avis() {
  const scrollRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchPublicAvis();
        setReviews(Array.isArray(data) ? data : []);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Impossible de charger les avis pour le moment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const repeatedReviews = useMemo(() => {
    if (!reviews.length) {
      return [];
    }

    return [...reviews, ...reviews];
  }, [reviews]);

  const isAuthenticated = hasStoredToken();
  const currentUser = getStoredUser();
  const avisCtaPath =
    isAuthenticated && currentUser?.role === "client" ? "/mes-avis" : "/connexion";

  const scrollByCard = (direction) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="review-star">
        {star <= Number(rating || 0) ? "★" : "☆"}
      </span>
    ));

  const initialsFor = (name) =>
    String(name || "AA")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

  return (
    <section className="avis-page">
      <div className="avis-header">
        <h1 className="avis-title">Ce que nos clients disent de l&apos;experience AARSSI</h1>
        <p className="avis-subtitle">
          Plus de {reviews.length || 0} avis verifies laisses par nos clients
          depuis la plateforme.
        </p>
      </div>

      {loading ? (
        <div className="avis-feedback-state">
          <p>Chargement des avis...</p>
        </div>
      ) : error ? (
        <div className="avis-feedback-state">
          <p>{error}</p>
        </div>
      ) : reviews.length ? (
        <>
          <div className="reviews-container">
            <div className="reviews-scroll-wrapper-relative">
              <button
                type="button"
                className="scroll-arrow left"
                onClick={() => scrollByCard(-1)}
                aria-label="Avis precedents"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#C5A059"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="reviews-scroll-wrapper" ref={scrollRef}>
                {repeatedReviews.map((review, index) => (
                  <article className="review-card" key={`${review.id}-${index}`}>
                    <div className="review-profile-section">
                      <div className="reviewer-avatar-centered">
                        {review.provider_image ? (
                          <img
                            src={review.provider_image}
                            alt={review.provider_name}
                            className="profile-photo"
                          />
                        ) : (
                          <div className="profile-photo profile-photo-fallback">
                            {initialsFor(review.client_name)}
                          </div>
                        )}
                      </div>

                      <div className="reviewer-info-centered">
                        <h3 className="reviewer-name">{review.client_name}</h3>
                        <div className="reviewer-meta">
                          <span className="reviewer-profile">
                            {review.service_category || "Service"}
                          </span>
                          <span className="reviewer-city">• {review.client_city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-rating-bottom">{renderStars(review.rating)}</div>

                    <div className="review-content">
                      <p className="review-comment">
                        &quot;{review.comment || "Tres satisfait du service."}&quot;
                      </p>
                    </div>

                    <button type="button" className="voir-details-btn">
                      {review.provider_name}
                    </button>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className="scroll-arrow right"
                onClick={() => scrollByCard(1)}
                aria-label="Avis suivants"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#C5A059"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="avis-action">
            <Link to="/services" className="donner-avis-btn">
              Trouver Mon Prestataire
            </Link>
            <p className="avis-footer-text">
              vous avez deja utiliser AARSSI ?
              <Link to={avisCtaPath} className="avis-link">
                laisser un avis
              </Link>
            </p>
          </div>
        </>
      ) : (
        <div className="avis-feedback-state">
          <p>Aucun avis disponible pour le moment.</p>
        </div>
      )}
    </section>
  );
}

export default Avis;
