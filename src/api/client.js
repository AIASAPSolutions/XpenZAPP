import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';

const apiClient = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthToken = async () => {
  try {
    const { useAuthStore } = await import('../store/authStore');
    const storeToken = useAuthStore.getState().token;
    if (storeToken) return storeToken;
  } catch {
    // authStore not ready yet
  }
  return SecureStore.getItemAsync('user_token');
};

const persistTokens = async (accessToken, refreshToken) => {
  if (accessToken) {
    await SecureStore.setItemAsync('user_token', accessToken);
    try {
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.setState({ token: accessToken });
    } catch {
      // ignore
    }
  }
  if (refreshToken) {
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  }
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Default to JSON, but respect an explicitly-set content type
    // (form-urlencoded logins, multipart receipt uploads, etc.)
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      const res = await axios.post(
        `${CONFIG.BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const accessToken = res.data?.access_token || res.data?.token;
      const newRefresh = res.data?.refresh_token || refreshToken;

      if (!accessToken) {
        return Promise.reject(error);
      }

      await persistTokens(accessToken, newRefresh);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error('[XpenZ API] Token refresh failed', refreshError);
      return Promise.reject(refreshError);
    }
  }
);

export const request = async (method, path, data = null, options = {}) => {
  return apiClient({ method, url: path, data, ...options });
};

/**
 * Sends an application/x-www-form-urlencoded request through the same
 * axios instance as request(), so the Bearer token interceptor still applies.
 * Accepts a plain object and serializes it to a URL-encoded body.
 */
export const formRequest = async (method, path, fields = {}, options = {}) => {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key, value);
    }
  });

  return apiClient({
    method,
    url: path,
    data: body.toString(),
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export default apiClient;
