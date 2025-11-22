import { firestoreService } from './firestoreService';
import { appConfig } from '../config/appConfig';
import { hashPassword } from '../utils/passwordHash';

// Production-safe logging
const log = (...args) => { if (__DEV__) console.log(...args); };
const logError = (...args) => { console.error(...args); }; // Always log errors

/**
 * Generate sample orders only (for data visualization/testing)
 * All generated orders will be marked with isSample: true
 */
export const generateSampleOrders = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping sample orders generation - using mocks');
    return { generatedOrders: 0 };
  }

  try {
    log('📦 Starting sample orders generation...');
    const now = new Date().toISOString();
    
    // Get menu items and addons for creating realistic orders
    const menuItems = await firestoreService.getCollectionOnce('menu', [['status', '==', 'available']]);
    const addons = await firestoreService.getCollectionOnce('addons', [['available', '==', true]]);
    
    if (menuItems.length === 0) {
      throw new Error('No menu items found. Please seed menu items first.');
    }

    // Generate sample orders with variety
    const sampleOrders = [];
    const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    const paymentMethods = ['cash', 'gcash'];
    const orderTypes = ['dine-in', 'take-out'];
    
    // Generate 20-30 sample orders
    const numOrders = 25;
    
    for (let i = 0; i < numOrders; i++) {
      // Random order type
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      
      // Select random items (1-4 items per order)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        // Random addons for customizable items
        const selectedAddons = [];
        if (randomItem.customizable && addons.length > 0 && Math.random() > 0.5) {
          const numAddons = Math.floor(Math.random() * 3) + 1;
          for (let k = 0; k < numAddons && k < addons.length; k++) {
            const randomAddon = addons[Math.floor(Math.random() * addons.length)];
            if (!selectedAddons.find(a => a.id === randomAddon.id)) {
              selectedAddons.push({
                name: randomAddon.name,
                price: randomAddon.price
              });
            }
          }
        }
        
        const itemTotal = (randomItem.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)) * quantity;
        
        selectedItems.push({
          itemId: randomItem.id,
          name: randomItem.name,
          price: randomItem.price,
          quantity: quantity,
          addOns: selectedAddons,
          specialInstructions: '',
          totalItemPrice: itemTotal
        });
      }
      
      // Calculate totals
      const subtotal = selectedItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
      const discountAmount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0; // 30% chance of discount
      const total = subtotal - discountAmount;
      
      // Random status (weighted towards completed for visualization)
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random payment method
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Generate order ID (sample format: SAMPLE_MMDDXXX)
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const orderNum = String(i + 1).padStart(3, '0');
      const orderId = `SAMPLE_${month}${day}${orderNum}`;
      
      // Create order data
      const orderData = {
        id: orderId,
        items: selectedItems,
        subtotal: subtotal,
        total: total,
        discountAmount: discountAmount,
        status: status,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'gcash' ? 'paid' : (paymentMethod === 'cash' ? 'paid' : 'pending'),
        orderType: orderType,
        source: orderType === 'dine-in' ? 'customer' : 'customer',
        isSample: true, // Mark as sample data
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      // Add order type specific fields
      if (orderType === 'dine-in') {
        orderData.tableNumber = Math.floor(Math.random() * 8) + 1;
      } else {
        orderData.customerName = `Sample Customer ${i + 1}`;
      }
      
      // Add timestamps based on status
      if (status === 'preparing' || status === 'ready' || status === 'completed') {
        orderData.preparationStartTime = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString();
      }
      if (status === 'ready' || status === 'completed') {
        orderData.readyTime = new Date(Date.now() - Math.random() * 1 * 60 * 60 * 1000).toISOString();
      }
      if (status === 'completed') {
        orderData.completedTime = new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString();
      }
      if (status === 'cancelled') {
        orderData.cancelledAt = new Date(Date.now() - Math.random() * 1 * 60 * 60 * 1000).toISOString();
        orderData.cancelledBy = 'kitchen';
      }
      
      sampleOrders.push(orderData);
    }
    
    // Insert all sample orders
    let generatedCount = 0;
    for (const order of sampleOrders) {
      try {
        await firestoreService.upsertDocument('orders', order.id, order);
        generatedCount++;
      } catch (error) {
        logError(`Failed to create sample order ${order.id}:`, error);
      }
    }
    
    log(`✅ Generated ${generatedCount} sample orders`);
    return { generatedOrders: generatedCount };
  } catch (error) {
    logError('❌ Error generating sample orders:', error);
    throw error;
  }
};

/**
 * Seed initial data to Firestore collections
 * Run this once to initialize your Firestore database
 */
export const seedFirestore = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping Firestore seed - using mocks');
    return;
  }

  const now = new Date().toISOString();

  try {
    // 1. Seed Users Collection
    log('Seeding users...');
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
    log(`✅ Seeded ${users.length} users`);

    // 2. Seed Tables Collection
    log('Seeding tables...');
    const tables = Array.from({ length: 8 }, (_, i) => ({
      id: `table_${i + 1}`,
      number: i + 1,
      active: true,
      createdAt: now
    }));

    for (const table of tables) {
      await firestoreService.upsertDocument('tables', table.id, table);
    }
    log(`✅ Seeded ${tables.length} tables`);

    // 3. Seed Menu Items (categories are extracted from menu items, no separate collection needed)
    log('Seeding menu items...');
    
    // Helper to get asset path for React Native
    const getImagePath = (filename) => `../../assets/menu-images/${filename}`;
    
    const menuItems = [
      // Silog Meals
      { id: 'tapsilog_001', name: 'Tapsilog', category: 'silog_meals', price: 75, imageUrl: getImagePath('tapsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'bangsilog_002', name: 'Bangsilog', category: 'silog_meals', price: 69, imageUrl: getImagePath('bangsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'porksilog_003', name: 'Porkchopsilog', category: 'silog_meals', price: 69, imageUrl: getImagePath('porkchopsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'tocilog_004', name: 'Tocilog', category: 'silog_meals', price: 65, imageUrl: getImagePath('tocilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'chicksilog_005', name: 'Chicksilog', category: 'silog_meals', price: 69, imageUrl: getImagePath('chicksilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'baconsilog_006', name: 'Baconsilog', category: 'silog_meals', price: 65, imageUrl: getImagePath('baconsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'lechonsilog_007', name: 'Lechonsilog', category: 'silog_meals', price: 69, imageUrl: getImagePath('lechonsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'bbq_rice_008', name: 'BBQ with Rice', category: 'silog_meals', price: 60, imageUrl: getImagePath('bbq_rice.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'shanghai_silog_009', name: 'Shanghai Silog', category: 'silog_meals', price: 55, imageUrl: getImagePath('shanghai_silog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hungarian_010', name: 'Hungarian Silog', category: 'silog_meals', price: 70, imageUrl: getImagePath('hungarian_silog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'embosilog_011', name: 'Embosilog', category: 'silog_meals', price: 55, imageUrl: getImagePath('embosilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hotsilog_012', name: 'Hotsilog', category: 'silog_meals', price: 40, imageUrl: getImagePath('hotsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'longsilog_013', name: 'Longsilog', category: 'silog_meals', price: 55, imageUrl: getImagePath('longsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'hamsilog_014', name: 'Hamsilog', category: 'silog_meals', price: 40, imageUrl: getImagePath('hamsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'spamsilog_015', name: 'Spamsilog', category: 'silog_meals', price: 50, imageUrl: getImagePath('spamsilog.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      // Snacks
      { id: 'fries_cup_016', name: 'Fries in a Cup', category: 'snacks', price: 50, imageUrl: getImagePath('fries_cup.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'nachos_017', name: 'Nachos', category: 'snacks', price: 50, imageUrl: getImagePath('nachos.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'cheese_sticks_018', name: 'Cheese Sticks', category: 'snacks', price: 50, imageUrl: getImagePath('cheese_sticks.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_classic_019', name: 'Classic Corndog', category: 'snacks', price: 60, imageUrl: getImagePath('corndog_classic.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_cheddar_020', name: 'Cheddar Corndog', category: 'snacks', price: 60, imageUrl: getImagePath('corndog_classic.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_classic_mozza_021', name: 'Classic Mozza Corndog', category: 'snacks', price: 70, imageUrl: getImagePath('corndog_classic.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_full_mozza_022', name: 'Full Mozza Corndog', category: 'snacks', price: 75, imageUrl: getImagePath('corndog_classic.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'corndog_potato_023', name: 'Potato Corndog', category: 'snacks', price: 75, imageUrl: getImagePath('corndog_potato.png'), status: 'available', customizable: false, addons: [], createdAt: now },
      // Drinks
      { id: 'cucumber_lemonade_s_024', name: 'Cucumber Lemonade (Small)', category: 'drinks', price: 25, imageUrl: getImagePath('cucumber_lemonade.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'lemon_ice_tea_s_026', name: 'Lemon Ice Tea (Small)', category: 'drinks', price: 25, imageUrl: getImagePath('lemon_ice_tea.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'blue_lemonade_s_028', name: 'Blue Lemonade (Small)', category: 'drinks', price: 25, imageUrl: getImagePath('blue_lemonade.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'red_ice_tea_s_030', name: 'Red Ice Tea (Small)', category: 'drinks', price: 25, imageUrl: getImagePath('red_ice_tea.png'), status: 'available', customizable: true, addons: [], createdAt: now },
      { id: 'soft_drink_032', name: 'Mountain Dew', category: 'drinks', price: 22, imageUrl: getImagePath('mountain_dew.jpg'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_033', name: 'Coke', category: 'drinks', price: 22, imageUrl: getImagePath('coke.jpg'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_034', name: 'Sprite', category: 'drinks', price: 22, imageUrl: getImagePath('sprite.jpg'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'soft_drink_035', name: 'Royal', category: 'drinks', price: 22, imageUrl: getImagePath('royal.jpg'), status: 'available', customizable: false, addons: [], createdAt: now },
      { id: 'mineral_water_036', name: 'Mineral Water', category: 'drinks', price: 12, imageUrl: getImagePath('mineral_water.jpg'), status: 'available', customizable: false, addons: [], createdAt: now }
    ];

    for (const item of menuItems) {
      await firestoreService.upsertDocument('menu', item.id, item);
    }
    log(`✅ Seeded ${menuItems.length} menu items`);

    // 4. Seed Addons
    log('Seeding addons...');
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
    log(`✅ Seeded ${addons.length} addons`);

    log('✅ Firestore seeding completed successfully!');
    return true;
  } catch (error) {
    logError('❌ Error seeding Firestore:', error);
    throw error;
  }
};

/**
 * Migration function to add 'category' field to existing menu items
 * This updates all menu items to have the 'category' field based on their categoryId or name
 */
export const migrateMenuCategory = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping migration - using mocks');
    return;
  }

  try {
    log('🔄 Starting menu items category migration...');
    
    // Get all menu items
    const menuItems = await firestoreService.getCollectionOnce('menu', [], ['name', 'asc']);
    log(`📦 Found ${menuItems.length} menu items to migrate`);

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
        log(`⏭️  Skipping ${item.name} - already has category: ${item.category}`);
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
        log(`⚠️  Could not determine category for ${item.name}, defaulting to silog_meals`);
      }
      
      // Normalize category
      if (categoryMap[category]) {
        category = categoryMap[category];
      }

      // Update the item with category field
      await firestoreService.updateDocument('menu', item.id, {
        category: category
      });

      log(`✅ Updated ${item.name} - category: ${category}`);
      updated++;
    }

    log('\n📊 Migration Summary:');
    log(`   ✅ Updated: ${updated} items`);
    log(`   ⏭️  Skipped: ${skipped} items`);
    log(`   📦 Total: ${menuItems.length} items`);
    log('✅ Migration completed successfully!');
    
    return { updated, skipped, total: menuItems.length };
  } catch (error) {
    logError('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Reset ALL orders (delete everything in orders collection)
 * This is a complete reset - deletes both sample and real orders
 * Use with caution - this action cannot be undone
 */
export const resetAllOrders = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping reset - using mocks');
    return { deletedOrders: 0 };
  }

  try {
    log('🗑️  Starting complete orders reset...');
    
    let deletedOrders = 0;

    // Delete ALL orders (both sample and real)
    log('Deleting all orders...');
    try {
      const orders = await firestoreService.getCollectionOnce('orders');
      log(`📦 Found ${orders.length} total orders to delete`);
      
      for (const order of orders) {
        try {
          await firestoreService.deleteDocument('orders', order.id);
          deletedOrders++;
          log(`✅ Deleted order: ${order.id}`);
        } catch (error) {
          logError(`Failed to delete order ${order.id}:`, error);
        }
      }
      log(`✅ Deleted ${deletedOrders} orders`);
    } catch (error) {
      logError('Error deleting orders:', error);
      throw error;
    }

    log('\n📊 Reset Summary:');
    log(`   ✅ Deleted All Orders: ${deletedOrders}`);
    log('✅ Complete orders reset completed successfully!');
    
    return { 
      success: true, 
      deletedOrders
    };
  } catch (error) {
    logError('❌ Reset failed:', error);
    throw error;
  }
};

/**
 * Delete sample/test data from Firestore
 * This removes ONLY sample orders (marked with isSample: true)
 * Real user-inputted orders are preserved
 */
export const deleteSampleData = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping delete - using mocks');
    return { deletedOrders: 0, deletedDiscounts: 0 };
  }

  try {
    log('🗑️  Starting sample data deletion...');
    
    let deletedOrders = 0;
    let deletedDiscounts = 0;
    let preservedOrders = 0;

    // Delete ONLY sample orders (marked with isSample: true)
    log('Deleting sample orders...');
    try {
      const orders = await firestoreService.getCollectionOnce('orders');
      log(`📦 Found ${orders.length} total orders`);
      
      for (const order of orders) {
        // Only delete orders marked as samples
        if (order.isSample === true) {
          try {
            await firestoreService.deleteDocument('orders', order.id);
            deletedOrders++;
            log(`✅ Deleted sample order: ${order.id}`);
          } catch (error) {
            logError(`Failed to delete order ${order.id}:`, error);
          }
        } else {
          preservedOrders++;
          log(`⏭️  Preserved real order: ${order.id}`);
        }
      }
      log(`✅ Deleted ${deletedOrders} sample orders`);
      log(`✅ Preserved ${preservedOrders} real orders`);
    } catch (error) {
      logError('Error deleting orders:', error);
      throw error;
    }

    // Delete test/demo discounts (those with codes like 'TEST', 'DEMO', 'SAMPLE', etc.)
    log('Deleting test discounts...');
    try {
      const discounts = await firestoreService.getCollectionOnce('discounts');
      log(`📦 Found ${discounts.length} discounts to check`);
      
      const testCodes = ['TEST', 'DEMO', 'SAMPLE', 'TRIAL', 'DEMO123', 'TEST123'];
      
      for (const discount of discounts) {
        const code = (discount.code || '').toUpperCase();
        const name = (discount.name || '').toUpperCase();
        
        // Check if discount is a test/demo discount
        const isTestDiscount = testCodes.includes(code) || 
                              testCodes.some(testCode => code.includes(testCode)) ||
                              name.includes('TEST') || 
                              name.includes('DEMO') || 
                              name.includes('SAMPLE') ||
                              (discount.id && (
                                discount.id.toLowerCase().includes('test') ||
                                discount.id.toLowerCase().includes('demo') ||
                                discount.id.toLowerCase().includes('sample')
                              ));
        
        if (isTestDiscount) {
          try {
            await firestoreService.deleteDocument('discounts', discount.id);
            deletedDiscounts++;
            log(`✅ Deleted test discount: ${discount.code || discount.id}`);
          } catch (error) {
            logError(`Failed to delete discount ${discount.id}:`, error);
          }
        }
      }
      log(`✅ Deleted ${deletedDiscounts} test discounts`);
    } catch (error) {
      logError('Error deleting discounts:', error);
      // Don't throw - discounts deletion is optional
      log('⚠️  Some discounts may not have been deleted');
    }

    log('\n📊 Deletion Summary:');
    log(`   ✅ Deleted Sample Orders: ${deletedOrders}`);
    log(`   ✅ Preserved Real Orders: ${preservedOrders}`);
    log(`   ✅ Deleted Discounts: ${deletedDiscounts}`);
    log('✅ Sample data deletion completed successfully!');
    
    return { 
      success: true, 
      deletedOrders, 
      preservedOrders,
      deletedDiscounts 
    };
  } catch (error) {
    logError('❌ Deletion failed:', error);
    throw error;
  }
};

/**
 * Reset all staff users and passwords
 * This deletes all existing staff users and creates a new admin user
 * Also resets the payment confirmation password
 * 
 * Default credentials:
 * - Username: admin
 * - Password: admin123
 * - Payment password: admin123
 */
export const resetStaffUsersAndPasswords = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping staff reset - using mocks');
    return;
  }

  try {
    log('🔄 Starting staff users and passwords reset...');
    
    // 1. Delete all existing staff users
    log('Deleting existing staff users...');
    const staffRoles = ['admin', 'cashier', 'kitchen', 'developer'];
    let deletedUsers = 0;
    
    try {
      const allUsers = await firestoreService.getCollectionOnce('users');
      log(`📦 Found ${allUsers.length} users to check`);
      
      for (const user of allUsers) {
        // Check if user is a staff member
        if (user.role && staffRoles.includes(user.role)) {
          try {
            await firestoreService.deleteDocument('users', user.id);
            deletedUsers++;
            log(`✅ Deleted staff user: ${user.username || user.id} (${user.role})`);
          } catch (error) {
            logError(`Failed to delete user ${user.id}:`, error);
          }
        }
      }
      log(`✅ Deleted ${deletedUsers} staff users`);
    } catch (error) {
      logError('Error deleting staff users:', error);
      throw error;
    }

    // 2. Create new admin user with default credentials
    log('Creating new admin user...');
    const now = new Date().toISOString();
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    
    const newAdminUser = {
      id: 'admin_new',
      username: defaultUsername,
      password: hashPassword(defaultPassword),
      role: 'admin',
      status: 'active',
      displayName: 'Administrator',
      createdAt: now,
      updatedAt: now
    };

    try {
      await firestoreService.upsertDocument('users', newAdminUser.id, newAdminUser);
      log(`✅ Created new admin user: ${defaultUsername}`);
    } catch (error) {
      logError('Error creating admin user:', error);
      throw error;
    }

    // 3. Reset payment confirmation password
    log('Resetting payment confirmation password...');
    const defaultPaymentPassword = 'admin123';
    
    try {
      await firestoreService.upsertDocument('settings', 'payment', {
        password: hashPassword(defaultPaymentPassword),
        updatedAt: now,
      });
      log(`✅ Reset payment confirmation password`);
    } catch (error) {
      logError('Error resetting payment password:', error);
      // Don't throw - payment password reset is optional
      log('⚠️  Payment password reset failed, but continuing...');
    }

    log('\n📊 Reset Summary:');
    log(`   ✅ Deleted Staff Users: ${deletedUsers}`);
    log(`   ✅ Created New Admin User: ${defaultUsername}`);
    log(`   ✅ Reset Payment Password`);
    log('\n🔑 Default Credentials:');
    log(`   Username: ${defaultUsername}`);
    log(`   Password: ${defaultPassword}`);
    log(`   Payment Password: ${defaultPaymentPassword}`);
    log('\n⚠️  IMPORTANT: Change these passwords immediately after first login!');
    log('✅ Staff users and passwords reset completed successfully!');
    
    return { 
      success: true, 
      deletedUsers,
      newAdminUsername: defaultUsername,
      defaultPassword: defaultPassword,
      defaultPaymentPassword: defaultPaymentPassword
    };
  } catch (error) {
    logError('❌ Staff reset failed:', error);
    throw error;
  }
};

/**
 * Migrate all existing orders to add orderType field (dine-in or take-out)
 * Determines orderType based on:
 * - tableNumber presence = 'dine-in'
 * - ticketNumber presence = 'take-out'
 * - source and other indicators as fallback
 */
export const migrateOrderTypes = async () => {
  if (appConfig.USE_MOCKS) {
    log('Skipping order type migration - using mocks');
    return { updated: 0, skipped: 0 };
  }

  try {
    log('🔄 Starting order type migration...');
    
    // Get all orders
    const orders = await firestoreService.getCollectionOnce('orders', []);
    log(`📦 Found ${orders.length} orders to check`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const order of orders) {
      try {
        // Skip if orderType already exists and is valid
        if (order.orderType === 'dine-in' || order.orderType === 'take-out') {
          skipped++;
          continue;
        }
        
        // Determine orderType based on order data
        let orderType = null;
        
        // Priority 1: Check for tableNumber (dine-in)
        if (order.tableNumber) {
          orderType = 'dine-in';
        }
        // Priority 2: Check for ticketNumber (take-out)
        else if (order.ticketNumber) {
          orderType = 'take-out';
        }
        // Priority 3: Check source and other indicators
        else if (order.source === 'cashier') {
          // Cashier: if has customerName (not numeric), it's take-out
          // If has tableNumber (numeric), it's dine-in
          if (order.customerName && !/^\d+$/.test(order.customerName)) {
            orderType = 'take-out';
          } else if (order.tableNumber) {
            orderType = 'dine-in';
          } else {
            // Default for cashier orders without clear indicator
            orderType = 'dine-in';
          }
        }
        // Priority 4: Check if order has payment-related fields (might indicate take-out)
        else if (order.paymentId || order.sourceId || order.paymentIntentId) {
          // GCash orders with ticket are usually take-out, but check other indicators
          if (order.ticketNumber) {
            orderType = 'take-out';
          } else if (order.tableNumber) {
            orderType = 'dine-in';
          } else {
            // Default for online payments without clear indicator
            orderType = 'take-out';
          }
        }
        // Priority 5: Default fallback
        else {
          // If no clear indicator, default to dine-in (most common)
          orderType = 'dine-in';
        }
        
        // Update order with orderType
        await firestoreService.updateDocument('orders', order.id, {
          orderType: orderType,
          updatedAt: new Date().toISOString()
        });
        
        updated++;
        log(`✅ Updated order ${order.id}: ${orderType}`);
      } catch (error) {
        logError(`❌ Failed to update order ${order.id}:`, error);
        // Continue with next order
      }
    }
    
    log(`\n📊 Migration Summary:`);
    log(`   ✅ Updated: ${updated}`);
    log(`   ⏭️  Skipped: ${skipped}`);
    log('✅ Order type migration completed successfully!');
    
    return { updated, skipped };
  } catch (error) {
    logError('❌ Order type migration failed:', error);
    throw error;
  }
};

