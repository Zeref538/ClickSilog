import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useOffline } from '../../hooks/useOffline';
import Icon from './Icon';

const OfflineIndicator = () => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { isOnline, queueSize } = useOffline();

  if (isOnline && queueSize === 0) {
    return null; // Don't show anything when online and no pending operations
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOnline 
            ? theme.colors.success + '20' 
            : theme.colors.warning + '20',
          borderColor: isOnline 
            ? theme.colors.success 
            : theme.colors.warning,
          borderWidth: 1.5,
          borderRadius: borderRadius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          marginHorizontal: spacing.md,
          marginVertical: spacing.xs,
        }
      ]}
    >
      <Icon
        name={isOnline ? 'cloud-done' : 'cloud-offline'}
        library="ionicons"
        size={18}
        color={isOnline ? theme.colors.success : theme.colors.warning}
        style={{ marginRight: spacing.xs }}
      />
      <Text
        style={[
          styles.text,
          {
            color: isOnline ? theme.colors.success : theme.colors.warning,
            ...typography.captionBold,
          }
        ]}
      >
        {isOnline 
          ? queueSize > 0 
            ? `Syncing ${queueSize} pending operation${queueSize > 1 ? 's' : ''}...`
            : 'Online'
          : `Offline - ${queueSize} operation${queueSize !== 1 ? 's' : ''} queued`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default OfflineIndicator;

