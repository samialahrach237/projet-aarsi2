import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import logoImage from "../Assets/logo/logo.png";
import ProfileAvatar from "./ProfileAvatar";
import { getDefaultRouteForRole, getStoredUser, isAuthenticated, logoutUser } from "../services/authService";
import "../Styles/Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    window.addEventListener("auth:changed", syncUser);

    return () => {
      window.removeEventListener("auth:changed", syncUser);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active-link" : "";
  };

  const handleLogout = async () => {
    await logoutUser();
    window.dispatchEvent(
      new CustomEvent("toast:add", {
        detail: {
          type: "success",
          message: "Vous etes deconnecte avec succes.",
        },
      })
    );
    navigate("/connexion");
  };

  const dashboardPath = user ? getDefaultRouteForRole(user.role) : "/connexion";

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <div className="logo-symbol">
              <img src={logoImage} alt="AARSSI Logo" className="logo-image" />
            </div>
            <span className="brand-name">AARSSI</span>
          </Link>
        </div>

        <div className="header-right-group">
          <div className="mobile-connection-icon">
            {authenticated ? (
              <button type="button" className="connection-link connection-button" onClick={handleLogout}>
                <FaSignOutAlt className="connection-icon" />
              </button>
            ) : (
              <Link to="/connexion" className="connection-link">
                <FaUser className="connection-icon" />
              </Link>
            )}
          </div>

          <button type="button" className="menu-icon" onClick={toggleMenu} aria-label="Ouvrir le menu">
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
            <span className={isMenuOpen ? "bar open" : "bar"}></span>
          </button>
        </div>

        <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          <Link to="/" className={isActive("/")} onClick={toggleMenu}>
            Accueil
          </Link>
          <Link to="/services" className={isActive("/services")} onClick={toggleMenu}>
            Services
          </Link>
          <Link to="/avis" className={isActive("/avis")} onClick={toggleMenu}>
            Avis
          </Link>
          {authenticated && (
            <Link to={dashboardPath} className={isActive(dashboardPath)} onClick={toggleMenu}>
              {user?.role === "prestataire" ? "Espace Prestataire" : user?.role === "admin" ? "Admin" : "Mon Compte"}
            </Link>
          )}
        </nav>

        <div className="header-right">
          {authenticated ? (
            <div className="user-actions">
              <div className="user-badge">
                <span className="user-badge-name">{user?.name || "Utilisateur"}</span>
                <span className="user-badge-role">{user?.role || "client"}</span>
              </div>
              <ProfileAvatar name={user?.name} src={user?.photo_url} size="sm" className="header-profile-avatar" />
              <button type="button" className="logout-btn" onClick={handleLogout}>
                Deconnexion
              </button>
            </div>
          ) : (
            <Link to="/connexion" className="login-btn">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
