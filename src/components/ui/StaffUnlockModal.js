import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedButton from './AnimatedButton';
import Icon from './Icon';
import { authService } from '../../services/authService';

const StaffUnlockModal = ({
  visible,
  onSuccess,
  onCancel,
  title = 'Staff Unlock Required',
  message = 'Enter a staff password to exit customer mode.',
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setError(null);
      setLoading(false);
    }
  }, [visible]);

  const handleCancel = () => {
    setPassword('');
    setError(null);
    if (onCancel) onCancel();
  };

  const handleUnlock = async () => {
    const trimmed = password.trim();
    if (!trimmed) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const staffUser = await authService.verifyStaffPassword(trimmed);
      if (staffUser) {
        setPassword('');
        if (onSuccess) onSuccess(staffUser);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Staff unlock verification failed:', err);
      setError(err.message || 'Unable to verify password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              padding: spacing.xl,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.primary + '40',
                  borderRadius: borderRadius.xl,
                  borderWidth: 3,
                },
              ]}
            >
              <Icon name="lock-closed" library="ionicons" size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, typography.h3, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.message, typography.body, { color: theme.colors.textSecondary }]}>{message}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.caption, { color: theme.colors.textSecondary }]}>Staff Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: error ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter staff password"
              placeholderTextColor={theme.colors.textTertiary || '#9CA3AF'}
              autoCapitalize="none"
              secureTextEntry
              editable={!loading}
              onSubmitEditing={handleUnlock}
            />
            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            ) : null}
          </View>

          <View style={[styles.actions, { gap: spacing.md }]}>
            <AnimatedButton
              style={[styles.button, { borderColor: theme.colors.border, borderRadius: borderRadius.md }]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </AnimatedButton>
            <AnimatedButton
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: borderRadius.md,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleUnlock}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary || '#FFFFFF'} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.colors.onPrimary || '#FFFFFF' }]}>Unlock</Text>
              )}
            </AnimatedButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
});

export default StaffUnlockModal;
