import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarToolbar({ date, label, onNavigate, onView, view }) {
  const monthLabel = format(date, "MMMM yyyy", { locale: fr });

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate("TODAY")}>Aujourd'hui</button>
        <button type="button" onClick={() => onNavigate("PREV")}>Precedent</button>
        <button type="button" onClick={() => onNavigate("NEXT")}>Suivant</button>
      </span>

      <span className="rbc-toolbar-label">{label || monthLabel}</span>

      <span className="rbc-btn-group">
        <button type="button" className={view === Views.MONTH ? "rbc-active" : ""} onClick={() => onView(Views.MONTH)}>
          Mois
        </button>
        <button type="button" className={view === Views.WEEK ? "rbc-active" : ""} onClick={() => onView(Views.WEEK)}>
          Semaine
        </button>
        <button type="button" className={view === Views.DAY ? "rbc-active" : ""} onClick={() => onView(Views.DAY)}>
          Jour
        </button>
        <button type="button" className={view === Views.AGENDA ? "rbc-active" : ""} onClick={() => onView(Views.AGENDA)}>
          Agenda
        </button>
      </span>
    </div>
  );
}

function ProviderCalendar({
  reservationEvents,
  availabilityEvents,
  currentDate,
  currentView,
  onNavigate,
  onView,
  onSelectEvent,
  onSelectSlot,
}) {
  const messages = useMemo(
    () => ({
      today: "Aujourd'hui",
      previous: "Precedent",
      next: "Suivant",
      month: "Mois",
      week: "Semaine",
      day: "Jour",
      agenda: "Agenda",
      date: "Date",
      time: "Heure",
      event: "Reservation",
      noEventsInRange: "Aucun evenement sur cette periode.",
      showMore: (total) => `+ ${total} plus`,
    }),
    []
  );

  const availabilityByDate = useMemo(() => {
    const entries = availabilityEvents.map((event) => [
      format(new Date(event.start), "yyyy-MM-dd"),
      Boolean(event.resource?.available),
    ]);

    return new Map(entries);
  }, [availabilityEvents]);

  const eventStyleGetter = (event) => {
    if (event.type === "reservation") {
      if (event.resource?.status === "accepted") {
        return {
          style: {
            backgroundColor: "#2d8c49",
            borderColor: "#1e6b3a",
            color: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 6px 18px rgba(45, 140, 73, 0.18)",
            fontWeight: 600,
          },
        };
      }

      if (event.resource?.status === "pending") {
        return {
          style: {
            backgroundColor: "#c89b3c",
            borderColor: "#9a741f",
            color: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 6px 18px rgba(200, 155, 60, 0.2)",
            fontWeight: 600,
          },
        };
      }

      return {
        style: {
          backgroundColor: "#c24141",
          borderColor: "#9f2f2f",
          color: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 6px 18px rgba(194, 65, 65, 0.18)",
          fontWeight: 600,
        },
      };
    }

    return {
      style: {
        backgroundColor: event.resource?.available ? "rgba(45, 140, 73, 0.3)" : "rgba(200, 155, 60, 0.45)",
        borderColor: event.resource?.available ? "rgba(45, 140, 73, 0.45)" : "rgba(200, 155, 60, 0.55)",
        color: "#3f3213",
      },
    };
  };

  const dayPropGetter = (date) => {
    const availability = availabilityByDate.get(format(date, "yyyy-MM-dd"));

    if (availability === true) {
      return {
        className: "provider-calendar-day-available",
      };
    }

    if (availability === false) {
      return {
        className: "provider-calendar-day-unavailable",
      };
    }

    return {};
  };

  return (
    <div className="provider-calendar-shell">
      <Calendar
        culture="fr"
        localizer={localizer}
        events={reservationEvents}
        backgroundEvents={availabilityEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        popup
        toolbar
        date={currentDate}
        view={currentView}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={messages}
        style={{ height: 720 }}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        components={{
          toolbar: CalendarToolbar,
        }}
      />
    </div>
  );
}

export default ProviderCalendar;
