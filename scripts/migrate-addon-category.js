/**
 * Migration script to add 'category' field to existing add-ons in Firestore
 * This updates all add-ons to have the 'category' field based on their name
 */

const { firestoreService } = require('../src/services/firestoreService');
const { appConfig } = require('../src/config/appConfig');

const inferCategory = (addonName) => {
  const name = (addonName || '').toLowerCase();
  if (name.includes('rice')) return 'rice';
  if (name.includes('drink') || name.includes('lemonade') || name.includes('tea') || name.includes('water')) return 'drink';
  return 'extra'; // Default to extra for items like egg, hotdog, spam
};

const migrateAddonCategory = async () => {
  if (appConfig.USE_MOCKS) {
    console.log('Skipping migration - using mocks');
    return;
  }

  try {
    console.log('🔄 Starting add-ons category migration...');
    
    // Get all add-ons
    const addons = await firestoreService.getCollectionOnce('addons', [], ['name', 'asc']);
    console.log(`📦 Found ${addons.length} add-ons to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const addon of addons) {
      // Check if addon already has 'category' field
      if (addon.category && addon.category !== '') {
        console.log(`⏭️  Skipping ${addon.name} - already has category: ${addon.category}`);
        skipped++;
        continue;
      }

      // Infer category from name
      const category = inferCategory(addon.name);
      
      // Update the addon with category field
      await firestoreService.updateDocument('addons', addon.id, {
        category: category
      });

      console.log(`✅ Updated ${addon.name} - category: ${category}`);
      updated++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated} add-ons`);
    console.log(`   ⏭️  Skipped: ${skipped} add-ons`);
    console.log(`   📦 Total: ${addons.length} add-ons`);
    console.log('✅ Migration completed successfully!');
    
    return { updated, skipped, total: addons.length };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateAddonCategory()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAddonCategory };

