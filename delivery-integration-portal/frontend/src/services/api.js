import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fantastic-broccoli-wr5w5r77v5w92gv4w-8000.app.github.dev/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;