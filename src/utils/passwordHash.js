/**
 * Password hashing utilities
 * Note: For React Native, we use a simple hashing approach
 * In production, this should be done server-side with bcrypt
 */

/**
 * Simple hash function for password storage
 * WARNING: This is a basic hash. For production, use server-side bcrypt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => {
  if (!password) return '';
  
  // Simple hash function (NOT cryptographically secure)
  // For production, this should be done server-side with bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add salt and additional hashing
  const salt = 'clicksilog_salt_2024';
  const saltedPassword = password + salt;
  let saltedHash = 0;
  for (let i = 0; i < saltedPassword.length; i++) {
    const char = saltedPassword.charCodeAt(i);
    saltedHash = ((saltedHash << 5) - saltedHash) + char;
    saltedHash = saltedHash & saltedHash;
  }
  
  // Combine hashes
  const combinedHash = Math.abs(hash) + Math.abs(saltedHash);
  return combinedHash.toString(36) + password.length.toString(36);
};

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if password matches hash
 */
export const verifyPassword = (password, hash) => {
  if (!password || !hash) return false;
  
  // First, try direct comparison (for plain text passwords)
  if (password === hash) {
    return true;
  }
  
  // Check if hash looks like our hash format (base36 number + length suffix)
  // Our hash format: base36 number + length (e.g., "abc123def4" where last char is length)
  const hashPattern = /^[0-9a-z]+[0-9a-z]$/;
  if (!hashPattern.test(hash) || hash.length < 3) {
    // Doesn't look like our hash format, try direct comparison
    return password === hash;
  }
  
  // Verify against hash
  const computedHash = hashPassword(password);
  return computedHash === hash;
};

/**
 * Check if password is already hashed
 * @param {string} password - Password string to check
 * @returns {boolean} True if password appears to be hashed
 */
export const isPasswordHashed = (password) => {
  if (!password) return false;
  
  // Our hash format: base36 number + length suffix (e.g., "abc123def4")
  // Hashed passwords are typically longer (at least 8 chars) and end with a single alphanumeric char
  // The last character represents the original password length
  const hashPattern = /^[0-9a-z]{8,}[0-9a-z]$/i;
  
  // Check if it matches our hash pattern
  if (hashPattern.test(password)) {
    // Additional check: try to extract the length suffix
    // If the last character is a valid base36 digit (0-9, a-z), it's likely a hash
    const lastChar = password[password.length - 1];
    if (/[0-9a-z]/i.test(lastChar)) {
      return true;
    }
  }
  
  return false;
};

export default {
  hashPassword,
  verifyPassword,
  isPasswordHashed,
};


