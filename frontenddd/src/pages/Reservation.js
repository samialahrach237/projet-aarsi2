import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation, fetchServiceById } from "../services/api";
import { getStoredUser, refreshStoredUser } from "../services/authService";
import "../Styles/Reservation.css";

const buildInitialFormData = () => {
  const storedUser = getStoredUser();

  return {
    fullName: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    city: storedUser?.city || "",
    date: "",
    time: "",
    guests: "2",
    notes: "",
  };
};

const getCategoryLabel = (category) => {
  if (typeof category === "object") {
    return category?.name || category?.title || category?.slug || "Service";
  }

  return category || "Service";
};

function Reservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(buildInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      setApiError("");

      try {
        const data = await fetchServiceById(id);

        if (data) {
          setService(data);
        } else {
          navigate("/services");
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Service introuvable.";
        setApiError(message);
        navigate("/services");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, navigate]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Le nom complet est requis";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Email invalide";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Le numero de telephone est requis";
    } else if (!/^[+]?[0-9\s-]{10,}$/.test(formData.phone)) {
      nextErrors.phone = "Numero de telephone invalide";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "La ville est requise";
    }

    if (!formData.date) {
      nextErrors.date = "La date est requise";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        nextErrors.date = "La date ne peut pas etre dans le passe";
      }
    }

    if (!formData.time) {
      nextErrors.time = "L'heure est requise";
    }

    if (!formData.guests || Number(formData.guests) < 1) {
      nextErrors.guests = "Le nombre d'invites doit etre superieur a 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setSuccessMessage("");

    try {
      const duration = service?.duration ? Number(service.duration) : 60;
      const addMinutesToTime = (time, minutes) => {
        const [hours, mins] = time.split(":").map(Number);
        const total = hours * 60 + mins + minutes;
        const nextHours = Math.floor((total % 1440) / 60);
        const nextMinutes = total % 60;

        return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
      };

      await createReservation({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        service_id: service.id,
        reservation_date: formData.date,
        reservation_time: formData.time,
        start_time: formData.time,
        end_time: addMinutesToTime(formData.time, duration),
        guests: Number(formData.guests),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        message: formData.notes.trim(),
      });

      await refreshStoredUser().catch(() => null);

      setSuccessMessage("Reservation envoyee avec succes. Redirection vers votre tableau de bord...");

      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1600);
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;
      const message = error?.response?.data?.message || "Une erreur est survenue. Veuillez reessayer.";

      if (responseErrors && typeof responseErrors === "object") {
        const fieldMap = {
          full_name: "fullName",
          reservation_date: "date",
          reservation_time: "time",
          message: "notes",
        };

        setErrors((current) => ({
          ...current,
          ...Object.entries(responseErrors).reduce((acc, [field, messages]) => {
            acc[fieldMap[field] || field] = Array.isArray(messages) ? messages[0] : messages;
            return acc;
          }, {}),
        }));
      }

      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !service) {
    return (
      <div className="reservation-loading">
        <div className="loading-spinner" />
        <p>{apiError || "Chargement du service..."}</p>
      </div>
    );
  }

  const serviceCity = service?.provider?.city || service?.provider?.address || "Maroc";
  const serviceCategory = getCategoryLabel(service?.category);
  const reviewsCount = Array.isArray(service?.reviews)
    ? service.reviews.length
    : Number(service?.reviews_count || 0);

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <div className="reservation-header">
          <h1>Reserver {service.name}</h1>
          <p className="service-category">
            {serviceCategory} - {serviceCity}
          </p>
        </div>

        <div className="reservation-content">
          <div className="service-preview">
            <div className="service-image">
              {service.image || service?.provider?.photo ? (
                <img
                  src={service.image || service?.provider?.photo}
                  alt={service.name}
                />
              ) : (
                <div className="service-image-empty" aria-hidden="true" />
              )}
            </div>
            <div className="service-details">
              <h3>{service.name}</h3>
              <p className="service-city">{serviceCity}</p>
              <p className="service-card-category">{serviceCategory}</p>
              <div className="service-rating-row">
                <div className="service-rating">
                  <span className="stars">
                    {"*".repeat(Math.max(1, Math.floor(Number(service.rating || 0))))}
                  </span>
                  <span className="rating-value">
                    {Number(service.rating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="service-reviews-count">({reviewsCount} avis)</span>
              </div>
              <div className="service-price-block">
                <span className="service-price-label">A partir de</span>
                <p className="service-price">
                  {Number(service.price || 0).toLocaleString("fr-FR")} MAD
                </p>
              </div>
            </div>
          </div>

          <div className="reservation-form-container">
            <h2>Informations de reservation</h2>
            {apiError ? <div className="form-error-banner">{apiError}</div> : null}
            {successMessage ? <div className="form-success-banner">{successMessage}</div> : null}
            <form className="reservation-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Nom complet *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "error" : ""}
                    placeholder="Votre nom complet"
                  />
                  {errors.fullName ? <span className="error-message">{errors.fullName}</span> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                    placeholder="votre@email.com"
                  />
                  {errors.email ? <span className="error-message">{errors.email}</span> : null}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telephone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="+212 6 XX XX XX XX"
                  />
                  {errors.phone ? <span className="error-message">{errors.phone}</span> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="city">Ville *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "error" : ""}
                    placeholder="Casablanca, Marrakech, Rabat..."
                  />
                  {errors.city ? <span className="error-message">{errors.city}</span> : null}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={errors.date ? "error" : ""}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date ? <span className="error-message">{errors.date}</span> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="time">Heure *</label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={errors.time ? "error" : ""}
                  >
                    <option value="">Selectionnez une heure</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                  {errors.time ? <span className="error-message">{errors.time}</span> : null}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guests">Nombre de personnes *</label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className={errors.guests ? "error" : ""}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                    <option key={number} value={number}>
                      {number} personne{number > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                {errors.guests ? <span className="error-message">{errors.guests}</span> : null}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Message / notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Precisions sur votre demande, preferences speciales, etc."
                  rows="4"
                />
                {errors.notes ? <span className="error-message">{errors.notes}</span> : null}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-reserve" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi en cours..." : "Confirmer la reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
