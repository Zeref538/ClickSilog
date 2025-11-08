# Firestore Setup Guide

Your app is configured to use Firebase Firestore, but **you need to seed the database with initial data** before it will work.

## 🔍 Check Current Status

First, check if your Firebase is properly connected:

```bash
npm run check:firebase
```

This will show you:
- ✅ If Firebase is initialized
- ✅ If Firestore is connected
- ✅ If there's any data in your database

## 📝 Step 1: Verify Environment Variables

Create a `.env` file in the project root (if it doesn't exist):

```env
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDocFfiBivKUeUYuoUF5an6TcUO7nWgebU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=clicksilog-9a095.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clicksilog-9a095
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=clicksilog-9a095.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=124998545103
EXPO_PUBLIC_FIREBASE_APP_ID=1:124998545103:web:7ed9728dea16aff1a611ba
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-TDKRT5Y79G
```

**Important:** Make sure `EXPO_PUBLIC_USE_MOCKS=false` to enable Firebase!

## 🔥 Step 2: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `clicksilog-9a095`
3. Click **Firestore Database** in the left menu
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (choose closest to you)
7. Click **Enable**

## 🔐 Step 3: Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules, set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (for development)
    // TODO: Restrict access in production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish** to save the rules.

## 🌱 Step 4: Seed Your Database

Run the seed script to populate your Firestore with initial data:

```bash
npm run seed:firestore
```

This will create:
- ✅ **Users** (admin, cashier, kitchen, staff)
- ✅ **Tables** (1-8)
- ✅ **Menu Categories** (Silog Meals, Snacks, Drinks)
- ✅ **Menu Items** (all your menu items)
- ✅ **Add-ons** (Extra Rice, Extra Egg, etc.)

## ✅ Step 5: Verify Data

1. Go to Firebase Console → Firestore Database
2. You should see these collections:
   - `users` (4 documents)
   - `tables` (8 documents)
   - `menu_categories` (3 documents)
   - `menu` (36 documents)
   - `addons` (5 documents)

## 🚀 Step 6: Test Your App

1. Restart your Expo dev server:
   ```bash
   npm start -- --clear
   ```

2. Make sure `EXPO_PUBLIC_USE_MOCKS=false` in your `.env`

3. Test login:
   - **Staff Login:**
     - Username: `admin` / Password: `admin123`
     - Username: `cashier` / Password: `cashier123`
     - Username: `kitchen` / Password: `kitchen123`
   - **Customer Login:**
     - Table Number: `1` through `8`

## ⚠️ Troubleshooting

### "No data in Firestore"

**Problem:** Your Firestore is empty.

**Solution:**
1. Make sure `EXPO_PUBLIC_USE_MOCKS=false` in `.env`
2. Run `npm run seed:firestore`
3. Check Firebase Console to verify data was created

### "Firestore connection failed"

**Problem:** Can't connect to Firestore.

**Solutions:**
1. **Check Firestore is enabled:**
   - Firebase Console → Firestore Database
   - If you see "Create database", click it and enable Firestore

2. **Check security rules:**
   - Firebase Console → Firestore → Rules
   - Make sure rules allow read/write (for development)

3. **Check Firebase config:**
   - Verify your `.env` file has correct Firebase credentials
   - Run `npm run check:firebase` to verify connection

4. **Check network:**
   - Make sure you have internet connection
   - Check if Firebase is blocked by firewall

### "USE_MOCKS is true"

**Problem:** App is using mock data instead of Firestore.

**Solution:**
1. Create/update `.env` file with `EXPO_PUBLIC_USE_MOCKS=false`
2. Restart Expo dev server: `npm start -- --clear`
3. Rebuild your app if using dev client

### "Component auth has not been registered"

**Problem:** Firebase Auth native module not available.

**Solution:**
- This is **OK** - your app uses custom authentication (username/password)
- Firebase Auth is not required for your app
- The app will work with Firestore even if Auth fails

## 📊 What Gets Seeded

### Users Collection
- `admin1` - Admin user (username: `admin`, password: `admin123`)
- `cashier1` - Cashier user (username: `cashier`, password: `cashier123`)
- `kitchen1` - Kitchen user (username: `kitchen`, password: `kitchen123`)
- `staff1` - Staff user (username: `staff`, password: `staff123`)

### Tables Collection
- `table_1` through `table_8` (numbers 1-8)

### Menu Categories
- `silog_meals` - Silog Meals
- `snacks` - Snacks
- `drinks` - Drinks & Beverages

### Menu Items
- 15 Silog Meals (Tapsilog, Bangsilog, etc.)
- 8 Snacks (Fries, Nachos, Corndogs, etc.)
- 13 Drinks (Lemonades, Ice Teas, Soft Drinks, etc.)

### Add-ons
- Extra Rice
- Extra Java Rice
- Extra Egg
- Extra Hotdog
- Extra Spam

## 🎯 Next Steps

After seeding:
1. ✅ Test login with seeded users
2. ✅ Test customer login with table numbers 1-8
3. ✅ Place an order and verify it appears in Firestore
4. ✅ Check Kitchen Display System shows orders
5. ✅ Verify Cashier can see orders

Your app is now ready to use Firestore! 🎉

