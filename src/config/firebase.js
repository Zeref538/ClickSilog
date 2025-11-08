import { appConfig } from './appConfig';

// Export nulls in mock mode - Firebase won't be initialized at all
export let db = null;
export let storage = null;
export let app = null;

if (!appConfig.USE_MOCKS) {
  // Only initialize Firebase when NOT in mock mode
  try {
    // Import Firebase modules using require (dynamic import for mock mode support)
    const { initializeApp, getApps } = require('firebase/app');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    const firebaseConfig = {
      apiKey: appConfig.firebase.apiKey,
      authDomain: appConfig.firebase.authDomain,
      projectId: appConfig.firebase.projectId,
      storageBucket: appConfig.firebase.storageBucket,
      messagingSenderId: appConfig.firebase.messagingSenderId,
      appId: appConfig.firebase.appId,
      measurementId: appConfig.firebase.measurementId
    };

    // Check if app is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }

    // Initialize Firestore (this is what we actually need!)
    try {
      db = getFirestore(app);
      if (db) {
        console.log('✅ Firestore initialized successfully');
        console.log('📊 Firestore is ready to use');
      } else {
        console.error('❌ Firestore initialization returned null');
      }
    } catch (dbError) {
      console.error('❌ Firestore initialization failed:', dbError.message);
      console.error('Error details:', dbError.code, dbError.stack);
      db = null;
    }
    
    // Initialize Storage (optional)
    try {
      storage = getStorage(app);
      if (storage) {
        console.log('✅ Firebase Storage initialized successfully');
      }
    } catch (storageError) {
      console.warn('⚠️ Firebase Storage initialization failed:', storageError.message);
      storage = null;
    }

    // Final status check
    if (!db) {
      console.error('❌ CRITICAL: Firestore is not available!');
      console.error('This means your app will use mock data instead of Firestore.');
      console.error('Check:');
      console.error('  1. Is Firestore enabled in Firebase Console?');
      console.error('  2. Are your Firebase credentials correct?');
      console.error('  3. Is EXPO_PUBLIC_USE_MOCKS=false in your .env file?');
      console.error('  4. Do you have internet connection?');
    } else {
      console.log('✅ Firebase setup complete - Firestore is ready!');
    }
  } catch (error) {
    const errorMessage = error.message || String(error);
    console.error('❌ Firebase initialization failed:', errorMessage);
      console.error('Error details:', errorMessage, error.code);
      console.error('This might prevent Firestore from working.');
    
    // Keep exports as null - app will use mock data if Firestore failed
    // Don't throw - let the app continue with fallback
  }
}

export default app;


