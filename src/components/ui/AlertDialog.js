import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const AlertDialog = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  buttons = [{ text: 'OK', onPress: onClose }],
  type = 'info' // 'success', 'error', 'warning', 'info'
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!theme || !spacing || !borderRadius || !typography) {
    return null;
  }

  // Get type-specific colors
  const getTypeConfig = () => {
    const configs = {
      success: {
        iconColor: theme.colors.success,
        bgColor: theme.colors.successLight + '30',
        borderColor: theme.colors.success + '40',
        icon: 'checkmark-circle',
      },
      info: {
        iconColor: theme.colors.info || theme.colors.primary,
        bgColor: theme.colors.infoLight + '30' || theme.colors.primaryContainer,
        borderColor: (theme.colors.info || theme.colors.primary) + '40',
        icon: 'information-circle',
      },
      warning: {
        iconColor: theme.colors.warning,
        bgColor: theme.colors.warningLight + '30',
        borderColor: theme.colors.warning + '40',
        icon: 'warning',
      },
      error: {
        iconColor: theme.colors.error,
        bgColor: theme.colors.errorLight + '30',
        borderColor: theme.colors.error + '40',
        icon: 'alert-circle',
      },
    };
    return configs[type] || configs.info;
  };

  const typeConfig = getTypeConfig();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: fadeAnim,
            padding: spacing.xl,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: borderRadius.xl,
              borderWidth: 2,
              borderColor: typeConfig.borderColor,
              padding: spacing.xl,
              shadowColor: typeConfig.iconColor,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Icon Container */}
          <View
            style={{
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
              alignSelf: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(typeConfig.iconColor, 0.1),
                padding: spacing.md,
                borderRadius: 999,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: typeConfig.iconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Icon
                name={typeConfig.icon}
                library="ionicons"
                size={40}
                color={typeConfig.iconColor}
              />
            </View>
          </View>

          {/* Title */}
          {title && (
            <Text style={[
              styles.title,
              {
                color: theme.colors.text,
                ...typography.h2,
                marginBottom: spacing.md,
                textAlign: 'center',
              }
            ]}>
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text style={[
              styles.message,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                marginBottom: spacing.xl,
                textAlign: 'center',
              }
            ]}>
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={[styles.buttonRow, { gap: spacing.md }]}>
            {buttons.map((button, index) => {
              const isPrimary = index === buttons.length - 1;
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              
              return (
                <AnimatedButton
                  key={index}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress();
                    }
                    if (button.text === 'OK' || button.style === 'cancel') {
                      onClose();
                    }
                  }}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isDestructive 
                        ? theme.colors.error 
                        : isCancel 
                        ? theme.colors.surfaceVariant 
                        : isPrimary 
                        ? theme.colors.primary 
                        : theme.colors.surfaceVariant,
                      borderRadius: borderRadius.md,
                      paddingVertical: spacing.md,
                      flex: buttons.length > 1 ? 1 : undefined,
                      minWidth: buttons.length === 1 ? '100%' : undefined,
                      borderWidth: isCancel ? 1.5 : 0,
                      borderColor: isCancel ? theme.colors.border : 'transparent',
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.buttonText,
                      {
                        color: isDestructive || isPrimary 
                          ? '#FFFFFF' 
                          : theme.colors.text,
                        ...typography.bodyBold,
                      }
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                    allowFontScaling={true}
                  >
                    {button.text}
                  </Text>
                </AnimatedButton>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  message: {
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default AlertDialog;

