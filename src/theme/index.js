/**
 * Canonical Theme System
 * 
 * Single source of truth for all design tokens.
 * All spacing, colors, typography, and other design values must come from here.
 * 
 * Usage:
 *   import { useTheme } from '../contexts/ThemeContext';
 *   const { theme, spacing, borderRadius, typography } = useTheme();
 * 
 * NEVER use bare 'spacing' variable - always use theme.spacing or spacing from useTheme()
 */

import { fonts } from '../config/theme';
import { lightTheme as baseLightTheme, darkTheme as baseDarkTheme } from '../config/theme';

// Export all design tokens in a single canonical structure
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, lineHeight: 40, fontFamily: fonts.bold },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, lineHeight: 32, fontFamily: fonts.bold },
  h3: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2, lineHeight: 28, fontFamily: fonts.semiBold },
  h4: { fontSize: 18, fontWeight: '600', letterSpacing: 0, lineHeight: 24, fontFamily: fonts.semiBold },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: 0.1, lineHeight: 24, fontFamily: fonts.regular },
  bodyBold: { fontSize: 16, fontWeight: '600', letterSpacing: 0.1, lineHeight: 24, fontFamily: fonts.semiBold },
  bodyMedium: { fontSize: 16, fontWeight: '500', letterSpacing: 0.1, lineHeight: 24, fontFamily: fonts.medium },
  caption: { fontSize: 14, fontWeight: '400', letterSpacing: 0.2, lineHeight: 20, fontFamily: fonts.regular },
  captionBold: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2, lineHeight: 20, fontFamily: fonts.semiBold },
  overline: { fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 16, fontFamily: fonts.medium },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2, lineHeight: 24, fontFamily: fonts.semiBold },
};

// Re-export theme objects for compatibility
export { baseLightTheme as lightTheme, baseDarkTheme as darkTheme };
export { fonts };

// Default theme export (light theme)
export default baseLightTheme;

