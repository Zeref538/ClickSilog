# EAS Build Troubleshooting Guide

## Common Build Errors and Solutions

### Error: "Unknown error. See logs of the Build complete hook build phase"

This is a generic error. Check the actual build logs for specific issues.

#### How to View Build Logs

1. Go to: https://expo.dev/accounts/zeref8425/projects/clicksilogapp/builds
2. Click on the failed build
3. Scroll to "Build logs" section
4. Look for error messages (usually in red)

#### Common Causes and Fixes

##### 1. Missing SDK Version
**Error**: Build fails during configuration
**Fix**: Added `sdkVersion` to `app.json`

##### 2. Version Code Conflict
**Error**: `android.versionCode field in app config is ignored`
**Fix**: Removed `versionCode` from `app.json` (EAS manages it remotely)

##### 3. Build Hook Errors
**Error**: Errors in "Build complete hook" phase
**Possible causes**:
- Missing environment variables
- Post-build script errors
- File permission issues

**Fix**: Check if you have any custom build hooks in `eas.json` or build scripts

##### 4. Missing Dependencies
**Error**: Module not found or dependency errors
**Fix**:
```bash
npm install
# Clear cache
npm run start:clear
```

##### 5. Icon/Splash Issues
**Error**: Invalid icon or splash screen
**Fix**: Ensure `assets/icon.png` exists and is valid (1024x1024 recommended)

##### 6. Firebase Configuration
**Error**: Firebase initialization errors
**Fix**: Verify Firebase config in `src/config/firebase.js`

---

## Step-by-Step Debugging

### 1. Check Build Logs
```bash
# View build details
eas build:view [build-id]
```

### 2. Test Locally First
```bash
# Build locally to catch errors early
npx expo run:android --variant release
```

### 3. Clear Cache and Rebuild
```bash
# Clear EAS build cache
eas build --clear-cache --platform android --profile preview
```

### 4. Check Configuration
```bash
# Validate app.json
npx expo-doctor
```

### 5. Update Dependencies
```bash
# Update all dependencies
npm update
# Or update Expo
npx expo install --fix
```

---

## Specific Error Messages

### "Module not found"
- Check `package.json` dependencies
- Run `npm install`
- Clear node_modules and reinstall

### "Gradle build failed"
- Check `android/app/build.gradle`
- Verify Android SDK versions
- Check for syntax errors

### "Keystore error"
- Verify keystore credentials in EAS
- Run `eas credentials` to check/update

### "Asset bundling failed"
- Check `app.json` → `assetBundlePatterns`
- Verify all assets exist
- Check file paths

### "Firebase initialization error"
- Verify Firebase config
- Check API keys
- Ensure Firebase project is active

---

## Quick Fixes

### Fix 1: Update app.json
```json
{
  "expo": {
    "sdkVersion": "54.0.0",
    // Remove versionCode from android section if using remote versioning
  }
}
```

### Fix 2: Clear and Rebuild
```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install
eas build --clear-cache --platform android --profile preview
```

### Fix 3: Check EAS Status
Visit: https://status.expo.dev/
If EAS is down, wait and retry

### Fix 4: Update EAS CLI
```bash
npm install -g eas-cli@latest
```

---

## Getting Help

1. **Check Build Logs**: Always check the detailed logs first
2. **EAS Status**: https://status.expo.dev/
3. **Expo Forums**: https://forums.expo.dev/
4. **Discord**: https://chat.expo.dev/
5. **Documentation**: https://docs.expo.dev/build/introduction/

---

## Next Steps After Fixing

1. Review the build logs from the failed build
2. Identify the specific error message
3. Apply the appropriate fix from this guide
4. Rebuild: `npm run build:android:apk`
5. Monitor the new build

---

**Last Updated**: 2025-01-20
