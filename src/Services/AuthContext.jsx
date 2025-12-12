import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const setSession = (data) => {
 
  if (data) {
    localStorage.setItem("SAG_USER", JSON.stringify(data));
  } else {
    localStorage.removeItem("SAG_USER");
  }
};

export const getSession = () => {
  const userData = localStorage.getItem("SAG_USER");
  return userData && userData !== "undefined" ? JSON.parse(userData) : null;
};

export const logout = () => {
  localStorage.removeItem("SAG_USER");
  localStorage.removeItem("user_id");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setUser(getSession());
    setLoading(false);

    const onStorageChange = () => {
      setUser(getSession());
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

