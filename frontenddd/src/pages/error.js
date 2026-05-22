import { Link } from "react-router-dom";
import "../Styles/Error.css";

function NotFound() {
  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Non Trouvée</h2>
          <p className="error-message">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <div className="error-actions">
            <Link to="/" className="btn-home">
              🏠 Retour à l'Accueil
            </Link>
            <Link to="/services" className="btn-services">
              💍 Voir les Services
            </Link>
          </div>
        </div>
        
        <div className="error-illustration">
          <div className="rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
          <div className="error-icon">⚠️</div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;