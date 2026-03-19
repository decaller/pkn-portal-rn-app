/**
 * PKN Portal API Client
 * Configured for public (unauthenticated) API calls.
 * Auth interceptors will be added in Phase 2.
 */
import axios from 'axios';

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

// Response interceptor — normalize error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
