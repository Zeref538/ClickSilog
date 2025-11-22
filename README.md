# Click Silog

A comprehensive React Native (Expo) restaurant management system with Customer, Kitchen, Cashier, and Admin modules.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run in Expo Go (Development - Mock Mode)
```bash
npm start
# Scan QR code with Expo Go app
```

### Run with Firebase (Local Build)
```bash
# Connect Android device (USB or wireless)
npm run android
```

### Build for Production
```bash
npm run build:android:apk
```

## Documentation

- **Project Summary & Requirements:** `docs/PROJECT_SUMMARY.md` - Complete project documentation, requirements, and change logs
- **User Manual:** `docs/USER_MANUAL.md` - Step-by-step guide for all user roles
- **Testing Guide:** `docs/TESTING_GUIDE.md` - Comprehensive real device testing guide
- **Quick Testing:** `docs/QUICK_TESTING_GUIDE.md` - Fast 5-minute testing checklist

## Scripts

- `npm start` - Start Expo dev server (Expo Go)
- `npm run android` - Build and install on Android (local build)
- `npm run build:android:apk` - Build preview APK (EAS)
- `npm run build:android:dev` - Build development client (EAS)
- `npm run build:android:prod` - Build production APK (EAS)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (Auth, Cart, Theme)
├── screens/        # Screen components organized by module
├── services/       # Business logic and API services
├── navigation/    # Navigation configuration
├── config/         # App configuration (Firebase, theme)
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

## Key Features

- ✅ Real-time order synchronization via Firestore
- ✅ Secure payment processing with PayMongo (GCash, PayMaya, Card)
- ✅ Role-based access control (Customer, Kitchen, Cashier, Admin)
- ✅ Dark/Light theme support
- ✅ Offline support with local caching
- ✅ Comprehensive error handling
- ✅ Production-ready APK builds

## Payment Integration

The app uses **PayMongo** for secure payment processing. See [PROJECT_SUMMARY.md](./docs/project/PROJECT_SUMMARY.md#paymongo-payment-integration) for detailed documentation on:
- How PayMongo works
- Implementation details
- Setup instructions
- Security best practices

