import { useContext } from "react";
import { AuthContext } from "../Services/AuthContext";
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    return true;
  }
};

export const useAuth = () => {
  const { user, loading } = useContext(AuthContext);
  const token = user?.token || null;
  const isExpired = token ? isTokenExpired(token) : true;

  return {
    ...user,
    token,
    loading,
    isAuthenticated: !!token && !isExpired,
    isTokenExpired: isExpired,
  };
};
