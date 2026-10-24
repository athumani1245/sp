import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshToken } from '../services/authService';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
const API_KEY = process.env.REACT_APP_API_KEY || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY,
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        const result = await refreshToken(refresh);

        if (result.success && result.token) {
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${result.token}`;
          }
          return api(originalRequest);
        }
      }

      // Refresh failed, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('subscription');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
