/**
 * Theme Utilities
 * 
 * Runtime safeguards and helpers for safe theme token access.
 * Prevents crashes when accessing undefined theme properties.
 */

/**
 * Safely get a theme token value with fallback
 * 
 * @param {object} theme - Theme object
 * @param {string} path - Dot-separated path to token (e.g., 'spacing.md', 'colors.primary')
 * @param {any} fallback - Fallback value if token is missing
 * @param {string} sourceFile - Optional: file name for error reporting
 * @returns {any} Token value or fallback
 */
export function getToken(theme, path, fallback, sourceFile = '') {
  if (!theme || typeof theme !== 'object') {
    if (__DEV__) {
      console.warn(`[Theme] Invalid theme object${sourceFile ? ` in ${sourceFile}` : ''}`);
    }
    return fallback;
  }

  const keys = path.split('.');
  let value = theme;

  for (const key of keys) {
    if (value == null || typeof value !== 'object') {
      if (__DEV__) {
        console.warn(
          `[Theme] Missing token: ${path}${sourceFile ? ` in ${sourceFile}` : ''}. Using fallback: ${fallback}`
        );
      }
      return fallback;
    }
    value = value[key];
  }

  if (value === undefined) {
    if (__DEV__) {
      console.warn(
        `[Theme] Missing token: ${path}${sourceFile ? ` in ${sourceFile}` : ''}. Using fallback: ${fallback}`
      );
    }
    return fallback;
  }

  return value;
}

/**
 * Get spacing value safely
 * 
 * @param {object} theme - Theme object or spacing object
 * @param {string} size - Spacing size (xs, sm, md, lg, xl, xxl)
 * @param {number} fallback - Fallback spacing value
 * @returns {number} Spacing value
 */
export function getSpacing(theme, size, fallback = 8) {
  const spacing = theme?.spacing || theme;
  if (spacing && typeof spacing === 'object' && spacing[size] !== undefined) {
    return spacing[size];
  }
  if (__DEV__) {
    console.warn(`[Theme] Missing spacing.${size}. Using fallback: ${fallback}`);
  }
  return fallback;
}

/**
 * Get color value safely
 * 
 * @param {object} theme - Theme object
 * @param {string} colorName - Color name (e.g., 'primary', 'text', 'colors.primary')
 * @param {string} fallback - Fallback color value
 * @returns {string} Color value
 */
export function getColor(theme, colorName, fallback = '#000000') {
  // Handle both 'primary' and 'colors.primary' formats
  const path = colorName.startsWith('colors.') ? colorName : `colors.${colorName}`;
  return getToken(theme, path, fallback);
}

/**
 * Validate theme object structure
 * 
 * @param {object} theme - Theme object to validate
 * @returns {object} Validation result { valid: boolean, errors: string[] }
 */
export function validateTheme(theme) {
  const errors = [];

  if (!theme || typeof theme !== 'object') {
    errors.push('Theme is not an object');
    return { valid: false, errors };
  }

  // Check required top-level properties
  const required = ['colors', 'spacing', 'borderRadius', 'typography'];
  for (const prop of required) {
    if (!theme[prop] || typeof theme[prop] !== 'object') {
      errors.push(`Missing or invalid theme.${prop}`);
    }
  }

  // Check spacing values
  if (theme.spacing) {
    const spacingSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    for (const size of spacingSizes) {
      if (theme.spacing[size] === undefined || typeof theme.spacing[size] !== 'number') {
        errors.push(`Missing or invalid theme.spacing.${size}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a safe theme accessor that always returns valid values
 * 
 * @param {object} theme - Theme object
 * @returns {object} Safe theme accessor with fallbacks
 */
export function createSafeTheme(theme) {
  const defaultSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
  const defaultColors = {
    primary: '#FFD54F',
    text: '#1E1E1E',
    background: '#FAFAFA',
    surface: '#FFFFFF',
  };

  return {
    spacing: theme?.spacing || defaultSpacing,
    colors: theme?.colors || defaultColors,
    borderRadius: theme?.borderRadius || { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, round: 9999 },
    typography: theme?.typography || {},
    ...theme,
  };
}

