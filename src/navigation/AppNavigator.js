import React, { useContext, useEffect, useRef } from 'react';
import { BackHandler, View, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePinLock } from '../contexts/PinLockContext';
import CustomerStack from './CustomerStack';
import KitchenStack from './KitchenStack';
import CashierStack from './CashierStack';
import AdminStack from './AdminStack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import TableNumberScreen from '../screens/TableNumberScreen';
import TicketNumberScreen from '../screens/customer/TicketNumberScreen';
import OrderModeScreen from '../screens/customer/OrderModeScreen';
import DeveloperScreenSelection from '../screens/DeveloperScreenSelection';

const RootStack = createStackNavigator();

const AppNavigator = () => {
  const authContext = useContext(AuthContext);
  const navigationRef = useRef(null);
  const { theme } = useTheme();
  const { registerActivity } = usePinLock();

  // Safely destructure with defaults
  const userRole = authContext?.userRole || null;
  const loading = authContext?.loading ?? true;
  const user = authContext?.user || null;

  // Activity monitoring is handled via NavigationContainer callbacks (onReady, onStateChange)
  // and AnimatedButton component which calls registerActivity() on all button presses

  // Calculate derived values BEFORE any hooks or early returns
  const isAuthenticated = user !== null;
  const showDeveloperScreen = isAuthenticated && userRole === 'developer';
  const shouldAutoEnterStack = isAuthenticated && userRole; // All authenticated users (including customers) should auto-enter their stack

  // Determine which stack to show based on role
  let Component = CustomerStack;
  if (userRole === 'kitchen') Component = KitchenStack;
  if (userRole === 'cashier') Component = CashierStack;
  if (userRole === 'admin') Component = AdminStack;
  // Developer role shows DeveloperScreenSelection instead of a stack

  // Determine initial route based on authentication and role
  const getInitialRoute = () => {
    if (showDeveloperScreen) return 'DeveloperScreenSelection';
    if (shouldAutoEnterStack) return 'Main'; // All authenticated roles (including customers) auto-enter their stack
    return 'Home'; // Default start: profile selection screen (unauthenticated)
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      // Register activity on back button press
      registerActivity();
      
      if (navigationRef.current?.isReady()) {
        if (navigationRef.current?.canGoBack()) {
          navigationRef.current.goBack();
          return true;
        }
      }
      // If we can't go back, don't exit the app - just prevent default behavior
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [registerActivity]);

  // Navigate to Main when authentication state changes to authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      let attempts = 0;
      const maxAttempts = 30; // Try for up to 3 seconds (30 * 100ms)
      let isCancelled = false;
      const timers = [];
      
      // Wait for navigator to be ready, then navigate
      const checkAndNavigate = () => {
        if (isCancelled) return;
        attempts++;
        
        if (navigationRef.current?.isReady()) {
          try {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            const targetRoute = showDeveloperScreen ? 'DeveloperScreenSelection' : 'Main';
            
            // Only navigate if we're not already on the target screen
            if (currentRoute?.name !== targetRoute) {
              if (__DEV__) {
                console.log(`[AppNavigator] Navigating to ${targetRoute} (current: ${currentRoute?.name || 'unknown'}, attempt ${attempts})`);
              }
              
              // Use reset to clear navigation stack and go to Main
              // This ensures we're on the correct screen even if navigator remounted
              navigationRef.current?.reset({
                index: 0,
                routes: [{ name: targetRoute }],
              });
              
              if (__DEV__) {
                console.log(`[AppNavigator] Navigation reset completed successfully`);
              }
            } else {
              if (__DEV__) {
                console.log(`[AppNavigator] Already on target route: ${targetRoute}`);
              }
            }
          } catch (error) {
            if (__DEV__) {
              console.warn(`[AppNavigator] Navigation error (attempt ${attempts}):`, error.message);
            }
            // Fallback: try simple navigate
            if (attempts < maxAttempts) {
              try {
                const targetRoute = showDeveloperScreen ? 'DeveloperScreenSelection' : 'Main';
                navigationRef.current?.navigate(targetRoute);
                if (__DEV__) {
                  console.log(`[AppNavigator] Fallback navigation to ${targetRoute} attempted`);
                }
              } catch (navError) {
                if (__DEV__) {
                  console.warn('[AppNavigator] Fallback navigation also failed:', navError.message);
                }
                // Try again after delay
                const timer = setTimeout(checkAndNavigate, 100);
                timers.push(timer);
              }
            } else {
              if (__DEV__) {
                console.error('[AppNavigator] Navigation failed after max attempts');
              }
            }
          }
        } else {
          // Navigator not ready yet, try again after a short delay
          if (attempts < maxAttempts) {
            const timer = setTimeout(checkAndNavigate, 100);
            timers.push(timer);
          } else {
            if (__DEV__) {
              console.warn('[AppNavigator] Navigator not ready after max attempts');
            }
          }
        }
      };
      
      // Start checking after a delay to ensure NavigationContainer has remounted
      // Increased delay to allow NavigationContainer to fully remount with new key
      const initialTimer = setTimeout(checkAndNavigate, 400);
      timers.push(initialTimer);
      
      return () => {
        isCancelled = true;
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isAuthenticated, userRole, showDeveloperScreen]);

  // Only show loading on initial app load, not during login transitions
  // This prevents blocking the UI when user logs in
  // MUST BE AFTER ALL HOOKS
  if (loading && !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.colors?.background || '#FAFAFA' }}>
        <ActivityIndicator size="large" color={theme?.colors?.primary || '#FFD54F'} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme?.colors?.background || '#FAFAFA' }}>
      <NavigationContainer
        // Avoid remounting the navigator when userRole changes while unauthenticated.
        // Remounts reset to initialRoute and caused Home to reappear after selecting a role.
        key={`root-${isAuthenticated ? 'auth' : 'noauth'}`}
        ref={(ref) => {
          navigationRef.current = ref;
          if (ref) {
            global.navigationRef = ref;
            // Register activity on navigation ready
            registerActivity();
          }
        }}
        onReady={() => {
          // Register activity when navigation is ready
          registerActivity();
          
          // If authenticated, ensure we're on the correct screen after remount
          if (isAuthenticated && userRole && navigationRef.current?.isReady()) {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            const targetRoute = showDeveloperScreen ? 'DeveloperScreenSelection' : 'Main';
            
            // Only navigate if we're not already on the target screen
            if (currentRoute?.name !== targetRoute) {
              try {
                navigationRef.current?.reset({
                  index: 0,
                  routes: [{ name: targetRoute }],
                });
                if (__DEV__) {
                  console.log(`[AppNavigator] onReady: Navigated to ${targetRoute}`);
                }
              } catch (error) {
                if (__DEV__) {
                  console.warn('[AppNavigator] onReady navigation error:', error.message);
                }
              }
            }
          }
        }}
        onStateChange={() => {
          // Register activity on navigation state changes
          registerActivity();
        }}
        theme={{
          dark: false,
          colors: {
            primary: theme?.colors?.primary || '#FFD54F',
            background: theme?.colors?.background || '#FAFAFA',
            card: theme?.colors?.surface || '#FFFFFF',
            text: theme?.colors?.text || '#1E1E1E',
            border: theme?.colors?.border || '#E0E0E0',
            notification: theme?.colors?.primary || '#FFD54F',
          },
        }}
      >
        <RootStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyle: { backgroundColor: theme?.colors?.background || '#FAFAFA' },
          }} 
          initialRouteName={getInitialRoute()}
        >
        {/* Home screen for role selection - always available */}
          <RootStack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
            gestureEnabled: false,
            title: 'Select Station'
            }}
          />
        {/* Login and TableNumber screens - always available for navigation */}
            <RootStack.Screen 
              name="OrderMode" 
              component={OrderModeScreen}
              options={{
                gestureEnabled: false,
                title: 'Order Mode'
              }}
            />
            <RootStack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                gestureEnabled: false,
                title: 'Login'
              }}
            />
            <RootStack.Screen 
              name="TableNumber" 
              component={TableNumberScreen}
              options={{
                gestureEnabled: false,
                title: 'Table Number'
              }}
            />
            <RootStack.Screen 
              name="TicketNumber" 
              component={TicketNumberScreen}
              options={{
                gestureEnabled: false,
                title: 'Ticket Number'
              }}
            />
        {/* Always register DeveloperScreenSelection so it's available when needed */}
        <RootStack.Screen 
          name="DeveloperScreenSelection" 
          component={DeveloperScreenSelection}
          options={{
            gestureEnabled: false,
            title: 'Developer Mode'
          }}
        />
        {/* Main stack - always register, but only accessible when authenticated */}
        {/* Always register Main screen so navigation can work even during remount */}
        <RootStack.Screen 
          name="Main" 
          component={Component}
          options={{
            gestureEnabled: userRole !== 'customer',
            gestureDirection: 'horizontal'
          }}
        />
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default AppNavigator;
