import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Connexion.css";
import {
  getDefaultRouteForRole,
  loginUser,
  registerUser,
} from "../services/authService";
import { getApiErrorMessage, getValidationErrors } from "../utils/apiErrors";

function Connexion() {
  const [showLogin, setShowLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [registerRole, setRegisterRole] = useState("client");
  const navigate = useNavigate();

  const emitToast = (type, message) => {
    window.dispatchEvent(
      new CustomEvent("toast:add", {
        detail: { type, message },
      })
    );
  };

  const getFieldError = (field) => validationErrors[field]?.[0] || "";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setValidationErrors({});
    setIsSubmitting(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await loginUser(email, password);
      const user = response?.user;

      emitToast("success", "Connexion reussie.");
      navigate(getDefaultRouteForRole(user?.role));
    } catch (err) {
      setValidationErrors(getValidationErrors(err));
      setError(getApiErrorMessage(err, "Erreur de connexion. Veuillez reessayer."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setValidationErrors({});
    setIsSubmitting(true);

    const payload = {
      name: e.target.registerName.value,
      email: e.target.registerEmail.value,
      password: e.target.registerPassword.value,
      password_confirmation: e.target.confirmPassword.value,
      role: registerRole,
    };

    if (registerRole === "client") {
      payload.address = e.target.registerAddress.value;
    } else {
      payload.nomEntreprise = e.target.registerCompany.value;
      payload.adresse = e.target.registerCompanyAddress.value;
      payload.description = e.target.registerDescription.value || null;
    }

    try {
      const response = await registerUser(payload);
      const user = response?.user;

      emitToast("success", "Compte cree avec succes.");
      navigate(getDefaultRouteForRole(user?.role));
    } catch (err) {
      setValidationErrors(getValidationErrors(err));
      setError(getApiErrorMessage(err, "Erreur d'inscription. Veuillez reessayer."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="connexion-page">
      <div className="connexion-container">
        {showLogin ? (
          <>
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Entrez votre email"
                  className="form-input"
                  required
                />
                {getFieldError("email") && <p className="error-message">{getFieldError("email")}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  className="form-input"
                  required
                />
                {getFieldError("password") && <p className="error-message">{getFieldError("password")}</p>}
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="btn-connexion" disabled={isSubmitting}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="form-switch">
              <p>
                Vous n'avez pas de compte ?{" "}
                <span
                  className="switch-link"
                  onClick={() => {
                    setShowLogin(false);
                    setError("");
                    setValidationErrors({});
                  }}
                >
                  S'inscrire
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2>Inscription</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="registerName">Nom complet</label>
                <input
                  id="registerName"
                  name="registerName"
                  type="text"
                  placeholder="Entrez votre nom"
                  className="form-input"
                  required
                />
                {getFieldError("name") && <p className="error-message">{getFieldError("name")}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="registerEmail">Email</label>
                <input
                  id="registerEmail"
                  name="registerEmail"
                  type="email"
                  placeholder="Entrez votre email"
                  className="form-input"
                  required
                />
                {getFieldError("email") && <p className="error-message">{getFieldError("email")}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="registerPassword">Mot de passe</label>
                <input
                  id="registerPassword"
                  name="registerPassword"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  className="form-input"
                  required
                />
                {getFieldError("password") && <p className="error-message">{getFieldError("password")}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmation de mot de passe</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registerRole">Role</label>
                <select
                  id="registerRole"
                  className="form-select"
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  required
                >
                  <option value="client">client</option>
                  <option value="prestataire">prestataire</option>
                </select>
              </div>

              {registerRole === "client" ? (
                <div className="form-group">
                  <label htmlFor="registerAddress">Adresse</label>
                  <input
                    id="registerAddress"
                    name="registerAddress"
                    type="text"
                    placeholder="Votre adresse"
                    className="form-input"
                    required
                  />
                  {getFieldError("address") && <p className="error-message">{getFieldError("address")}</p>}
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="registerCompany">Nom de l'entreprise</label>
                    <input
                      id="registerCompany"
                      name="registerCompany"
                      type="text"
                      placeholder="Nom de l'entreprise"
                      className="form-input"
                      required
                    />
                    {getFieldError("nomEntreprise") && (
                      <p className="error-message">{getFieldError("nomEntreprise")}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="registerCompanyAddress">Adresse de l'entreprise</label>
                    <input
                      id="registerCompanyAddress"
                      name="registerCompanyAddress"
                      type="text"
                      placeholder="Adresse"
                      className="form-input"
                      required
                    />
                    {getFieldError("adresse") && <p className="error-message">{getFieldError("adresse")}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="registerDescription">Description</label>
                    <textarea
                      id="registerDescription"
                      name="registerDescription"
                      placeholder="Decrivez votre activite"
                      className="form-input"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="btn-register" disabled={isSubmitting}>
                {isSubmitting ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div className="form-switch">
              <p>
                Vous avez deja un compte ?{" "}
                <span
                  className="switch-link"
                  onClick={() => {
                    setShowLogin(true);
                    setError("");
                    setValidationErrors({});
                  }}
                >
                  Se connecter
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Connexion;
