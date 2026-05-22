import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchServiceById } from "../services/api";
import "../Styles/ProviderProfile.css";

const getCategoryLabel = (category) => {
  if (typeof category === "object") {
    return category?.name || category?.title || category?.slug || "Service";
  }

  return category || "Service";
};

function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadService = async () => {
      setLoading(true);

      try {
        const serviceData = await fetchServiceById(id);

        if (!serviceData) {
          navigate("/services");
          return;
        }

        if (isMounted) {
          setService(serviceData);
        }
      } catch (error) {
        navigate("/services");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleReservation = () => {
    navigate(`/reservation/${id}`);
  };

  if (loading || !service) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: "center", padding: "100px", color: "#666" }}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div
        className="profile-hero"
        style={{
          backgroundImage: `url(${
            service.image ||
            "https://images.unsplash.com/flagged/photo-1576485436509-a7d286952b65?q=80&w=1200&auto=format&fit=crop"
          })`,
        }}
      >
        <div className="hero-overlay" />
      </div>

      <div className="profile-info-card">
        <div className="info-main">
          <h1 className="provider-name">{service.name}</h1>
          <p className="provider-location">
            📍 {service?.provider?.city || service?.provider?.address || "Maroc"}
          </p>
          
        </div>

        <div className="info-stats">
          <div className="stat-item">
            <span className="stars">
              {"★".repeat(Math.max(1, Math.floor(Number(service.rating || 0))))}
            </span>
            <span className="rating-text">
              {Number(service.rating || 0).toFixed(1)} ({service?.reviews?.length || "0"} Avis)
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="price-value">
              {Number(service.price || 0).toLocaleString("fr-FR")} MAD
            </span>
            <span className="price-label">À PARTIR DE</span>
          </div>
        </div>

        <button className="book-now-btn" onClick={handleReservation}>
          RÉSERVER MAINTENANT
        </button>
      </div>

      <div className="profile-content-container">
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            DÉTAILS
          </button>
          <button
            className={`tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            GALERIE
          </button>
          <button
            className={`tab-btn ${activeTab === "map" ? "active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            LOCALISATION
          </button>
        </div>

        {activeTab === "details" ? (
          <div className="details-section">
            <div className="description-container">
              <h2 className="section-title">À propos de ce service</h2>
              <p className="description-text">
                {service.description ||
                  "Découvrez nos services exceptionnels pour rendre votre événement special et inoubliable. Notre equipe d'experts s'engage a fournir un service de qualite superieure adapte a vos besoins specifiques."}
              </p>
            </div>

            <div className="info-grid-premium">
              <div className="info-box-premium">
                <h4>Type de service</h4>
                <p>{getCategoryLabel(service?.category)}</p>
              </div>
              <div className="info-box-premium">
                <h4>Ville</h4>
                <p>{service?.provider?.city || service?.provider?.address || "Maroc"}</p>
              </div>
              <div className="info-box-premium">
                <h4>Disponibilité</h4>
                <p>Sur réservation</p>
              </div>
              <div className="info-box-premium">
                <h4>Prix de base</h4>
                <p>{Number(service.price || 0).toLocaleString("fr-FR")} MAD</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "gallery" ? (
          <div className="gallery-section-premium">
            <h2 className="section-title">Notre Galerie</h2>
            <div className="gallery-grid-premium">
              {(service.gallery?.length
                ? service.gallery
                : [
                    service.image ||
                      "https://images.unsplash.com/flagged/photo-1576485436509-a7d286952b65?q=80&w=1200&auto=format&fit=crop",
                  ]
              ).map((image, index) => (
                <div key={index} className="gallery-item-premium">
                  <img src={image} alt={`${service.name} ${index + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "map" ? (
          <div className="map-section-premium">
            <h2 className="section-title">Où nous trouver</h2>
            <div className="map-container-premium">
              <iframe
                src={
                  service.mapEmbed ||
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.846363523414!2d-7.632562!3d33.57311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d2927d0357b5%3A0x3ea250ecf488774a!2sCasablanca!5e0!3m2!1sen!2sma!4v1642250000000!5m2!1sen!2sma"
                }
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
                title="Google Maps Location"
              />
              <div className="address-info">
                <h3>Adresse</h3>
                <p>{service?.provider?.address || `${service?.provider?.city || "Maroc"}, Maroc`}</p>
                <p>Téléphone: +212 XX XX XX XX</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ProviderProfile;
