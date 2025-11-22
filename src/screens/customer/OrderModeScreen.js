import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
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

const OrderModeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, spacing, borderRadius, typography, themeMode } = useTheme();
  const [staffModalVisible, setStaffModalVisible] = useState(false);

  const goToTableNumber = () => {
    navigation.navigate('TableNumber', { orderMode: 'dine-in' });
  };

  const goToTicketNumber = () => {
    navigation.navigate('TicketNumber', { orderMode: 'take-out' });
  };

  const handleUnlockSuccess = () => {
    setStaffModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        setStaffModalVisible(true);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => backHandler.remove();
    }, [])
  );

  const renderModeCard = (label, description, icon, color, onPress) => (
    <AnimatedButton
      key={label}
      style={[
        styles.modeCard,
        {
          backgroundColor: color + '20',
          borderColor: color + '50',
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: color + '25',
              borderColor: color + '60',
              borderRadius: borderRadius.round,
              padding: spacing.md,
            },
          ]}
        >
          <Icon name={icon} library="ionicons" size={34} color={color} />
        </View>
        <Text style={[typography.h2, styles.cardTitle, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.cardDescription, typography.body, { color: theme.colors.textSecondary }]}>{description}</Text>
      </View>
    </AnimatedButton>
  );

  // Match ThemeToggle's day/night coloring
  const toggleBaseColor = themeMode === 'dark' ? (theme.colors.warning || '#FFB300') : (theme.colors.secondary || '#7C3AED');
  const toggleBgFill = themeMode === 'dark' ? hexToRgba(toggleBaseColor, 0.15) : hexToRgba(toggleBaseColor, 0.1);
  const toggleBorder = themeMode === 'dark' ? toggleBaseColor + '50' : toggleBaseColor + '40';
  const toggleIconColor = toggleBaseColor;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.lg,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <AnimatedButton
            onPress={() => setStaffModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Staff unlock"
            accessibilityHint="Open staff access modal"
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
          <Text style={[styles.headerText, typography.caption, { color: theme.colors.textSecondary }]}>Choose how you want to order</Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggle />
        </View>
      </View>

      <View style={[styles.content, { padding: spacing.lg }]}> 
        <Text style={[styles.title, typography.h1, { color: theme.colors.text }]}>How would you like to dine?</Text>
        <Text style={[styles.subtitle, typography.body, { color: theme.colors.textSecondary }]}>Select an option to continue</Text>

        <View style={[styles.cardGroup, { marginTop: spacing.xl, gap: spacing.lg }]}> 
          {renderModeCard('Dine-In', 'Enter your table number and we will serve you at your seat.', 'restaurant', theme.colors.primary, goToTableNumber)}
          {renderModeCard('Take-Out', 'Use your ticket number so we can call you when it is ready.', 'bag-handle', theme.colors.secondary || '#F97316', goToTicketNumber)}
        </View>
      </View>

      <StaffUnlockModal
        visible={staffModalVisible}
        onCancel={() => setStaffModalVisible(false)}
        onSuccess={handleUnlockSuccess}
        title="Staff Access Required"
        message="Enter a staff password to return to the station selection screen."
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
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
  },
  headerActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  staffButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  unlockIconWrapper: {
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
    // Default - overridden inline based on theme
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
  backIconStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
  },
  cardGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  modeCard: {
    borderWidth: 1.5,
  },
  cardContent: {
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    borderWidth: 1.5,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardDescription: {
    textAlign: 'center',
  },
});

export default OrderModeScreen;
