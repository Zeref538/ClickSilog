import { appConfig } from './appConfig';

// Production-safe logging
const log = (...args) => { if (__DEV__) console.log(...args); };
const logError = (...args) => { console.error(...args); }; // Always log errors
const logWarn = (...args) => { if (__DEV__) console.warn(...args); };

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
        log('✅ Firestore initialized successfully');
        log('📊 Firestore is ready to use');
      } else {
        logError('❌ Firestore initialization returned null');
      }
    } catch (dbError) {
      logError('❌ Firestore initialization failed:', dbError.message);
      logError('Error details:', dbError.code, dbError.stack);
      db = null;
    }
    
    // Initialize Storage (optional)
    try {
      storage = getStorage(app);
      if (storage) {
        log('✅ Firebase Storage initialized successfully');
      }
    } catch (storageError) {
      logWarn('⚠️ Firebase Storage initialization failed:', storageError.message);
      storage = null;
    }

    // Final status check
    if (!db) {
      logError('❌ CRITICAL: Firestore is not available!');
      logError('This means your app will use mock data instead of Firestore.');
      logError('Check:');
      logError('  1. Is Firestore enabled in Firebase Console?');
      logError('  2. Are your Firebase credentials correct?');
      logError('  3. Is EXPO_PUBLIC_USE_MOCKS=false in your .env file?');
      logError('  4. Do you have internet connection?');
    } else {
      log('✅ Firebase setup complete - Firestore is ready!');
    }
  } catch (error) {
    const errorMessage = error.message || String(error);
    logError('❌ Firebase initialization failed:', errorMessage);
    logError('Error details:', errorMessage, error.code);
    logError('This might prevent Firestore from working.');
    
    // Keep exports as null - app will use mock data if Firestore failed
    // Don't throw - let the app continue with fallback
  }
}

export default app;


