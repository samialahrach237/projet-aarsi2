import {
  MdCalendarMonth,
  MdHelpOutline,
  MdImage,
  MdInsights,
  MdLogout,
  MdStorefront,
  MdAssignment,
} from "react-icons/md";

const menuItems = [
  { id: "overview", label: "Vue d'ensemble", icon: <MdInsights /> },
  { id: "services", label: "Services", icon: <MdStorefront /> },
  { id: "reservations", label: "Reservations", icon: <MdAssignment /> },
  { id: "calendar", label: "Calendrier", icon: <MdCalendarMonth /> },
  { id: "photos", label: "Photos", icon: <MdImage /> },
];

function ProviderSidebar({ activeTab, isOpen, onChangeTab, onClose, onLogout }) {
  return (
    <aside className={`provider-modern-sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="provider-sidebar-brand">AAR<span>SSI</span></div>

      <nav className="provider-sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`provider-sidebar-link ${activeTab === item.id ? "is-active" : ""}`}
            onClick={() => {
              onChangeTab(item.id);
              onClose();
            }}
            type="button"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <button
          className="provider-sidebar-link provider-logout-link"
          onClick={onLogout}
          type="button"
        >
          <MdLogout />
          <span>Deconnexion</span>
        </button>
      </nav>

      <div className="provider-sidebar-footer">
        <div className="provider-support-card">
          <MdHelpOutline />
          <strong>Besoin d'aide ?</strong>
          <p>Notre equipe est la pour vous accompagner.</p>
          <button type="button">Contacter le support</button>
        </div>
      </div>
    </aside>
  );
}

export default ProviderSidebar;
