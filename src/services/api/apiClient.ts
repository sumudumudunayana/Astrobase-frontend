import axios, { AxiosError } from 'axios';
import { getOrCreateLearnerId } from './learnerIdentity';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5244/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach unique learner identity header
apiClient.interceptors.request.use(
  (config) => {
    const learnerId = getOrCreateLearnerId();
    config.headers.set('X-Learner-Id', learnerId);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for telemetry logging and friendly error reporting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; status?: string }>) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || 'Telemetry connection error';
    
    // Log structured telemetry error in console
    console.warn(`[AstroBase Telemetry Error] [HTTP ${status || 'Network'}]: ${errorMessage}`, {
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

