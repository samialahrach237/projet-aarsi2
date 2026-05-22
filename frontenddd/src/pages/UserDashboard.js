import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaRedoAlt,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import UserAccountLayout from "../Components/UserAccountLayout";
import {
  cancelReservation,
  fetchClientReservations,
} from "../services/api";
import { getApiErrorMessage } from "../utils/apiErrors";
import "../Styles/UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState([]);
  const [counts, setCounts] = useState({ all: 0, accepted: 0, refused: 0, pending: 0 });
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 4 });
  const [cancellingReservationId, setCancellingReservationId] = useState(null);

  const emitToast = (type, message) => {
    window.dispatchEvent(new CustomEvent("toast:add", { detail: { type, message } }));
  };

  const loadClientData = async (isRefresh = false, nextStatus = activeStatus, nextPage = page) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetchClientReservations(
        {
          status: nextStatus,
          page: nextPage,
          per_page: 4,
        },
        { raw: true }
      );

      setReservations(Array.isArray(response?.data) ? response.data : []);
      setCounts(response?.counts || { all: 0, accepted: 0, refused: 0, pending: 0 });
      setPagination(response?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 4 });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Impossible de charger votre espace client."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (status) => {
    setActiveStatus(status);
    setPage(1);
    loadClientData(false, status, 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.last_page || nextPage === page) {
      return;
    }

    setPage(nextPage);
    loadClientData(false, activeStatus, nextPage);
  };

  const handleCancel = async (reservationId) => {
    setCancellingReservationId(reservationId);

    try {
      await cancelReservation(reservationId);
      emitToast("success", "Reservation annulee avec succes.");
      await loadClientData(true, activeStatus, page);
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible d'annuler cette reservation."));
    } finally {
      setCancellingReservationId(null);
    }
  };

  const openAvisPage = (reservation) => {
    navigate("/mes-avis", {
      state: {
        openCreate: true,
        serviceId: reservation.service_id,
      },
    });
  };

  const formatReservationDate = (reservation) => {
    const value = reservation?.reservation_date || reservation?.date;
    return value
      ? new Date(value).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";
  };

  const normalizeStatus = (status = "") => (status === "rejected" ? "refused" : status);

  const statusLabel = (status = "") => {
    const normalized = normalizeStatus(status);
    return normalized ? normalized.toUpperCase() : "PENDING";
  };

  const filterItems = [
    { id: "all", label: "Tous", icon: <MdOutlineDashboard />, count: counts.all },
    { id: "accepted", label: "Accepted", icon: <FaCheckCircle />, count: counts.accepted },
    { id: "refused", label: "Refused", icon: <FaTimesCircle />, count: counts.refused },
    { id: "pending", label: "Pending", icon: <FaClock />, count: counts.pending },
  ];

  const pageNumbers = Array.from({ length: pagination.last_page || 1 }, (_, index) => index + 1);

  const renderAction = (reservation) => {
    if (reservation.status === "pending") {
      return (
        <button
          className="reservation-outline-btn reservation-cancel-modern"
          onClick={() => handleCancel(reservation.id)}
          disabled={cancellingReservationId === reservation.id}
        >
          {cancellingReservationId === reservation.id ? "Annulation..." : "Annuler"}
          <FaArrowRight />
        </button>
      );
    }

    if (reservation.status === "accepted" && !reservation.has_avis) {
      return (
        <button className="reservation-outline-btn" onClick={() => openAvisPage(reservation)}>
          Laisser un avis
          <FaArrowRight />
        </button>
      );
    }

    if (reservation.status === "accepted" && reservation.has_avis) {
      return (
        <button className="reservation-outline-btn" onClick={() => navigate("/mes-avis")}>
          Voir mon avis
          <FaArrowRight />
        </button>
      );
    }

    return (
      <button className="reservation-outline-btn" onClick={() => navigate("/mes-avis")}>
        Voir les details
        <FaArrowRight />
      </button>
    );
  };

  if (loading) {
    return (
      <UserAccountLayout activeTab="reservations">
        <div className="tab-content dashboard-message-panel">
          <p>Chargement de votre espace client...</p>
        </div>
      </UserAccountLayout>
    );
  }

  if (error) {
    return (
      <UserAccountLayout activeTab="reservations">
        <div className="tab-content dashboard-message-panel">
          <p>{error}</p>
          <button className="reservation-primary-btn" onClick={() => loadClientData()}>
            Reessayer
          </button>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout activeTab="reservations">
      <div className="tab-content user-dashboard-shell reservations-modern-shell">
        <section className="reservations-toolbar">
          <div>
            <h1>Mes reservations</h1>
          </div>
          <button className="reservation-primary-btn" onClick={() => loadClientData(true)} disabled={refreshing}>
            <span>{refreshing ? "Actualisation..." : "Actualiser"}</span>
            <FaRedoAlt className={refreshing ? "is-spinning" : ""} />
          </button>
        </section>

        <section className="reservation-filters" aria-label="Filtres reservations">
          {filterItems.map((item) => (
            <button
              key={item.id}
              className={`reservation-filter-btn ${activeStatus === item.id ? "active" : ""}`}
              onClick={() => handleFilterChange(item.id)}
              type="button"
            >
              <span className={`filter-icon filter-icon-${item.id}`}>{item.icon}</span>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </section>

        <section className="reservations-list-modern">
          {reservations.length ? (
            reservations.map((reservation) => (
              <article key={reservation.id} className="reservation-row-card">
                <div className="reservation-row-main">
                  <h2>{reservation.service || "Reservation AARSSI"}</h2>
                  <p className="reservation-provider">{reservation.prestataire || "Prestataire AARSSI"}</p>
                  <div className="reservation-row-meta">
                    <span>
                      <FaCalendarAlt />
                      {formatReservationDate(reservation)}
                    </span>
                    <span>
                      <FaClock />
                      {reservation.start_time || reservation.reservation_time || "--:--"} - {reservation.end_time || "--:--"}
                    </span>
                    <span>
                      <FaUsers />
                      {reservation.guests ? `${reservation.guests} invites` : "Invites non precises"}
                    </span>
                  </div>
                </div>
                <div className="reservation-row-side">
                  <span className={`status-pill status-${normalizeStatus(reservation.status)}`}>
                    {normalizeStatus(reservation.status) === "accepted" ? <FaCheckCircle /> : null}
                    {normalizeStatus(reservation.status) === "refused" ? <FaTimesCircle /> : null}
                    {normalizeStatus(reservation.status) === "pending" ? <FaClock /> : null}
                    {statusLabel(reservation.status)}
                  </span>
                  {renderAction(reservation)}
                </div>
              </article>
            ))
          ) : (
            <div className="reservations-empty-state">
              <FaCalendarAlt />
              <h2>Aucune reservation disponible</h2>
              <p>Vos prochaines demandes apparaitront ici avec leur statut en temps reel.</p>
            </div>
          )}
        </section>

        {pagination.last_page > 1 ? (
          <nav className="reservation-pagination" aria-label="Pagination reservations">
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
      </div>
    </UserAccountLayout>
  );
}

export default UserDashboard;
