# Why There's No Data in Firestore

## 🔍 The Issue

Your Firestore database is **created and ready**, but it's **empty** because:

1. **No data has been seeded yet** - The database is a blank slate
2. **The app needs initial data** - Users, tables, menu items, etc. need to be added
3. **Seeding hasn't been run** - The seed function exists but hasn't been executed

## ✅ Solution: Seed Your Database

You have **two options** to populate your Firestore:

### Option 1: Use Admin Dashboard (Recommended) ✅

1. **Make sure your app is running** with `EXPO_PUBLIC_USE_MOCKS=false` (which you have)
2. **Login as admin:**
   - Username: `admin`
   - Password: `admin123`
3. **Go to Admin Dashboard**
4. **Click "Seed Database"** card
5. **Click "Seed Firestore Database"** button
6. **Wait for confirmation** - You should see "Database seeded successfully!"

### Option 2: Manual via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `clicksilog-9a095`
3. Go to **Firestore Database** → **Data** tab
4. Click **"+ Start collection"**
5. Manually create collections and documents (tedious, not recommended)

## 🔍 Check if Firestore is Connecting

After restarting your app, check the terminal logs. You should see:

**If Firestore is working:**
```
✅ Firestore initialized successfully
📊 Firestore is ready to use
✅ Firebase setup complete - Firestore is ready!
```

**If Firestore is NOT working:**
```
❌ CRITICAL: Firestore is not available!
This means your app will use mock data instead of Firestore.
```

## ⚠️ Common Issues

### Issue 1: Firestore Security Rules

**Problem:** Security rules might be blocking writes

**Solution:**
1. Go to Firebase Console → Firestore Database → **Rules** tab
2. Set rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **Publish**

### Issue 2: Firestore Not Enabled

**Problem:** Firestore database might not be created

**Solution:**
1. Go to Firebase Console → Firestore Database
2. If you see "Create database", click it
3. Choose **Start in test mode**
4. Select a location
5. Click **Enable**

### Issue 3: App Using Mock Data

**Problem:** `EXPO_PUBLIC_USE_MOCKS` might be `true` or not set

**Solution:**
- Check your `.env` file has `EXPO_PUBLIC_USE_MOCKS=false`
- Restart your Expo dev server after changing `.env`

## 📊 What Gets Seeded

When you run the seed function, it will create:

- **users** collection (4 documents)
  - admin, cashier, kitchen, staff users
  
- **tables** collection (8 documents)
  - table_1 through table_8
  
- **menu_categories** collection (3 documents)
  - silog_meals, snacks, drinks
  
- **menu** collection (36 documents)
  - 15 Silog meals, 8 Snacks, 13 Drinks
  
- **addons** collection (5 documents)
  - Extra Rice, Extra Java Rice, Extra Egg, etc.

## 🎯 Next Steps

1. **Restart your app** to see the new Firestore connection logs
2. **Check the logs** - Look for "✅ Firestore initialized successfully"
3. **Login as admin** and seed the database
4. **Check Firebase Console** - You should see collections appear after seeding

