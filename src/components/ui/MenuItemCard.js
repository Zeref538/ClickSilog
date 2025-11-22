import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { scale } from '../../utils/responsive';
import ItemCustomizationModal from './ItemCustomizationModal';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getLocalImage } from '../../config/menuImages';

const AnimatedView = Animated.createAnimatedComponent(View);

// Warm color palette
const PALETTE = {
  red: '#E52020',
  orange: '#FBA518',
  yellow: '#F9CB43',
  olive: '#A89C29',
};

  const MenuItemCard = ({ item }) => {
  // Helper function to convert hex color to rgba with opacity
  const hexToRgba = (hex, opacity) => {
    const cleanHex = (hex || '').replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const { theme, spacing, borderRadius, typography, themeMode } = useTheme();
  const { addToCart, calculateTotalPrice, items, removeFromCart, updateQty } = useCart();
  const [open, setOpen] = useState(false);
  const scaleAnim = useSharedValue(1);
  
  // Check if item is already in cart (by id only, not considering add-ons)
  const cartItem = items.find(cartItem => cartItem.id === item.id);
  const isInCart = !!cartItem;

  const onConfirm = ({ qty, selectedAddOns, specialInstructions, totalItemPrice }) => {
    addToCart(item, { qty, selectedAddOns, specialInstructions, totalItemPrice });
    setOpen(false);
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categoryId || '';
    if (cat === 'silog_meals' || cat === 'meal' || cat === 'silog') return { name: 'restaurant', library: 'ionicons' };
    if (cat === 'snacks' || cat === 'snack') return { name: 'fast-food', library: 'ionicons' };
    if (cat === 'drinks' || cat === 'drink') return { name: 'water', library: 'ionicons' };
    return { name: 'restaurant-outline', library: 'ionicons' };
  };

  const getCategoryColor = (categoryId) => {
    const cat = categoryId || '';
    if (cat === 'silog_meals' || cat === 'meal' || cat === 'silog') return PALETTE.red + '15';
    if (cat === 'snacks' || cat === 'snack') return PALETTE.olive + '15';
    if (cat === 'drinks' || cat === 'drink') return PALETTE.orange + '15';
    return theme.colors.surface;
  };

  const getCategoryIconColor = (categoryId) => {
    const cat = categoryId || '';
    if (cat === 'silog_meals' || cat === 'meal' || cat === 'silog') return PALETTE.red;
    if (cat === 'snacks' || cat === 'snack') return PALETTE.olive;
    if (cat === 'drinks' || cat === 'drink') return PALETTE.orange;
    return theme.colors.primary;
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePress = () => {
    scaleAnim.value = withSpring(0.98, { damping: 15, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    setOpen(true);
  };

  const categoryIcon = getCategoryIcon(item.category || item.categoryId);
  const hasImage = item?.imageUrl && item.imageUrl.trim() !== '';
  const imageSource = hasImage ? getLocalImage(item.imageUrl) : null;
  const isRemoteImage = imageSource && typeof imageSource === 'object' && imageSource.uri;
  
  // Debug logging for images (only in dev mode)
  if (__DEV__ && hasImage && !imageSource) {
    console.log(`[MenuItemCard] No image found for ${item.name}:`, item.imageUrl);
  }

  // Button sizing constants
  const BUTTON_SIZE = 42; // circle size legacy
  const RECT_BUTTON_HEIGHT = 40; // rectangle height for spanning add button
  const BUTTON_MARGIN = 12;
  const CART_BADGE_SIZE = 22;
  // final button size reduces slightly when circle button is in cart to reduce overlap
  // badge vertical offset to center the cart badge on the right side of the rect button
  const badgeBottomOffset = 12 + Math.round((RECT_BUTTON_HEIGHT - CART_BADGE_SIZE) / 2);
  // badge placement - keep a small gap between badge and add button
  const badgeRightOffset = 12;
  const rectButtonPaddingRight = CART_BADGE_SIZE + 8; // reserve space so the label can be centered visually without badge overlap
  const addButtonRightOffset = badgeRightOffset + CART_BADGE_SIZE + 12; // add button is left from the badge to avoid overlap with extra padding
  // finalButtonSize and iconSize were for previous circular add button; removed since using a rectangle button

  return (
    <AnimatedView style={[
      styles.card, 
      { 
        backgroundColor: theme.colors.surface,
        borderColor: isInCart ? hexToRgba(PALETTE.orange, 0.25) : theme.colors.border,
        borderRadius: borderRadius.xl,
        padding: spacing.sm,
          paddingBottom: spacing.md + RECT_BUTTON_HEIGHT + BUTTON_MARGIN,
        margin: spacing.sm,
      },
      cardAnimatedStyle
    ]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={{ flex: 1 }}>
          <View style={[styles.imageContainer, { backgroundColor: 'transparent' }]}> 
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: imageSource ? '#ffffff' : getCategoryColor(item.category || item.categoryId),
              borderRadius: borderRadius.round,
              width: 84,
              height: 84,
              overflow: 'hidden',
              padding: imageSource ? 6 : 0,
              borderWidth: isInCart ? 2 : 0,
              borderColor: isInCart ? PALETTE.orange : 'transparent',
            }
          ]}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={{
                  width: 84 - 12,
                  height: 84 - 12,
                  borderRadius: (84 - 12) / 2,
                  borderWidth: isInCart ? 3 : 0,
                  borderColor: isInCart ? PALETTE.orange : 'transparent',
                }}
                resizeMode="cover"
                onError={(error) => {
                  if (__DEV__) {
                    console.log(`[MenuItemCard] Image load error for ${item.name}:`, error.nativeEvent.error);
                  }
                }}
              />
            ) : (
            <Icon
              name={categoryIcon.name}
              library={categoryIcon.library}
              size={48}
              responsive={false}
              color={getCategoryIconColor(item.category || item.categoryId)}
              />
            )}
            {/* removed top-right selectedBadge — replaced by red cartBadge at card level */}
          </View>
        </View>
          <View style={[
            styles.content,
            { alignItems: 'center', paddingLeft: 0, paddingRight: 0 }
          ]}>
          <Text 
            style={[
              styles.title, 
              { 
                color: theme.colors.text,
                ...typography.bodyBold,
                  marginBottom: Math.max(2, Math.round((spacing.xs || 4) / 2)),
                textAlign: 'center',
              }
            ]} 
            numberOfLines={2}
          >
            {item.name.replace(/\s*\((Small|Large)\)\s*/i, '')}
          </Text>
          <View style={[styles.priceContainer, { marginTop: Math.max(0, Math.round((spacing.xs || 4) / 3)) }]}>
            <Text style={[
              styles.price,
              {
                color: PALETTE.orange,
                ...typography.h4,
                fontWeight: '900',
              }
            ]}>
              ₱{(item.price || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Floating add button positioned absolute bottom-right */}
      {isInCart && (
        <View style={[styles.cartBadge, { right: spacing.md - Math.round(CART_BADGE_SIZE/2), bottom: badgeBottomOffset + 2, width: CART_BADGE_SIZE, height: CART_BADGE_SIZE, borderRadius: CART_BADGE_SIZE/2, backgroundColor: PALETTE.red, borderWidth: 2, borderColor: theme.colors.surface, transform: [{ translateY: -2 }] }]}> 
          <Text style={[styles.cartBadgeText, { color: '#FFFFFF' }]}>{cartItem.qty}</Text>
        </View>
      )}
      {/* Optional ring (halo) behind button to make it more visible on darker surfaces */}
      <View style={[styles.addButtonRing, { left: spacing.md - 4, right: spacing.md - 4, height: RECT_BUTTON_HEIGHT + 8, borderRadius: (RECT_BUTTON_HEIGHT + 8) / 2, backgroundColor: PALETTE.orange + '12' }]} />
      <AnimatedButton
            style={[
          styles.addButtonRect,
          {
            backgroundColor: PALETTE.yellow,
            borderWidth: 1.75,
            borderColor: PALETTE.orange + 'CC',
            borderRadius: borderRadius.lg,
            left: spacing.md,
            right: spacing.md,
            height: RECT_BUTTON_HEIGHT,
            shadowColor: PALETTE.orange,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 4,
            paddingLeft: rectButtonPaddingRight + (spacing.md / 2),
            paddingRight: rectButtonPaddingRight + (spacing.md / 2),
            paddingVertical: 0,
            flexDirection: 'row',
          }
        ]}
        onPress={handlePress}
      >
        <View style={[styles.addContents, { height: RECT_BUTTON_HEIGHT }] }>
          <Text style={{ color: '#111', fontWeight: '700', fontSize: 16, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.08)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>Add</Text>
        </View>
      </AnimatedButton>
      {/* overlay fallback removed */}
      {open && (
        <ItemCustomizationModal
          visible={open}
          onClose={() => setOpen(false)}
          item={item}
          onConfirm={onConfirm}
          calculateTotalPrice={calculateTotalPrice}
        />
      )}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  labelContainer: {
    position: 'absolute',
    // top, right, padding, gap handled inline with theme spacing
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 6,
  },
  title: {
    minHeight: 32,
    lineHeight: 20,
  },
  priceContainer: {
    marginTop: 8,
  },
  // priceRow and qtyCount removed; price is single-line and qty is not inlined
  price: {
    // Typography handled via theme
    flexShrink: 0,
  },
  buttonContainer: {
    // Deprecated; floating buttons used instead
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonFloating: {
    position: 'absolute',
    bottom: 12,
    zIndex: 10,
  },
  addButtonRect: {
    position: 'absolute',
    bottom: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // left/right values will be set inline using theme spacing
  },
  addContents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  addButtonRing: {
    position: 'absolute',
    bottom: 8,
    zIndex: 9,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    zIndex: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  // removeButtonFloating removed - no minus button
});

export default memo(MenuItemCard);
