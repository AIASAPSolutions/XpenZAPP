import { request } from './client';

export const getProfile = () => {
  return request('get', '/profile');
};

export const updateProfile = (profileData) => {
  return request('put', '/profile', profileData);
};

export const changePassword = (currentPassword, newPassword) => {
  return request('put', '/profile/change-password', { currentPassword, newPassword });
};
