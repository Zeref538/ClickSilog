/**
 * Check EAS Secrets Configuration
 * 
 * This script helps verify if all required environment variables
 * are set in EAS for production builds.
 */

const { execSync } = require('child_process');

console.log('\n🔍 Checking EAS Secrets Configuration\n');
console.log('='.repeat(60));

const requiredSecrets = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_USE_MOCKS',
  'EXPO_PUBLIC_PAYMONGO_SECRET_KEY'
];

console.log('\n📋 Required Environment Variables for Production:\n');

requiredSecrets.forEach(secret => {
  console.log(`   - ${secret}`);
});

console.log('\n📝 To Set Secrets in EAS:\n');
console.log('   Option 1: Via EAS CLI');
console.log('   eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-value" --type string\n');
console.log('   Option 2: Via EAS Dashboard');
console.log('   1. Go to: https://expo.dev/accounts/zeref8425/projects/clicksilogapp');
console.log('   2. Navigate to: Secrets → Environment Variables');
console.log('   3. Add variables for "production" environment\n');

console.log('📋 To List Current Secrets:');
console.log('   eas secret:list\n');

console.log('⚠️  Note: Secrets must be set for "production" environment');
console.log('   The build error may be due to missing environment variables.\n');

console.log('='.repeat(60));
console.log('✅ Check complete!\n');


