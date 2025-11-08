/**
 * Utility to generate password hash
 * Run this in your app console or create a temporary screen to use it
 */

import { hashPassword } from './passwordHash';

/**
 * Generate hash for a password
 * Usage: Call this function with your desired password
 * 
 * Example:
 * const hash = generatePasswordHash('mynewpassword123');
 * console.log('Hash:', hash);
 * 
 * Then copy the hash and paste it into Firestore for the user's password field
 */
export const generatePasswordHash = (password) => {
  if (!password) {
    console.error('Password is required');
    return null;
  }
  
  const hash = hashPassword(password);
  console.log('='.repeat(50));
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('='.repeat(50));
  console.log('Copy this hash and paste it into Firestore:');
  console.log(hash);
  console.log('='.repeat(50));
  
  return hash;
};

/**
 * Quick reset function - generates hashes for common passwords
 */
export const generateCommonHashes = () => {
  const commonPasswords = {
    'admin123': hashPassword('admin123'),
    'dev123': hashPassword('dev123'),
    'admin': hashPassword('admin'),
    'developer': hashPassword('developer'),
    'password123': hashPassword('password123'),
  };
  
  console.log('='.repeat(50));
  console.log('Common Password Hashes:');
  console.log('='.repeat(50));
  Object.entries(commonPasswords).forEach(([password, hash]) => {
    console.log(`${password}: ${hash}`);
  });
  console.log('='.repeat(50));
  
  return commonPasswords;
};

export default generatePasswordHash;

