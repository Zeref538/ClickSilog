# ClickSilog - Project Summary & Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-11-09  
**Platform:** React Native (Expo) with Firebase & PayMongo

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Module Breakdown](#module-breakdown)
4. [PayMongo Payment Integration](#paymongo-payment-integration)
5. [Setup & Configuration](#setup--configuration)
6. [Build & Deployment](#build--deployment)
7. [Key Features](#key-features)

---

## Project Overview

**ClickSilog** is a comprehensive restaurant management system that provides:
- **Self-service ordering** for customers (table-based)
- **Real-time kitchen order management** via Kitchen Display System (KDS)
- **Point-of-sale (POS) system** for cashiers
- **Administrative dashboard** for menu, staff, discounts, and sales management

### Core Modules

1. **Customer Module** - Browse menu, customize items, place orders, pay via GCash or Cash
2. **Kitchen Module** - View orders in real-time, update order status (pending → preparing → completed)
3. **Cashier Module** - Process cash payments, view order history, generate receipts
4. **Admin Module** - Manage menu items, add-ons, discounts, users, and view sales reports

---

## Architecture & Technology Stack

### Frontend
- **Framework:** React Native 0.81.5 with Expo 54.0.22
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **State Management:** React Context API (Auth, Cart, Theme)
- **UI Components:** Custom theme system with dark/light mode support
- **Fonts:** Poppins (400, 500, 600, 700)

### Backend
- **Database:** Firebase Firestore (real-time database)
- **Authentication:** Custom role-based authentication (not Firebase Auth)
- **Storage:** Firebase Storage (for menu item images)
- **Cloud Functions:** Firebase Cloud Functions (for secure payment processing)
- **Payment Processing:** PayMongo API integration

### Project Structure
```
src/
├── components/     # Reusable UI components
│   ├── cashier/    # Cashier-specific components
│   ├── customer/    # Customer-specific components
│   └── ui/         # Shared UI components
├── contexts/       # React Context providers (Auth, Cart, Theme)
├── screens/        # Screen components organized by module
│   ├── admin/     # Admin screens
│   ├── cashier/    # Cashier screens
│   ├── customer/   # Customer screens
│   └── kitchen/    # Kitchen screens
├── services/       # Business logic and API services
├── navigation/     # Navigation configuration
├── config/         # App configuration (Firebase, theme)
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

---

## Module Breakdown

### 1. Customer Module

**Features:**
- Browse menu by category (Silog Meals, Snacks, Drinks)
- Customize items (size, add-ons, quantity, special instructions)
- Add items to cart
- Apply discount codes
- Place orders
- Pay via GCash (PayMongo) or Cash
- Real-time order status updates

**Key Screens:**
- `MenuScreen` - Browse and select menu items
- `CartScreen` - Review cart and apply discounts
- `PaymentScreen` - Process payments (GCash/Cash)
- `CustomerOrderNotification` - Real-time order status updates

### 2. Kitchen Module

**Features:**
- View orders in real-time by status (Pending, Preparing, All)
- Update order status (Pending → Preparing → Completed)
- Filter orders by status
- View order details (items, add-ons, special instructions)

**Key Screens:**
- `KDSDashboard` - Main kitchen display interface

### 3. Cashier Module

**Features:**
- View pending cash payment requests
- Process cash payments (with password confirmation)
- View order history
- Generate receipts
- Search and filter orders

**Key Screens:**
- `CashierOrderingScreen` - Main cashier interface
- `CashierPaymentScreen` - Process cash payments
- `CashierPaymentNotification` - Payment request notifications

### 4. Admin Module

**Features:**
- **Menu Management:** Add, edit, delete menu items with images
- **Add-ons Management:** Manage add-ons (rice, drinks, extras)
- **Discount Management:** Create and manage discount codes
- **User Management:** Manage staff accounts (admin, cashier, kitchen, developer)
- **Sales Reports:** View analytics, revenue trends, popular items, peak hours
- **Payment Settings:** Configure payment confirmation password
- **Seed Database:** Populate Firestore with initial data

**Key Screens:**
- `AdminDashboard` - Main admin dashboard
- `MenuManager` - Menu item management
- `AddOnsManager` - Add-ons management
- `DiscountManager` - Discount code management
- `UserManager` - User account management
- `SalesReportScreen` - Sales analytics and reports
- `PaymentSettingsScreen` - Payment confirmation password configuration

---

## PayMongo Payment Integration

### Overview

PayMongo is a payment gateway that enables secure payment processing for GCash, PayMaya, and card payments in the Philippines. The integration uses a **secure server-side approach** via Firebase Cloud Functions to protect sensitive API keys.

### How PayMongo Works

#### 1. Payment Flow Architecture

```
Customer App → Cloud Function → PayMongo API → Payment Processing
     ↓              ↓                  ↓              ↓
  Create      Secure API        Payment Intent   Payment Method
  Order       Key Storage       Creation         Attachment
```

#### 2. Payment Intent Flow

**Step 1: Create Payment Intent (Server-Side)**
- Customer places order in the app
- App calls Firebase Cloud Function (`createPaymentIntent`)
- Cloud Function securely creates a payment intent using PayMongo API
- Returns `paymentIntentId` and `clientKey` to the app

**Step 2: Attach Payment Method (Client-Side)**
- App uses `clientKey` (public key) to securely attach payment method
- Customer selects payment method (GCash, PayMaya, Card)
- Payment method is attached to the payment intent

**Step 3: Process Payment**
- PayMongo processes the payment
- Payment status is updated (pending → succeeded/failed)
- Order status is updated in Firestore

**Step 4: Order Completion**
- On successful payment, order status is updated to "completed"
- Customer receives confirmation
- Kitchen and cashier are notified

### Implementation Details

#### Client-Side (`src/services/paymentService.js`)

```javascript
// Secure payment processing via Cloud Function
export const processPayment = async ({ amount, currency, description, orderId, paymentMethod }) => {
  // Step 1: Create payment intent via Cloud Function (secure)
  const intentResult = await createPaymentIntentViaFunction({
    amount,
    currency,
    description,
    orderId
  });

  // Step 2: Return payment intent for client-side processing
  return {
    success: true,
    paymentIntentId: intentResult.paymentIntentId,
    clientKey: intentResult.clientKey,
    status: 'pending'
  };
};
```

#### Server-Side (`functions/index.js`)

```javascript
// Cloud Function: Create Payment Intent
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  // Get secret key from environment (secure)
  const secretKey = await getPayMongoSecretKey();
  
  // Create payment intent via PayMongo API
  const response = await axios.post(
    `${PAYMONGO_API_URL}/payment_intents`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'PHP',
          payment_method_allowed: ['card', 'gcash', 'paymaya'],
          description: `Order #${orderId}`
        }
      }
    },
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Return payment intent ID and client key
  res.json({
    success: true,
    paymentIntentId: response.data.data.id,
    clientKey: response.data.data.attributes.client_key
  });
});
```

### Security Best Practices

1. **Never expose secret keys in client-side code**
   - Secret keys are stored in Cloud Functions environment variables
   - Only public keys (`clientKey`) are used in the app

2. **Use Cloud Functions for sensitive operations**
   - Payment intent creation happens server-side
   - API keys are never exposed to the client

3. **Environment variable management**
   - Store secret keys in Firebase Functions config
   - Use `.env` file for local development (never commit to Git)

4. **Payment confirmation**
   - Cash payments require staff password confirmation
   - Payment status is verified before order completion

### Setup Instructions

#### 1. Get PayMongo API Keys

1. Sign up at [PayMongo](https://paymongo.com/)
2. Go to **Settings** → **API Keys**
3. Copy your **Test** and **Live** API keys:
   - **Public Key:** `pk_test_xxxxx` or `pk_live_xxxxx`
   - **Secret Key:** `sk_test_xxxxx` or `sk_live_xxxxx`

#### 2. Configure Environment Variables

**For Local Development (`functions/.env`):**
```env
PAYMONGO_SECRET_KEY=sk_test_xxxxx
```

**For Production (Firebase Functions Config):**
```bash
firebase functions:config:set paymongo.secret_key="sk_live_xxxxx"
```

#### 3. Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

#### 4. Update App Configuration

**In `src/config/appConfig.js`:**
```javascript
paymongo: {
  // Use environment variables - never hardcode keys
  publicKey: process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY || '',
  secretKey: process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || ''
}
```

**In `.env` file:**
```env
EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxx
# Note: Secret key should NOT be in .env - it's only in Cloud Functions
```

### Payment Methods Supported

1. **GCash** - Mobile wallet payment
2. **PayMaya** - Mobile wallet payment
3. **Card** - Credit/Debit card payment
4. **Cash** - Cash payment (requires staff password confirmation)

### Testing

**Test Mode:**
- Use test API keys (`pk_test_...`, `sk_test_...`)
- Test payments won't charge real money
- Use test card numbers from PayMongo documentation

**Production Mode:**
- Switch to live API keys (`pk_live_...`, `sk_live_...`)
- Real payments will be processed
- Ensure proper error handling and logging

---

## Setup & Configuration

### Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- Firebase account
- PayMongo account
- Android Studio (for Android builds)

### Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create Firebase project
   - Enable Firestore Database
   - Enable Firebase Storage
   - Copy Firebase config to `src/config/firebase.js`

3. **Configure Environment Variables**
   - Create `.env` file in root directory
   - Add Firebase and PayMongo configuration:
     ```env
     EXPO_PUBLIC_USE_MOCKS=false
     EXPO_PUBLIC_FIREBASE_API_KEY=your_key
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxx
     ```

4. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

### Running the App

**Development Mode (Expo Go):**
```bash
npm start
# Scan QR code with Expo Go app
```

**Development Build (Local):**
```bash
npm run android
```

**Production Build (APK):**
```bash
npm run build:android:apk
```

---

## Build & Deployment

### APK Build Process

1. **Configure EAS Build**
   - Ensure `eas.json` is configured
   - Set up EAS project ID in `app.json`

2. **Build APK**
   ```bash
   npm run build:android:apk
   ```

3. **Install APK**
   - Download APK from EAS build dashboard
   - Install on Android device

### Pre-Build Checklist

- ✅ All environment variables configured
- ✅ Firebase project set up
- ✅ Firestore rules deployed
- ✅ Cloud Functions deployed
- ✅ PayMongo API keys configured
- ✅ App icon and splash screen configured
- ✅ All assets optimized

---

## Key Features

### Real-Time Synchronization
- Firestore `onSnapshot` listeners for real-time updates
- Menu updates sync across all devices
- Order status changes sync instantly
- Kitchen and Cashier see orders in real-time

### Offline Support
- Local storage caching via `AsyncStorage`
- Offline queue for write operations
- Network status detection
- Automatic sync when online

### Theme System
- Light/Dark mode support
- Consistent color scheme
- Responsive typography
- Customizable theme tokens

### Error Handling
- Global error handler
- Error boundaries
- Comprehensive try-catch blocks
- User-friendly error messages

### Security
- Password hashing
- Role-based access control
- Secure API key storage
- Payment confirmation passwords

---

## Additional Resources

- **Firebase Console:** https://console.firebase.google.com/
- **PayMongo Dashboard:** https://dashboard.paymongo.com/
- **Expo Documentation:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/

---

**Last Updated:** 2025-11-09  
**Status:** Production Ready ✅

