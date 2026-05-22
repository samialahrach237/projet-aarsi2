import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaEllipsisV,
  FaEye,
  FaHeart,
  FaPen,
  FaRegEdit,
  FaStar,
  FaTrashAlt,
} from "react-icons/fa";
import UserAccountLayout from "../Components/UserAccountLayout";
import {
  createAvis,
  deleteAvis as deleteAvisRequest,
  fetchClientReservations,
  fetchUserAvis,
  updateAvis as updateAvisRequest,
} from "../services/api";
import { getStoredToken } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiErrors";
import "../Styles/Avis.css";
import "../Styles/UserDashboard.css";

function MyAvis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [reviewableReservations, setReviewableReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 6 });
  const hasLoadedAvis = useRef(false);
  const [viewedReview, setViewedReview] = useState(null);
  const [modalState, setModalState] = useState({
    mode: null,
    avisId: null,
    serviceId: null,
    service: "",
    prestataire: "",
    rating: 5,
    comment: "",
  });

  const emitToast = (type, message) => {
    window.dispatchEvent(new CustomEvent("toast:add", { detail: { type, message } }));
  };

  const normalizeAvisResponse = (response) => {
    if (Array.isArray(response)) {
      return { items: response, meta: { current_page: 1, last_page: 1, total: response.length, per_page: response.length || 6 } };
    }

    return {
      items: Array.isArray(response?.data) ? response.data : [],
      meta: response?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 6 },
    };
  };

  const loadAvis = async (nextPage = page) => {
    setLoading(true);
    setError("");

    try {
      const [avisResponse, reservationsResponse] = await Promise.all([
        fetchUserAvis({ page: nextPage, per_page: 6 }, { raw: true }),
        fetchClientReservations(),
      ]);
      const { items, meta } = normalizeAvisResponse(avisResponse);
      const reservations = Array.isArray(reservationsResponse) ? reservationsResponse : [];

      setReviews(items);
      setPagination(meta);
      setReviewableReservations(
        reservations.filter(
          (reservation) => reservation.status === "accepted" && !reservation.has_avis
        )
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Impossible de charger vos avis."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedAvis.current) {
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      return;
    }

    hasLoadedAvis.current = true;
    loadAvis(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const serviceId = location.state?.serviceId;

    if (location.state?.openCreate && serviceId && reviewableReservations.length) {
      const reservation = reviewableReservations.find(
        (item) => String(item.service_id) === String(serviceId)
      );

      if (!reservation) {
        navigate(location.pathname, { replace: true, state: null });
        return;
      }

      openCreateModal(reservation);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state, navigate, reviewableReservations]);

  const renderStars = (rating, clickable = false, onChange = null) =>
    [1, 2, 3, 4, 5].map((star) => {
      const className = `modern-star ${star <= Number(rating || 0) ? "selected" : ""}`;

      if (clickable) {
        return (
          <button
            key={star}
            type="button"
            className={className}
            onClick={() => onChange?.(star)}
            aria-label={`${star} etoile${star > 1 ? "s" : ""}`}
          >
            <FaStar />
          </button>
        );
      }

      return (
        <span key={star} className={className}>
          <FaStar />
        </span>
      );
    });

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  const getReviewCategory = (review) => review.category || "Service mariage";

  const openEditModal = (review) => {
    setModalState({
      mode: "edit",
      avisId: review.id,
      serviceId: review.service_id,
      service: review.service || "Service",
      prestataire: review.prestataire || "Prestataire",
      rating: review.rating,
      comment: review.comment || "",
    });
  };

  const openCreateModal = (reservation = reviewableReservations[0]) => {
    if (!reservation) {
      emitToast("info", "Aucune reservation acceptee n'est disponible pour un nouvel avis.");
      navigate("/user-dashboard");
      return;
    }

    setModalState({
      mode: "create",
      avisId: null,
      serviceId: reservation.service_id,
      service: reservation.service || "Service",
      prestataire: reservation.prestataire || "Prestataire",
      rating: 5,
      comment: "",
    });
  };

  const closeModal = () => {
    setModalState({
      mode: null,
      avisId: null,
      serviceId: null,
      service: "",
      prestataire: "",
      rating: 5,
      comment: "",
    });
  };

  const handleCreateServiceChange = (event) => {
    const reservation = reviewableReservations.find(
      (item) => String(item.service_id) === event.target.value
    );

    if (!reservation) {
      return;
    }

    setModalState((current) => ({
      ...current,
      serviceId: reservation.service_id,
      service: reservation.service || "Service",
      prestataire: reservation.prestataire || "Prestataire",
    }));
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.last_page || nextPage === page) {
      return;
    }

    setPage(nextPage);
    loadAvis(nextPage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (modalState.mode === "create") {
        await createAvis({
          service_id: modalState.serviceId,
          rating: modalState.rating,
          comment: modalState.comment,
        });
        emitToast("success", "Avis ajoute avec succes.");
      } else if (modalState.mode === "edit" && modalState.avisId) {
        await updateAvisRequest(modalState.avisId, {
          rating: modalState.rating,
          comment: modalState.comment,
        });
        emitToast("success", "Avis mis a jour avec succes.");
      }

      closeModal();
      setPage(1);
      await loadAvis(1);
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible d'enregistrer cet avis."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (avisId) => {
    setDeletingId(avisId);

    try {
      await deleteAvisRequest(avisId);
      emitToast("success", "Avis supprime avec succes.");
      await loadAvis(page);
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible de supprimer cet avis."));
    } finally {
      setDeletingId(null);
    }
  };

  const pageNumbers = Array.from({ length: pagination.last_page || 1 }, (_, index) => index + 1);

  return (
    <UserAccountLayout activeTab="avis">
      <div className="tab-content avis-modern-shell">
        {loading ? (
          <div className="dashboard-message-panel">
            <p>Chargement de vos avis...</p>
          </div>
        ) : error ? (
          <div className="dashboard-message-panel">
            <p>{error}</p>
            <button className="reservation-primary-btn" onClick={() => loadAvis(page)}>
              Reessayer
            </button>
          </div>
        ) : (
          <>
            <section className="avis-modern-heading">
              <div>
                <h1>Mes avis</h1>
                <p>Partagez votre experience et aidez d'autres futurs maries</p>
              </div>
              <span>{pagination.total} avis publie{pagination.total > 1 ? "s" : ""}</span>
            </section>

            <section className="avis-cta-card">
              <div className="avis-cta-icon">
                <FaRegEdit />
              </div>
              <div className="avis-cta-copy">
                <h2>Vous avez recemment reserve un service ?</h2>
                <p>Partagez votre experience en laissant un avis pour aider d'autres futurs maries.</p>
              </div>
              <button className="reservation-primary-btn avis-write-btn" type="button" onClick={() => openCreateModal()}>
                <FaPen />
                <span>Ecrire un avis</span>
              </button>
            </section>

            <section className="avis-published-section">
              <h2>Mes avis publies</h2>

              <div className="avis-modern-list">
                {reviews.length ? (
                  reviews.map((review) => (
                    <article key={review.id} className="avis-modern-card">
                      <div className="avis-card-content">
                        <span className="avis-category-badge">{getReviewCategory(review)}</span>
                        <h3>{review.service || "Service AARSSI"}</h3>
                        <div className="avis-rating-row" aria-label={`${review.rating} sur 5`}>
                          {renderStars(review.rating)}
                        </div>
                        <p className="avis-modern-comment">{review.comment || "Aucun commentaire."}</p>
                        <p className="avis-modern-date">
                          <FaCalendarAlt />
                          {formatDate(review.date)}
                        </p>
                      </div>

                      <div className="avis-card-side">
                        <div className="avis-card-top-actions">
                          <span className="avis-published-badge">
                            <FaCheckCircle />
                            Publie
                          </span>
                          <button className="avis-kebab-btn" type="button" aria-label="Options de l'avis">
                            <FaEllipsisV />
                          </button>
                        </div>

                        <div className="avis-action-buttons">
                          <button className="avis-action-btn view" type="button" onClick={() => setViewedReview(review)}>
                            Voir l'avis
                            <FaEye />
                          </button>
                          <button className="avis-action-btn edit" type="button" onClick={() => openEditModal(review)}>
                            <FaPen />
                            Modifier
                          </button>
                          <button
                            className="avis-action-btn delete"
                            type="button"
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                          >
                            <FaTrashAlt />
                            {deletingId === review.id ? "Suppression..." : "Supprimer"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="reservations-empty-state">
                    <FaRegEdit />
                    <h2>Aucun avis publie</h2>
                    <p>Vos avis apparaitront ici apres validation de vos reservations acceptees.</p>
                  </div>
                )}
              </div>
            </section>

            {pagination.last_page > 1 ? (
              <nav className="reservation-pagination" aria-label="Pagination avis">
                <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                  Precedent
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === page ? "active" : ""}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= pagination.last_page}>
                  Suivant
                </button>
              </nav>
            ) : null}

            <section className="avis-info-card">
              <span>
                <FaHeart />
              </span>
              <div>
                <h2>Votre avis compte</h2>
                <p>Vos avis aident d'autres couples a faire le meilleur choix pour leur grand jour.</p>
              </div>
            </section>
          </>
        )}

        {viewedReview && (
          <div className="review-modal" onMouseDown={() => setViewedReview(null)}>
            <div className="review-form avis-view-modal" onMouseDown={(event) => event.stopPropagation()}>
              <h3 className="review-form-title">{viewedReview.service || "Avis"}</h3>
              <span className="avis-category-badge">{getReviewCategory(viewedReview)}</span>
              <div className="avis-rating-row">{renderStars(viewedReview.rating)}</div>
              <p className="avis-modern-comment">{viewedReview.comment || "Aucun commentaire."}</p>
              <p className="avis-modern-date">
                <FaCalendarAlt />
                {formatDate(viewedReview.date)}
              </p>
              <div className="form-actions">
                <button type="button" className="submit-review-btn" onClick={() => setViewedReview(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {modalState.mode && (
          <div className="review-modal" onMouseDown={closeModal}>
            <form className="review-form" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
              <h3 className="review-form-title">
                {modalState.mode === "create" ? "Laisser un avis" : "Modifier mon avis"}
              </h3>
              <div className="form-group">
                <label className="form-label">Service</label>
                {modalState.mode === "create" && reviewableReservations.length > 1 ? (
                  <select className="form-input" value={modalState.serviceId || ""} onChange={handleCreateServiceChange}>
                    {reviewableReservations.map((reservation) => (
                      <option key={reservation.id} value={reservation.service_id}>
                        {reservation.service || "Service"} - {reservation.prestataire || "Prestataire"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="form-input" value={modalState.service} readOnly />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Prestataire</label>
                <input type="text" className="form-input" value={modalState.prestataire} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <div className="star-rating">
                  {renderStars(modalState.rating, true, (rating) =>
                    setModalState((current) => ({ ...current, rating }))
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Commentaire</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={modalState.comment}
                  onChange={(event) =>
                    setModalState((current) => ({ ...current, comment: event.target.value }))
                  }
                  placeholder="Partagez votre experience..."
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="submit-review-btn" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </UserAccountLayout>
  );
}

export default MyAvis;
