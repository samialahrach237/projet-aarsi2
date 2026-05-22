import { FaUser } from "react-icons/fa";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

function ProfileAvatar({ name, src, size = "md", className = "" }) {
  const initials = getInitials(name);

  return (
    <span className={`profile-avatar profile-avatar-${size} ${className}`.trim()} aria-label={name || "Utilisateur"}>
      {src ? (
        <img src={src} alt={name || "Photo de profil"} />
      ) : (
        <span className="profile-avatar-fallback">{initials || <FaUser />}</span>
      )}
    </span>
  );
}

export default ProfileAvatar;
