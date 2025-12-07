import axios from 'axios';
import { useStore } from '../store/useStore';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Objects API
export const objectsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/objects', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/objects/${id}`);
    return response.data;
  },
  getRegions: async () => {
    const response = await api.get('/objects/meta/regions');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/objects/meta/stats');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  askAssistant: async (query) => {
    const response = await api.post('/analytics/assistant', { query });
    return response.data;
  },
  getRoute: async (params = {}) => {
    const response = await api.get('/analytics/route', { params });
    return response.data;
  },
  getHeatmap: async () => {
    const response = await api.get('/analytics/heatmap');
    return response.data;
  },
  getPriorityTable: async (params = {}) => {
    const response = await api.get('/analytics/priority-table', { params });
    return response.data;
  },
};

export default api;

