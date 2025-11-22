# Build Types: Development vs Production

## Quick Comparison

| Feature | Development Build | Production Build |
|---------|------------------|------------------|
| **Command** | `npm run build:android:dev` | `eas build --platform android --profile production` |
| **Profile** | `development` | `production` |
| **Development Client** | ✅ Yes (includes Expo Dev Client) | ❌ No (standalone app) |
| **Metro Bundler** | ✅ Can connect to Metro | ❌ Cannot connect |
| **Hot Reload** | ✅ Yes (via Metro) | ❌ No |
| **Code Updates** | ✅ Can update via OTA | ❌ Requires new build |
| **Debugging** | ✅ Full debugging tools | ⚠️ Limited debugging |
| **Performance** | ⚠️ Slower (debug mode) | ✅ Optimized |
| **Bundle Size** | ⚠️ Larger (includes dev tools) | ✅ Smaller (minified) |
| **Distribution** | Internal only | Can publish to stores |
| **Use Case** | Testing & Development | Final Release |

---

## Detailed Differences

### 1. **Development Build** (`npm run build:android:dev`)

**What it is:**
- A custom development client that includes Expo Dev Client
- Allows you to load your app from Metro bundler
- Similar to Expo Go but with your custom native code

**Configuration (from `eas.json`):**
```json
{
  "development": {
    "developmentClient": true,  // ← Key difference!
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    }
  }
}
```

**Features:**
- ✅ **Development Client Included**: Has Expo Dev Client built-in
- ✅ **Metro Connection**: Can connect to your local Metro bundler
- ✅ **Hot Reload**: Changes appear instantly without rebuilding
- ✅ **Fast Iteration**: Update JavaScript code without rebuilding APK
- ✅ **Debugging**: Full access to React Native debugging tools
- ✅ **Internal Distribution**: Can share with team for testing

**How it works:**
1. Build the development client once: `npm run build:android:dev`
2. Install APK on device
3. Start Metro: `npm run start:clear`
4. App connects to Metro and loads your code
5. Make code changes → See updates instantly

**When to use:**
- During active development
- Testing new features
- Debugging issues
- Team testing (internal distribution)
- When you need to update code frequently

**Limitations:**
- ❌ Larger APK size (includes dev tools)
- ❌ Slower performance (debug mode)
- ❌ Cannot publish to Play Store
- ❌ Requires Metro bundler running

---

### 2. **Production Build** (`eas build --platform android --profile production`)

**What it is:**
- A standalone, optimized app ready for distribution
- Contains all code bundled and minified
- No connection to Metro bundler
- Ready for Play Store submission

**Configuration (from `eas.json`):**
```json
{
  "production": {
    "android": {
      "buildType": "apk"  // or "aab" for Play Store
    }
  }
}
```

**Features:**
- ✅ **Standalone**: All code bundled in the APK
- ✅ **Optimized**: Code minified and optimized
- ✅ **Smaller Size**: No dev tools included
- ✅ **Faster**: Production-optimized performance
- ✅ **Store Ready**: Can submit to Google Play Store
- ✅ **No Metro Required**: Works completely offline

**How it works:**
1. Build production APK: `eas build --platform android --profile production`
2. All JavaScript code is bundled into the APK
3. Install APK on device
4. App runs standalone (no Metro needed)
5. To update: Must rebuild and reinstall

**When to use:**
- Final release to users
- Play Store submission
- Production deployment
- When you want standalone app
- Performance testing

**Limitations:**
- ❌ No hot reload (must rebuild for changes)
- ❌ No Metro connection
- ❌ Limited debugging
- ❌ Slower iteration (rebuild required)

---

## Visual Comparison

### Development Build Flow:
```
┌─────────────┐
│  Your Code  │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│ Metro Bundler│◄────┤ Dev Client   │
│  (Running)  │      │  (APK)       │
└─────────────┘      └──────────────┘
       │                    │
       └────────────────────┘
              ▲
              │
         Hot Reload
```

### Production Build Flow:
```
┌─────────────┐
│  Your Code  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Bundled   │
│   & Minified│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Production  │
│    APK      │
└─────────────┘
   (Standalone)
```

---

## Which One Should You Use?

### Use **Development Build** when:
- ✅ You're actively developing
- ✅ You need to test code changes quickly
- ✅ You're debugging issues
- ✅ You're sharing with team for testing
- ✅ You need hot reload

### Use **Production Build** when:
- ✅ You're ready to release to users
- ✅ You want to test final performance
- ✅ You're submitting to Play Store
- ✅ You need a standalone app
- ✅ Code is finalized

---

## Build Commands Reference

### Development Build:
```bash
# Build development client
npm run build:android:dev

# After installing APK, start Metro:
npm run start:clear

# Or with dev client:
npm run start:dev:clear
```

### Production Build:
```bash
# Build production APK
eas build --platform android --profile production

# Or using npm script (if you add it):
npm run build:android:prod
```

### Preview Build (Middle Ground):
```bash
# Build preview APK (no dev client, but internal distribution)
npm run build:android:apk
# or
eas build --platform android --profile preview
```

---

## Build Process Comparison

### Development Build Process:
1. **Build Time**: ~15-20 minutes (first time)
2. **Includes**: Expo Dev Client + Your Native Code
3. **APK Size**: ~50-80 MB (larger due to dev tools)
4. **After Build**: Install APK, then connect to Metro
5. **Updates**: Instant via Metro (no rebuild needed)

### Production Build Process:
1. **Build Time**: ~20-30 minutes
2. **Includes**: Your App Code (bundled & minified)
3. **APK Size**: ~20-40 MB (optimized)
4. **After Build**: Install APK, ready to use
5. **Updates**: Requires new build

---

## Testing Workflow Recommendation

### Phase 1: Development (Use Development Build)
```bash
# 1. Build development client
npm run build:android:dev

# 2. Install on device
# 3. Start Metro
npm run start:clear

# 4. Test and iterate quickly
# 5. Make code changes → See updates instantly
```

### Phase 2: Pre-Production Testing (Use Preview Build)
```bash
# 1. Build preview APK
npm run build:android:apk

# 2. Install on device
# 3. Test as standalone app (no Metro)
# 4. Verify performance and behavior
```

### Phase 3: Production Release (Use Production Build)
```bash
# 1. Final testing complete
# 2. Build production APK
eas build --platform android --profile production

# 3. Test production APK
# 4. Submit to Play Store (or distribute directly)
```

---

## Important Notes

### Development Build:
- ⚠️ **Requires Metro**: App won't work without Metro bundler running
- ⚠️ **Internet Required**: Needs connection to Metro server
- ⚠️ **Not for End Users**: Too large and requires setup

### Production Build:
- ⚠️ **No Hot Reload**: Must rebuild for any code changes
- ⚠️ **Final Code**: Make sure code is production-ready before building
- ✅ **Standalone**: Works completely offline after installation

---

## Summary

**Development Build** = Development tool for fast iteration
- Use during development
- Requires Metro bundler
- Hot reload enabled
- Larger, slower, but flexible

**Production Build** = Final app for users
- Use for release
- Standalone (no Metro)
- Optimized and fast
- Smaller, faster, but requires rebuild for updates

**Choose based on your needs:**
- **Developing/Testing** → Development Build
- **Releasing to Users** → Production Build

---

**Last Updated:** 2025-01-XX


