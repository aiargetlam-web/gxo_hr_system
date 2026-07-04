import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ⭐ REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⭐ RESPONSE INTERCEPTOR (SENZA REDIRECT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se il token è scaduto → lo rimuoviamo
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // ❌ NON fare redirect qui
      // ProtectedRoute gestirà il redirect in modo sicuro
    }

    return Promise.reject(error);
  }
);

export default api;
