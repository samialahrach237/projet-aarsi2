import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaCamera,
  FaCrown,
  FaGem,
  FaGift,
  FaHome,
  FaUtensils,
} from "react-icons/fa";
import SearchBar from "../Components/SearchBar";
import PrestataireCard from "../Components/PrestataireCard";
import { fetchCategories, fetchServices } from "../services/api";
import "../Styles/Services.css";

const categoryIconMap = {
  "lieux-de-reception": FaHome,
  traiteur: FaUtensils,
  negafa: FaCrown,
  photographie: FaCamera,
  bijoux: FaGem,
  tayfer: FaGift,
};

function Services() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryContainerRef = useRef(null);
  const [filters, setFilters] = useState({
    city: "",
    category: "",
    provider: "",
    priceRange: "",
    rating: "",
    searchQuery: "",
  });

  const checkScrollPosition = useCallback(() => {
    const container = categoryContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;
    setShowRightArrow(!isAtEnd);
  }, []);

  useEffect(() => {
    const container = categoryContainerRef.current;
    if (!container) {
      return undefined;
    }

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const categoryParam = params.get("category");
    const providerParam = params.get("provider");

    setFilters((current) => ({
      ...current,
      city: cityParam || "",
      category: categoryParam || "",
      provider: providerParam || "",
    }));
  }, [location.search]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [servicesResponse, categoriesResponse] = await Promise.all([
          fetchServices({ per_page: 100 }),
          fetchCategories(),
        ]);

        setServices(Array.isArray(servicesResponse?.data) ? servicesResponse.data : []);
        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Erreur lors du chargement des prestataires."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((current) => ({
      ...current,
      [filterType]: value,
      ...(filterType === "category" ? { provider: "" } : {}),
    }));
  };

  const getCategoryIcon = (categoryId) => {
    const IconComponent = categoryIconMap[categoryId] || FaGem;
    return <IconComponent className="category-icon" />;
  };

  const marketplaceCategories = useMemo(
    () => {
      const allowedOrder = [
        { id: "all", title: "Tous", type: "category" },
        { id: "negafa", title: "Negafa", type: "category" },
        { id: "lieux-de-reception", title: "Lieux de reception", type: "category" },
        { id: "traiteur", title: "Traiteur", type: "category" },
        { id: "photographie", title: "Photographie", type: "category" },
        { id: "bijoux", title: "Bijoux", type: "category" },
        { id: "tayfer", title: "Tayfer", type: "category" },
        {  id: "hanna-prestige-marrakech", title: "Hanna",type: "provider",        },
        {id: "mequeupe-beauty-casablanca",title: "Maquillage",type: "provider",},
      ];

      return allowedOrder.filter((item) => {
        if (item.type === "provider") {
          return services.some((service) => service?.provider?.slug === item.id);
        }

        if (item.id === "all") {
          return true;
        }

        return categories.some((category) => category.slug === item.id);
      });
    },
    [categories, services]
  );

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .map((service) => service?.provider?.city || service?.provider?.address)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [services]
  );

  const normalizedServices = useMemo(
    () =>
      services.map((service) => ({
        id: service.id,
        nomEntreprise: service?.provider?.name || "Prestataire",
        providerSlug: service?.provider?.slug || "",
        adresse: service?.provider?.city || service?.provider?.address || "Maroc",
        categorie: service?.category?.name || "Service",
        primaryService: {
          id: service.id,
          name: service.name,
          category: service?.category?.name || "Service",
          price: Number(service.price || 0),
        },
        rating: Number(service.rating || 0),
        reviews: Number(service.reviews_count || 0),
        image: service.image || service?.provider?.photo || "",
      })),
    [services]
  );

  const filteredServices = useMemo(
    () =>
      normalizedServices.filter((service) => {
        const address = service?.adresse || "";
        const categoryName = service?.primaryService?.category || "";
        const categorySlug = categories.find(
          (category) => category.name === categoryName
        )?.slug;
        const serviceName = service?.primaryService?.name || "";
        const companyName = service?.nomEntreprise || "";

        if (filters.city && !address.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }

        if (
          filters.category &&
          filters.category !== "all" &&
          filters.category !== categorySlug
        ) {
          return false;
        }

        if (filters.provider && filters.provider !== service.providerSlug) {
          return false;
        }

        if (filters.priceRange) {
          const startingPrice = Number(service?.primaryService?.price || 0);

          if (filters.priceRange === "low" && startingPrice > 500) {
            return false;
          }

          if (
            filters.priceRange === "medium" &&
            (startingPrice <= 500 || startingPrice > 3000)
          ) {
            return false;
          }

          if (filters.priceRange === "high" && startingPrice <= 3000) {
            return false;
          }
        }

        if (filters.rating) {
          if (filters.rating === "5" && service.rating < 5) {
            return false;
          }

          if (filters.rating === "4" && service.rating < 4) {
            return false;
          }
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();

          return (
            companyName.toLowerCase().includes(query) ||
            address.toLowerCase().includes(query) ||
            serviceName.toLowerCase().includes(query)
          );
        }

        return true;
      }),
    [categories, filters, normalizedServices]
  );

  const emptyMessage = error || "Aucun prestataire trouve.";

  return (
    <div className="services-page">
      <div className="services-header-premium">
        <h1 className="page-title-premium">Trouvez vos prestataires</h1>

        <div className="search-bar-container-premium">
          <SearchBar
            cityValue={filters.city}
            categoryValue={filters.category}
            onCityChange={(value) => handleFilterChange("city", value)}
            onCategoryChange={(value) => handleFilterChange("category", value)}
            cities={cities}
            categories={marketplaceCategories}
          />
        </div>

        <div className="category-bar-premium">
          <div className="category-scroll-wrapper">
            <div
              className="category-scroll-container"
              ref={categoryContainerRef}
              onScroll={checkScrollPosition}
            >
              {marketplaceCategories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn-premium ${
                    category.type === "provider"
                      ? filters.provider === category.id
                      : filters.category === (category.id === "all" ? "" : category.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      category:
                        category.type === "category"
                          ? category.id === "all"
                            ? ""
                            : category.id
                          : "",
                      provider: category.type === "provider" ? category.id : "",
                    }))
                  }
                >
                  <span className="category-icon-premium">
                    {category.type === "provider" ? (
                      category.id === "hanna-prestige-marrakech" ? (
                        <FaCrown className="category-icon" />
                      ) : (
                        <FaGem className="category-icon" />
                      )
                    ) : (
                      getCategoryIcon(category.id)
                    )}
                  </span>
                  <span className="category-text-premium">{category.title}</span>
                  {(category.type === "provider"
                    ? filters.provider === category.id
                    : filters.category === (category.id === "all" ? "" : category.id)) ? (
                    <div className="active-indicator" />
                  ) : null}
                </button>
              ))}
            </div>

            {showRightArrow ? (
              <div className="scroll-right-indicator">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#9c7c3a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="services-grid-container">
        {loading ? (
          <div className="no-results-premium">
            <h3>Chargement des prestataires...</h3>
          </div>
        ) : error ? (
          <div className="no-results-premium">
            <h3>{emptyMessage}</h3>
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <PrestataireCard
              key={service.id}
              nomEntreprise={service.nomEntreprise}
              adresse={service.adresse}
              categorie={service.categorie}
              primaryService={service.primaryService}
              rating={service.rating}
              reviews={service.reviews}
              image={service.image}
            />
          ))
        ) : (
          <div className="no-results-premium">
            <div className="no-results-icon">🕊️</div>
            <h3>Aucun prestataire trouvé</h3>
            <p>Nous n'avons pas trouvé de prestataires correspondant à votre recherche.</p>
            <button
              className="reset-btn-premium"
              onClick={() =>
                setFilters({
                  city: "",
                  category: "",
                  provider: "",
                  priceRange: "",
                  rating: "",
                  searchQuery: "",
                })
              }
            >
              Voir tous les prestataires
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Services;
