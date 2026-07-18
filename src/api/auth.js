import { request, formRequest } from './client';
import { extractAuthPayload, normalizeUser } from './normalizers';

export const login = async (email, password) => {
  // FastAPI OAuth2 password flow expects form-urlencoded username + password
  const res = await formRequest('post', '/auth/login', {
    username: email,
    password,
  });
  return { data: extractAuthPayload(res.data) };
};

export const register = async ({ email, password, name, phone, subscriptionCode, companyCode, userType }) => {
  const res = await request('post', '/auth/signup', {
    email,
    password,
    full_name: name,
    phone_number: phone || null,
    user_type: userType || 'individual',
    subscription_code: subscriptionCode,
    company_code: companyCode || undefined,
  });
  return { data: res.data }; // returns UserResponse, no token yet
};

export const verifyOtp = async (email, otpCode) => {
  const res = await request('post', '/auth/verify-otp', {
    email,
    otp_code: otpCode,
  });
  return { data: extractAuthPayload(res.data) }; // returns Token
};

export const resendOtp = async (email) => {
  const res = await request('post', '/auth/resend-otp', { email });
  return res.data;
};

export const getMe = async () => {
  const res = await request('get', '/auth/me');
  return { data: normalizeUser(res.data) };
};

export const refreshToken = async (refresh) => {
  const res = await request('post', '/auth/refresh', { refresh_token: refresh });
  return res;
};

export const logout = async () => {
  try {
    return await request('post', '/auth/logout');
  } catch (err) {
    if (err.response?.status === 404) return;
    throw err;
  }
};

export const forgotPassword = async (email) => {
  const res = await request('post', '/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (email, otpCode, newPassword) => {
  const res = await request('post', '/auth/reset-password', {
    email,
    otp_code: otpCode,
    new_password: newPassword,
  });
  return { data: extractAuthPayload(res.data) };
};

/** @deprecated Use register() */
export const signup = (userData) => register({
  email: userData.email,
  password: userData.password,
  name: userData.fullName || userData.name,
  phone: userData.phone,
  subscriptionCode: userData.subscriptionCode || userData.companyCode || '',
  companyCode: userData.organizationCode,
  userType: userData.accountType,
});