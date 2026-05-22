import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "../Styles/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Merci pour votre message ! Nous vous répondrons bientôt.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contactez-nous</h1>
          <p className="contact-description">
                  Pour toute question, suggestion ou demande d’information, l’équipe AARSSI est à votre disposition.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-form-section">
        
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <h2>Envoyez-nous un message</h2>
                <label htmlFor="name">Nom complet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="Demande générale">Demande générale</option>
                  <option value="Support technique">Support technique</option>
                  <option value="Partenariat">Partenariat</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Envoyer le message
              </button>
            </form>
          </div>

          <div className="contact-info-section">
            <h2>Informations de contact</h2>
            <div className="contact-info">
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div className="info-content">
                  <h3>Email</h3>
                  <p>contact@aarssi.com</p>
                  <p>support@aarssi.ma</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaPhone className="info-icon" />
                <div className="info-content">
                  <h3>Téléphone</h3>
                  <p>+212 768705449</p>
                  <p>Lun-Ven: 9h00-18h00</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div className="info-content">
                  <h3>Adresse</h3>
                  <p>Hay Amal ,Wislan</p>
                  <p>Méknes, Maroc</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaClock className="info-icon" />
                <div className="info-content">
                  <h3>Horaires</h3>
                  <p>Lun-Ven: 9h00 - 18h00</p>
                  <p>Sam: 9h00 - 13h00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
