import axios from 'axios';
import LODGIX_CONFIG from '@/config/lodgix';
import rateLimiter from './rateLimiter';

// Create a preconfigured Axios instance for Lodgix API
const lodgixApi = axios.create({
  baseURL: LODGIX_CONFIG.API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Do not transform JSON; let axios handle
  validateStatus: () => true,
});

// Request interceptor: inject auth header and enforce 3 rps
lodgixApi.interceptors.request.use(async (config) => {
  // Rate limit globally across this process
  await rateLimiter.schedule();
  const key = LODGIX_CONFIG.getApiKey();
  if (key) {
    // Lodgix expects Token auth
    config.headers.Authorization = `Token ${key}`;
  }
  return config;
});

// Response interceptor: normalize errors
lodgixApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network or timeout
    return Promise.resolve({
      status: error.response?.status || 0,
      data: {
        error: 'Network error',
        message: error.message,
      },
    });
  }
);

export default lodgixApi;
