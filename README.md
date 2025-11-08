# ClickSiLogApp

A React Native (Expo) restaurant app with Customer, Kitchen, Cashier, and Admin modules.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run in Expo Go (Fastest - Mock Mode)
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

## Testing Firebase Real-Time Sync

1. **Connect device via wireless debugging** (see `WIRELESS_DEBUGGING.md`)
2. **Build and install:**
   ```bash
   npm run android
   ```
3. **Install on second device** (wireless or USB)
4. **Test sync** - changes appear instantly on both devices

## Documentation

- `WIRELESS_DEBUGGING.md` - Setup wireless debugging
- `FIREBASE_PAYMONGO_SETUP.md` - Firebase and PayMongo configuration
- `ENV_SETUP.md` - Environment variables setup
- `docs/INTEGRATION.md` - Integration guide

## Scripts

- `npm start` - Start Expo dev server (Expo Go)
- `npm run android` - Build and install on Android (local build)
- `npm run build:android:apk` - Build APK for production (EAS)
- `npm run build:android:dev` - Build development client (EAS)

## Project Structure

- `src/config/` - Configuration (Firebase, app settings)
- `src/services/` - Service layer (Firestore, Auth, etc.)
- `src/screens/` - Screen components
- `src/components/` - Reusable components
- `src/contexts/` - React contexts (Auth, Cart, Theme)
- `src/navigation/` - Navigation setup

