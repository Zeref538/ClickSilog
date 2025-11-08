# Fix Firestore Indexes

Your app is getting Firestore index errors because some queries require composite indexes. This guide will help you create the necessary indexes.

## 🔍 What Are Firestore Indexes?

Firestore requires composite indexes when you:
- Query with multiple `where` conditions
- Query with `where` + `orderBy` on different fields
- Query with `orderBy` on multiple fields

## 🚀 Quick Fix: Deploy Indexes Automatically

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project: `clicksilog-9a095`
   - Use existing `firestore.indexes.json` file
   - Don't overwrite existing files

4. **Deploy indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

   This will create all the indexes defined in `firestore.indexes.json`.

### Option 2: Using Firebase Console (Manual)

1. **Go to Firebase Console**:
   - Open [Firebase Console](https://console.firebase.google.com/)
   - Select project: **ClickSilog** (clicksilog-9a095)
   - Click **Firestore Database** (left menu)
   - Click **Indexes** tab

2. **Click the link from the error**:
   - The error message in your console includes a link like:
     ```
     https://console.firebase.google.com/v1/r/project/clicksilog-9a095/firestore/indexes?create_composite=...
     ```
   - Click this link - it will automatically create the required index

3. **Wait for index creation**:
   - Indexes can take a few minutes to build
   - You'll see a status: "Building" → "Enabled"
   - Once enabled, the error will disappear

## 📋 Required Indexes

The following indexes are defined in `firestore.indexes.json`:

### 1. **users** collection:
- `username` + `status` (for login queries)
- `createdAt` DESC (for user list sorting)

### 2. **tables** collection:
- `number` + `active` (for table validation)

### 3. **discounts** collection:
- `code` + `active` (for discount lookup)
- `active` (for active discounts)
- `createdAt` DESC (for discount list sorting)

### 4. **orders** collection:
- `status` + `timestamp` ASC (for order filtering by status)
- `timestamp` DESC (for order list sorting)

### 5. **addons** collection:
- `available` + `createdAt` ASC (for add-on filtering)
- `createdAt` ASC (for add-on list sorting)

### 6. **menu_addons** collection:
- `menuItemId` + `sortOrder` ASC (for menu-addon mapping)
- `sortOrder` ASC (for add-on list sorting)

### 7. **menu** collection:
- `name` ASC (for menu list sorting)

## ✅ Verify Indexes Are Created

1. Go to **Firebase Console** → **Firestore Database** → **Indexes** tab
2. You should see all indexes listed with status "Enabled"
3. If any are still "Building", wait a few minutes

## 🔧 Troubleshooting

### Error: "Index already exists"
- This is OK - the index is already created
- You can ignore this error

### Error: "Index creation failed"
- Check your Firebase project permissions
- Make sure you're logged in: `firebase login`
- Try creating the index manually via the console link

### Indexes taking too long to build
- Large collections take longer to index
- Wait 5-10 minutes for indexes to build
- Check the Firebase Console for status updates

## 🎯 After Indexes Are Created

Once all indexes are "Enabled":
1. **Restart your app** (if running)
2. **Clear cache**: `npm start -- --clear`
3. **Test again** - the errors should be gone!

## 📝 Notes

- Indexes are **free** for Firestore
- They only need to be created **once**
- They're automatically maintained by Firebase
- If you add new queries, you may need to add more indexes

---

**Need help?** Check the Firebase Console for detailed error messages and index creation status.

