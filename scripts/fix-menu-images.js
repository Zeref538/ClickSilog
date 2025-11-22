/**
 * Script to fix menu item imageUrls in Firestore
 * Replaces Firebase Storage URLs with local asset paths
 * 
 * Run this from the Admin Dashboard > Seed Database screen
 * Or call fixMenuImages() from your code
 */

import { firestoreService } from '../src/services/firestoreService';

// Mapping of menu item IDs to local image filenames
const imageMapping = {
  // Silog Meals
  'tapsilog_001': 'tapsilog.png',
  'bangsilog_002': 'bangsilog.png',
  'porksilog_003': 'porkchopsilog.png',
  'tocilog_004': 'tocilog.png',
  'chicksilog_005': 'chicksilog.png',
  'baconsilog_006': 'baconsilog.png',
  'lechonsilog_007': 'lechonsilog.png',
  'bbq_rice_008': 'bbq_rice.png',
  'shanghai_silog_009': 'shanghai_silog.png',
  'hungarian_010': 'hungarian_silog.png',
  'embosilog_011': 'embosilog.png',
  'hotsilog_012': 'hotsilog.png',
  'longsilog_013': 'longsilog.png',
  'hamsilog_014': 'hamsilog.png',
  'spamsilog_015': 'spamsilog.png',
  // Snacks
  'fries_cup_016': 'fries_cup.png',
  'nachos_017': 'nachos.png',
  'cheese_sticks_018': 'cheese_sticks.png',
  'corndog_classic_019': 'corndog_classic.png',
  'corndog_cheddar_020': 'corndog_classic.png',
  'corndog_classic_mozza_021': 'corndog_classic.png',
  'corndog_full_mozza_022': 'corndog_classic.png',
  'corndog_potato_023': 'corndog_potato.png',
  // Drinks
  'cucumber_lemonade_s_024': 'cucumber_lemonade.png',
  'lemon_ice_tea_s_026': 'lemon_ice_tea.png',
  'blue_lemonade_s_028': 'blue_lemonade.png',
  'red_ice_tea_s_030': 'red_ice_tea.png',
  'soft_drink_032': 'mountain_dew.jpg',
  'soft_drink_033': 'coke.jpg',
  'soft_drink_034': 'sprite.jpg',
  'soft_drink_035': 'royal.jpg',
  'mineral_water_036': 'mineral_water.jpg',
};

const getImagePath = (filename) => `../../assets/menu-images/${filename}`;

export const fixMenuImages = async () => {
  console.log('🔧 Starting menu image fix...');
  
  try {
    // Get all menu items
    const menuItems = await firestoreService.getCollection('menu');
    console.log(`📋 Found ${menuItems.length} menu items`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const item of menuItems) {
      const localImage = imageMapping[item.id];
      
      if (localImage) {
        const newImageUrl = getImagePath(localImage);
        
        // Only update if the imageUrl is different
        if (item.imageUrl !== newImageUrl) {
          await firestoreService.updateDocument('menu', item.id, {
            imageUrl: newImageUrl
          });
          console.log(`✅ Updated ${item.name}: ${newImageUrl}`);
          updated++;
        } else {
          console.log(`⏭️  Skipped ${item.name}: already correct`);
          skipped++;
        }
      } else {
        console.log(`⚠️  No mapping found for ${item.id} (${item.name})`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Fix complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${menuItems.length}`);
    
    return { success: true, updated, skipped, total: menuItems.length };
  } catch (error) {
    console.error('❌ Error fixing menu images:', error);
    throw error;
  }
};
