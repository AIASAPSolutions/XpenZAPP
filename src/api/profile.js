import { request } from './client';
import { normalizeUser } from './normalizers';

export const getProfile = async () => {
  const res = await request('get', '/auth/me');
  return { data: normalizeUser(res.data) };
};

const extractMembers = (data) => {
  const list = Array.isArray(data) ? data : data?.members || data?.data || [];
  return list.map(normalizeUser);
};

export const getOrganizationMembers = async () => {
  try {
    const res = await request('get', '/organizations/members');
    return { data: extractMembers(res.data) };
  } catch (err) {
    if (err?.response?.status === 422 || err?.response?.status === 404) {
      try {
        const res2 = await request('get', '/organizations/me/members');
        return { data: extractMembers(res2.data) };
      } catch {
        return { data: [] };
      }
    }
    return { data: [] };
  }
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