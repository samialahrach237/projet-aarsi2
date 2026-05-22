import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./index.css";
import "./App.css";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import ProtectedRoute from "./Components/ProtectedRoute";
import ScrollToTop from "./Components/ScrollToTop";
import ToastContainer from "./Components/ToastContainer";
import Accueil from "./pages/Accueil";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Avis from "./pages/Avis";
import Connexion from "./pages/Connexion";
import Contact from "./pages/Contact";
import MyAvis from "./pages/MyAvis";
import NotFound from "./pages/error";
import Profile from "./pages/Profile";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import Provider from "./pages/provider";
import Reservation from "./pages/Reservation";
import Services from "./pages/Services";
import UserDashboard from "./pages/UserDashboard";
import {
  bootstrapAuth,
  clearAuthData,
  getDefaultRouteForRole,
  getStoredToken,
  getStoredUser,
} from "./services/authService";

function RoleRedirect() {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user?.role) {
    return <Navigate to="/connexion" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}

const DASHBOARD_ROUTE_PATHS = [
  "/dashboard",
  "/user-dashboard",
  "/mes-avis",
  "/profile",
  "/provider-dashboard",
  "/admin",
  "/admin-dashboard",
];

const isDashboardRoute = (pathname) => {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  return DASHBOARD_ROUTE_PATHS.some((routePath) => (
    normalizedPath === routePath || normalizedPath.startsWith(`${routePath}/`)
  ));
};

function AppShell() {
  const location = useLocation();
  const shouldHidePublicLayout = isDashboardRoute(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!shouldHidePublicLayout && <Header />}
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ProviderProfile />} />
        <Route path="/service/:id" element={<ProviderProfile />} />
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredRole="client">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/avis" element={<Avis />} />
        <Route
          path="/mes-avis"
          element={
            <ProtectedRoute requiredRole="client">
              <MyAvis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="client">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/provider" element={<Provider />} />
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute requiredRole="prestataire">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<RoleRedirect />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/reservation/:id"
          element={
            <ProtectedRoute requiredRole="client">
              <Reservation />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!shouldHidePublicLayout && <Footer />}
    </>
  );
}

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncAuthenticatedUser = async () => {
      const token = getStoredToken();

      if (!token) {
        if (isMounted) {
          setIsAuthReady(true);
        }
        return;
      }

      try {
        await bootstrapAuth();
      } catch (error) {
        clearAuthData();
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    syncAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAuthReady) {
    return null;
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
