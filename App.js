import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import useTheme from './src/hooks/useTheme';
import Toast from './src/components/common/Toast';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Dynamic Core App Shell to consume Zustand theme states
const AppContent = () => {
  const { paperTheme } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator />
      <Toast />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
