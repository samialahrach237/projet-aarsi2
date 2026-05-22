import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AdminLogin.css";
import { clearAuthData, loginUser } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiErrors";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginUser(email, password);

      if (response?.user?.role !== "admin") {
        clearAuthData();
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }

      window.dispatchEvent(
        new CustomEvent("toast:add", {
          detail: {
            type: "success",
            message: "Connexion administrateur reussie.",
          },
        })
      );
      navigate("/admin-dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Email ou mot de passe incorrect."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h2>🔒 Admin Access</h2>
          <p>Espace de gestion sécurisé</p>
        </div>
        
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>Email Administrateur</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@aarssi.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-admin-login">
            {isSubmitting ? "Connexion..." : "Se Connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
