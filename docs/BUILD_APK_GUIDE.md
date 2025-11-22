# APK Build Guide - Click Silog App

This guide will help you build an APK for the Click Silog app.

## 📋 Pre-Build Checklist

Before building, ensure:

- [ ] All code changes are committed
- [ ] App version is updated in `app.json` (currently: `1.0.0`)
- [ ] Version code is updated in `android/app/build.gradle` (currently: `1`)
- [ ] Firebase configuration is correct
- [ ] All dependencies are installed (`npm install`)
- [ ] EAS CLI is installed (`npm install -g eas-cli`)
- [ ] You're logged into EAS (`eas login`)

## 🚀 Option 1: EAS Build (Recommended - Cloud Build)

EAS Build builds your app in the cloud. No local Android SDK required.

### Prerequisites

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Configure EAS** (if first time):
   ```bash
   eas build:configure
   ```

### Build Commands

#### Preview/Testing APK (Recommended for testing)
```bash
npm run build:android:apk
# OR
eas build --platform android --profile preview
```

#### Development APK (with dev client)
```bash
npm run build:android:dev
# OR
eas build --platform android --profile development
```

#### Production APK
```bash
npm run build:android:prod
# OR
eas build --platform android --profile production
```

### Build Process

1. Run the build command
2. EAS will ask you to confirm build settings
3. Build will start in the cloud (takes 10-20 minutes)
4. You'll get a download link when complete
5. Download the APK from the EAS dashboard or link

### Download APK

After build completes:
- Check your email for download link
- Or visit: https://expo.dev/accounts/[your-account]/projects/clicksilogapp/builds
- Download the APK file

---

## 🏗️ Option 2: Local Build (Requires Android SDK)

Build the APK locally on your machine.

### Prerequisites

1. **Android Studio** installed
2. **Android SDK** configured
3. **JAVA_HOME** environment variable set
4. **ANDROID_HOME** environment variable set

### Build Steps

1. **Navigate to android directory**:
   ```bash
   cd android
   ```

2. **Clean previous builds**:
   ```bash
   ./gradlew clean
   ```

3. **Build Release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

4. **Find your APK**:
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

### Alternative: Build via Expo

```bash
npx expo run:android --variant release
```

---

## 📦 Build Profiles Explained

### Preview Profile
- **Purpose**: Testing and internal distribution
- **Build Type**: APK
- **Distribution**: Internal
- **Use Case**: Share with testers, QA testing

### Development Profile
- **Purpose**: Development with dev client
- **Build Type**: APK
- **Distribution**: Internal
- **Use Case**: Development and debugging

### Production Profile
- **Purpose**: Production release
- **Build Type**: APK
- **Distribution**: Store (if configured)
- **Use Case**: Final release, Play Store submission

---

## 🔐 Signing Configuration

### Current Setup

Your app is currently using **debug keystore** for release builds. This is fine for testing but **NOT for production**.

### For Production Release

You need to create a production keystore:

1. **Generate keystore**:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore clicksilog-release.keystore -alias clicksilog-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Store credentials securely**:
   - Save keystore file securely
   - Store passwords in password manager
   - **DO NOT commit keystore to git**

3. **Configure EAS credentials**:
   ```bash
   eas credentials
   ```
   - Select Android
   - Select Production
   - Upload your keystore

---

## 📱 Installing the APK

### On Android Device/Emulator

1. **Enable Unknown Sources**:
   - Settings → Security → Unknown Sources (enable)

2. **Transfer APK** to device:
   - Via USB
   - Via email
   - Via cloud storage

3. **Install**:
   - Tap the APK file
   - Follow installation prompts

### Via ADB (for emulator)

```bash
adb install path/to/app-release.apk
```

---

## 🔍 Troubleshooting

### Build Fails

1. **Check EAS status**: https://status.expo.dev/
2. **Check build logs**: Available in EAS dashboard
3. **Clear cache**: `eas build --clear-cache`
4. **Update dependencies**: `npm install`

### APK Too Large

- Check `app.json` → `assetBundlePatterns`
- Remove unused assets
- Enable ProGuard (already configured)

### Version Code Conflicts

- Increment `versionCode` in `android/app/build.gradle`
- Update `version` in `app.json`

### Firebase Errors

- Verify Firebase config in `src/config/firebase.js`
- Check Firebase project settings
- Ensure API keys are correct

---

## 📊 Build Information

### Current Configuration

- **App Name**: Click Silog
- **Package**: com.clicksilog.app
- **Version**: 1.0.0
- **Version Code**: 1
- **Min SDK**: (check `android/build.gradle`)
- **Target SDK**: (check `android/build.gradle`)

### File Locations

- **APK Output (Local)**: `android/app/build/outputs/apk/release/app-release.apk`
- **EAS Builds**: https://expo.dev/accounts/[account]/projects/clicksilogapp/builds
- **Keystore**: `android/app/debug.keystore` (debug only)

---

## ✅ Quick Start (Recommended)

For your first build, use EAS Build Preview:

```bash
# 1. Login to EAS
eas login

# 2. Build preview APK
npm run build:android:apk

# 3. Wait for build to complete (10-20 minutes)

# 4. Download APK from email or dashboard

# 5. Install on device
```

---

## 📝 Notes

- **First build** takes longer (10-20 minutes)
- **Subsequent builds** are faster (5-10 minutes) due to caching
- **APK size** is typically 30-50 MB
- **Debug keystore** is fine for testing, but create production keystore for release
- **Version code** must increment for each new build uploaded to Play Store

---

## 🆘 Need Help?

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Android Build Docs**: https://reactnative.dev/docs/signed-apk-android
- **Expo Discord**: https://chat.expo.dev/

---

**Last Updated**: 2025-01-20
**Build System**: Expo EAS Build + Local Gradle
**Recommended Method**: EAS Build (Preview Profile)

