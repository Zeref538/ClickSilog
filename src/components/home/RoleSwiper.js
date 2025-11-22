import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, Animated, Platform } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import Icon from '../../components/ui/Icon';
import { useTheme } from '../../contexts/ThemeContext';
// Removed expo-linear-gradient import because it's not guaranteed to be available in Expo Go.

// Simple dots indicator
const Dots = ({ count, index, activeColor, inactiveColor }) => {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === index ? activeColor : 'transparent',
              width: i === index ? 18 : 8,
              borderWidth: i === index ? 0 : 1,
              borderColor: i === index ? 'transparent' : inactiveColor,
              shadowColor: i === index ? '#000' : undefined,
              shadowOpacity: i === index ? 0.18 : 0,
              shadowRadius: i === index ? 6 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * RoleSwiper
 * Full-screen immersive swipe interface.
 * Animates background color between role palettes as user swipes.
 * Returns scrollX and currentIndex for parent to animate background.
 */
const RoleSwiper = ({ roles, onSelect, scrollX, onIndexChange }) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const itemWidth = SCREEN_WIDTH; // full width pages for clean paging

  // Utility: hex -> rgb and luminance checker moved to top-level so both
  // the slide and the footer can make contrast decisions from the same logic.
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

  // Convert hex to HSL and back to support hue shifts (analogous colors)
  const hexToHsl = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rf:
          h = (gf - bf) / d + (gf < bf ? 6 : 0);
          break;
        case gf:
          h = (bf - rf) / d + 2;
          break;
        case bf:
          h = (rf - gf) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h, s, l) => {
    // Convert HSL [0..360], [0..100], [0..100] to hex
    const hf = h / 360;
    const sf = s / 100;
    const lf = l / 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r = lf;
    let g = lf;
    let b = lf;
    if (sf !== 0) {
      const q = lf < 0.5 ? lf * (1 + sf) : lf + sf - lf * sf;
      const p = 2 * lf - q;
      r = hue2rgb(p, q, hf + 1 / 3);
      g = hue2rgb(p, q, hf);
      b = hue2rgb(p, q, hf - 1 / 3);
    }
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // shift hue by degrees, normalize, and adjust s/l by optional amounts
  const shiftHue = (hex, degrees = 20, sAdj = 0, lAdj = 0) => {
    try {
      const { h, s, l } = hexToHsl(hex);
      let newH = (h + degrees) % 360;
      if (newH < 0) newH += 360;
      let newS = Math.max(0, Math.min(100, s + sAdj));
      let newL = Math.max(0, Math.min(100, l + lAdj));
      return hslToHex(newH, newS, newL);
    } catch {
      return hex;
    }
  };

  // Utility: darken/lighten a hex color by a percentage between 0 and 1.
  const adjustHexLightness = (hex, amount) => {
    try {
      const { r, g, b } = hexToRgb(hex);
      const clamp = (v) => Math.max(0, Math.min(255, v));
      const amt = Math.round(255 * amount);
      return (
        '#' +
        [
          clamp(r - amt).toString(16).padStart(2, '0'),
          clamp(g - amt).toString(16).padStart(2, '0'),
          clamp(b - amt).toString(16).padStart(2, '0'),
        ].join('')
      );
    } catch {
      return hex;
    }
  };

  const renderItem = ({ item, index: itemIndex }) => {
    // Scale and opacity based on scroll position
    const inputRange = [
      (itemIndex - 1) * itemWidth,
      itemIndex * itemWidth,
      (itemIndex + 1) * itemWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    // Determine if background is light or dark based on luminance
    const bgIsLight = isLightBg(item.bgColor);
    const isDark = theme.mode === 'dark';

    // Accessibility-focused contrast adjustments for very light backgrounds like #FFF287
    const HIGH_CONTRAST_TEXT = '#1A1A1A';
    const SECONDARY_DARK = '#444444';
    const LIGHT_ROLE_BG = '#FFF287';

    // Card color uses the role color but is mixed for higher contrast
    // If background is light, mix with black to get a darker card; else mix with white to slightly lift the card
    // If `item.cardColor` is provided (from role mapping), use it; otherwise derive analogous color
    const defaultHueShift = bgIsLight ? 25 : -25;
    const defaultLAdj = bgIsLight ? -12 : 8;
    const cardColor = item.cardColor ? item.cardColor : shiftHue(item.bgColor, defaultHueShift, 0, defaultLAdj);
    // Border is the same hue shifted slightly and slightly darker
    const cardBorder = shiftHue(cardColor, 0, 0, bgIsLight ? -8 : -10);

    // Primary text should follow card luminance (not screen background) for stronger contrast
    const cardIsLight = isLightBg(cardColor);
    const textColor = '#1A1A1A'; // Always use dark text for better readability

    // Secondary text also follows background luminance
    const captionColor = bgIsLight ? SECONDARY_DARK : 'rgba(255,255,255,0.80)';

    // Icon color: always use dark color for better contrast
    const iconColor = '#1A1A1A';

    // (cardColor and cardBorder already computed above)

    // More modern card-based layout with frosted card effect and floating badge.
    const badgeScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1.08, 0.9],
      extrapolate: 'clamp',
    });

    return (
            <Animated.View
        style={{
          width: itemWidth,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
          transform: [{ scale }],
          opacity,
        }}
      >
        <AnimatedButton
          onPress={() => onSelect(item.key)}
          activeOpacity={0.9}
          style={{ width: '100%', maxWidth: 520, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${item.label}`}
        >
          <View style={{ alignItems: 'center', width: '100%' }}>
            {/* Floating badge */}
            <Animated.View
              style={{
                width: 132,
                height: 132,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.lg,
                // Badge has a thin stroke to contrast against card and no shadow
                borderWidth: 1,
                borderColor: cardBorder,
                backgroundColor: cardColor,
                transform: [{ scale: badgeScale }],
              }}
            >
              <Icon name={item.iconName} library="ionicons" size={62} color={iconColor} />
            </Animated.View>

            {/* Frosted card */}
            <View
              style={{
                width: '92%',
                alignItems: 'center',
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.lg,
                borderRadius: 24,
                backgroundColor: cardColor,
                // Card border stroke (replace shadow with thin line)
                borderWidth: 1,
                borderColor: cardBorder,
                // Clip any overlapping content to keep the card visually uniform
                overflow: 'hidden',
              }}
            >
              <Text
                style={[
                  typography.h1,
                  {
                    color: textColor,
                    textAlign: 'center',
                    fontWeight: '700',
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                {item.label}
              </Text>

              {/* Brief caption removed by user request to reduce visual clutter */}
            </View>
          </View>
        </AnimatedButton>
      </Animated.View>
    );
  };

  const onMomentumEnd = (ev) => {
    const newIndex = Math.round(ev.nativeEvent.contentOffset.x / itemWidth);
    setIndex(newIndex);
    if (onIndexChange) onIndexChange(newIndex);
  };

  const getActiveRoleBg = () => {
    return roles && roles[index] ? roles[index].bgColor : roles[0].bgColor;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.FlatList
          ref={listRef}
          data={roles}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: 'center' }}
        />
      </View>

      <View style={{ paddingBottom: spacing.xxl, alignItems: 'center' }}>
        <Dots
          count={roles.length}
          index={index}
          activeColor={theme.colors.primary || '#F9CB43'}
          inactiveColor={theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : (theme.colors.border || 'rgba(0,0,0,0.12)')}
        />
        <Text
          style={[
            typography.caption,
            {
              color: '#1A1A1A',
              marginTop: spacing.md,
              fontWeight: '500',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              fontSize: typography.caption.fontSize - 1,
            },
          ]}
        >
          Swipe to choose • Tap to continue
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    marginHorizontal: 3,
  },
});

export default RoleSwiper;
