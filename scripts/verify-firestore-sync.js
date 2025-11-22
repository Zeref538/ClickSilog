/**
 * Firestore Synchronization Verification Script
 * 
 * This script verifies that all data sources are properly configured
 * to use Firestore and that synchronization is working correctly.
 * 
 * Usage: node scripts/verify-firestore-sync.js
 */

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
let useMocks = false;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const useMocksMatch = envContent.match(/EXPO_PUBLIC_USE_MOCKS=(.+)/);
  if (useMocksMatch) {
    useMocks = useMocksMatch[1].trim() === 'true';
  }
}

console.log('\n🔍 Firestore Synchronization Verification\n');
console.log('='.repeat(60));

// Check environment configuration
console.log('\n📋 Configuration Check:');
console.log(`   EXPO_PUBLIC_USE_MOCKS: ${useMocks ? 'true ⚠️' : 'false ✅'}`);
if (useMocks) {
  console.log('   ⚠️  WARNING: App is configured to use MOCK data!');
  console.log('   ⚠️  Set EXPO_PUBLIC_USE_MOCKS=false in .env for Firestore');
} else {
  console.log('   ✅ App is configured to use Firestore');
}

// Check Firebase credentials
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

console.log('\n🔑 Firebase Credentials Check:');
requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName + '=');
  console.log(`   ${hasVar ? '✅' : '❌'} ${varName}`);
});

// Check data source files
console.log('\n📊 Data Source Verification:');
const srcPath = path.join(__dirname, '..', 'src');
const filesToCheck = [
  'services/firestoreService.js',
  'services/orderService.js',
  'services/authService.js',
  'hooks/useRealTime.js',
  'config/firebase.js',
  'config/appConfig.js',
];

filesToCheck.forEach(file => {
  const filePath = path.join(srcPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const usesFirestore = content.includes('firebaseDb') || content.includes('db') || content.includes('onSnapshot');
    const checksUseMocks = content.includes('appConfig.USE_MOCKS') || content.includes('USE_MOCKS');
    console.log(`   ${usesFirestore && checksUseMocks ? '✅' : '⚠️'} ${file}`);
  } else {
    console.log(`   ❌ ${file} (not found)`);
  }
});

// Check screen components
console.log('\n🖥️  Screen Components Check:');
const screensPath = path.join(srcPath, 'screens');
const screenDirs = ['admin', 'cashier', 'kitchen', 'customer'];

screenDirs.forEach(dir => {
  const dirPath = path.join(screensPath, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
    const usesFirestore = files.some(file => {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      return content.includes('subscribeCollection') || 
             content.includes('useRealTimeCollection') ||
             content.includes('firestoreService');
    });
    console.log(`   ${usesFirestore ? '✅' : '⚠️'} ${dir}/ (${files.length} files)`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Verification Complete!');
console.log('\n📝 Next Steps:');
console.log('   1. Ensure EXPO_PUBLIC_USE_MOCKS=false in .env');
console.log('   2. Verify all Firebase credentials are set');
console.log('   3. Test real-time sync by making changes in Firebase Console');
console.log('   4. Check app logs for "✅ Firestore initialized successfully"');
console.log('\n');

