/**
 * PKN Portal API Client
 * Configured for public (unauthenticated) API calls.
 * Auth interceptors will be added in Phase 2.
 */
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Base URL configured via environment variables (.env files)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://portal.pkn.or.id/api/v1';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach token if available
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize error responses and handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    // Normalize network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }
    return Promise.reject(error.response.data || error);
  },
);

export { API_BASE_URL };
export default api;
