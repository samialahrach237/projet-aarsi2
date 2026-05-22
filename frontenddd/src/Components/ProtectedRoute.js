import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getDefaultRouteForRole,
  getStoredToken,
  getStoredUser,
  refreshStoredUser,
} from "../services/authService";

function ProtectedRoute({ children, requiredRole = null, allowedRoles = [] }) {
  const location = useLocation();
  const [state, setState] = useState({
    isLoading: true,
    token: getStoredToken(),
    user: getStoredUser(),
  });

  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      const token = getStoredToken();

      if (!token) {
        if (isMounted) {
          setState({
            isLoading: false,
            token: null,
            user: null,
          });
        }
        return;
      }

      try {
        const user = await refreshStoredUser();

        if (isMounted) {
          setState({
            isLoading: false,
            token,
            user,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            isLoading: false,
            token: null,
            user: null,
          });
        }
      }
    };

    syncWithServer();

    const syncFromStorage = () => {
      setState((current) => ({
        ...current,
        token: getStoredToken(),
        user: getStoredUser(),
      }));
    };

    window.addEventListener("auth:changed", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:changed", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const { isLoading, token, user } = state;

  if (isLoading) {
    return null;
  }

  if (!token || !user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  const acceptedRoles = allowedRoles.length ? allowedRoles : requiredRole ? [requiredRole] : [];

  if (acceptedRoles.length && !acceptedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
