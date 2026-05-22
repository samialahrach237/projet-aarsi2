import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../Styles/SearchBar.css";

function SearchBar({
  cityValue,
  categoryValue,
  onCityChange,
  onCategoryChange,
  cities = [],
  categories = [],
}) {
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (cityValue) {
      params.set("city", cityValue);
    }

    if (categoryValue) {
      params.set("category", categoryValue);
    }

    const queryString = params.toString();
    navigate(queryString ? `/services?${queryString}` : "/services");
  };

  return (
    <div className="modern-search-wrapper">
      <form className="modern-search-bar" onSubmit={handleSearch}>
        <div className="search-fields-container">
          <div className="search-field-group">
            <div className="field-icon">📋</div>
            <select
              className="modern-search-select"
              value={categoryValue}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">Type de service</option>
              {categories.map((category) => {
                const id = typeof category === "object" ? category.id : category;
                const title =
                  typeof category === "object"
                    ? category?.title || category?.name || category?.slug
                    : category;
                if (id === "all") {
                  return null;
                }

                return (
                  <option key={id} value={id}>
                    {title}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="search-field-separator">|</div>

          <div className="search-field-group">
            <div className="field-icon">📍</div>
            <select
              className="modern-search-select"
              value={cityValue}
              onChange={(event) => onCityChange(event.target.value)}
            >
              <option value="">Ville ou region</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="search-submit-button">
          <FaSearch className="search-icon" />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
