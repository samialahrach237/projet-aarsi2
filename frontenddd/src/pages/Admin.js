import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MdContentPaste,
  MdDashboard,
  MdAdd,
  MdEdit,
  MdEvent,
  MdFileDownload,
  MdFilterList,
  MdLogout,
  MdPeople,
  MdStore,
  MdTrendingUp,
} from "react-icons/md";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUserForm,
  fetchAdminPendingPrestataires,
  fetchAdminReservations,
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
  validatePrestataire,
} from "../services/api";
import { logoutUser } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiErrors";
import "../Styles/Admin.css";

function Admin() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [pendingPrestataires, setPendingPrestataires] = useState([]);
  const [busyUserId, setBusyUserId] = useState(null);
  const [busyPrestataireId, setBusyPrestataireId] = useState(null);
  const [userModalMode, setUserModalMode] = useState(null);
  const [userForm, setUserForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [userFormRoles, setUserFormRoles] = useState(["admin", "client", "prestataire"]);
  const [userFormErrors, setUserFormErrors] = useState({});
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const emitToast = (type, message) => {
    window.dispatchEvent(
      new CustomEvent("toast:add", {
        detail: { type, message },
      })
    );
  };

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, usersResponse, prestatairesResponse, reservationsResponse] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(),
        fetchAdminPendingPrestataires(),
        fetchAdminReservations(),
      ]);

      setStats(statsResponse);
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
      setPendingPrestataires(Array.isArray(prestatairesResponse) ? prestatairesResponse : []);
      setReservations(Array.isArray(reservationsResponse) ? reservationsResponse : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Impossible de charger les donnees administrateur."));
    } finally {
      setLoading(false);
    }
  }, []);

  const formatReservationDate = (reservation) => {
    const value = reservation?.reservation_date || reservation?.date;
    return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
  };

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const chartData = useMemo(() => {
    if (!stats) {
      return {
        servicesPerCategory: [],
        subscriptionPlans: [],
        monthlyRevenue: [],
      };
    }

    return {
      servicesPerCategory: [
        { name: "Users", value: stats.users ?? 0 },
        { name: "Clients", value: stats.clients ?? 0 },
        { name: "Prestataires", value: stats.prestataires ?? 0 },
        { name: "Services", value: stats.services ?? 0 },
        { name: "Reservations", value: stats.reservations ?? 0 },
      ],
      subscriptionPlans: [
        { name: "Valides", value: stats.validatedPrestataires ?? 0, color: "#D4AF37" },
        { name: "En attente", value: stats.pendingPrestataires ?? 0, color: "#999999" },
      ],
      monthlyRevenue: [
        { month: "Pending", revenue: stats.pendingReservations ?? 0 },
        { month: "Accepted", revenue: stats.acceptedReservations ?? 0 },
        { month: "Rejected", revenue: stats.rejectedReservations ?? 0 },
      ],
    };
  }, [stats]);

  const handleDeleteUser = async (userId) => {
    setBusyUserId(userId);

    try {
      await deleteAdminUser(userId);
      emitToast("success", "Utilisateur supprime avec succes.");
      await loadAdminData();
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible de supprimer cet utilisateur."));
    } finally {
      setBusyUserId(null);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      id: null,
      name: "",
      email: "",
      password: "",
      role: "client",
    });
    setUserFormErrors({});
  };

  const normalizeValidationErrors = (requestError) => requestError?.response?.data?.errors || {};

  const openCreateUserModal = async () => {
    resetUserForm();
    setUserModalMode("create");
    setUserFormLoading(true);

    try {
      const response = await fetchAdminUserForm();
      setUserFormRoles(response?.roles || ["admin", "client", "prestataire"]);
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible d'ouvrir le formulaire utilisateur."));
      setUserModalMode(null);
    } finally {
      setUserFormLoading(false);
    }
  };

  const openEditUserModal = async (userId) => {
    resetUserForm();
    setUserModalMode("edit");
    setEditingUserId(userId);
    setUserFormLoading(true);

    try {
      const response = await fetchAdminUser(userId);
      const user = response?.user || response;
      setUserFormRoles(response?.roles || ["admin", "client", "prestataire"]);
      setUserForm({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "client",
      });
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible de charger cet utilisateur."));
      setUserModalMode(null);
    } finally {
      setEditingUserId(null);
      setUserFormLoading(false);
    }
  };

  const closeUserModal = () => {
    if (userFormLoading) {
      return;
    }

    setUserModalMode(null);
    resetUserForm();
  };

  const handleUserFormChange = ({ target: { name, value } }) => {
    setUserForm((current) => ({ ...current, [name]: value }));
    setUserFormErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleUserFormSubmit = async (event) => {
    event.preventDefault();
    setUserFormLoading(true);
    setUserFormErrors({});

    const payload = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
    };

    if (userModalMode === "create" || userForm.password) {
      payload.password = userForm.password;
    }

    try {
      if (userModalMode === "create") {
        await createAdminUser(payload);
        emitToast("success", "Utilisateur ajoute avec succes.");
      } else {
        await updateAdminUser(userForm.id, payload);
        emitToast("success", "Utilisateur modifie avec succes.");
      }

      setUserModalMode(null);
      resetUserForm();
      await loadAdminData();
    } catch (requestError) {
      const validationErrors = normalizeValidationErrors(requestError);

      if (Object.keys(validationErrors).length) {
        setUserFormErrors(validationErrors);
      }

      emitToast("error", getApiErrorMessage(requestError, "Impossible d'enregistrer cet utilisateur."));
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleValidatePrestataire = async (prestataireId) => {
    setBusyPrestataireId(prestataireId);

    try {
      await validatePrestataire(prestataireId);
      emitToast("success", "Prestataire valide avec succes.");
      await loadAdminData();
    } catch (requestError) {
      emitToast("error", getApiErrorMessage(requestError, "Impossible de valider ce prestataire."));
    } finally {
      setBusyPrestataireId(null);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);

    try {
      await logoutUser();
      window.location.assign("/connexion");
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadgeClass = (role) => {
    if (role === "admin") {
      return "text-approved";
    }

    if (role === "prestataire") {
      return "text-pending";
    }

    return "text-rejected";
  };

  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><MdPeople /></div>
          <div className="stat-info">
            <h3>{stats?.users ?? 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MdPeople /></div>
          <div className="stat-info">
            <h3>{stats?.clients ?? 0}</h3>
            <p>Total Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MdStore /></div>
          <div className="stat-info">
            <h3>{stats?.prestataires ?? 0}</h3>
            <p>Total Prestataires</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><MdContentPaste /></div>
          <div className="stat-info">
            <h3>{stats?.services ?? 0}</h3>
            <p>Total Services</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><MdEvent /></div>
          <div className="stat-info">
            <h3>{stats?.reservations ?? 0}</h3>
            <p>Total Reservations</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="revenue-section card-box">
          <div className="card-header">
            <h3>Reservation Overview</h3>
          </div>
          <div className="revenue-grid">
            <div className="revenue-main-card">
              <p>Pending Reservations</p>
              <h2>{stats?.pendingReservations ?? 0}</h2>
            </div>
            <div className="revenue-monthly-card">
              <p>Accepted Reservations</p>
              <h3>{stats?.acceptedReservations ?? 0}</h3>
              <span className="growth-indicator positive">
                <MdTrendingUp /> Rejected: {stats?.rejectedReservations ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="res-section">
          <div className="res-card card-box">
            <h3>Prestataire Validation</h3>
            <div className="res-grid">
              <div className="res-item"><span>Pending</span> <strong className="text-pending">{stats?.pendingPrestataires ?? 0}</strong></div>
              <div className="res-item"><span>Validated</span> <strong className="text-approved">{stats?.validatedPrestataires ?? 0}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-box card-box">
          <h3>Platform Totals</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.servicesPerCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#005A31" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box card-box">
          <h3>Prestataire Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.subscriptionPlans}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.subscriptionPlans.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box card-box full-width">
          <h3>Reservation Status Evolution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} dot={{ fill: "#D4AF37" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="providers-view">
      <div className="admin-actions-bar">
        <div className="filter-group">
          <label><MdFilterList /> Utilisateurs</label>
        </div>
        <div className="export-buttons">
          <button className="btn-add-user" type="button" onClick={openCreateUserModal} disabled={userFormLoading}>
            <MdAdd /> Ajouter utilisateur
          </button>
          <button className="btn-export"><MdFileDownload /> DB</button>
        </div>
      </div>

      <div className="table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="provider-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <strong className={roleBadgeClass(user.role)}>
                    {user.role}
                  </strong>
                </td>
                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "-"}</td>
                <td className="action-buttons">
                  <button
                    className="btn-edit"
                    type="button"
                    onClick={() => openEditUserModal(user.id)}
                    disabled={editingUserId === user.id || userFormLoading}
                  >
                    <MdEdit /> {editingUserId === user.id ? "..." : "Modifier"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={busyUserId === user.id}
                  >
                    {busyUserId === user.id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrestataires = () => (
    <div className="providers-view">
      <div className="admin-actions-bar">
        <div className="filter-group">
          <label><MdFilterList /> Validation Prestataires</label>
        </div>
      </div>

      <div className="table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Adresse</th>
              <th>Photo</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPrestataires.map((prestataire) => (
              <tr key={prestataire.id}>
                <td className="provider-name">{prestataire.nomEntreprise}</td>
                <td>{prestataire.email}</td>
                <td>{prestataire.adresse}</td>
                <td>
                  <div className="table-images-preview">
                    {prestataire.photo_url ? (
                      <img src={prestataire.photo_url} alt={prestataire.nomEntreprise} className="table-thumb" />
                    ) : "N/A"}
                  </div>
                </td>
                <td>
                  <strong className={prestataire.is_validated ? "text-approved" : "text-pending"}>
                    {prestataire.is_validated ? "Validated" : "Pending"}
                  </strong>
                </td>
                <td className="action-buttons">
                  <button
                    className="btn-approve"
                    onClick={() => handleValidatePrestataire(prestataire.id)}
                    disabled={busyPrestataireId === prestataire.id}
                  >
                    {busyPrestataireId === prestataire.id ? "..." : "Validate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="providers-view">
      <div className="admin-actions-bar">
        <div className="filter-group">
          <label><MdFilterList /> Reservations</label>
        </div>
        <div className="export-buttons">
          <button className="btn-export" onClick={loadAdminData}><MdFileDownload /> Refresh</button>
        </div>
      </div>

      <div className="table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Service</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Ville</th>
              <th>Invites</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length ? (
              reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>
                    <strong>{reservation.client_name || reservation.client || "Client"}</strong>
                    <div>{reservation.client_email || reservation.phone || "-"}</div>
                  </td>
                  <td>{reservation.service_name || reservation.service || "Service"}</td>
                  <td>{formatReservationDate(reservation)}</td>
                  <td>{reservation.start_time} - {reservation.end_time}</td>
                  <td>{reservation.city || "-"}</td>
                  <td>{reservation.guests ?? 1}</td>
                  <td>
                    <strong className={reservation.status === "accepted" ? "text-approved" : reservation.status === "pending" ? "text-pending" : "text-rejected"}>
                      {reservation.status}
                    </strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">Aucune reservation pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>AAR<span>SSI</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button className={currentView === "dashboard" ? "active" : ""} onClick={() => setCurrentView("dashboard")}>
            <MdDashboard /> Dashboard
          </button>
          <button className={currentView === "users" ? "active" : ""} onClick={() => setCurrentView("users")}>
            <MdPeople /> Utilisateurs
          </button>
          <button className={currentView === "prestataires" ? "active" : ""} onClick={() => setCurrentView("prestataires")}>
            <MdStore /> Validation prestataires
          </button>
          <button className={currentView === "reservations" ? "active" : ""} onClick={() => setCurrentView("reservations")}>
            <MdEvent /> Reservations
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>AARSSI Admin Dashboard</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-filters">
              <button className="header-logout" onClick={handleLogout} disabled={actionLoading}>
                <MdLogout /> {actionLoading ? "..." : "Deconnexion"}
              </button>
            </div>
          </div>
        </header>

        <div className="admin-content-area">
          {loading ? (
            <div className="generic-view">
              <h2>Chargement</h2>
              <p>Recuperation des donnees depuis la base de donnees...</p>
            </div>
          ) : error ? (
            <div className="generic-view">
              <h2>Erreur</h2>
              <p>{error}</p>
              <button className="btn-create" onClick={loadAdminData}>
                Reessayer
              </button>
            </div>
          ) : currentView === "dashboard" ? (
            renderDashboard()
          ) : currentView === "users" ? (
            renderUsers()
          ) : currentView === "reservations" ? (
            renderReservations()
          ) : (
            renderPrestataires()
          )}
        </div>
      </main>

      {userModalMode && (
        <div className="modal-overlay" onMouseDown={closeUserModal}>
          <div className="modal-content admin-user-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{userModalMode === "create" ? "Ajouter utilisateur" : "Modifier utilisateur"}</h2>
              <button type="button" onClick={closeUserModal} disabled={userFormLoading}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleUserFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    name="name"
                    type="text"
                    value={userForm.name}
                    onChange={handleUserFormChange}
                    disabled={userFormLoading}
                    required
                  />
                  {userFormErrors.name ? <span className="form-error">{userFormErrors.name[0]}</span> : null}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={handleUserFormChange}
                    disabled={userFormLoading}
                    required
                  />
                  {userFormErrors.email ? <span className="form-error">{userFormErrors.email[0]}</span> : null}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{userModalMode === "create" ? "Mot de passe" : "Mot de passe optionnel"}</label>
                  <input
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleUserFormChange}
                    disabled={userFormLoading}
                    required={userModalMode === "create"}
                    placeholder={userModalMode === "edit" ? "Laisser vide pour conserver l'actuel" : ""}
                  />
                  {userFormErrors.password ? <span className="form-error">{userFormErrors.password[0]}</span> : null}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                    disabled={userFormLoading}
                    required
                  >
                    {userFormRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  {userFormErrors.role ? <span className="form-error">{userFormErrors.role[0]}</span> : null}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeUserModal} disabled={userFormLoading}>
                  Annuler
                </button>
                <button type="submit" className="btn-save" disabled={userFormLoading}>
                  {userFormLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
