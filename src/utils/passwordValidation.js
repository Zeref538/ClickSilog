/**
 * Password validation utilities
 */

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid, strength, and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  let strength = 0;

  if (!password) {
    return {
      isValid: false,
      strength: 0,
      errors: ['Password is required'],
      score: 0
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength += 1;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength += 1;
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strength += 1;
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength += 1;
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    strength += 1;
  }

  // Check maximum length (optional, for security)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  const isValid = errors.length === 0;
  const score = strength; // 0-5

  // Determine strength level
  let strengthLevel = 'weak';
  if (score >= 4) strengthLevel = 'strong';
  else if (score >= 3) strengthLevel = 'medium';
  else if (score >= 2) strengthLevel = 'weak';

  return {
    isValid,
    strength: strengthLevel,
    errors,
    score
  };
};

/**
 * Get password strength color
 * @param {string} strength - Strength level (weak, medium, strong)
 * @param {Object} theme - Theme object
 * @returns {string} Color code
 */
export const getPasswordStrengthColor = (strength, theme) => {
  switch (strength) {
    case 'strong':
      return theme.colors.success;
    case 'medium':
      return theme.colors.warning;
    case 'weak':
    default:
      return theme.colors.error;
  }
};

/**
 * Get password strength text
 * @param {string} strength - Strength level
 * @returns {string} Display text
 */
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'medium':
      return 'Medium';
    case 'weak':
    default:
      return 'Weak';
  }
};

export default {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText
};

