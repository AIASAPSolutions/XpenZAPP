import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth';
import * as profileApi from '../api/profile';
import { normalizeUser } from '../api/normalizers';

const persistSession = async (set, { token, refreshToken, user }) => {
  if (token) await SecureStore.setItemAsync('user_token', token);
  if (refreshToken) await SecureStore.setItemAsync('refresh_token', refreshToken);
  set({ user, token, isAuthenticated: true, loading: false });
};

const parseError = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
  return err.response?.data?.message || fallback;
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  biometricsEnabled: false,
  defaultCurrency: 'INR',

  login: async (email, password) => {
  set({ loading: true, error: null });
  try {
    const response = await authApi.login(email, password);
    const token = response.data.token || response.data.access_token;
    const refreshToken = response.data.refreshToken || response.data.refresh_token || null;

    // Store token first so getMe() interceptor can use it
    await SecureStore.setItemAsync('user_token', token);

    const meResponse = await authApi.getMe();
    const user = meResponse.data;
    console.log('USER FROM /me:', JSON.stringify(user));

    await persistSession(set, { user, token, refreshToken });
    return { success: true };
  } catch (err) {
    console.log('LOGIN ERROR:', err.message, err.response?.data);
    const errorMsg = parseError(err, 'Login failed. Please verify your email and password.');
    set({ error: errorMsg, loading: false });
    return { success: false, error: errorMsg };
  }
},
  signup: async (userData) => {
    set({ loading: true, error: null });
    try {
      await authApi.register({
        email: userData.email,
        password: userData.password,
        name: userData.fullName,
        phone: userData.phone || null,
        subscriptionCode: userData.subscriptionCode || '',
        companyCode: userData.organizationCode || undefined,
        userType: userData.accountType || 'individual',
      });
      set({ loading: false });
      return { success: true, requiresOtp: true, email: userData.email };
    } catch (err) {
      const errorMsg = parseError(err, 'Registration failed. Please try again.');
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  verifyOtp: async (email, otpCode) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.verifyOtp(email, otpCode);
      const { token, refreshToken } = response.data;
      const meResponse = await authApi.getMe();
      const user = meResponse.data;
      await persistSession(set, { user, token, refreshToken });
      return { success: true };
    } catch (err) {
      const errorMsg = parseError(err, 'Invalid or expired OTP.');
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  resendOtp: async (email) => {
    try {
      await authApi.resendOtp(email);
      return { success: true };
    } catch (err) {
      const errorMsg = parseError(err, 'Failed to resend OTP.');
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout request failed. Clearing local storage anyway.', e);
    }
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await profileApi.updateProfile(profileData);
      set({ user: response.data, loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = parseError(err, 'Failed to update profile details.');
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = parseError(err, 'Failed to update password.');
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  setBiometrics: (enabled) => set({ biometricsEnabled: enabled }),

  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        // Set token in store first so axios interceptor picks it up
        set({ token });
        const response = await profileApi.getProfile();
        set({
          token,
          user: response.data,
          isAuthenticated: true,
        });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (e) {
      console.warn('Auto login check failed or no token stored', e);
      const status = e?.response?.status;
      if (status === 403 || status === 401) {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
      set({ isAuthenticated: false, user: null, token: null });
    }
  },

  clearError: () => set({ error: null }),
}));