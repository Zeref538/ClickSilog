import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import { widthPercentage } from '../utils/responsive';
import { useResponsive } from '../hooks/useResponsive';
import AnimatedButton from '../components/ui/AnimatedButton';
import Icon from '../components/ui/Icon';
import ThemeToggle from '../components/ui/ThemeToggle';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { login, userRole: selectedRole } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { isTablet } = useResponsive();
  
  // Get expected role from route params or context
  const expectedRole = route.params?.role || selectedRole;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alertService.error('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.loginWithUsername(username.trim(), password);
      
      // Validate role - if expected role is set, user's role must match
      // Exception: admin and developer can access any module
      if (expectedRole && user.role !== expectedRole && user.role !== 'admin' && user.role !== 'developer') {
        throw new Error(`This account is for ${user.role} role. Please select ${user.role} from the home screen.`);
      }
      
      await login(user);
      
      // Navigation will be handled by AppNavigator based on role
      // AppNavigator will automatically show the correct screen when userRole changes
      // No need to manually navigate - just let AppNavigator re-render
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'ACCOUNT_DEACTIVATED') {
        alertService.warning(
          'Account Deactivated',
          'This account has been deactivated. Please contact an administrator for assistance.'
        );
      } else {
        alertService.error('Login Failed', error.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header bar with Home and Theme buttons */}
      <View style={[
        styles.headerBar,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1.5,
          paddingTop: spacing.xl + spacing.sm,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.lg,
        }
      ]}>
        <AnimatedButton
          onPress={() => navigation.navigate('Home')}
          style={[
            styles.headerButton,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderWidth: 1.5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
            }
          ]}
        >
          <Icon
            name="home"
            library="ionicons"
            size={18}
            color={theme.colors.text}
          />
          <Text style={[
            styles.headerButtonText,
            {
              color: theme.colors.text,
              ...typography.captionBold,
            }
          ]}>
            Home
          </Text>
        </AnimatedButton>
        <ThemeToggle />
      </View>

      <View style={[styles.contentContainer, { padding: spacing.xl }]}>
        <View style={[
          styles.contentWrapper,
          {
            width: '100%',
            maxWidth: isTablet ? widthPercentage(50) : 400,
            alignSelf: 'center',
          }
        ]}>
          <View style={[styles.logoContainer, { marginBottom: spacing.xxl }]}>
            <View style={[
              styles.logoBox,
              {
                backgroundColor: theme.colors.primaryContainer,
                borderRadius: borderRadius.xl,
                borderColor: theme.colors.primary + '40',
                borderWidth: 3,
              }
            ]}>
              <Icon
                name="lock-closed"
                library="ionicons"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, ...typography.h1, marginTop: spacing.lg }]}>
              Login
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...typography.body, marginTop: spacing.sm }]}>
              Enter your credentials to continue
            </Text>
          </View>

          <View style={[styles.form, { gap: spacing.lg }]}>
            <View>
              <Text style={[styles.label, { color: theme.colors.text, ...typography.caption }]}>
                Username
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    ...typography.body,
                  }
                ]}
                placeholder="Enter username"
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: theme.colors.text, ...typography.caption }]}>
                Password
              </Text>
              <View style={[
                styles.passwordContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                }
              ]}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    color: theme.colors.text,
                    padding: spacing.md,
                    paddingRight: spacing.sm,
                    flex: 1,
                    ...typography.body,
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onSubmitEditing={handleLogin}
              />
              <AnimatedButton
                onPress={() => setShowPassword(!showPassword)}
                style={[
                  styles.passwordToggle,
                  {
                    padding: spacing.sm,
                    marginRight: spacing.xs,
                  }
                ]}
                disabled={loading}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  library="ionicons"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </AnimatedButton>
            </View>
            </View>

            <AnimatedButton
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: borderRadius.md,
                  paddingVertical: spacing.md,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
              <Text 
                style={[styles.loginButtonText, { ...typography.button }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
                allowFontScaling={true}
              >
                Login
              </Text>
              )}
            </AnimatedButton>
          </View>
        </View>
      </View>
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
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButtonText: {
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBox: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  contentWrapper: {
    width: '100%',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  customerButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerButtonText: {
    fontWeight: '600',
  },
});

export default LoginScreen;

