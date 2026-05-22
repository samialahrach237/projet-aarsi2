import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteForRole, registerUser } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiErrors";
import "../Styles/Provider.css";

const categories = [
  { id: "Photographe", title: "Photographe" },
  { id: "Negafa", title: "Negafa" },
  { id: "Maquilleur", title: "Maquilleur" },
  { id: "Coiffeur", title: "Coiffeur" },
  { id: "Traiteur", title: "Traiteur" },
  { id: "Decorateur", title: "Decorateur" },
  { id: "DJ", title: "DJ" },
];

const cities = ["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger", "Agadir", "Meknes", "Oujda"];

function Provider() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profileName: "",
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirmation: "",
    service: "",
    city: "",
    images: [],
    imagePreviews: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const providerDescription = useMemo(() => {
    const segments = [];

    if (formData.service) {
      segments.push(`Specialite: ${formData.service}`);
    }

    if (formData.phoneNumber) {
      segments.push(`Contact: ${formData.phoneNumber}`);
    }

    return segments.join(" | ");
  }, [formData.phoneNumber, formData.service]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (formData.images.length + files.length > 3) {
      alert("Vous pouvez ajouter un maximum de 3 images.");
      return;
    }

    const newImages = [...formData.images, ...files];
    const newPreviews = [...formData.imagePreviews, ...files.map((file) => URL.createObjectURL(file))];

    setFormData((current) => ({
      ...current,
      images: newImages,
      imagePreviews: newPreviews,
    }));
  };

  const removeImage = (index) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
      imagePreviews: current.imagePreviews.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const nextStep = () => {
    if (
      formData.profileName &&
      formData.email &&
      formData.phoneNumber &&
      formData.password &&
      formData.passwordConfirmation
    ) {
      setStep(2);
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
    }
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.service || !formData.city) {
      alert("Veuillez selectionner un service et une ville.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        name: formData.profileName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
        role: "prestataire",
        nomEntreprise: formData.profileName,
        adresse: formData.city,
        description: providerDescription,
      });

      alert("Profil cree avec succes. Vous pourrez ajouter vos photos depuis votre dashboard.");
      navigate(getDefaultRouteForRole(response?.user?.role));
    } catch (error) {
      alert(getApiErrorMessage(error, "Erreur lors de la creation du compte prestataire."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="provider-page">
      <div className="provider-header">
        <h1 className="provider-title">Espace Provider</h1>
        <p className="provider-subtitle">Rejoignez l'elite du mariage en quelques clics</p>
      </div>

      <div className="provider-form-container">
        <div className="multi-step-container">
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1. Informations</div>
            <div className={`progress-line ${step >= 2 ? "active" : ""}`}></div>
            <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2. Details & Media</div>
          </div>

          <form className="provider-form-multi" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step-content animation-slide-in">
                <h2 className="form-step-title">Coordonnees</h2>

                <div className="form-group">
                  <label htmlFor="profileName">Nom du Profil</label>
                  <input
                    type="text"
                    id="profileName"
                    name="profileName"
                    value={formData.profileName}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Studio Photo Prestige"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Professionnel</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contact@votreentreprise.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Telephone</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="+212 6XX XXX XXX"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passwordConfirmation">Confirmation du mot de passe</label>
                  <input
                    type="password"
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={nextStep} className="btn-next">Suivant</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step-content animation-slide-in">
                <h2 className="form-step-title">Details du Service</h2>

                <div className="form-group">
                  <label htmlFor="service">Type de Service</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Selectionnez un service</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="city">Ville</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Selectionnez une ville</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Photos du Service</label>
                  <div className="images-grid">
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={preview} className="image-preview-container">
                        <img src={preview} alt={`Preview ${index + 1}`} className="image-preview-item" />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>x</button>
                      </div>
                    ))}

                    {formData.imagePreviews.length < 3 ? (
                      <div className="image-upload-wrapper">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="image-input"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="image-label">
                          <div className="upload-placeholder">
                            <span>+ Photo</span>
                          </div>
                        </label>
                      </div>
                    ) : null}
                  </div>
                  <small>Les photos selectionnees ici sont seulement en apercu. Ajoutez-les apres inscription depuis votre dashboard.</small>
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={prevStep} className="btn-prev">Retour</button>
                  <button type="submit" className="btn-submit-final" disabled={isSubmitting}>
                    {isSubmitting ? "Creation..." : "Creer Profil"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="info-card">
          <h3>Pourquoi rejoindre AARSSI?</h3>
          <ul>
            <li>Acces a des clients reels</li>
            <li>Gestion centralisee de vos services</li>
            <li>Photos et reservations depuis le dashboard prestataire</li>
            <li>Validation et suivi de votre activite</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Provider;
