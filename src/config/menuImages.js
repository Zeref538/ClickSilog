/**
 * Menu Images Mapping
 * Maps image paths to require() statements for React Native
 * This is necessary because React Native requires static image paths at build time
 */

export const menuImages = {
  // Silog Meals
  'tapsilog.png': require('../../assets/menu-images/tapsilog.png'),
  'bangsilog.png': require('../../assets/menu-images/bangsilog.png'),
  'porkchopsilog.png': require('../../assets/menu-images/porkchopsilog.png'),
  'tocilog.png': require('../../assets/menu-images/tocilog.png'),
  'chicksilog.png': require('../../assets/menu-images/chicksilog.png'),
  'baconsilog.png': require('../../assets/menu-images/baconsilog.png'),
  'lechonsilog.png': require('../../assets/menu-images/lechonsilog.png'),
  'bbq_rice.png': require('../../assets/menu-images/bbq_rice.png'),
  'shanghai_silog.png': require('../../assets/menu-images/shanghai_silog.png'),
  'hungarian_silog.png': require('../../assets/menu-images/hungarian_silog.png'),
  'embosilog.png': require('../../assets/menu-images/embosilog.png'),
  'hotsilog.png': require('../../assets/menu-images/hotsilog.png'),
  'longsilog.png': require('../../assets/menu-images/longsilog.png'),
  'hamsilog.png': require('../../assets/menu-images/hamsilog.png'),
  'spamsilog.png': require('../../assets/menu-images/spamsilog.png'),
  
  // Snacks
  'fries_cup.png': require('../../assets/menu-images/fries_cup.png'),
  'nachos.png': require('../../assets/menu-images/nachos.png'),
  'cheese_sticks.png': require('../../assets/menu-images/cheese_sticks.png'),
  'corndog_classic.png': require('../../assets/menu-images/corndog_classic.png'),
  'corndog_potato.png': require('../../assets/menu-images/corndog_potato.png'),
  
  // Drinks
  'cucumber_lemonade.png': require('../../assets/menu-images/cucumber_lemonade.png'),
  'lemon_ice_tea.png': require('../../assets/menu-images/lemon_ice_tea.png'),
  'blue_lemonade.png': require('../../assets/menu-images/blue_lemonade.png'),
  'red_ice_tea.png': require('../../assets/menu-images/red_ice_tea.png'),
  'mountain_dew.jpg': require('../../assets/menu-images/mountain_dew.jpg'),
  'coke.jpg': require('../../assets/menu-images/coke.jpg'),
  'sprite.jpg': require('../../assets/menu-images/sprite.jpg'),
  'royal.jpg': require('../../assets/menu-images/royal.jpg'),
  'mineral_water.jpg': require('../../assets/menu-images/mineral_water.jpg'),
};

/**
 * Get image source from imageUrl - handles both local assets and Firebase Storage URLs
 * @param {string} imageUrl - The imageUrl from the menu item
 *   - Local: '../../assets/menu-images/tapsilog.png' or 'tapsilog.png'
 *   - Firebase Storage: 'https://firebasestorage.googleapis.com/...' or 'gs://...'
 * @returns {number|{uri: string}|null} - The require() result, {uri: url} object, or null
 */
export const getLocalImage = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Check if it's a Firebase Storage URL (HTTP/HTTPS or gs://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('gs://')) {
    // Return URI object for React Native Image component
    return { uri: imageUrl };
  }
  
  // Check if it's a local file URI (file://)
  if (imageUrl.startsWith('file://')) {
    return { uri: imageUrl };
  }
  
  // Try to find in local assets
  // Extract filename from path (handle both relative paths and plain filenames)
  const filename = imageUrl.split('/').pop().trim();
  
  const result = menuImages[filename] || null;
  
  // Debug log if image not found (only for local assets, not Firebase URLs)
  if (!result && !imageUrl.includes('firebase') && !imageUrl.includes('http')) {
    if (__DEV__) {
      console.log(`[menuImages] Local image not found for filename: "${filename}" from URL: "${imageUrl}"`);
    }
  }
  
  return result;
};
