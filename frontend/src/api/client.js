import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const rawAuth = localStorage.getItem("sip_auth");
  const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
  const parsedUser = parsedAuth?.user || null;

  if (parsedAuth?.token) {
    config.headers.Authorization = `Bearer ${parsedAuth.token}`;
  }
  config.headers["X-Actor"] = parsedUser?.username || "system";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      globalThis.dispatchEvent(new CustomEvent("sip:unauthorized"));
    }
    return Promise.reject(error);
  }
);
