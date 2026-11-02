import { createContext, useState, useEffect, useContext } from "react";
import { apiFetch } from "../api";

// The JWT lives in an httpOnly cookie that JavaScript cannot read,
// so we ask the server who is logged in (/api/auth/me).
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Remove the token saved by the Experiment 4 version (localStorage is
    // readable by any script on the page, so it is no longer used).
    localStorage.removeItem("token");

    apiFetch("/api/auth/me")
      .then(({ ok, data }) => setUser(ok ? data.user : null))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, checking }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
