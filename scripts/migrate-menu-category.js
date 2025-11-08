/**
 * Migration script to add 'category' field to existing menu items in Firestore
 * 
 * Usage:
 *   npm run migrate:category
 * 
 * This script will:
 * 1. Read all menu items from Firestore
 * 2. Add/update the 'category' field based on existing 'categoryId' or item name
 * 3. Update all items in Firestore
 */

// Use require for Node.js compatibility
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    // Try to use application default credentials or service account
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed.');
    console.error('💡 Make sure you have Firebase Admin SDK set up or use the Admin Dashboard in the app instead.');
    console.error('   Error:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// Category mapping
const categoryMap = {
  'silog_meals': 'silog_meals',
  'snacks': 'snacks',
  'drinks': 'drinks'
};

// Infer category from item name
function inferCategoryFromName(itemName) {
  const name = (itemName || '').toLowerCase();
  
  if (name.includes('silog') || name.includes('tapa') || name.includes('bangus') || 
      name.includes('pork') || name.includes('tocino') || name.includes('chicken') ||
      name.includes('bacon') || name.includes('lechon') || name.includes('bbq') ||
      name.includes('shanghai') || name.includes('hungarian') || name.includes('embutido') ||
      name.includes('hotdog') || name.includes('longganisa') || name.includes('ham') ||
      name.includes('spam')) {
    return 'silog_meals';
  } else if (name.includes('fries') || name.includes('nachos') || name.includes('cheese') ||
             name.includes('corndog')) {
    return 'snacks';
  } else if (name.includes('lemonade') || name.includes('tea') || name.includes('drink') ||
             name.includes('dew') || name.includes('coke') || name.includes('sprite') ||
             name.includes('royal') || name.includes('water')) {
    return 'drinks';
  }
  
  return null;
}

async function migrateMenuItems() {
  try {
    console.log('🔄 Starting menu items migration...\n');
    
    // Get all menu items
    const menuRef = db.collection('menu');
    const snapshot = await menuRef.get();
    
    if (snapshot.empty) {
      console.log('⚠️  No menu items found in Firestore.');
      console.log('💡 Run "npm run seed:firestore" first to seed the database.');
      process.exit(0);
    }
    
    console.log(`📦 Found ${snapshot.size} menu items to migrate\n`);
    
    let updated = 0;
    let skipped = 0;
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    snapshot.forEach((doc) => {
      const item = doc.data();
      const itemId = doc.id;
      
      // Check if item already has 'category' field
      if (item.category && item.category !== '') {
        console.log(`⏭️  Skipping ${item.name || itemId} - already has category: ${item.category}`);
        skipped++;
        return;
      }
      
      // Determine category from categoryId or item name
      let category = item.category || item.categoryId;
      
      // If no categoryId, try to infer from name
      if (!category) {
        category = inferCategoryFromName(item.name);
      }
      
      // Default to silog_meals if can't determine
      if (!category) {
        category = 'silog_meals';
        console.log(`⚠️  Could not determine category for ${item.name || itemId}, defaulting to silog_meals`);
      }
      
      // Normalize category
      if (categoryMap[category]) {
        category = categoryMap[category];
      }
      
      // Add to batch update
      const itemRef = menuRef.doc(itemId);
      batch.update(itemRef, { category: category });
      batchCount++;
      
      console.log(`✅ Will update ${item.name || itemId} - category: ${category}`);
      updated++;
      
      // Commit batch if it reaches the limit
      if (batchCount >= BATCH_SIZE) {
        batch.commit();
        batchCount = 0;
      }
    });
    
    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⏭️  Skipped: ${skipped} items`);
    console.log(`   📦 Total: ${snapshot.size} items`);
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateMenuItems()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
