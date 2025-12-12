import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../Services/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null; 

  // No logueado -> al login con redirect de vuelta a /admin
  if (!user?.token) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  // Logueado pero no admin -> a /home con aviso
  if ((user?.user_type || "").toLowerCase() !== "admin") {
    localStorage.setItem(
      "toast_message",
      "No tienes permisos para ver esta sección."
    );
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
