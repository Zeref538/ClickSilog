// For Expo, environment variables must be prefixed with EXPO_PUBLIC_
// Access via process.env.EXPO_PUBLIC_*
// In production, all values MUST come from environment variables

// Helper to get required env var or throw error
const getRequiredEnv = (key, fallback = null) => {
  const value = process.env[key];
  if (!value && !fallback) {
    if (__DEV__) {
      console.warn(`⚠️  Missing required environment variable: ${key}`);
      // In development, allow fallback for easier setup
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}. Please set it in your .env file.`);
  }
  return value || fallback;
};

export const appConfig = {
  // Set to 'true' to disable Firebase and use mocks, 'false' to enable Firebase
  // Defaults to false (Firebase enabled) if env var not set
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS === 'true',
  
  firebase: {
    // In production, these MUST be set via environment variables
    // Fallback values are only for development convenience
    apiKey: getRequiredEnv('EXPO_PUBLIC_FIREBASE_API_KEY', __DEV__ ? 'AIzaSyDocFfiBivKUeUYuoUF5an6TcUO7nWgebU' : null),
    authDomain: getRequiredEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', __DEV__ ? 'clicksilog-9a095.firebaseapp.com' : null),
    projectId: getRequiredEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID', __DEV__ ? 'clicksilog-9a095' : null),
    storageBucket: getRequiredEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', __DEV__ ? 'clicksilog-9a095.firebasestorage.app' : null),
    messagingSenderId: getRequiredEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', __DEV__ ? '124998545103' : null),
    appId: getRequiredEnv('EXPO_PUBLIC_FIREBASE_APP_ID', __DEV__ ? '1:124998545103:web:7ed9728dea16aff1a611ba' : null),
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || (__DEV__ ? 'G-TDKRT5Y79G' : null), // Optional: for analytics
    region: process.env.EXPO_PUBLIC_FIREBASE_REGION || 'us-central1' // Cloud Functions region
  },
  
  paymongo: {
    // API keys should be set via environment variables (EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY and EXPO_PUBLIC_PAYMONGO_SECRET_KEY)
    // Never commit actual API keys to the repository
    publicKey: process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY || '',
    secretKey: process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || ''
  },

  // PIN Lock Configuration
  pinLock: {
    // Auto-lock timeout in minutes (default: 5 minutes)
    // Can be configured in admin settings
    defaultTimeoutMinutes: 5,
    // Minimum timeout in minutes
    minTimeoutMinutes: 1,
    // Maximum timeout in minutes
    maxTimeoutMinutes: 60,
  }
};

