# APK Build Guide for ClickSilog App

## Prerequisites

1. **EAS Account**: Sign up at [expo.dev](https://expo.dev) if you don't have an account
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Login to EAS**:
   ```bash
   eas login
   ```

## Build Configuration

The app is configured for APK builds in `eas.json`:

- **Development**: Development client build
- **Preview**: APK for internal testing
- **Production**: Production APK

## Building APK

### Option 1: Preview Build (Recommended for Testing)

```bash
npm run build:android:apk
# or
eas build --platform android --profile preview
```

This creates an APK file that can be installed directly on Android devices.

### Option 2: Production Build

```bash
npm run build:android
# or
eas build --platform android --profile production
```

### Option 3: Development Build

```bash
npm run build:android:dev
# or
eas build --platform android --profile development
```

## Build Status

Check build status:
```bash
eas build:list
```

## Download APK

After the build completes:
1. Visit [expo.dev](https://expo.dev)
2. Go to your project → Builds
3. Download the APK file
4. Transfer to Android device and install

## App Configuration

### Version Management

Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

- **version**: User-facing version (e.g., "1.0.0")
- **versionCode**: Internal version number (increment for each build)

### Permissions

Android permissions are configured in `app.json`:
- Camera (for menu item images)
- Storage (for image uploads)
- Media library access

### Icons and Splash

Ensure these files exist in `assets/`:
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024 for Android)

## Environment Variables

Before building, ensure `.env` file has:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY=your_public_key
```

**Note**: Secret keys should NOT be in `.env` - use Cloud Functions for secure operations.

## Troubleshooting

### Build Fails

1. Check EAS status: `eas build:list`
2. Review build logs in Expo dashboard
3. Ensure all dependencies are in `package.json`
4. Check for TypeScript/ESLint errors: `npm run lint`

### APK Won't Install

1. Enable "Install from Unknown Sources" on Android device
2. Check APK file size (should be ~50-100MB)
3. Ensure device has enough storage space

### App Crashes on Launch

1. Check Firebase configuration
2. Verify all environment variables are set
3. Check device logs: `adb logcat`

## Local Build (Advanced)

For local builds without EAS:
```bash
npx expo run:android
```

This requires Android Studio and Android SDK setup.

## Next Steps

1. Test the APK on multiple devices
2. Set up Firebase Storage rules (deploy `storage.rules`)
3. Configure PayMongo webhooks
4. Test payment flow end-to-end

