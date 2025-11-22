import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, BackHandler, Animated, useWindowDimensions, InteractionManager } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
// removed scale import (unused)
import Icon from '../components/ui/Icon';
import RoleSwiper from '../components/home/RoleSwiper';

const HomeScreen = () => {
  const { setRole } = useContext(AuthContext);
  const { theme, spacing, borderRadius, typography, themeMode } = useTheme();
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  // Role color palettes
  const roles = [
    {
      key: 'customer',
      label: 'Customer',
      iconName: 'person',
      bgColor: '#F9CB43',
      // Slightly darker yellow for better contrast on text
      cardColor: '#E7B72D',
    },
    {
      key: 'kitchen',
      label: 'Kitchen',
      iconName: 'restaurant',
      bgColor: '#E52020',
      // Slightly deeper red to maintain contrast on card
      cardColor: '#D11717',
    },
    {
      key: 'cashier',
      label: 'Cashier',
      iconName: 'card',
      bgColor: '#FBA518',
      // Slightly more orange tone for higher contrast
      cardColor: '#E79507',
    },
    {
      key: 'admin',
      label: 'Admin',
      iconName: 'settings',
      bgColor: '#A89C29',
      // Slightly darker olive for better card contrast
      cardColor: '#938923',
    },
  ];

  // Animated background color based on scroll position
  const backgroundColor = scrollX.interpolate({
    inputRange: roles.map((_, i) => i * SCREEN_WIDTH),
    outputRange: roles.map((role) => role.bgColor),
    extrapolate: 'clamp',
  });

  // Utility to detect if the active role background is light so the header
  // (ClickSiLog) can pick a readable color.
  const hexToRgb = (hex) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const isLightBg = (hex) => {
    try {
      const { r, g, b } = hexToRgb(hex);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance > 128;
    } catch {
      return true;
    }
  };

  const headerIsLight = roles && roles[activeIndex] ? isLightBg(roles[activeIndex].bgColor) : (themeMode !== 'dark');

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const choose = async (role) => {
    // Set role first to ensure context is updated before navigation
    await setRole(role);
    
    // Wait for interactions and state updates to complete before navigating
    // This prevents navigation from being reset by AppNavigator re-render
    InteractionManager.runAfterInteractions(() => {
      if (role === 'customer') {
        navigation.navigate('OrderMode');
      } else {
        navigation.navigate('Login', { role });
      }
    });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Header: minimal branding to keep UI clean */}
      <View style={[styles.header, { paddingTop: spacing.lg, paddingHorizontal: spacing.md }]}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.logoBox,
                {
                  backgroundColor: headerIsLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  width: 44,
                  height: 44,
                  marginRight: spacing.sm,
                  borderWidth: 0,
                },
              ]}
            >
              <Icon
                name="restaurant"
                library="ionicons"
                size={20}
                color="#1A1A1A"
              />
            </View>
            <Text
              style={[
                typography.h3,
                {
                  color: headerIsLight ? '#1A1A1A' : (theme.colors.onSurface || 'rgba(255,255,255,0.95)'),
                  fontWeight: '700',
                },
              ]}
            >
              ClickSiLog
            </Text>
          </View>
        </View>
      </View>

      {/* Swipeable role selector */}
  <RoleSwiper roles={roles} onSelect={choose} scrollX={scrollX} onIndexChange={setActiveIndex} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
