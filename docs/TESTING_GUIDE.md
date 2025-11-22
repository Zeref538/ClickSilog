# Click Silog - Real Device Testing Guide

This guide will help you test all user flows on real Android devices before building the production APK.

---

## Prerequisites

### 1. Required Equipment
- **Android Device(s)** - At least one Android phone (Android 8.0+)
- **USB Cable** - To connect device to computer
- **Stable Internet Connection** - For Firestore synchronization
- **Computer** - With Node.js and Expo CLI installed

### 2. Device Setup

#### Enable Developer Options:
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. You'll see "You are now a developer!"

#### Enable USB Debugging:
1. Go to **Settings** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

#### Connect Device:
1. Connect your Android device to computer via USB
2. On your device, when prompted, tap **"Allow USB Debugging"**
3. Check "Always allow from this computer" (optional)

---

## Testing Setup

### Step 1: Install Development Build on Device

#### Option A: Using EAS Build (Recommended)
```bash
# Build a development client
eas build --platform android --profile development

# After build completes, download and install the APK on your device
# The APK will be available in your EAS dashboard
```

#### Option B: Using Expo Development Build
```bash
# Install Expo Go from Play Store (for quick testing)
# OR build a development client:
npx expo install expo-dev-client
npx expo run:android
```

#### Option C: Direct APK Installation
```bash
# Build APK locally
cd android
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Step 2: Configure Environment

1. **Ensure `.env` file is configured:**
   ```bash
   # Check your .env file has:
   EXPO_PUBLIC_USE_MOCKS=false
   EXPO_PUBLIC_FIREBASE_API_KEY=your_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   # ... all other Firebase credentials
   ```

2. **Start Metro Bundler:**
   ```bash
   npx expo start --clear
   ```

3. **Connect Device:**
   - If using Expo Go: Scan QR code
   - If using development build: App should connect automatically
   - If using USB: Run `adb devices` to verify connection

---

## Testing Checklist

### 🔐 Authentication & Login Flows

#### Admin Login
- [ ] **Test Admin Login**
  - Enter correct admin credentials
  - Verify successful login
  - Verify redirect to Admin Dashboard
  - Test with incorrect password (should show error)
  - Test logout functionality

#### Cashier Login
- [ ] **Test Cashier Login**
  - Enter correct cashier credentials
  - Verify successful login
  - Verify redirect to Cashier Dashboard
  - Test logout functionality

#### Kitchen Login
- [ ] **Test Kitchen Login**
  - Enter correct kitchen credentials
  - Verify successful login
  - Verify redirect to KDS Dashboard
  - Test logout functionality

#### Customer Access
- [ ] **Test Dine-In Access**
  - Enter table number (1-8)
  - Verify successful access
  - Verify redirect to menu screen
  
- [ ] **Test Take-Out Access**
  - Enter customer name
  - Verify successful access
  - Verify redirect to menu screen

---

### 👤 Admin User Flows

#### Sales Report
- [ ] **View Sales Report**
  - Navigate to Sales Report
  - Test all date filters (Today, 7 Days, 30 Days, All Time)
  - Verify statistics display correctly:
    - Total Sales
    - Total Orders
    - Payment Method Breakdown
    - Order Status Breakdown
  - Test CSV Export
  - Verify CSV file contains correct data

#### Menu Management
- [ ] **Add Menu Item**
  - Navigate to Menu Management
  - Click "Add Item"
  - Fill in all fields (name, category, price)
  - Upload image (optional)
  - Save item
  - Verify item appears in menu list
  - Verify item syncs to Customer/Cashier screens

- [ ] **Edit Menu Item**
  - Select an item
  - Click "Edit"
  - Modify price
  - Save changes
  - Verify changes reflect immediately
  - Verify changes sync to other screens

- [ ] **Delete Menu Item**
  - Select an item
  - Click "Delete"
  - Confirm deletion
  - Verify item is removed
  - Verify removal syncs to other screens

- [ ] **Toggle Item Availability**
  - Toggle an item's availability
  - Verify status changes
  - Verify unavailable items don't show in Customer/Cashier screens

#### Add-Ons Management
- [ ] **Add Add-On**
  - Navigate to Add-Ons Management
  - Add new add-on (rice, drink, or extra)
  - Verify add-on appears in list
  - Verify add-on available in customization

- [ ] **Edit Add-On**
  - Edit add-on price
  - Verify price updates
  - Verify price updates in customization

- [ ] **Delete Add-On**
  - Delete an add-on
  - Verify removal

#### Discount Management
- [ ] **Create Discount**
  - Navigate to Discount Management
  - Create new discount code
  - Set validity dates
  - Verify discount appears in list

- [ ] **Test Discount Application**
  - Use discount code in Customer/Cashier cart
  - Verify discount applies correctly
  - Verify discount calculation is accurate

#### User Management
- [ ] **Add User**
  - Navigate to User Management
  - Add new user (Cashier or Kitchen)
  - Set username, password, role
  - Verify user can login with new credentials

- [ ] **Edit User**
  - Edit user details
  - Change status (Active/Inactive)
  - Verify changes save correctly

- [ ] **Delete User**
  - Delete a user
  - Verify user cannot login after deletion

#### Data Management
- [ ] **Generate Sample Orders**
  - Navigate to Data Samples
  - Generate sample orders
  - Verify orders appear in Kitchen/Cashier screens

- [ ] **Delete Sample Data**
  - Delete sample data
  - Verify only sample data is deleted
  - Verify real orders remain intact

---

### 💰 Cashier User Flows

#### View Orders
- [ ] **View All Orders**
  - Navigate to Cashier Dashboard
  - View orders in different status tabs
  - Verify order details display correctly

#### Process Payments
- [ ] **Process Cash Payment**
  - Select an order
  - Click "Process Payment"
  - Select "Cash"
  - Enter cash amount
  - Enter payment password
  - Confirm payment
  - Verify receipt is generated
  - Verify order status updates

- [ ] **Process GCash Payment**
  - Select an order
  - Click "Process Payment"
  - Select "GCash"
  - Complete PayMongo payment flow
  - Verify payment success
  - Verify receipt is generated
  - Verify order status updates

#### Create Orders
- [ ] **Create Dine-In Order**
  - Click "New Order"
  - Select "Dine-In"
  - Enter table number
  - Add items to cart
  - Customize items
  - Place order
  - Process payment
  - Verify order appears in Kitchen

- [ ] **Create Take-Out Order**
  - Click "New Order"
  - Select "Take-Out"
  - Enter customer name
  - Add items to cart
  - Add order notes
  - Place order
  - Process payment
  - Verify order appears in Kitchen with customer name

---

### 🍳 Kitchen User Flows

#### View Orders
- [ ] **View Pending Orders**
  - Navigate to KDS Dashboard
  - View "Pending" tab
  - Verify new orders appear immediately
  - Verify order details (table/customer, items)

- [ ] **View Preparing Orders**
  - View "Preparing" tab
  - Verify orders in preparation

- [ ] **View All Orders**
  - View "All" tab
  - Filter by status
  - Verify all orders display

#### Manage Order Status
- [ ] **Start Preparing Order**
  - Click "Start" on pending order
  - Verify order moves to "Preparing" tab
  - Verify status updates in real-time
  - Verify Cashier sees status update

- [ ] **Mark Order as Ready**
  - Click "Ready" on preparing order
  - Verify order moves to "All" tab
  - Verify status shows "Ready"
  - Verify Cashier sees status update

- [ ] **Complete Order**
  - Click "Complete" on ready order
  - Verify order marked as "Completed"
  - Verify order remains in "All" tab

- [ ] **Cancel Order**
  - Click "Cancel" on any order
  - Enter cancellation reason
  - Confirm cancellation
  - Verify order marked as "Cancelled"
  - Verify cancellation reflects in Sales Report

---

### 🛒 Customer User Flows

#### Dine-In Flow
- [ ] **Access Menu (Dine-In)**
  - Enter table number
  - Verify menu loads
  - Browse categories
  - View item details

- [ ] **Add Items to Cart**
  - Select menu item
  - Customize with add-ons
  - Add special instructions
  - Add to cart
  - Verify item appears in cart
  - Verify price calculation is correct

- [ ] **Apply Discount**
  - Add discount code to cart
  - Verify discount applies
  - Verify total updates correctly

- [ ] **Place Order (Dine-In)**
  - Review cart
  - Add order notes
  - Place order
  - Select payment method
  - Complete payment
  - Verify receipt displays
  - Verify order appears in Kitchen

#### Take-Out Flow
- [ ] **Access Menu (Take-Out)**
  - Enter customer name
  - Verify menu loads
  - Browse and select items

- [ ] **Place Order (Take-Out)**
  - Add items to cart
  - Customize items
  - Place order
  - Complete payment
  - Verify receipt displays
  - Verify order appears in Kitchen with customer name

#### Payment Flows
- [ ] **Cash Payment**
  - Select "Cash"
  - Enter cash amount
  - Verify change calculation
  - Complete payment
  - Verify receipt

- [ ] **GCash Payment**
  - Select "GCash"
  - Complete PayMongo flow
  - Verify payment success
  - Verify receipt

---

## Cross-Station Testing

### Real-Time Synchronization
- [ ] **Order Creation → Kitchen Display**
  - Create order from Customer station
  - Verify order appears in Kitchen within 2 seconds
  - Verify order details are correct

- [ ] **Status Update → All Stations**
  - Update order status in Kitchen
  - Verify Cashier sees status update
  - Verify Customer sees status update (if applicable)

- [ ] **Menu Update → All Stations**
  - Update menu item in Admin
  - Verify changes appear in Customer/Cashier screens
  - Verify price updates reflect immediately

### Multi-Device Testing
- [ ] **Test on Multiple Devices**
  - Install app on 2+ devices
  - Login as different roles on each device
  - Create order on one device
  - Verify order appears on other devices
  - Test status updates across devices

---

## Performance Testing

### Loading Times
- [ ] **Screen Load Performance**
  - Measure time to load each screen
  - Target: < 2 seconds per screen
  - Test on different network conditions

- [ ] **Data Sync Performance**
  - Measure time for data to sync
  - Target: < 1 second for real-time updates
  - Test with multiple simultaneous orders

### Responsiveness
- [ ] **Button Response**
  - Test all buttons respond immediately
  - Verify no lag when tapping
  - Test on different screen sizes

- [ ] **Scroll Performance**
  - Test scrolling in long lists (menu, orders)
  - Verify smooth scrolling
  - Test on lower-end devices

---

## Error Handling Testing

### Network Issues
- [ ] **Offline Behavior**
  - Disable internet connection
  - Test app behavior
  - Verify error messages display
  - Re-enable internet
  - Verify data syncs when connection restored

### Invalid Inputs
- [ ] **Form Validation**
  - Test empty fields
  - Test invalid formats
  - Test boundary values
  - Verify error messages are clear

### Edge Cases
- [ ] **Large Orders**
  - Create order with 10+ items
  - Verify app handles correctly
  - Verify calculations are accurate

- [ ] **Concurrent Operations**
  - Multiple users performing actions simultaneously
  - Verify no data conflicts
  - Verify all updates sync correctly

---

## Device Compatibility Testing

### Screen Sizes
- [ ] **Phone Testing**
  - Test on standard phone (5-6 inches)
  - Verify UI scales correctly
  - Verify all elements are accessible

- [ ] **Tablet Testing** (if available)
  - Test on tablet device
  - Verify UI adapts to larger screen
  - Verify Kitchen Display System works well

### Android Versions
- [ ] **Android 8.0+ Testing**
  - Test on Android 8.0 (minimum)
  - Test on Android 10+
  - Test on Android 12+
  - Verify compatibility across versions

---

## Security Testing

### Authentication
- [ ] **Password Security**
  - Test with incorrect passwords
  - Verify error messages don't reveal user existence
  - Test account lockout (if implemented)

### Payment Security
- [ ] **Payment Password**
  - Test cash payment password protection
  - Verify incorrect password is rejected
  - Verify payment password is required

### Data Security
- [ ] **Role-Based Access**
  - Verify Cashier cannot access Admin features
  - Verify Kitchen cannot access payment features
  - Verify Customer cannot access admin functions

---

## Final Pre-Build Checklist

Before building the production APK, ensure:

- [ ] All user flows tested and working
- [ ] No critical bugs found
- [ ] Performance meets targets (< 2s load time)
- [ ] Real-time sync working correctly
- [ ] Payment processing working (Cash & GCash)
- [ ] Receipt generation working
- [ ] CSV export working
- [ ] Error handling appropriate
- [ ] UI responsive on all tested devices
- [ ] All roles can login and access their features
- [ ] Data persists correctly
- [ ] Logout works for all roles

---

## Testing Tools

### Useful Commands

```bash
# Check connected devices
adb devices

# View device logs
adb logcat

# Clear app data
adb shell pm clear com.clicksilog.app

# Install APK
adb install path/to/app.apk

# Uninstall app
adb uninstall com.clicksilog.app
```

### Log Monitoring

```bash
# Filter Expo logs
npx expo start --clear | grep -i error

# View Firebase logs
# Check Firebase Console → Firestore → Usage tab
```

---

## Reporting Issues

When testing, document:

1. **Issue Description**: What happened?
2. **Steps to Reproduce**: How to recreate the issue
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happened?
5. **Device Info**: Android version, device model
6. **Screenshots/Videos**: Visual evidence
7. **Logs**: Any error messages or console logs

---

## Next Steps After Testing

Once all tests pass:

1. **Fix any critical bugs** found during testing
2. **Retest** fixed issues
3. **Document** any known limitations
4. **Build Production APK** using:
   ```bash
   eas build --platform android --profile production
   ```

---

**Good luck with your testing! 🚀**


