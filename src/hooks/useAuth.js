import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const auth = useAuthStore();
  
  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    biometricsEnabled: auth.biometricsEnabled,
    defaultCurrency: auth.defaultCurrency,
    login: auth.login,
    signup: auth.signup,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
    setBiometrics: auth.setBiometrics,
    setDefaultCurrency: auth.setDefaultCurrency,
    checkAuth: auth.checkAuth,
    clearError: auth.clearError,
  };
};
export default useAuth;
