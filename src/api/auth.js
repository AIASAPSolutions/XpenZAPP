import { request } from './client';

export const login = (email, password, rememberMe) => {
  return request('post', '/auth/login', { email, password, rememberMe });
};

export const signup = (userData) => {
  return request('post', '/auth/signup', userData);
};

export const logout = () => {
  return request('post', '/auth/logout');
};

export const forgotPassword = (email) => {
  return request('post', '/auth/forgot-password', { email });
};

export const refreshToken = (refresh) => {
  return request('post', '/auth/refresh', { refreshToken: refresh });
};
