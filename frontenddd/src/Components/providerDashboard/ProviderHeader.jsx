import { MdMenu, MdNotificationsNone, MdOpenInNew } from "react-icons/md";
import ProfileAvatar from "../ProfileAvatar";

function ProviderHeader({ provider, onOpenSidebar, onOpenPublicProfile }) {
  return (
    <header className="provider-modern-topbar">
      <button className="provider-mobile-menu" type="button" onClick={onOpenSidebar} aria-label="Ouvrir le menu">
        <MdMenu />
      </button>

      <div className="provider-topbar-title">
        <p>Dashboard prestataire</p>
        <h1>{provider.name}</h1>
      </div>

      <div className="provider-topbar-actions">
        <button className="provider-public-profile-btn" type="button" onClick={onOpenPublicProfile}>
          Voir le profil public <MdOpenInNew />
        </button>
        <button className="provider-notification-btn" type="button" aria-label="Notifications">
          <MdNotificationsNone />
          <span>3</span>
        </button>
        <ProfileAvatar name={provider.name} src={provider.photoUrl} size="sm" />
      </div>
    </header>
  );
}

export default ProviderHeader;
