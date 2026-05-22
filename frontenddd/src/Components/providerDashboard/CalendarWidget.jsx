import { useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const monthNames = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function buildCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let i = startOffset; i > 0; i -= 1) {
    days.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (days.length % 7 !== 0 || days.length < 35) {
    const last = days[days.length - 1].date;
    days.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  return days;
}

const toDateKey = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

function CalendarWidget({ reservations, onOpenCalendar }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const reservedDays = useMemo(() => {
    const keys = new Set();
    reservations.forEach((reservation) => {
      const key = toDateKey(reservation.reservation_date || reservation.date);
      if (key) {
        keys.add(key);
      }
    });
    return keys;
  }, [reservations]);

  const days = useMemo(() => buildCalendar(currentDate), [currentDate]);

  const changeMonth = (direction) => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + direction, 1));
  };

  return (
    <section className="provider-modern-card provider-calendar-widget provider-animate-in">
      <div className="provider-widget-header">
        <h2>Calendrier des reservations</h2>
        <button type="button" onClick={onOpenCalendar}>Voir le calendrier</button>
      </div>

      <div className="provider-calendar-toolbar">
        <button type="button" onClick={() => changeMonth(-1)}><MdChevronLeft /></button>
        <strong>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
        <button type="button" onClick={() => changeMonth(1)}><MdChevronRight /></button>
      </div>

      <div className="provider-mini-calendar">
        {weekDays.map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
        {days.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const isReserved = reservedDays.has(key);

          return (
            <span key={key} className={`calendar-day ${!inMonth ? "is-muted" : ""} ${isReserved ? "is-reserved" : ""}`}>
              {date.getDate()}
            </span>
          );
        })}
      </div>

      <div className="provider-calendar-legend-modern">
        <span></span> Reservation confirmee
      </div>
    </section>
  );
}

export default CalendarWidget;
