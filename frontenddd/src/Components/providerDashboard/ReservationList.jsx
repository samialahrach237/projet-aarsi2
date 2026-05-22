import { MdCalendarToday, MdFavoriteBorder } from "react-icons/md";

const statusLabels = {
  accepted: "Confirmee",
  pending: "En attente",
  rejected: "Refusee",
  refused: "Refusee",
};

function ReservationList({ reservations, onViewAll }) {
  return (
    <section className="provider-modern-card provider-reservation-widget provider-animate-in">
      <div className="provider-widget-header">
        <h2>Reservations recentes</h2>
        <button type="button" onClick={onViewAll}>Voir tout</button>
      </div>

      <div className="provider-reservation-list">
        {reservations.length ? reservations.slice(0, 3).map((reservation, index) => (
          <article key={reservation.id} className="provider-reservation-row">
            <div className="provider-reservation-thumb">
              {(reservation.client_name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="provider-reservation-main">
              <strong>{reservation.client_name || "Client"}</strong>
              <span><MdCalendarToday /> {reservation.reservation_date || reservation.date || "-"}</span>
              <span><MdFavoriteBorder /> {reservation.service_category || reservation.service_name || "Evenement"}</span>
            </div>
            <div className="provider-reservation-side">
              <span className={`provider-status-chip status-${reservation.status}`}>
                {statusLabels[reservation.status] || reservation.status}
              </span>
              <strong>{Number(reservation.amount ?? reservation.price ?? 0).toLocaleString("fr-FR")} MAD</strong>
            </div>
          </article>
        )) : (
          <div className="provider-empty-modern">Aucune reservation recente.</div>
        )}
      </div>

      <button className="provider-manage-reservations" type="button" onClick={onViewAll}>
        Gerer toutes les reservations
      </button>
    </section>
  );
}

export default ReservationList;
