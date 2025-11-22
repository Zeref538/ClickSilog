import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { alertService } from '../../services/alertService';
import AnimatedButton from '../../components/ui/AnimatedButton';
import Icon from '../../components/ui/Icon';
import HeaderCircleIcon from '../../components/ui/HeaderCircleIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';
import StaffUnlockModal from '../../components/ui/StaffUnlockModal';

const hexToRgba = (hex, opacity) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const TicketNumberScreen = () => {
  const insets = useSafeAreaInsets();
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, spacing, borderRadius, typography, themeMode } = useTheme();
  const { login, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const toggleBaseColor = themeMode === 'dark' ? (theme.colors.warning || '#FFB300') : (theme.colors.secondary || '#7C3AED');
  const toggleBgFill = themeMode === 'dark' ? hexToRgba(toggleBaseColor, 0.15) : hexToRgba(toggleBaseColor, 0.1);
  const toggleBorder = themeMode === 'dark' ? toggleBaseColor + '50' : toggleBaseColor + '40';
  const toggleIconColor = toggleBaseColor;

  const focusAnim = useSharedValue(0);
  const logoPulse = useSharedValue(0);

  useEffect(() => {
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const handleLogin = async () => {
    const name = customerName.trim();
    if (!name) {
      alertService.error('Error', 'Please enter your customer name');
      return;
    }

    setLoading(true);
    try {
      // Login is now instant (no blocking Firestore queries)
      const user = await authService.loginWithCustomerName(name);
      await login(user);
      
      // AppNavigator will automatically navigate to Main when user is authenticated
      // Since login is now instant, navigation should happen immediately
      // Don't manually navigate as it causes conflicts
    } catch (error) {
      alertService.error('Error', error.message || 'Unable to process customer name');
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

  const onInputFocus = () => {
    focusAnim.value = withTiming(1, { duration: 220 });
  };

  const onInputBlur = () => {
    focusAnim.value = withTiming(0, { duration: 200 });
  };

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
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 1,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: spacing.sm,
              paddingHorizontal: spacing.lg,
            },
          ]}
        >
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
            <Text style={[styles.headerCenterText, { color: theme.colors.textSecondary }]}>For take-out orders, enter your customer name</Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
          </View>
        </View>

        <View style={[styles.content, { padding: spacing.lg, paddingBottom: spacing.xxl + insets.bottom }]}>
          <View style={[styles.logoContainer, { marginBottom: spacing.lg, alignItems: 'center' }]}> 
            <Animated.View style={logoAnimatedStyle}>
              <View style={[styles.logoBox, { backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }]}> 
                <Icon name="bag-handle" library="ionicons" size={44} color={theme.colors.onPrimary || '#1A1A1A'} />
              </View>
            </Animated.View>
            <Text style={[styles.title, { color: theme.colors.text, ...typography.h1, marginTop: spacing.lg, fontSize: 28 }]}>Take-Out Pickup</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...typography.body, marginTop: spacing.xs }]}>Enter your customer name so we can notify you</Text>
          </View>

          <View style={[styles.formWrapper, { gap: spacing.lg }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}> 
              <View style={styles.form}>
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
                      },
                    ]}
                    placeholder="Enter customer name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={customerName}
                    onChangeText={(text) => {
                      // Allow full names with spaces, letters, and common name characters
                      const sanitized = text.trim();
                      setCustomerName(sanitized);
                    }}
                    keyboardType="default"
                    autoCapitalize="words"
                    editable={!loading}
                    onSubmitEditing={handleLogin}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    accessibilityLabel="Customer name input"
                    accessibilityHint="Enter your name for take-out orders"
                  />
                </Animated.View>

                <AnimatedButton
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.primary,
                      paddingVertical: spacing.md,
                      borderRadius: 999,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.loginButtonText, { color: theme.colors.onPrimary, ...typography.button }]}>Continue</Text>
                    )}
                  </View>
                </AnimatedButton>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

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

      <StaffUnlockModal
        visible={staffModalVisible}
        onCancel={() => setStaffModalVisible(false)}
        onSuccess={exitToOrderMode}
        title="Staff Access Required"
        message="Enter a staff password to go back to the order mode selection screen."
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
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  input: {
    borderWidth: 0,
    minHeight: 64,
    fontWeight: 'bold',
    borderRadius: 999,
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
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    borderWidth: 0,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TicketNumberScreen;
