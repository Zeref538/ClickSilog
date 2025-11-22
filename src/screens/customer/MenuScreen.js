import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, ScrollView, useWindowDimensions, TouchableOpacity, BackHandler, TextInput, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRealTimeCollection } from '../../hooks/useRealTime';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { appConfig } from '../../config/appConfig';
import CategoryFilter from '../../components/ui/CategoryFilter';
import MenuItemCard from '../../components/ui/MenuItemCard';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Icon from '../../components/ui/Icon';
import AnimatedButton from '../../components/ui/AnimatedButton';
import CustomerOrderNotification from '../../components/customer/CustomerOrderNotification';
import StaffUnlockModal from '../../components/ui/StaffUnlockModal';
import { scale } from '../../utils/responsive';

// Warm color palette
const PALETTE = {
  red: '#E52020',
  orange: '#FBA518',
  yellow: '#F9CB43',
  olive: '#A89C29',
};

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const MenuScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { logout } = useContext(AuthContext);
  const { items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const scrollRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const isSwipingRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 4 : 2;
  const cartCount = items.reduce((n, i) => n + (i.qty || 0), 0);

  // Navigate back to OrderMode (selection screen) without logging out
  const goToOrderMode = () => {
    setStaffModalVisible(false);
    const rootNavigation = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'OrderMode' }],
      })
    );
  };

  const handleStaffUnlockSuccess = async () => {
    setStaffModalVisible(false);
    try {
      await logout();
    } catch (error) {
      console.warn('Customer logout error:', error);
    }

    const rootNavigation = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'OrderMode' }],
      })
    );
  };

  const { data: menuItemsRaw, loading: itemsLoading } = useRealTimeCollection('menu', [], ['name', 'asc']);
  
  // Filter available items (support both 'available' boolean and 'status' string)
  // Hide deactivated items from customer
  const menuItems = useMemo(() => {
    const raw = menuItemsRaw || [];
    // Dedupe by id - ensure that we don't render duplicates from data source
    const map = new Map();
    raw.forEach((it) => {
      const id = it.id || `${it.name}-${it.price}`;
      if (!map.has(id)) map.set(id, it);
    });
    if (raw.length !== map.size) {
      console.warn(`MenuScreen: deduped ${raw.length - map.size} duplicated menu items`);
    }
    return Array.from(map.values()).filter(item => 
      (item.status === 'available' || item.available === true) &&
      item.status !== 'deactivated' &&
      item.available !== false &&
      !(item.category === 'drinks' && /\(\s*Large\s*\)/i.test(item.name || ''))
    );
  }, [menuItemsRaw]);

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const categoryMap = new Map();
    const categoryOrder = ['silog_meals', 'snacks', 'drinks'];
    const categoryNames = {
      'silog_meals': 'Silog Meals',
      'snacks': 'Snacks',
      'drinks': 'Beverages'
    };
    
    menuItems.forEach(item => {
      const cat = item.category || item.categoryId;
      if (cat && !categoryMap.has(cat)) {
        categoryMap.set(cat, {
          id: cat,
          name: categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')
        });
      }
    });
    
    // Sort by predefined order, then alphabetically
    return Array.from(categoryMap.values()).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.id);
      const bIndex = categoryOrder.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [menuItems]);

  // Create pages array: All + categories
  const pages = useMemo(() => [{ id: null, name: 'All' }, ...categories], [categories]);

  // Get current page index based on selected category
  const pageIndex = useMemo(() => {
    if (selectedCategory === null || selectedCategory === undefined) return 0;
    const i = pages.findIndex((p) => p.id === selectedCategory);
    return Math.max(0, i);
  }, [selectedCategory, pages]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Short press: back to order mode (no logout)
      goToOrderMode();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  // Sync scroll position when selectedCategory changes (but not from swipe gestures)
  useEffect(() => {
    if (categoryScrollRef.current && !isSwipingRef.current) {
      const targetIndex = pageIndex;
      categoryScrollRef.current.scrollTo({ x: width * targetIndex, animated: true });
    }
    // Reset flag after scrolling
    isSwipingRef.current = false;
  }, [selectedCategory, width, pageIndex]);

  const filterByCategory = (catId) => (catId && catId !== 'all') 
    ? menuItems.filter((i) => i.category === catId || i.categoryId === catId) 
    : menuItems;

  const onSelectCategory = (catId) => {
    // When category is selected via button, setSelectedCategory will trigger useEffect to scroll
    setSelectedCategory(catId);
  };

  // Handle swipe gesture - update selected category when user swipes between pages
  const onMomentumEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    const page = pages[i];
    if (page) {
      isSwipingRef.current = true; // Mark that this change came from swipe
      setSelectedCategory(page.id === null || page.id === undefined ? null : page.id);
    }
  };

  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((m) => m.name?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q));
  }, [menuItems, search]);

  // Show UI immediately - menu will populate when data arrives
  // This makes the screen appear instantly instead of showing a loading screen
  // The FlatList will handle empty state gracefully

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.surface, 
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }
      ]}>
        <AnimatedButton
          onPress={goToOrderMode}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Return to dine-in or take-out selection"
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(theme.colors.error, 0.1), // Soft 10% opacity halo
              borderWidth: 1.5,
                borderColor: theme.colors.error + '40',
                padding: spacing.sm,
                borderRadius: 999, // Perfect circle
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.colors.error,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
        >
          <Icon
        name="arrow-back"
            library="ionicons"
            size={22}
            color={theme.colors.error}
            responsive={true}
            hitArea={false}
          />
            </View>
          </View>
        </AnimatedButton>
        <View style={[styles.headerRight, { gap: spacing.sm }]}>
          {searchOpen ? (
            <View style={[
              styles.searchWrap, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + '40',
                borderRadius: borderRadius.lg,
                borderWidth: 2,
                paddingHorizontal: spacing.md,
                height: 44,
              }
            ]}>
              <Icon
                name="search"
                library="ionicons"
                size={22}
                color={theme.colors.textSecondary}
                style={{ marginRight: spacing.sm }}
                responsive={true}
                hitArea={false}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search menu items..."
                placeholderTextColor={theme.colors.textTertiary}
                autoFocus
                style={[
                  styles.searchInput, 
                  { 
                    color: theme.colors.text,
                    flex: 1,
                    ...typography.body,
                    textAlignVertical: 'center',
                    paddingVertical: 0,
                    includeFontPadding: false,
                    // Reserve space equivalent to the cancel button width + margin.
                    paddingRight: 48,
                  }
                ]}
                textAlignVertical="center"
              />
              <AnimatedButton
                onPress={() => { setSearchOpen(false); setSearch(''); }}
                style={[
                  styles.searchCancel, 
                  { 
                    backgroundColor: theme.colors.errorLight,
                    borderRadius: borderRadius.round,
                    width: 32,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    // Position absolutely so native text input doesn't overlap on Android
                    position: 'absolute',
                    right: spacing.md - 4,
                    zIndex: 10,
                    // Android needs elevation to stack above the TextInput, iOS uses zIndex
                    ...Platform.select({ android: { elevation: 6 }, ios: { zIndex: 10 } }),
                  }
                ]}
              >
                <Icon
                  name="close"
                  library="ionicons"
                  size={20}
                  color={theme.colors.error}
                  responsive={true}
                  hitArea={false}
                  style={{ margin: 0 }}
                />
              </AnimatedButton>
            </View>
          ) : (
            <>
              <AnimatedButton
                style={{
                    width: 44,
                    height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={() => setSearchOpen(true)}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: hexToRgba(theme.colors.info || '#3B82F6', 0.1), // Blue for search
                      borderWidth: 1.5,
                      borderColor: (theme.colors.info || '#3B82F6') + '40',
                      padding: spacing.sm,
                      borderRadius: 999, // Perfect circle
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: theme.colors.info || '#3B82F6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
              >
                <Icon
                  name="search"
                  library="ionicons"
                  size={22}
                  color={theme.colors.info || '#3B82F6'}
                  responsive={true}
                  hitArea={false}
                />
                  </View>
                </View>
              </AnimatedButton>
              <CustomerOrderNotification />
              <ThemeToggle />
            </>
          )}
          <AnimatedButton
            style={{
                width: 44,
                height: 44,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              position: 'relative',
            }}
            onPress={() => navigation.navigate('Cart')}
          >
            <View
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: hexToRgba(theme.colors.success || '#10B981', 0.1), // Green for cart
                  borderWidth: 1.5,
                  borderColor: (theme.colors.success || '#10B981') + '40',
                  padding: spacing.sm,
                  borderRadius: 999, // Perfect circle
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.success || '#10B981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
          >
            <Icon
              name="cart"
              library="ionicons"
              size={22}
              color={theme.colors.success || '#10B981'}
              responsive={true}
              hitArea={false}
            />
              </View>
            </View>
            {cartCount > 0 && (
              <View style={[
                styles.cartBadge, 
                { 
                  backgroundColor: theme.colors.error,
                  borderRadius: borderRadius.round,
                  minWidth: 20,
                  height: 20,
                }
              ]}>
                <Text style={[
                  styles.cartBadgeText,
                  { color: theme.colors.onPrimary }
                ]}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </AnimatedButton>
        </View>
      </View>

      <View style={[
        styles.greeting, 
        { 
          backgroundColor: theme.colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
        }
      ]}>
        <View style={[styles.greetingContent, { gap: spacing.sm }]}>
          <Text style={[
            styles.greetingText, 
            { 
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: '600',
              flex: 1,
            }
          ]}>
            What would you like to order?
          </Text>
          <View style={[styles.greetingIcons, { gap: spacing.xs }]}>
            <Icon name="star" library="ionicons" size={16} color={PALETTE.yellow} responsive={true} />
            <Icon name="restaurant" library="ionicons" size={16} color={PALETTE.orange} responsive={true} />
            <Icon name="sparkles" library="ionicons" size={16} color={PALETTE.red} responsive={true} />
          </View>
        </View>
      </View>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => onSelectCategory(id)}
      />

      {/* Horizontal ScrollView for swipeable category pages */}
      <ScrollView
        ref={categoryScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        bounces={false}
        decelerationRate="fast"
      >
        {pages.map((page, pageIdx) => {
          const itemsInPage = filterByCategory(page.id);
          const filtered = filteredBySearch.filter((m) => itemsInPage.find((x) => x.id === m.id));
          
          // Dedupe items for rendering by ID and by normalized name+price to catch duplicates with different ids
          const itemsMap = new Map();
          const itemsNamePriceMap = new Map();
          filtered.forEach((it) => {
            const idKey = it.id || `${it.name}-${it.price}`;
            if (!itemsMap.has(idKey)) {
              itemsMap.set(idKey, it);
            }
            const normalizedName = (it.name || '').replace(/\s*\((Small|Large)\)\s*/i, '').trim().toLowerCase();
            const namePriceKey = `${normalizedName}|${String(it.price || '')}`;
            if (!itemsNamePriceMap.has(namePriceKey)) {
              itemsNamePriceMap.set(namePriceKey, it);
            }
          });
          // Prefer explicit unique IDs; but if duplicates exist with different IDs, use name+price result
          const items = Array.from(itemsMap.values());
          if (items.length !== itemsNamePriceMap.size) {
            // If size differs, rebuild from namePrice map to ensure only one per product display
            const dedupedByNamePrice = Array.from(itemsNamePriceMap.values());
            if (dedupedByNamePrice.length < items.length) {
              console.warn(`MenuScreen: deduped ${items.length - dedupedByNamePrice.length} duplicates using name+price`);
              items.length = 0;
              dedupedByNamePrice.forEach(i => items.push(i));
            }
          }

          return (
            <View key={page.id || 'all'} style={{ width }}>
              {items.length === 0 ? (
                <View style={[styles.empty, { padding: spacing.xxl }]}>
                  <Icon 
                    name="restaurant-outline" 
                    library="ionicons" 
                    size={64} 
                    color={theme.colors.textTertiary} 
                  />
                  <Text style={[
                    styles.emptyText, 
                    { 
                      color: theme.colors.text,
                      ...typography.h4,
                      marginTop: spacing.md,
                    }
                  ]}>
                    No items found
                  </Text>
                  <Text style={[
                    styles.emptySubtext,
                    {
                      color: theme.colors.textSecondary,
                      ...typography.caption,
                      marginTop: spacing.sm,
                    }
                  ]}>
                    {search ? 'Try a different search' : 'Check back later for new items'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  key={numColumns}
                  data={items}
                  keyExtractor={(item, index) => item?.id ? String(item.id) : `${(item?.name || 'item')}-${index}`}
                  renderItem={({ item }) => <MenuItemCard item={item} />}
                  numColumns={numColumns}
                  contentContainerStyle={[styles.listContent, { padding: spacing.md, paddingBottom: spacing.xl }]}
                  columnWrapperStyle={styles.row}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  updateCellsBatchingPeriod={50}
                  initialNumToRender={10}
                  windowSize={10}
                  nestedScrollEnabled={true}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      <StaffUnlockModal
        visible={staffModalVisible}
        onCancel={() => setStaffModalVisible(false)}
        onSuccess={handleStaffUnlockSuccess}
        title="Staff Access Required"
        message="Enter a staff password to leave the customer ordering flow."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    // Shadow properties handled inline for better control
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap handled inline with theme spacing
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',

    minWidth: 250,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  searchInput: {
    // Styled via theme
  },
  searchCancel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.2
  },
  greeting: {
    // Styled inline
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // gap handled inline with theme spacing
  },
  greetingIcons: {
    flexDirection: 'row',
    // gap handled inline with theme spacing
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12
  },
  listContent: {
    // padding handled inline with theme spacing
  },
  row: {
    justifyContent: 'flex-start'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center'
  },
  emptySubtext: {
    textAlign: 'center'
  }
});

export default MenuScreen;
