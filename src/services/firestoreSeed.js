import { firestoreService } from './firestoreService';
import { appConfig } from '../config/appConfig';
import { hashPassword } from '../utils/passwordHash';

/**
 * Seed initial data to Firestore collections
 * Run this once to initialize your Firestore database
 */
export const seedFirestore = async () => {
  if (appConfig.USE_MOCKS) {
    console.log('Skipping Firestore seed - using mocks');
    return;
  }

  const now = new Date().toISOString();

  try {
    // 1. Seed Users Collection
    console.log('Seeding users...');
    const users = [
      {
        id: 'admin1',
        username: 'admin',
        password: hashPassword('admin123'),
        role: 'admin',
        status: 'active',
        displayName: 'Admin User',
        createdAt: now
      },
      {
        id: 'cashier1',
        username: 'cashier',
        password: hashPassword('cashier123'),
        role: 'cashier',
        status: 'active',
        displayName: 'Cashier User',
        createdAt: now
      },
      {
        id: 'kitchen1',
        username: 'kitchen',
        password: hashPassword('kitchen123'),
        role: 'kitchen',
        status: 'active',
        displayName: 'Kitchen User',
        createdAt: now
      },
      {
        id: 'developer1',
        username: 'developer',
        password: hashPassword('dev123'),
        role: 'developer',
        status: 'active',
        displayName: 'Developer User',
        createdAt: now
      }
    ];

    for (const user of users) {
      await firestoreService.upsertDocument('users', user.id, user);
    }
    console.log(`✅ Seeded ${users.length} users`);

    // 2. Seed Tables Collection
    console.log('Seeding tables...');
    const tables = Array.from({ length: 8 }, (_, i) => ({
      id: `table_${i + 1}`,
      number: i + 1,
      active: true,
      createdAt: now
    }));

    for (const table of tables) {
      await firestoreService.upsertDocument('tables', table.id, table);
    }
    console.log(`✅ Seeded ${tables.length} tables`);

    // 3. Seed Menu Items (categories are extracted from menu items, no separate collection needed)
    console.log('Seeding menu items...');
    const menuItems = [
      // Silog Meals
      { id: 'tapsilog_001', name: 'Tapsilog', category: 'silog_meals', price: 75, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'bangsilog_002', name: 'Bangsilog', category: 'silog_meals', price: 69, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'porksilog_003', name: 'Porkchopsilog', category: 'silog_meals', price: 69, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'tocilog_004', name: 'Tocilog', category: 'silog_meals', price: 65, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'chicksilog_005', name: 'Chicksilog', category: 'silog_meals', price: 69, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'baconsilog_006', name: 'Baconsilog', category: 'silog_meals', price: 65, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'lechonsilog_007', name: 'Lechonsilog', category: 'silog_meals', price: 69, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'bbq_rice_008', name: 'BBQ with Rice', category: 'silog_meals', price: 60, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'shanghai_silog_009', name: 'Shanghai Silog', category: 'silog_meals', price: 55, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hungarian_010', name: 'Hungarian Silog', category: 'silog_meals', price: 70, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'embosilog_011', name: 'Embosilog', category: 'silog_meals', price: 55, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hotsilog_012', name: 'Hotsilog', category: 'silog_meals', price: 40, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'longsilog_013', name: 'Longsilog', category: 'silog_meals', price: 55, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hamsilog_014', name: 'Hamsilog', category: 'silog_meals', price: 40, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'spamsilog_015', name: 'Spamsilog', category: 'silog_meals', price: 50, imageUrl: '', status: 'available', customizable: true, addons: [], createdAt: now },
      // Snacks
      { id: 'fries_cup_016', name: 'Fries in a Cup', category: 'snacks', price: 50, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'nachos_017', name: 'Nachos', category: 'snacks', price: 50, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'cheese_sticks_018', name: 'Cheese Sticks', category: 'snacks', price: 50, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_classic_019', name: 'Classic Corndog', category: 'snacks', price: 60, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_cheddar_020', name: 'Cheddar Corndog', category: 'snacks', price: 60, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_classic_mozza_021', name: 'Classic Mozza Corndog', category: 'snacks', price: 70, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_full_mozza_022', name: 'Full Mozza Corndog', category: 'snacks', price: 75, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_potato_023', name: 'Potato Corndog', category: 'snacks', price: 75, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      // Drinks
      { id: 'cucumber_lemonade_s_024', name: 'Cucumber Lemonade (Small)', category: 'drinks', price: 25, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'cucumber_lemonade_l_025', name: 'Cucumber Lemonade (Large)', category: 'drinks', price: 35, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'lemon_ice_tea_s_026', name: 'Lemon Ice Tea (Small)', category: 'drinks', price: 25, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'lemon_ice_tea_l_027', name: 'Lemon Ice Tea (Large)', category: 'drinks', price: 35, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'blue_lemonade_s_028', name: 'Blue Lemonade (Small)', category: 'drinks', price: 25, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'blue_lemonade_l_029', name: 'Blue Lemonade (Large)', category: 'drinks', price: 35, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'red_ice_tea_s_030', name: 'Red Ice Tea (Small)', category: 'drinks', price: 25, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'red_ice_tea_l_031', name: 'Red Ice Tea (Large)', category: 'drinks', price: 35, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_032', name: 'Mountain Dew', category: 'drinks', price: 22, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_033', name: 'Coke', category: 'drinks', price: 22, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_034', name: 'Sprite', category: 'drinks', price: 22, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_035', name: 'Royal', category: 'drinks', price: 22, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'mineral_water_036', name: 'Mineral Water', category: 'drinks', price: 12, imageUrl: '', status: 'available', customizable: false, addons: [], createdAt: now }
    ];

    for (const item of menuItems) {
      await firestoreService.upsertDocument('menu', item.id, item);
    }
    console.log(`✅ Seeded ${menuItems.length} menu items`);

    // 4. Seed Addons
    console.log('Seeding addons...');
    const addons = [
      { id: 'addon_extra_rice', name: 'Extra Rice', price: 15, available: true, category: 'rice', linkedTo: ['silog_meals'], createdAt: now },
      { id: 'addon_extra_java_rice', name: 'Extra Java Rice', price: 15, available: true, category: 'rice', linkedTo: ['silog_meals'], createdAt: now },
      { id: 'addon_extra_egg', name: 'Extra Egg', price: 10, available: true, category: 'extra', linkedTo: ['silog_meals'], createdAt: now },
      { id: 'addon_extra_hotdog', name: 'Extra Hotdog', price: 15, available: true, category: 'extra', linkedTo: ['silog_meals'], createdAt: now },
      { id: 'addon_extra_spam', name: 'Extra Spam', price: 20, available: true, category: 'extra', linkedTo: ['silog_meals'], createdAt: now }
    ];

    for (const addon of addons) {
      await firestoreService.upsertDocument('addons', addon.id, addon);
    }
    console.log(`✅ Seeded ${addons.length} addons`);

    console.log('✅ Firestore seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    throw error;
  }
};

/**
 * Migration function to add 'category' field to existing menu items
 * This updates all menu items to have the 'category' field based on their categoryId or name
 */
export const migrateMenuCategory = async () => {
  if (appConfig.USE_MOCKS) {
    console.log('Skipping migration - using mocks');
    return;
  }

  try {
    console.log('🔄 Starting menu items category migration...');
    
    // Get all menu items
    const menuItems = await firestoreService.getCollectionOnce('menu', [], ['name', 'asc']);
    console.log(`📦 Found ${menuItems.length} menu items to migrate`);

    let updated = 0;
    let skipped = 0;

    // Category mapping
    const categoryMap = {
      'silog_meals': 'silog_meals',
      'snacks': 'snacks',
      'drinks': 'drinks'
    };

    // Infer category from name
    const inferCategory = (itemName) => {
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
    };

    for (const item of menuItems) {
      // Check if item already has 'category' field
      if (item.category && item.category !== '') {
        console.log(`⏭️  Skipping ${item.name} - already has category: ${item.category}`);
        skipped++;
        continue;
      }

      // Determine category from categoryId or item name
      let category = item.category || item.categoryId;
      
      // If no categoryId, try to infer from name
      if (!category) {
        category = inferCategory(item.name);
      }
      
      // Default to silog_meals if can't determine
      if (!category) {
        category = 'silog_meals';
        console.log(`⚠️  Could not determine category for ${item.name}, defaulting to silog_meals`);
      }
      
      // Normalize category
      if (categoryMap[category]) {
        category = categoryMap[category];
      }

      // Update the item with category field
      await firestoreService.updateDocument('menu', item.id, {
        category: category
      });

      console.log(`✅ Updated ${item.name} - category: ${category}`);
      updated++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⏭️  Skipped: ${skipped} items`);
    console.log(`   📦 Total: ${menuItems.length} items`);
    console.log('✅ Migration completed successfully!');
    
    return { updated, skipped, total: menuItems.length };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

