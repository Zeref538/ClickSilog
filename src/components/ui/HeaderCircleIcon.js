import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedButton from './AnimatedButton';
import Icon from './Icon';
import { useTheme } from '../../contexts/ThemeContext';

const BUTTON_SIZE = 45;

const normalizeHex = (hex = '') => {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return clean.split('').map((char) => char + char).join('');
  }
  return clean.padEnd(6, '0');
};

const hexToRgba = (hex, opacity = 1) => {
  if (!hex) return `rgba(0, 0, 0, ${opacity})`;
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const blendHexColors = (hexA = '#000000', hexB = '#000000', weight = 0.5) => {
  const a = normalizeHex(hexA);
  const b = normalizeHex(hexB);
  const w = Math.min(Math.max(weight, 0), 1);
  const mix = (start, end) => Math.round(start + (end - start) * w);
  const startRgb = [parseInt(a.substring(0, 2), 16), parseInt(a.substring(2, 4), 16), parseInt(a.substring(4, 6), 16)];
  const endRgb = [parseInt(b.substring(0, 2), 16), parseInt(b.substring(2, 4), 16), parseInt(b.substring(4, 6), 16)];
  return `#${startRgb.map((value, idx) => mix(value, endRgb[idx]).toString(16).padStart(2, '0')).join('')}`;
};

const HeaderCircleIcon = ({
  name,
  library = 'ionicons',
  size = 22,
  iconColor,
  accentColor,
  backgroundTint,
  borderColor,
  shadowColor,
  highlightTint,
  padding,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const themeContext = typeof useTheme === 'function' ? useTheme() : null;
  const themeMode = themeContext?.themeMode || 'dark';
  const spacing = themeContext?.spacing || { sm: 10 };
  const paletteAccent = themeMode === 'dark'
    ? (themeContext?.theme?.colors?.warning || '#FFB300')
    : (themeContext?.theme?.colors?.secondary || '#7C3AED');
  const surfaceColor = themeContext?.theme?.colors?.surface || '#1C1C1C';
  const baseBackground = themeMode === 'dark' ? '#050505' : '#FDF9F2';

  const accent = accentColor || paletteAccent;
  const ringBackground = backgroundTint || blendHexColors(surfaceColor, accent, 0.18);
  const ringBorder = borderColor || blendHexColors(accent, '#FFFFFF', 0.35);
  const innerFill = blendHexColors(baseBackground, accent, themeMode === 'dark' ? 0.68 : 0.4);
  const innerBorder = blendHexColors(accent, '#FFFFFF', 0.12);
  const glow = shadowColor || hexToRgba(accent, 0.35);
  const highlight = highlightTint || hexToRgba('#FFFFFF', themeMode === 'dark' ? 0.08 : 0.12);
  const icon = iconColor || accent;
  const contentPadding = padding ?? spacing.sm;

  return (
    <AnimatedButton
      style={[styles.touchTarget, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.layerWrap} pointerEvents="none">
        <View
          style={[
            styles.circle,
            {
              borderColor: ringBorder,
              backgroundColor: ringBackground,
              padding: contentPadding,
              shadowColor: glow,
            },
          ]}
        >
          <View
            style={[
              styles.innerCircle,
              {
                backgroundColor: innerFill,
                borderColor: innerBorder,
              },
            ]}
          >
            <View style={[styles.innerHighlight, { backgroundColor: highlight }]} />
          </View>
          <Icon name={name} library={library} size={size} color={icon} responsive hitArea />
        </View>
      </View>
    </AnimatedButton>
  );
};

const styles = StyleSheet.create({
  touchTarget: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerWrap: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'visible',
  },
  innerCircle: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: (BUTTON_SIZE - 8) / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: (BUTTON_SIZE - 12) / 2.8,
    borderRadius: BUTTON_SIZE,
    opacity: 0.5,
  },
});

export default HeaderCircleIcon;
