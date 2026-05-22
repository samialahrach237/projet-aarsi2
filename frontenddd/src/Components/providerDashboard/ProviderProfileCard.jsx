import { MdEmail, MdLocationOn, MdOpenInNew, MdPhotoCamera } from "react-icons/md";
import ProfileAvatar from "../ProfileAvatar";

function ProviderProfileCard({ provider, uploading, onPhotoChange, onOpenPublicProfile }) {
  return (
    <section className="provider-profile-modern-card provider-animate-in">
      <div className="provider-profile-photo-wrap">
        <ProfileAvatar name={provider.name} src={provider.photoUrl} size="xl" />
        <label className="provider-photo-upload-btn" title="Modifier la photo">
          <MdPhotoCamera />
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onPhotoChange}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="provider-profile-content">
        <h2>{provider.name}</h2>
        <p className="provider-profile-line"><MdLocationOn /> {provider.city}</p>
        <p className="provider-profile-line"><MdEmail /> {provider.email}</p>
        <div className="provider-profile-meta">
          <span className={`provider-validation-badge ${provider.validated ? "is-valid" : "is-pending"}`}>
            {provider.validated ? "Compte valide" : "Validation en attente"}
          </span>
        </div>
      </div>

      <button className="provider-profile-public-btn" type="button" onClick={onOpenPublicProfile}>
        Voir le profil public <MdOpenInNew />
      </button>
    </section>
  );
}

export default ProviderProfileCard;
