import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchServices } from "../services/api";
import "../Styles/Accueil.css";

const PROMO_FEATURES = [
  {
    icon: "fas fa-check-circle",
    title: "Prestataires verifies",
    description:
      "Explorez de vraies categories issues de notre base et trouvez plus vite les bons profils.",
  },
  {
    icon: "fas fa-clock",
    title: "Reservation rapide",
    description:
      "Parcourez les services disponibles et entrez en contact avec les prestataires en quelques clics.",
  },
  {
    icon: "fas fa-star",
    title: "Avis authentiques",
    description:
      "Comparez les profils, les prestations et les notes avant de reserver votre coup de coeur.",
  },
];

function Accueil() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeGalleryFrame, setActiveGalleryFrame] = useState(0);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const [servicesResponse, categoriesResponse] = await Promise.all([
          fetchServices({ per_page: 16 }),
          fetchCategories(),
        ]);

        const serviceItems = Array.isArray(servicesResponse?.data)
          ? servicesResponse.data
          : [];
        const categoryItems = Array.isArray(categoriesResponse) ? categoriesResponse : [];

        setServices(serviceItems);
        setServicesTotal(Number(servicesResponse?.total || serviceItems.length || 0));
        setCategories(categoryItems);
      } catch (error) {
        setServices([]);
        setCategories([]);
        setServicesTotal(0);
      }
    };

    loadHomepageData();
  }, []);

  const featuredCategories = useMemo(() => categories.slice(0, 8), [categories]);

  const uniqueCitiesCount = useMemo(() => {
    const cities = services
      .map((service) => service?.provider?.city || service?.provider?.address)
      .filter(Boolean);

    return new Set(cities.map((city) => city.toLowerCase())).size;
  }, [services]);

  const sliderImages = useMemo(() => {
    const fromServices = services
      .map((service) => service?.image)
      .filter(Boolean);
    const fromCategories = featuredCategories
      .map((category) => category?.image)
      .filter(Boolean);

    return [...new Set([...fromServices, ...fromCategories])].slice(0, 4);
  }, [featuredCategories, services]);

  const homeGalleryFrames = useMemo(() => {
    const imagePool = [
      ...services.map((service) => service?.image).filter(Boolean),
      ...services.map((service) => service?.provider?.photo).filter(Boolean),
    ];

    const uniqueImages = [...new Set(imagePool)];

    if (uniqueImages.length === 0) {
      return [];
    }

    const baseImages = uniqueImages.slice(0, 16);
    const normalizedImages = [...baseImages];

    while (normalizedImages.length < 16) {
      normalizedImages.push(baseImages[normalizedImages.length % baseImages.length]);
    }

    return Array.from({ length: 4 }, (_, frameIndex) =>
      normalizedImages.slice(frameIndex * 4, frameIndex * 4 + 4)
    );
  }, [services]);

  useEffect(() => {
    if (sliderImages.length <= 1) {
      setActiveSlideIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % sliderImages.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [sliderImages]);

  useEffect(() => {
    if (homeGalleryFrames.length <= 1) {
      setActiveGalleryFrame(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveGalleryFrame((currentFrame) => (currentFrame + 1) % homeGalleryFrames.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [homeGalleryFrames]);

  return (
    <div className="home-wrapper">
      <section className="organizer-section">
        <div className="organizer-container">
          <div className="organizer-content">
            <h2 className="organizer-title">Ghir B&apos;click, un mariage magique</h2>
            <p className="organizer-description">
              Decouvrez une plateforme dediee aux futurs maries. Accedez a une
              selection exclusive de prestataires de confiance et organisez
              chaque detail de votre ceremonie avec clarte et elegance.
            </p>
            <Link to="/services" className="organizer-btn">
              Lancez une recherche
            </Link>
            <p className="organizer-subtext">
              Etes-vous un prestataire ? <Link to="/connexion">Rejoignez-nous ici !</Link>
            </p>
          </div>

          <div className="organizer-gallery">
            <div className="collage-grid">
              {Array.from({ length: 4 }, (_, itemIndex) => (
                <div className="collage-item collage-item-slider" key={`gallery-slot-${itemIndex}`}>
                  {homeGalleryFrames.length > 0 ? (
                    homeGalleryFrames.map((frame, frameIndex) => (
                      <img
                        key={`${frame[itemIndex]}-${frameIndex}-${itemIndex}`}
                        src={frame[itemIndex]}
                        alt={`Prestations mariage ${itemIndex + 1}`}
                        className={`collage-slide ${
                          frameIndex === activeGalleryFrame ? "is-active" : ""
                        }`}
                      />
                    ))
                  ) : (
                    <div className="collage-slide collage-slide-placeholder is-active" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-icon" style={{ color: "#9c7c3a" }}>
              <i className="fas fa-layer-group"></i>
            </span>
            <div className="stat-info">
              <h3 className="stat-number">{servicesTotal || services.length}</h3>
              <p className="stat-label">Services</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon" style={{ color: "#9c7c3a" }}>
              <i className="fas fa-list"></i>
            </span>
            <div className="stat-info">
              <h3 className="stat-number">{categories.length}</h3>
              <p className="stat-label">Categories</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon" style={{ color: "#9c7c3a" }}>
              <i className="fas fa-map-marker-alt"></i>
            </span>
            <div className="stat-info">
              <h3 className="stat-number">{uniqueCitiesCount}</h3>
              <p className="stat-label">Villes</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon" style={{ color: "#9c7c3a" }}>
              <i className="fas fa-star"></i>
            </span>
            <div className="stat-info">
              <h3 className="stat-number">{featuredCategories.length}</h3>
              <p className="stat-label">Univers en avant</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-showcase-section">
        <div className="home-section-shell">
          <div className="home-section-heading">
            <span className="section-kicker">Types d&apos;evenements</span>
            <h2 className="section-title">Nous couvrons divers types d&apos;evenements</h2>
            <p className="section-description">
              Explorez notre collection de categories pour trouver rapidement les
              prestataires adaptes a votre ambiance et a vos envies.
            </p>
          </div>

          <div className="categories-rail" role="list">
            <div className="categories-track">
              {[...featuredCategories, ...featuredCategories].map((category, index) => (
                <Link
                  key={`${category.id}-${index}`}
                  to={`/services?category=${category.slug}`}
                  className="category-showcase-card"
                >
                  <div className="category-showcase-image">
                    <img src={category.image} alt={category.name} />
                  </div>
                  <div className="category-showcase-content">
                    <h3 className="category-showcase-name">{category.name}</h3>
                    <p className="category-showcase-count">
                      {category.services_count} service
                      {category.services_count > 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="homepage-promo-section">
        <div className="home-section-shell homepage-promo-card">
          <div className="homepage-promo-visual">
            {sliderImages.length > 0 ? (
              <>
                {sliderImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt="Prestations mariage"
                    className={`homepage-promo-slide ${
                      index === activeSlideIndex ? "is-active" : ""
                    }`}
                  />
                ))}
              </>
            ) : (
              <img
                src="/images/hero.jpg"
                alt="Prestations mariage"
                className="homepage-promo-slide is-active"
              />
            )}
          </div>

          <div className="homepage-promo-copy">
            <h2 className="promotional-title">Pourquoi choisir notre plateforme</h2>
            <div className="promotional-description">
              <strong>Nos univers les plus demandes pour un mariage d&apos;exception</strong>
              <span>
                Explorez 7 categories et trouvez les prestations les plus
                recherchees, de lieux de reception aux services complementaires
                pour votre grand jour.
              </span>
            </div>

            <ul className="promotional-features">
              {PROMO_FEATURES.map((feature) => (
                <li key={feature.title}>
                  <span className="feature-icon">
                    <i className={feature.icon}></i>
                  </span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/services" className="promotional-btn">
              Explorer les services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Accueil;
