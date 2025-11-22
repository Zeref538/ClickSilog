import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { usePinLock } from '../../contexts/PinLockContext';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';

const PinLockModal = () => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { isLocked, unlock, loading } = usePinLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isLocked && inputRef.current) {
      // Focus input when modal appears
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) {
      // Clear PIN when unlocked
      setPin('');
      setError(null);
    }
  }, [isLocked]);

  const handlePinChange = (text) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    setPin(numericText);
    setError(null);

    // Auto-submit when 4 digits entered
    if (numericText.length === 4) {
      handleUnlock(numericText);
    }
  };

  const handleUnlock = async (pinToCheck = pin) => {
    if (!pinToCheck || pinToCheck.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    Keyboard.dismiss();
    const result = await unlock(pinToCheck);
    
    if (!result.success) {
      setError(result.error || 'Incorrect PIN');
      setPin('');
      // Refocus input after error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (key) => {
    if (pin.length < 4) {
      handlePinChange(pin + key);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  if (!isLocked) {
    return null;
  }

  return (
    <Modal
      visible={isLocked}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.content, { padding: spacing.xl }]}>
            {/* Lock Icon */}
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.errorLight || '#FEE2E2',
                borderRadius: borderRadius.round,
                width: 80,
                height: 80,
                marginBottom: spacing.xl,
              }
            ]}>
              <Icon
                name="lock-closed"
                library="ionicons"
                size={40}
                color={theme.colors.error || '#DC2626'}
                responsive={true}
              />
            </View>

            {/* Title */}
            <Text style={[
              styles.title,
              {
                color: theme.colors.text,
                ...typography.h2,
                marginBottom: spacing.sm,
              }
            ]}>
              App Locked
            </Text>

            {/* Subtitle */}
            <Text style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                marginBottom: spacing.xl,
                textAlign: 'center',
              }
            ]}>
              Enter your PIN to unlock
            </Text>

            {/* PIN Input (Hidden) */}
            <TextInput
              ref={inputRef}
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
              style={styles.hiddenInput}
            />

            {/* PIN Dots Display */}
            <View style={[styles.pinContainer, { marginBottom: spacing.xl }]}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: pin.length > index
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderRadius: borderRadius.round,
                      borderWidth: 2,
                      borderColor: error && pin.length === 4 && index === 3
                        ? theme.colors.error
                        : (pin.length > index ? theme.colors.primary : theme.colors.border),
                    }
                  ]}
                />
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <Text style={[
                styles.errorText,
                {
                  color: theme.colors.error,
                  ...typography.caption,
                  marginBottom: spacing.md,
                }
              ]}>
                {error}
              </Text>
            )}

            {/* Numeric Keypad */}
            <View style={[styles.keypad, { gap: spacing.md }]}>
              <View style={[styles.keypadRow, { gap: spacing.md }]}>
                {[1, 2, 3].map((num) => (
                  <AnimatedButton
                    key={num}
                    onPress={() => handleKeyPress(num.toString())}
                    style={[
                      styles.keypadButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        borderRadius: borderRadius.xl,
                        borderWidth: 2,
                        minWidth: 70,
                        minHeight: 70,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.keypadText,
                      {
                        color: theme.colors.text,
                        ...typography.h3,
                      }
                    ]}>
                      {num}
                    </Text>
                  </AnimatedButton>
                ))}
              </View>
              <View style={[styles.keypadRow, { gap: spacing.md }]}>
                {[4, 5, 6].map((num) => (
                  <AnimatedButton
                    key={num}
                    onPress={() => handleKeyPress(num.toString())}
                    style={[
                      styles.keypadButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        borderRadius: borderRadius.xl,
                        borderWidth: 2,
                        minWidth: 70,
                        minHeight: 70,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.keypadText,
                      {
                        color: theme.colors.text,
                        ...typography.h3,
                      }
                    ]}>
                      {num}
                    </Text>
                  </AnimatedButton>
                ))}
              </View>
              <View style={[styles.keypadRow, { gap: spacing.md }]}>
                {[7, 8, 9].map((num) => (
                  <AnimatedButton
                    key={num}
                    onPress={() => handleKeyPress(num.toString())}
                    style={[
                      styles.keypadButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        borderRadius: borderRadius.xl,
                        borderWidth: 2,
                        minWidth: 70,
                        minHeight: 70,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.keypadText,
                      {
                        color: theme.colors.text,
                        ...typography.h3,
                      }
                    ]}>
                      {num}
                    </Text>
                  </AnimatedButton>
                ))}
              </View>
              <View style={[styles.keypadRow, { gap: spacing.md }]}>
                <View style={[styles.keypadButton, { minWidth: 70, minHeight: 70, backgroundColor: 'transparent' }]} />
                <AnimatedButton
                  onPress={() => handleKeyPress('0')}
                  style={[
                    styles.keypadButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: borderRadius.xl,
                      borderWidth: 2,
                      minWidth: 70,
                      minHeight: 70,
                    }
                  ]}
                >
                  <Text style={[
                    styles.keypadText,
                    {
                      color: theme.colors.text,
                      ...typography.h3,
                    }
                  ]}>
                    0
                  </Text>
                </AnimatedButton>
                <AnimatedButton
                  onPress={handleBackspace}
                  style={[
                    styles.keypadButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: borderRadius.xl,
                      borderWidth: 2,
                      minWidth: 70,
                      minHeight: 70,
                    }
                  ]}
                >
                  <Icon
                    name="backspace-outline"
                    library="ionicons"
                    size={24}
                    color={theme.colors.text}
                  />
                </AnimatedButton>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
  },
  errorText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keypadText: {
    fontWeight: '600',
  },
});

export default PinLockModal;

