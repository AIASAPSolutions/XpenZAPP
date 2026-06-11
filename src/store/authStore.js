import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth';
import * as profileApi from '../api/profile';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  biometricsEnabled: false,
  defaultCurrency: 'INR',

  login: async (email, password, rememberMe = true) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password, rememberMe);
      const { user, token } = response.data;
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please verify your email and password.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  signup: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.signup(userData);
      const { user, token } = response.data;
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("Logout request failed. Clearing local storage anyway.", e);
    }
    
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('refresh_token');
    
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false, 
      loading: false 
    });
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await profileApi.updateProfile(profileData);
      set({ user: response.data, loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile details.';
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
      const errorMsg = err.response?.data?.message || 'Failed to update password.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  setBiometrics: (enabled) => {
    set({ biometricsEnabled: enabled });
  },

  setDefaultCurrency: (currency) => {
    set({ defaultCurrency: currency });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        // Fetch user profile to verify token integrity
        const response = await profileApi.getProfile();
        set({ 
          token, 
          user: response.data, 
          isAuthenticated: true 
        });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (e) {
      console.warn("Auto login check failed or no token stored", e);
      set({ isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null })
}));
