import React from 'react';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { KeyboardAvoidanceProvider } from './src/contexts/KeyboardAvoidanceContext';
import { KeyboardFocusProvider } from './src/contexts/KeyboardFocusContext';
import { AnimationProvider } from './src/contexts/AnimationContext';
import { PinLockProvider } from './src/contexts/PinLockContext';
import ErrorBoundary from './src/components/ui/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import AlertProvider from './src/components/ui/AlertProvider';
import PinLockModal from './src/components/ui/PinLockModal';
import errorLogger from './src/utils/errorLogger';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (fontError) {
    console.error('Font loading error:', fontError);
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            errorLogger.logError(error, {
              componentStack: errorInfo.componentStack,
              appLevel: true,
            });
          }}
        >
          <ThemeProvider>
            <AnimationProvider>
              <KeyboardAvoidanceProvider>
                <KeyboardFocusProvider>
                  <AuthProvider>
                    <CartProvider>
                      <PinLockProvider>
                        <AlertProvider>
                          <AppNavigator />
                          <PinLockModal />
                        </AlertProvider>
                      </PinLockProvider>
                    </CartProvider>
                  </AuthProvider>
                </KeyboardFocusProvider>
              </KeyboardAvoidanceProvider>
            </AnimationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
