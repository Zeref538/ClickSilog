# Quick Testing Guide - Real Device Testing

## 🚀 Quick Start (5 Minutes)

### Step 1: Connect Your Android Device
```bash
# 1. Enable Developer Options on your phone:
#    Settings → About Phone → Tap "Build Number" 7 times

# 2. Enable USB Debugging:
#    Settings → Developer Options → Enable "USB Debugging"

# 3. Connect phone to computer via USB

# 4. Verify connection:
adb devices
# Should show your device ID
```

### Step 2: Install App on Device

**Option A: Using Expo Go (Fastest)**
```bash
# 1. Install "Expo Go" from Play Store on your phone

# 2. Start Metro bundler:
npm run start:clear

# 3. Scan QR code with Expo Go app
```

**Option B: Build Development APK**
```bash
# Build development client
npm run build:android:dev

# After build completes, download APK from EAS dashboard
# Install on your device
```

### Step 3: Test Critical Flows

#### ✅ Must Test Before Production:

1. **Admin Login** → Sales Report → Export CSV
2. **Customer** → Add items → Place order → Pay (Cash & GCash)
3. **Kitchen** → View order → Start → Ready → Complete
4. **Cashier** → View order → Process payment → Generate receipt
5. **Admin** → Edit menu item → Verify syncs to Customer screen

---

## 📋 Essential Test Checklist

### Authentication
- [ ] Admin can login
- [ ] Cashier can login  
- [ ] Kitchen can login
- [ ] Customer can access (table number & customer name)

### Order Flow (Critical Path)
- [ ] Customer creates order
- [ ] Order appears in Kitchen immediately (< 2 seconds)
- [ ] Kitchen starts preparing
- [ ] Kitchen marks ready
- [ ] Cashier processes payment
- [ ] Receipt generates correctly

### Payment
- [ ] Cash payment works
- [ ] GCash payment works (PayMongo)
- [ ] Receipt displays correctly

### Real-Time Sync
- [ ] Menu change in Admin → Appears in Customer/Cashier
- [ ] Order status change → Updates in all stations
- [ ] Works on multiple devices simultaneously

### Performance
- [ ] Screens load in < 2 seconds
- [ ] No lag when tapping buttons
- [ ] Smooth scrolling in lists

---

## 🐛 Common Issues & Fixes

### Device Not Detected
```bash
# Check connection
adb devices

# If empty, try:
adb kill-server
adb start-server
adb devices
```

### App Won't Connect to Metro
```bash
# Restart Metro with clear cache
npm run start:clear

# Check firewall/antivirus isn't blocking
```

### Build Fails
```bash
# Clear build cache
eas build:cancel
eas build --platform android --profile development --clear-cache
```

---

## 📱 Testing on Multiple Devices

1. **Install on 2+ devices**
2. **Login as different roles:**
   - Device 1: Admin
   - Device 2: Cashier
   - Device 3: Kitchen
   - Device 4: Customer

3. **Test synchronization:**
   - Create order on Customer device
   - Verify appears on Kitchen device
   - Update status on Kitchen
   - Verify updates on Cashier device

---

## ⚡ Quick Performance Test

```bash
# Monitor app performance
adb shell dumpsys meminfo com.clicksilog.app

# Check network usage
adb shell dumpsys netstats
```

---

## ✅ Ready for Production?

Before building production APK, ensure:

- [x] All critical flows tested
- [x] No crashes or freezes
- [x] Payment works (Cash & GCash)
- [x] Real-time sync works
- [x] Performance acceptable (< 2s load)
- [x] Works on at least 2 different devices

**Then build:**
```bash
eas build --platform android --profile production
```

---

For detailed testing, see: `docs/TESTING_GUIDE.md`


