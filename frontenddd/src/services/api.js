import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const TOKEN_KEY = "auth_token";
const USER_KEY = "user";
const LEGACY_USER_KEY = "userData";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = config.headers ?? {};

  headers.Accept = "application/json";

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    delete headers.Authorization;
  }

  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      sessionStorage.removeItem("isAdminAuthenticated");
      sessionStorage.removeItem("isProviderAuthenticated");
      window.dispatchEvent(new Event("auth:changed"));

      if (window.location.pathname !== "/connexion") {
        window.location.href = "/connexion";
      }
    }

    return Promise.reject(error);
  }
);

const normalizePayload = (response) => response?.data?.data ?? response?.data;

export const fetchCurrentUser = async () => {
  const response = await api.get("/user");
  return normalizePayload(response);
};

export const fetchServices = async (params = {}) => {
  const response = await api.get("/services", { params });
  return normalizePayload(response);
};

export const searchServices = async (params = {}) => {
  const response = await api.get("/services/search", { params });
  return normalizePayload(response);
};

export const fetchServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return normalizePayload(response);
};

export const fetchCategories = async () => {
  const response = await api.get("/categories");
  return normalizePayload(response);
};

export const fetchPrestataires = async () => {
  const response = await api.get("/prestataires");
  return normalizePayload(response);
};

export const fetchPrestatairePhotos = async (prestataireId) => {
  const response = await api.get(`/photos/${prestataireId}`);
  return normalizePayload(response);
};

export const fetchProviderPhotos = async () => {
  const response = await api.get("/provider/photos");
  return normalizePayload(response);
};

export const uploadProviderPhoto = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/provider/photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizePayload(response);
};

export const updateProviderPhoto = async (photoId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post(`/provider/photos/${photoId}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizePayload(response);
};

export const deleteProviderPhoto = async (photoId) => {
  const response = await api.delete(`/provider/photos/${photoId}`);
  return normalizePayload(response);
};

export const fetchProviderDashboard = async () => {
  const response = await api.get("/provider/dashboard");
  return normalizePayload(response);
};

export const fetchProviderStatistics = async () => {
  const response = await api.get("/provider/statistics");
  return normalizePayload(response);
};

export const fetchProviderRecentReservations = async () => {
  const response = await api.get("/provider/reservations/recent");
  return normalizePayload(response);
};

export const fetchProviderServices = async () => {
  const response = await api.get("/provider/services");
  return normalizePayload(response);
};

export const createProviderService = async (payload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("category", payload.category);
  formData.append("price", payload.price);
  formData.append("duration", payload.duration);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.post("/provider/services", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizePayload(response);
};

export const updateProviderService = async (serviceId, payload) => {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }

  if (payload.category !== undefined) {
    formData.append("category", payload.category);
  }

  if (payload.price !== undefined) {
    formData.append("price", payload.price);
  }

  if (payload.duration !== undefined) {
    formData.append("duration", payload.duration);
  }

  if (payload.description !== undefined) {
    formData.append("description", payload.description ?? "");
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.post(`/provider/services/${serviceId}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizePayload(response);
};

export const deleteProviderService = async (serviceId) => {
  const response = await api.delete(`/provider/services/${serviceId}`);
  return normalizePayload(response);
};

export const fetchProviderReservations = async () => {
  const response = await api.get("/provider/reservations");
  return normalizePayload(response);
};

export const acceptProviderReservation = async (reservationId) => {
  const response = await api.post(`/provider/reservations/${reservationId}/accept`);
  return normalizePayload(response);
};

export const refuseProviderReservation = async (reservationId) => {
  const response = await api.post(`/provider/reservations/${reservationId}/refuse`);
  return normalizePayload(response);
};

export const fetchProviderCalendar = async () => {
  const response = await api.get("/provider/calendrier");
  return normalizePayload(response);
};

export const createProviderAvailability = async (payload) => {
  const response = await api.post("/provider/calendar", payload);
  return normalizePayload(response);
};

export const updateProviderAvailability = async (calendarId, payload) => {
  const response = await api.put(`/provider/calendar/${calendarId}`, payload);
  return normalizePayload(response);
};

export const deleteProviderAvailability = async (calendarId) => {
  const response = await api.delete(`/provider/calendar/${calendarId}`);
  return normalizePayload(response);
};

export const createReservation = async (payload) => {
  const response = await api.post("/reservations", payload);
  return normalizePayload(response);
};

export const fetchClientReservations = async (params = {}, options = {}) => {
  const response = await api.get("/client/reservations", { params });
  return options.raw ? response.data : normalizePayload(response);
};

export const fetchUserReservations = fetchClientReservations;

export const cancelReservation = async (reservationId) => {
  const response = await api.delete(`/reservations/${reservationId}`);
  return normalizePayload(response);
};

export const fetchClientAvis = async (params = {}, options = {}) => {
  const response = await api.get("/client/avis", { params });
  return options.raw ? response.data : normalizePayload(response);
};

export const fetchPublicAvis = async () => {
  const response = await api.get("/reviews");
  return normalizePayload(response);
};

export const fetchUserAvis = fetchClientAvis;

export const createAvis = async (payload) => {
  const response = await api.post("/avis", payload);
  return normalizePayload(response);
};

export const updateAvis = async (avisId, payload) => {
  const response = await api.put(`/avis/${avisId}`, payload);
  return normalizePayload(response);
};

export const deleteAvis = async (avisId) => {
  const response = await api.delete(`/avis/${avisId}`);
  return normalizePayload(response);
};

export const fetchClientProfile = async () => {
  const response = await api.get("/client/profile");
  return normalizePayload(response);
};

export const fetchUserProfile = fetchClientProfile;

export const updateUserProfile = async (payload) => {
  const response = await api.put("/user", payload);
  return normalizePayload(response);
};

export const fetchUserProfilePhoto = async () => {
  const response = await api.get("/user/photo-profile");
  return normalizePayload(response);
};

export const uploadUserProfilePhoto = async (imageFile) => {
  const formData = new FormData();
  formData.append("photo_profile", imageFile);

  const response = await api.post("/user/photo-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizePayload(response);
};

export const fetchAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return normalizePayload(response);
};

export const fetchAdminUserForm = async () => {
  const response = await api.get("/admin/users/create");
  return normalizePayload(response);
};

export const fetchAdminUser = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/edit`);
  return normalizePayload(response);
};

export const createAdminUser = async (payload) => {
  const response = await api.post("/admin/users", payload);
  return normalizePayload(response);
};

export const updateAdminUser = async (userId, payload) => {
  const response = await api.put(`/admin/users/${userId}`, payload);
  return normalizePayload(response);
};

export const fetchAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return normalizePayload(response);
};

export const fetchAdminReservations = async () => {
  const response = await api.get("/reservations");
  return normalizePayload(response);
};

export const fetchAdminPendingPrestataires = async () => {
  const response = await api.get("/admin/prestataires/pending");
  return normalizePayload(response);
};

export const validatePrestataire = async (prestataireId) => {
  const response = await api.post(`/admin/prestataires/${prestataireId}/validate`);
  return normalizePayload(response);
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return normalizePayload(response);
};

export default api;
