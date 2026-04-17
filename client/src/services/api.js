import axios from 'axios';

// Must match PORT in server/.env (default 5001 — 5000 is often occupied by other tools on Windows).
export const API_ORIGIN = 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;