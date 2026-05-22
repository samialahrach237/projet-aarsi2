import { Link } from "react-router-dom";
import "../Styles/Footer.css";


function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1 */}
        <div className="footer-col">
          <h4>AARSSI</h4>
          <p>À propos de nous</p>
          <p> Notre histoire</p>
          <p>Notre mission</p>
          <p>Carrière</p>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h4>Mentions légales & Support</h4>
          <p>Conditions</p>
          <p>Politique de confidentialité</p>
          <p>Politique de cookies</p>
          <p>Centre d’aide</p>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h4>Contact</h4>
          <Link to="/contact" className="footer-link">Contactez-nous</Link>
          <p>FAQ</p>
          <p>Partenariats</p>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
           <h4>Suivez-nous</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon linkedin">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 AARSSI. Developed with React.js. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
