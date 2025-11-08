import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';

const NotificationModal = ({ visible, onClose, title, message, icon, iconColor, type = 'info' }) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
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
      // Animate out
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
        icon: 'time',
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
  const finalIcon = icon || typeConfig.icon;
  const finalIconColor = iconColor || typeConfig.iconColor;

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
              padding: spacing.lg,
              shadowColor: finalIconColor,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Icon Container */}
          <View
            style={{
              width: 80,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(finalIconColor, 0.1), // Soft 10% opacity halo
                padding: spacing.md,
                borderRadius: 999, // Perfect circle
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: finalIconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Icon
                name={finalIcon}
                library="ionicons"
                size={40}
                color={finalIconColor}
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

          {/* Close Button */}
          <AnimatedButton
            onPress={onClose}
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.xl,
                shadowColor: theme.colors.primary,
              }
            ]}
          >
            <Text style={[
              styles.buttonText,
              {
                color: theme.colors.onPrimary,
                ...typography.bodyBold,
              }
            ]}>
              OK
            </Text>
          </AnimatedButton>
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
    // padding handled inline with theme spacing
  },
  container: {
    width: '100%',
    maxWidth: 400,
    // padding handled inline with theme spacing
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

export default NotificationModal;

