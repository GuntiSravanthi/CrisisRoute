import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crisisroute_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crisisroute_token');
      localStorage.removeItem('crisisroute_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
};

export const reportsAPI = {
  create: (formData) => api.post('/api/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/api/reports'),
  myReports: () => api.get('/api/reports/my'),
  get: (id) => api.get(`/api/reports/${id}`),
  detect: (formData) => api.post('/api/reports/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadPDF: (id) => api.get(`/api/reports/${id}/pdf`, { responseType: 'blob' }),
};

export const sheltersAPI = {
  list: (lat, lng) => api.get('/api/shelters', { params: { latitude: lat, longitude: lng } }),
  get: (id) => api.get(`/api/shelters/${id}`),
};

export const analyticsAPI = {
  get: () => api.get('/api/analytics'),
};

export const assistantAPI = {
  chat: (message, latitude, longitude) =>
    api.post('/api/assistant/chat', { message, latitude, longitude }),
};

export const adminAPI = {
  getReports: () => api.get('/api/admin/reports'),
  deleteReport: (id) => api.delete(`/api/admin/reports/${id}`),
  getShelters: () => api.get('/api/admin/shelters'),
  createShelter: (data) => api.post('/api/admin/shelters', data),
  updateShelter: (id, data) => api.put(`/api/admin/shelters/${id}`, data),
  getAnalytics: () => api.get('/api/admin/analytics'),
  getUserCount: () => api.get('/api/admin/users/count'),
};

export default api;
