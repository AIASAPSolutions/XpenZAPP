import { request } from './client';
import { normalizeUser } from './normalizers';

export const getProfile = async () => {
  const res = await request('get', '/auth/me');
  return { data: normalizeUser(res.data) };
};

export const getOrganizationMembers = async () => {
  const res = await request('get', '/organizations/members');
  const list = Array.isArray(res.data) ? res.data : res.data?.members || res.data?.data || [];
  return { data: list.map(normalizeUser) };
};

export const updateProfile = async (profileData) => {
  const res = await request('put', '/auth/me', {
    full_name: profileData.fullName || profileData.name,
    phone_number: profileData.phone || profileData.phone_number || undefined,
  });
  return { data: normalizeUser(res.data) };
};

export const changePassword = async (currentPassword, newPassword) => {
  return request('post', '/auth/change-password', { current_password: currentPassword, new_password: newPassword });
};