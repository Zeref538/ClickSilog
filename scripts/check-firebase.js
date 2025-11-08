/**
 * Script to check Firebase connection and configuration
 * 
 * Usage:
 *   node scripts/check-firebase.js
 * 
 * Note: This script requires the app to be running in Expo.
 * For a simpler check, use the Admin Dashboard's seed button.
 */

console.log('⚠️  This script requires ES modules which Node.js cannot directly run.');
console.log('📱 Instead, use the Admin Dashboard in your app to seed Firestore.');
console.log('');
console.log('Alternative: Use the Admin Dashboard:');
console.log('1. Login as admin (username: admin, password: admin123)');
console.log('2. Go to Admin Dashboard');
console.log('3. Use the "Seed Database" button (if available)');
console.log('');
console.log('Or manually seed via Firebase Console:');
console.log('1. Go to Firebase Console → Firestore Database');
console.log('2. Create collections manually');
console.log('3. Add documents as needed');
console.log('');
console.log('See FIRESTORE_SETUP.md for detailed instructions.');
process.exit(0);

async function main() {
  console.log('🔍 Checking Firebase Configuration...\n');

  // Check app config
  console.log('📋 App Configuration:');
  console.log(`  USE_MOCKS: ${appConfig.USE_MOCKS}`);
  console.log(`  Project ID: ${appConfig.firebase.projectId}`);
  console.log(`  Auth Domain: ${appConfig.firebase.authDomain}`);
  console.log(`  API Key: ${appConfig.firebase.apiKey ? appConfig.firebase.apiKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');

  // Check Firebase initialization
  console.log('🔥 Firebase Initialization:');
  if (app) {
    console.log('  ✅ Firebase App initialized');
    console.log(`  App Name: ${app.name}`);
  } else {
    console.log('  ❌ Firebase App NOT initialized');
  }

  if (db) {
    console.log('  ✅ Firestore initialized');
  } else {
    console.log('  ❌ Firestore NOT initialized');
    console.log('  This could mean:');
    console.log('    - USE_MOCKS is set to true');
    console.log('    - Firebase initialization failed');
    console.log('    - Firestore is not enabled in your Firebase project');
  }

  console.log('');

  // Try to read from Firestore
  if (db) {
    console.log('📖 Testing Firestore Connection...');
    try {
      const { collection, getDocs } = require('firebase/firestore');
      
      // Try to read from a test collection
      const testCollection = collection(db, 'menu');
      const snapshot = await getDocs(testCollection);
      
      console.log(`  ✅ Firestore connection successful!`);
      console.log(`  Found ${snapshot.size} documents in 'menu' collection`);
      
      if (snapshot.size === 0) {
        console.log('\n  ⚠️  No data found in Firestore.');
        console.log('  Run: node scripts/seed-firestore.js to populate your database');
      } else {
        console.log('\n  📊 Sample data:');
        snapshot.docs.slice(0, 3).forEach((doc) => {
          console.log(`    - ${doc.id}: ${JSON.stringify(doc.data())}`);
        });
      }
    } catch (error) {
      console.log(`  ❌ Firestore connection failed: ${error.message}`);
      console.log('\n  Possible issues:');
      console.log('    1. Firestore is not enabled in your Firebase project');
      console.log('    2. Firestore security rules are blocking access');
      console.log('    3. Network connectivity issues');
      console.log('    4. Invalid Firebase credentials');
    }
  } else {
    console.log('  ⏭️  Skipping Firestore test (db not initialized)');
  }

  console.log('\n✅ Check complete!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

