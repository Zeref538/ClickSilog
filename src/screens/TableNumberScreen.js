import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import AnimatedButton from '../components/ui/AnimatedButton';
import Icon from '../components/ui/Icon';
import ThemeToggle from '../components/ui/ThemeToggle';

const TableNumberScreen = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

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
      const user = await authService.loginWithTableNumber(num);
      await login(user);
      
             // Navigate to customer menu
             try {
               navigation.navigate('Main');
             } catch (e) {
               // If Main doesn't exist, the AppNavigator will handle routing
               console.log('Navigation handled by AppNavigator');
             }
    } catch (error) {
      alertService.error('Invalid Table', error.message || 'Table number not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

      <View style={[styles.content, { padding: spacing.xl }]}>
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
              name="restaurant"
              library="ionicons"
              size={56}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text, ...typography.h1, marginTop: spacing.lg }]}>
            Welcome to ClickSiLog
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...typography.body, marginTop: spacing.sm }]}>
            Enter your table number to start ordering
          </Text>
        </View>

        <View style={[styles.form, { gap: spacing.lg }]}>
          <View>
            <Text style={[styles.label, { color: theme.colors.text, ...typography.caption }]}>
              Table Number
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
                  ...typography.h2,
                  textAlign: 'center',
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
              autoFocus
            />
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
              <Text style={[styles.loginButtonText, { ...typography.button }]}>
                Start Ordering
              </Text>
            )}
          </AnimatedButton>
        </View>

      </View>
    </KeyboardAvoidingView>
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
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    minHeight: 64,
    fontWeight: 'bold',
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
  staffButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffButtonText: {
    fontWeight: '600',
  },
});

export default TableNumberScreen;

