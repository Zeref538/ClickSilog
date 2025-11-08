# Wireless Debugging Setup

## Quick Setup for Android Studio Wireless Debugging

### Step 1: Enable Wireless Debugging on Device

1. **Settings → Developer Options**
2. **Enable "Wireless debugging"**
3. **Tap "Wireless debugging"**
4. **Tap "Pair device with pairing code"**
5. **Note the IP address and port** (e.g., `192.168.1.100:37163`)
6. **Note the pairing code** (6 digits)

### Step 2: Connect from Android Studio

1. **Open Android Studio**
2. **Device Manager** (right sidebar or View → Tool Windows → Device Manager)
3. **Click "Pair using Wi-Fi"** (or use the wireless icon)
4. **Enter IP address and port** from device
5. **Enter pairing code** from device
6. **Click "OK"**

**Device should appear in Device Manager**

### Step 3: Build and Install

```bash
npm run android
```

**The build will automatically install on the wirelessly connected device.**

---

## Alternative: Connect via ADB

### If Android Studio pairing doesn't work:

```bash
# Pair device
adb pair <IP:PORT>

# Enter pairing code when prompted

# Connect
adb connect <IP:PORT>

# Verify
adb devices
```

**Example:**
```bash
adb pair 192.168.1.100:37163
# Enter code: 123456
adb connect 192.168.1.100:37163
adb devices
```

---

## Test Firebase Real-Time Sync

### After build completes:

1. **App installs automatically** on wirelessly connected device
2. **Check terminal** - should see: `✅ Firebase Auth initialized successfully`
3. **Test in app** - sign in, create data
4. **Install on second device** (wireless or USB)
5. **Test sync** - changes should appear instantly on both devices

---

## Troubleshooting

### Device not showing in Android Studio:
- Make sure device and computer are on **same WiFi network**
- Try pairing again
- Check firewall settings

### Build fails to install:
- Verify device is connected: `adb devices`
- Try USB connection instead
- Check device has enough storage

---

## Quick Commands

```bash
# Check connected devices
adb devices

# Build and install
npm run android

# Start dev server (if needed)
npm start
```

