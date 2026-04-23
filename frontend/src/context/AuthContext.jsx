import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/client";
import { AuthContext } from "./AuthContextObject";
import { getTokenExpiryMs, isTokenExpired } from "../utils/jwt";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("sip_auth");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.token || isTokenExpired(parsed.token)) {
        localStorage.removeItem("sip_auth");
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem("sip_auth");
      return null;
    }
  });

  const user = auth?.user || null;

  const clearAuth = useCallback(() => {
    localStorage.removeItem("sip_auth");
    setAuth(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    localStorage.setItem("sip_auth", JSON.stringify(response.data));
    setAuth(response.data);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const isAuthenticated = !!auth?.token && !isTokenExpired(auth.token);

  const tokenExpiresAt = auth?.token ? getTokenExpiryMs(auth.token) : null;

  useEffect(() => {
    if (!tokenExpiresAt) return undefined;
    const msLeft = tokenExpiresAt - Date.now();
    if (msLeft <= 0) {
      clearAuth();
      return undefined;
    }

    const timer = setTimeout(() => {
      clearAuth();
      globalThis.dispatchEvent(new CustomEvent("sip:session-expired"));
    }, msLeft);

    return () => clearTimeout(timer);
  }, [clearAuth, tokenExpiresAt]);

  useEffect(() => {
    const onUnauthorized = () => clearAuth();
    globalThis.addEventListener("sip:unauthorized", onUnauthorized);
    return () => globalThis.removeEventListener("sip:unauthorized", onUnauthorized);
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated,
      token: auth?.token || null,
      isAdmin: user?.role === "ADMIN",
    }),
    [auth?.token, isAuthenticated, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
