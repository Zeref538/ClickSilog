import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withRepeat,
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import AnimatedButton from '../components/ui/AnimatedButton';
import Icon from '../components/ui/Icon';
import HeaderCircleIcon from '../components/ui/HeaderCircleIcon';
import ThemeToggle from '../components/ui/ThemeToggle';
import StaffUnlockModal from '../components/ui/StaffUnlockModal';

// Conditionally import native modules to avoid Expo Go warnings
// We intentionally avoid importing expo-linear-gradient and expo-blur to prevent
// runtime warnings in environments where the native view managers are not
// available (Expo Go/dev-client). Instead, use a simple View-based fallback
// for gradient backgrounds and frosted glass effects.
// No native gradient or blur components used to avoid runtime warnings

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Utility: darken or lighten hex color by percent (-100..100)
const shiftGradient = (hex, percent) => {
  try {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const adjust = (c) => {
      const amt = Math.round((percent / 100) * 255);
      const value = Math.max(0, Math.min(255, c + amt));
      return value;
    };

    const nr = adjust(r);
    const ng = adjust(g);
    const nb = adjust(b);

    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
  } catch (err) {
    return hex;
  }
};

// Minimal fallback for gradient decorations. Using a single color fallback to
// avoid depending on native gradient modules.
const SafeLinearGradient = ({ fallbackColor, colors, children, style, ...gradientProps }) => {
  const backgroundColor = fallbackColor ?? colors?.[0] ?? 'transparent';
  const { start, end, locations, ...viewProps } = gradientProps;
  return (
    <View {...viewProps} style={[style, { backgroundColor }] }>
      {children}
    </View>
  );
};

const TableNumberScreen = () => {
  const insets = useSafeAreaInsets();
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, spacing, borderRadius, typography, themeMode } = useTheme();
  const { login, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const toggleBaseColor = themeMode === 'dark' ? (theme.colors.warning || '#FFB300') : (theme.colors.secondary || '#7C3AED');
  const toggleBgFill = themeMode === 'dark' ? hexToRgba(toggleBaseColor, 0.15) : hexToRgba(toggleBaseColor, 0.1);
  const toggleBorder = themeMode === 'dark' ? toggleBaseColor + '50' : toggleBaseColor + '40';
  const toggleIconColor = toggleBaseColor;

  const handleLogin = async () => {
    const tableNum = tableNumber.trim();
    if (!tableNum) {
      alertService.error('Error', 'Please enter a table number');
      return;
    }

    const num = parseInt(tableNum, 10);
    if (isNaN(num) || num < 1) {
      alertService.error('Error', 'Please enter a valid table number');
      return;
    }

    setLoading(true);
    try {
      // Login is now instant (no blocking Firestore queries)
      const user = await authService.loginWithTableNumber(num);
      await login(user);
      
      // AppNavigator will automatically navigate to Main when user is authenticated
      // Since login is now instant, navigation should happen immediately
      // Don't manually navigate as it causes conflicts
    } catch (error) {
      alertService.error('Error', error.message || 'Invalid table number');
      setLoading(false);
    }
    // Note: Don't set loading to false on success - let it stay true during navigation
    // The next screen will handle its own loading state
    // If navigation doesn't happen within 2 seconds, reset loading (safety timeout)
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const exitToOrderMode = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Staff unlock logout error:', error);
    }
    setStaffModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'OrderMode' }] });
  }, [logout, navigation]);

  // Reanimated values for focus and logo pulse
  const focusAnim = useSharedValue(0); // 0 -> unfocused, 1 -> focused
  const logoPulse = useSharedValue(0);

  useEffect(() => {
    // Start logo pulse animation
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite repeat
      false
    );
  }, []);

  const onInputFocus = () => {
    focusAnim.value = withTiming(1, { duration: 220 });
  };

  const onInputBlur = () => {
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  // Animated styles using reanimated
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + logoPulse.value * 0.05 }],
  }));

  const inputWrapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + focusAnim.value * 0.02 }],
    shadowOpacity: 0.06 + focusAnim.value * 0.12,
    shadowRadius: 8 + focusAnim.value * 8,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 100 })}
      >
      {/* Header bar with Home and Theme buttons (minimal) */}
      <View style={[
        styles.headerBar,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.lg,
        }
      ]}>
        <View style={styles.headerLeft}>
          <AnimatedButton
            onPress={() => {
              if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
              else navigation.reset({ index: 0, routes: [{ name: 'OrderMode' }] });
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityHint="Go back to the previous screen"
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
          >
            <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  backgroundColor: hexToRgba(theme.colors.error, 0.1),
                  borderWidth: 1.5,
                  borderColor: theme.colors.error + '40',
                  padding: spacing.sm,
                  borderRadius: 999,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.error,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="arrow-back" library="ionicons" size={22} color={theme.colors.error} responsive hitArea={false} />
              </View>
            </View>
          </AnimatedButton>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerCenterText, { color: theme.colors.textSecondary }]}>We only need your table number — no account required</Text>
        </View>
        <View style={styles.headerRight}>
          <ThemeToggle />
        </View>
      </View>

      <View style={[styles.content, { padding: spacing.lg, paddingBottom: spacing.xxl + insets.bottom }]}> 
        <View style={[styles.logoContainer, { marginBottom: spacing.lg, alignItems: 'center' }]}> 
          <Animated.View style={[logoAnimatedStyle]}>
            <View style={[styles.logoBox, { backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }]}> 
              <Icon name="restaurant" library="ionicons" size={44} color={theme.colors.onPrimary || '#1A1A1A'} />
            </View>
          </Animated.View>
          <Text style={[styles.title, { color: theme.colors.text, ...typography.h1, marginTop: spacing.lg, fontSize: 28 }]}>Welcome to ClickSiLog</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...typography.body, marginTop: spacing.xs }]}>Enter your table number to start ordering</Text>
        </View>

        <View style={[styles.formWrapper, { gap: spacing.lg }]}> 
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}> 
            <View style={styles.form}>
          <View>
            
            {/* Frosted glass input with blur effect */}
            <Animated.View
              style={[
                styles.inputWrap,
                inputWrapAnimatedStyle,
                {
                  borderRadius: 999,
                  backgroundColor: hexToRgba(theme.colors.surface, 0.98),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  overflow: 'hidden',
                },
              ]}
            >
              {Platform.OS === 'ios' ? (
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { borderRadius: 999, backgroundColor: hexToRgba(theme.colors.surface, 0.95) }]}
                />
              ) : null}
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: theme.colors.text,
                    borderRadius: 999,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xl,
                    ...typography.h2,
                    textAlign: 'center',
                    width: '100%',
                  }
                ]}
                placeholder="Enter table number"
                placeholderTextColor={theme.colors.textSecondary}
                value={tableNumber}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numeric = text.replace(/[^0-9]/g, '');
                  setTableNumber(numeric);
                }}
                keyboardType="number-pad"
                maxLength={3}
                editable={!loading}
                onSubmitEditing={handleLogin}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                autoFocus
                accessibilityLabel="Table number input"
                accessibilityHint="Enter your table number to start ordering"
              />
            </Animated.View>
          </View>

          <AnimatedButton
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Start Order"
            accessibilityHint="Takes you to the menu to begin ordering for entered table number"
          >
            <View style={[styles.loginButtonGradient, { backgroundColor: theme.colors.primary, paddingVertical: spacing.md, borderRadius: 999, width: '100%', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }]}> 
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.loginButtonText, { color: theme.colors.onPrimary, ...typography.button }]}>Start Ordering</Text>
              )}
            </View>
          </AnimatedButton>
          </View>
        </View>
        </View>

      </View>

      {/* Bottom safe area filler to prevent the lower nav/keyboard area showing a mismatched color */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom || 0,
          backgroundColor: theme.colors.background,
        }}
      />
    </KeyboardAvoidingView>
    <StaffUnlockModal
      visible={staffModalVisible}
      onCancel={() => setStaffModalVisible(false)}
      onSuccess={exitToOrderMode}
      title="Staff Access Required"
      message="Enter a staff password to go back to order selection."
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerCenterText: {
    fontSize: 13,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 28,
    paddingBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 0,
    minHeight: 64,
    fontWeight: 'bold',
    borderRadius: 999,
    // Slight inner shadow via border
    borderColor: 'transparent',
    elevation: 0,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  loginButton: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Flat look with thin stroke instead of heavy shadow
    elevation: 0,
    borderWidth: 0,
    width: '100%',
  },
  loginButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  staffButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  staffButtonOuter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffButtonBubble: {
    borderWidth: 1.5,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconFallback: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default TableNumberScreen;

