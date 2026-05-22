import api, { fetchCurrentUser } from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user";
const LEGACY_USER_KEY = "userData";

let activeUserRefreshPromise = null;

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const hasStoredToken = () => Boolean(getStoredToken());

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    return null;
  }
};

export const storeUserData = (user) => {
  if (!user) {
    return null;
  }

  const normalizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    city: user.city ?? null,
    photo_profile: user.photo_profile ?? null,
    photo_url: user.photo_url ?? null,
    created_at: user.created_at ?? null,
    role: user.role ?? null,
    client: user.client ?? null,
    prestataire: user.prestataire ?? null,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(normalizedUser));

  return normalizedUser;
};

export const storeAuthData = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    storeUserData(user);
  }

  window.dispatchEvent(new Event("auth:changed"));
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  sessionStorage.removeItem("isAdminAuthenticated");
  sessionStorage.removeItem("isProviderAuthenticated");
  window.dispatchEvent(new Event("auth:changed"));
};

export const getDefaultRouteForRole = (role) => {
  if (role === "prestataire") {
    return "/provider-dashboard";
  }

  if (role === "admin") {
    return "/admin-dashboard";
  }

  return "/user-dashboard";
};

export const refreshStoredUser = async () => {
  if (!getStoredToken()) {
    clearAuthData();
    return null;
  }

  if (!activeUserRefreshPromise) {
    activeUserRefreshPromise = fetchCurrentUser()
      .then((user) => {
        const normalizedUser = storeUserData(user);
        window.dispatchEvent(new Event("auth:changed"));
        return normalizedUser;
      })
      .catch((error) => {
        clearAuthData();
        throw error;
      })
      .finally(() => {
        activeUserRefreshPromise = null;
      });
  }

  return activeUserRefreshPromise;
};

const loginRequest = async ({ email, password }) => api.post("/login", { email, password });

export const loginUser = async (email, password) => {
  const response = await loginRequest({ email, password });
  const { user, token } = response.data;

  storeAuthData({ token, user });

  const refreshedUser = await refreshStoredUser();

  return {
    ...response.data,
    user: refreshedUser ?? user ?? null,
  };
};

export const registerUser = async (payload) => {
  const response = await api.post("/register", payload);
  const { user, token } = response.data;

  storeAuthData({ token, user });

  const refreshedUser = await refreshStoredUser();

  return {
    ...response.data,
    user: refreshedUser ?? user ?? null,
  };
};

export const logoutUser = async () => {
  try {
    if (getStoredToken()) {
      await api.post("/logout");
    }
  } catch (error) {
    // Ignore logout request failures and clear local auth state anyway.
  } finally {
    clearAuthData();
  }
};

export const bootstrapAuth = async () => {
  if (!getStoredToken()) {
    clearAuthData();
    return null;
  }

  return refreshStoredUser();
};

export const forceLogout = (redirectTo = "/connexion") => {
  clearAuthData();

  if (window.location.pathname !== redirectTo) {
    window.location.assign(redirectTo);
  }
};

export const isAuthenticated = () => hasStoredToken();
