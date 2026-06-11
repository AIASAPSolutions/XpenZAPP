import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const AppNavigator = () => {
  const { isAuthenticated, checkAuth } = useAuth();
  const { isDark } = useTheme();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      await checkAuth();
      setInitializing(false);
    };
    initializeSession();
  }, [checkAuth]);

  if (initializing) {
    return <LoadingSpinner fullScreen message="Restoring secure login session..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
export default AppNavigator;
