import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const saved = localStorage.getItem('user');
      const role = saved ? JSON.parse(saved)?.role : null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = role === 'admin' ? '/admin-login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
