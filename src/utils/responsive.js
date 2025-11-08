import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Get responsive width based on screen width
 * @param {number} size - Base size in pixels
 * @returns {number} Responsive size
 */
export const wp = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size * scale;
};

/**
 * Get responsive height based on screen height
 * @param {number} size - Base size in pixels
 * @returns {number} Responsive size
 */
export const hp = (size) => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return size * scale;
};

/**
 * Get responsive font size
 * @param {number} size - Base font size
 * @returns {number} Responsive font size
 */
export const fp = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
});

/**
 * Get responsive spacing multiplier
 * @param {number} baseSpacing - Base spacing value
 * @returns {number} Responsive spacing
 */
export const getResponsiveSpacing = (baseSpacing) => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2); // Cap at 1.2x
  return baseSpacing * scale;
};

/**
 * Get percentage width
 * @param {number} percentage - Percentage of screen width (0-100)
 * @returns {number} Width in pixels
 */
export const widthPercentage = (percentage) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Get percentage height
 * @param {number} percentage - Percentage of screen height (0-100)
 * @returns {number} Height in pixels
 */
export const heightPercentage = (percentage) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

export default {
  wp,
  hp,
  fp,
  getScreenDimensions,
  getResponsiveSpacing,
  widthPercentage,
  heightPercentage,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};

