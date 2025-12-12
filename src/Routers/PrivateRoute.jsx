import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { logout } from "../Services/AuthContext";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = () => {
  const { isAuthenticated, isTokenExpired, loading } = useAuth();
  const location = useLocation();

  // Espera a que termine el loading del contexto antes de evaluar
  if (loading) return null;

  if (!isAuthenticated && isTokenExpired) {
    localStorage.setItem(
      "toast_message",
      "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
    );
    logout();
    window.location.href = "/login";
    return null;
  }

  return <Outlet />;
};


export default PrivateRoute;
