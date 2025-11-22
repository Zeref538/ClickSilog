import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { alertService } from '../../services/alertService';
import Icon from '../../components/ui/Icon';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ThemeToggle from '../../components/ui/ThemeToggle';
import NotificationModal from '../../components/ui/NotificationModal';
import CashPaymentConfirmationModal from '../../components/ui/CashPaymentConfirmationModal';

// Production-safe logging
const log = (...args) => { if (__DEV__) console.log(...args); };
const logError = (...args) => { console.error(...args); }; // Always log errors

// Payment Method Chip Component (reused from customer)
const MethodChip = ({ label, selected, onPress, theme, borderRadius, spacing, typography }) => {
  // Safety checks for theme values
  const safeTheme = theme || { 
    colors: { 
      primary: '#FFD54F', 
      border: '#E0E0E0', 
      primaryContainer: '#FFF9C4', 
      surface: '#FFFFFF', 
      text: '#1E1E1E' 
    } 
  };
  const safeSpacing = spacing || { md: 16, lg: 24, sm: 8 };
  const safeBorderRadius = borderRadius || { lg: 16 };
  const safeTypography = typography || { bodyBold: {} };
  
  return (
    <AnimatedButton
      style={[
        styles.methodChip, 
        { 
          borderColor: selected ? safeTheme.colors.primary : safeTheme.colors.border,
          backgroundColor: selected ? safeTheme.colors.primaryContainer : safeTheme.colors.surface,
          borderRadius: safeBorderRadius.lg,
          borderWidth: 2.5,
          paddingVertical: safeSpacing.md,
          paddingHorizontal: safeSpacing.lg,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.2 : 0.05,
          shadowRadius: 4,
          elevation: selected ? 4 : 2,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.methodText, 
        { 
          color: selected ? safeTheme.colors.primary : safeTheme.colors.text,
          ...safeTypography.bodyBold,
        }
      ]}>
        {label}
      </Text>
    </AnimatedButton>
  );
};

const CashierPaymentScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
  // Safety checks for theme values - ensure all required properties exist
  const safeThemeContext = themeContext || {};
  const theme = safeThemeContext.theme || safeThemeContext || {
    colors: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      border: '#E0E0E0',
      primary: '#FFD54F',
      error: '#F44336',
      text: '#1E1E1E',
      textSecondary: '#757575',
      textTertiary: '#9E9E9E',
      primaryContainer: '#FFF9C4',
      success: '#4CAF50',
      successContainer: '#E8F5E9',
      info: '#0284C7',
      infoContainer: '#E0F2FE',
      warning: '#F59E0B',
      warningContainer: '#FEF3C7',
      errorLight: '#FFEBEE',
      onPrimary: '#000000',
    }
  };
  const spacing = safeThemeContext.spacing || { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
  const borderRadius = safeThemeContext.borderRadius || { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, round: 999 };
  const typography = safeThemeContext.typography || { bodyBold: {}, h2: {}, h4: {}, captionBold: {} };
  
  const { userRole } = React.useContext(AuthContext);
  const { items, total, clearCart, updateQty, removeFromCart, subtotal, discount, discountCode, discountAmount } = useCart();
  const [loading, setLoading] = useState(false);
  const [tableOrName, setTableOrName] = useState('');
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' or 'take-out'
  const [orderNotes, setOrderNotes] = useState(''); // Order-level notes
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'gcash'
  const [showOrderPlacedModal, setShowOrderPlacedModal] = useState(false);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Handle keyboard dismiss to reset scroll position
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Reset scroll position when keyboard is dismissed
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Debug: Track payment method changes
  useEffect(() => {
    log('Cashier: Payment method changed to:', paymentMethod);
  }, [paymentMethod]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      return;
    }

    log('Cashier handlePlaceOrder - paymentMethod:', paymentMethod);

    // For cash payments, show confirmation modal
    if (paymentMethod === 'cash') {
      log('Cashier: Showing cash confirmation modal');
      setShowCashConfirmation(true);
      return;
    }

    // For GCash, proceed with payment
    log('Cashier: Processing GCash payment');
    await processGCashPayment();
  };

  const processGCashPayment = async () => {
    try {
      log('Cashier processGCashPayment: Starting GCash payment');
      setLoading(true);
      const info = tableOrName.trim();
      const isNumeric = /^\d+$/.test(info);
      
      // Step 1: Create order first to get orderId with pending_payment status
      const orderData = {
        items,
        subtotal,
        total,
        paymentMethod: 'gcash',
        status: 'pending_payment', // Critical: order is waiting for payment
        discountCode: discountCode || null,
        discountAmount: discountAmount || 0,
        discountName: discount?.name || null,
        customerName: orderType === 'take-out' && info ? info : (!isNumeric && info ? info : undefined),
        tableNumber: orderType === 'dine-in' && isNumeric && info ? info : undefined,
        orderType: orderType, // Use selected order type
        orderNotes: orderNotes.trim() || null, // Order-level notes
        source: 'cashier', // Mark order as created by cashier
        paymentStatus: 'pending', // Payment is pending
      };
      
      // Place order first to get orderId
      const orderResult = await orderService.placeOrder(orderData);
      const orderId = orderResult?.id || orderResult?.orderId || `order_${Date.now()}`;
      
      // Step 2: Create payment source via Cloud Function (QR PH API)
      const paymentResult = await paymentService.processPayment({
        amount: total,
        currency: 'PHP',
        description: `ClickSiLog Order #${orderId}`,
        orderId,
        paymentMethod: 'gcash',
        tableNumber: orderType === 'dine-in' && isNumeric && info ? info : undefined
      });
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }
      
      // Step 3: Update order with source info
      if (paymentResult.sourceId) {
        await orderService.updateOrder(orderId, {
          sourceId: paymentResult.sourceId,
          paymentStatus: 'pending',
          status: 'pending_payment'
        });
      }
      
      // Step 4: Navigate to GCash payment screen
      log('Cashier: Navigating to GCashPayment screen with orderId:', orderId);
      navigation.navigate('GCashPayment', {
        orderId,
        sourceId: paymentResult.sourceId,
        checkoutSessionId: paymentResult.checkoutSessionId,
        checkoutUrl: paymentResult.checkoutUrl,
        qrData: paymentResult.qrData,
        expiresAt: paymentResult.expiresAt,
        amount: total,
        paymentType: paymentResult.qrData ? 'qrph' : 'checkout'
      });
      
      // Don't clear cart yet - wait for payment confirmation
      setLoading(false);
    } catch (e) {
      logError('Cashier GCash payment error:', e.message);
      logError('Cashier GCash payment error stack:', e.stack);
      alertService.error('Payment Error', e.message || 'Failed to process GCash payment. Please try again.');
      setLoading(false);
    }
  };

  const processCashPayment = async () => {
    try {
      setLoading(true);
      const info = tableOrName.trim();
      const isNumeric = /^\d+$/.test(info);
      
      const orderResult = await orderService.placeOrder({ 
        items, 
        subtotal,
        total, 
        paymentMethod: 'cash', 
        status: 'pending',
        discountCode: discountCode || null,
        discountAmount: discountAmount || 0,
        discountName: discount?.name || null,
        customerName: orderType === 'take-out' && info ? info : (!isNumeric && info ? info : undefined),
        tableNumber: orderType === 'dine-in' && isNumeric && info ? info : undefined,
        orderType: orderType, // Use selected order type
        orderNotes: orderNotes.trim() || null, // Order-level notes
        source: 'cashier', // Mark order as created by cashier
      });
      
      const orderId = orderResult?.id || orderResult?.orderId;
      clearCart();
      setTableOrName('');
      setOrderType('dine-in'); // Reset to default
      setOrderNotes(''); // Reset notes
      
      // Fetch order data and navigate to receipt
      if (orderId) {
        try {
          const { firestoreService } = await import('../../services/firestoreService');
          const order = await firestoreService.getDocument('orders', orderId);
          if (order) {
            navigation.navigate('Receipt', { order });
          } else {
            // Fallback: navigate to receipt with basic order data
            navigation.navigate('Receipt', { 
              order: { 
                id: orderId, 
                items, 
                total, 
                paymentMethod: 'cash',
                orderType,
                source: 'cashier'
              } 
            });
          }
        } catch (error) {
          logError('Error fetching order for receipt:', error);
          // Fallback: navigate to receipt with basic order data
          navigation.navigate('Receipt', { 
            order: { 
              id: orderId, 
              items, 
              total, 
              paymentMethod: 'cash',
              orderType,
              source: 'cashier'
            } 
          });
        }
      } else {
        // Fallback: show success modal if no order ID
        setShowOrderPlacedModal(true);
      }
    } catch (e) {
      logError('Order placement error:', e.message);
      alertService.error('Error', e.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Ensure background color is always defined
  const backgroundColor = theme?.colors?.background || '#FAFAFA';
  
  log('CashierPaymentScreen: Rendering with theme:', {
    hasTheme: !!theme,
    hasColors: !!theme?.colors,
    backgroundColor: backgroundColor,
    spacingKeys: spacing ? Object.keys(spacing) : 'none'
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 100 })}
    >
      <View style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
          borderBottomWidth: 1,
        }
      ]}>
        <View style={styles.headerContent}>
          <AnimatedButton
            onPress={() => navigation.navigate('CashierOrdering')}
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
                  backgroundColor: theme.colors.error + '20',
                  borderWidth: 1.5,
                  borderColor: theme.colors.error,
                  padding: spacing.sm,
                  borderRadius: 999,
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
          <Text style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              ...typography.h2,
              flex: 1,
              textAlign: 'center',
            }
          ]}>
            Checkout
          </Text>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled" 
        keyboardDismissMode="on-drag"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Method Selection */}
        <View style={[
          styles.paymentMethodSection,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            margin: spacing.md,
            marginBottom: spacing.sm,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.paymentMethodHeader,
            {
              marginBottom: spacing.md,
            }
          ]}>
            <Icon
              name={paymentMethod === 'gcash' ? 'phone-portrait' : 'cash'}
              library="ionicons"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: spacing.sm }}
            />
            <Text style={[
              styles.paymentMethodLabel,
              {
                color: theme.colors.text,
                ...typography.bodyBold,
              }
            ]}>
              Payment Method
            </Text>
          </View>
          
          <View style={[styles.methodsRow, { gap: spacing.md }]}>
            <MethodChip 
              label="Cash" 
              selected={paymentMethod === 'cash'} 
              onPress={() => {
                log('Cashier: Cash payment method selected, current state:', paymentMethod);
                setPaymentMethod('cash');
                log('Cashier: Payment method set to cash');
              }} 
              theme={theme}
              borderRadius={borderRadius}
              spacing={spacing}
              typography={typography}
            />
            <MethodChip 
              label="GCash" 
              selected={paymentMethod === 'gcash'} 
              onPress={() => {
                log('Cashier: GCash payment method selected, current state:', paymentMethod);
                setPaymentMethod('gcash');
                log('Cashier: Payment method set to gcash');
              }} 
              theme={theme}
              borderRadius={borderRadius}
              spacing={spacing}
              typography={typography}
            />
          </View>
          
          {/* Visual indicator of selected payment method */}
          <View style={[
            styles.selectedMethodIndicator,
            {
              marginTop: spacing.sm,
              padding: spacing.sm,
              backgroundColor: paymentMethod === 'gcash' 
                ? (theme.colors.infoContainer || '#E0F2FE')
                : (theme.colors.successContainer || '#E8F5E9'),
              borderRadius: borderRadius.md,
              borderWidth: 1.5,
              borderColor: paymentMethod === 'gcash'
                ? (theme.colors.info || '#0284C7')
                : (theme.colors.success || '#4CAF50'),
            }
          ]}>
            <View style={styles.selectedMethodRow}>
              <Icon
                name={paymentMethod === 'gcash' ? 'phone-portrait' : 'cash'}
                library="ionicons"
                size={18}
                color={paymentMethod === 'gcash'
                  ? (theme.colors.info || '#0284C7')
                  : (theme.colors.success || '#4CAF50')}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={[
                styles.selectedMethodText,
                {
                  color: paymentMethod === 'gcash'
                    ? (theme.colors.info || '#0284C7')
                    : (theme.colors.success || '#4CAF50'),
                  ...typography.captionBold,
                }
              ]}>
                Selected: {paymentMethod === 'gcash' ? 'GCash' : 'Cash'} Payment
              </Text>
            </View>
          </View>
        </View>

        {/* Table Number or Customer Name Input */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            margin: spacing.md,
            marginBottom: spacing.sm,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[
            styles.inputLabel,
            {
              color: theme.colors.text,
              ...typography.bodyBold,
              marginBottom: spacing.sm,
            }
          ]}>
            Order Information
          </Text>
          
          <View style={styles.inputRow}>
            <Icon
              name="information-circle"
              library="ionicons"
              size={20}
              color={theme.colors.textSecondary}
              style={{ marginRight: spacing.sm }}
            />
            <TextInput
              value={tableOrName}
              onChangeText={setTableOrName}
              placeholder={orderType === 'dine-in' ? 'Table number' : 'Customer name'}
              placeholderTextColor={theme.colors.textTertiary}
              onBlur={() => {
                // Ensure keyboard space is cleared when field loses focus
                Keyboard.dismiss();
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1.5,
                  flex: 1,
                  textAlign: 'center',
                  ...typography.body,
                }
              ]}
            />
          </View>
          
          {/* Order Type Toggle Buttons */}
          <View style={[
            styles.orderTypeContainer,
            {
              marginTop: spacing.md,
              gap: spacing.sm,
            }
          ]}>
            <AnimatedButton
              onPress={() => setOrderType('dine-in')}
              style={[
                styles.orderTypeButton,
                {
                  backgroundColor: orderType === 'dine-in' 
                    ? (theme.colors.info || '#0284C7')
                    : theme.colors.surfaceVariant,
                  borderColor: orderType === 'dine-in'
                    ? (theme.colors.info || '#0284C7')
                    : theme.colors.border,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderWidth: orderType === 'dine-in' ? 2 : 1.5,
                  flex: 1,
                  shadowColor: orderType === 'dine-in' ? (theme.colors.info || '#0284C7') : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: orderType === 'dine-in' ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: orderType === 'dine-in' ? 3 : 1,
                }
              ]}
            >
              <View style={styles.orderTypeButtonContent}>
                <Icon
                  name="restaurant"
                  library="ionicons"
                  size={20}
                  color={orderType === 'dine-in'
                    ? '#FFFFFF'
                    : theme.colors.textSecondary}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={[
                  styles.orderTypeText,
                  {
                    color: orderType === 'dine-in'
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                    ...typography.bodyBold,
                    fontSize: 15,
                  }
                ]}>
                  Dine-In
                </Text>
              </View>
            </AnimatedButton>
            
            <AnimatedButton
              onPress={() => setOrderType('take-out')}
              style={[
                styles.orderTypeButton,
                {
                  backgroundColor: orderType === 'take-out'
                    ? (theme.colors.warning || '#F59E0B')
                    : theme.colors.surfaceVariant,
                  borderColor: orderType === 'take-out'
                    ? (theme.colors.warning || '#F59E0B')
                    : theme.colors.border,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderWidth: orderType === 'take-out' ? 2 : 1.5,
                  flex: 1,
                  shadowColor: orderType === 'take-out' ? (theme.colors.warning || '#F59E0B') : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: orderType === 'take-out' ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: orderType === 'take-out' ? 3 : 1,
                }
              ]}
            >
              <View style={styles.orderTypeButtonContent}>
                <Icon
                  name="bag-handle"
                  library="ionicons"
                  size={20}
                  color={orderType === 'take-out'
                    ? '#FFFFFF'
                    : theme.colors.textSecondary}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={[
                  styles.orderTypeText,
                  {
                    color: orderType === 'take-out'
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                    ...typography.bodyBold,
                    fontSize: 15,
                  }
                ]}>
                  Take-Out
                </Text>
              </View>
            </AnimatedButton>
          </View>
          
          {/* Order Notes Field */}
          <View style={[
            styles.notesSection,
            {
              marginTop: spacing.md,
            }
          ]}>
            <View style={[
              styles.notesLabelRow,
              {
                marginBottom: spacing.sm,
              }
            ]}>
              <Icon
                name="document-text-outline"
                library="ionicons"
                size={18}
                color={theme.colors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={[
                styles.notesLabel,
                {
                  color: theme.colors.text,
                  ...typography.bodyBold,
                }
              ]}>
                Order Notes (Optional)
              </Text>
            </View>
            <TextInput
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Add any special instructions for this order..."
              placeholderTextColor={theme.colors.textTertiary}
              onBlur={() => {
                // Ensure keyboard space is cleared when field loses focus
                Keyboard.dismiss();
              }}
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1.5,
                  ...typography.body,
                }
              ]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Cart Items */}
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: borderRadius.xl,
                padding: spacing.md,
                marginBottom: spacing.md,
                marginHorizontal: spacing.md,
                borderWidth: 1,
              }
            ]}>
              <View style={styles.cardHeader}>
                <Text style={[
                  styles.name,
                  {
                    color: theme.colors.text,
                    ...typography.bodyBold,
                    flex: 1,
                  }
                ]}>
                  {item.name}
                </Text>
                <AnimatedButton
                  onPress={() => removeFromCart(item.id)}
                  style={[
                    styles.removeBtn,
                    {
                      backgroundColor: 'transparent',
                      borderRadius: borderRadius.round,
                      width: 36,
                      height: 36,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  ]}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.errorLight,
                      borderRadius: borderRadius.round,
                    }}
                  >
                    <Icon
                      name="close"
                      library="ionicons"
                      size={18}
                      color={theme.colors.error}
                      responsive={true}
                      hitArea={false}
                    />
                  </View>
                </AnimatedButton>
              </View>
              {!!item.addOns?.length && (
                <View style={[
                  styles.addOns,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    marginTop: spacing.sm,
                  }
                ]}>
                  {item.addOns.map((a, aIdx) => (
                    <View key={`${item.id}-addon-${a.id || aIdx}`} style={[styles.addOnRow, { gap: spacing.xs }]}>
                      <Icon
                        name="add-circle"
                        library="ionicons"
                        size={14}
                        color={theme.colors.primary}
                      />
                      <Text style={[
                        styles.addOnLine,
                        {
                          color: theme.colors.textSecondary,
                          ...typography.caption,
                          flex: 1,
                        }
                      ]}>
                        {a.name}
                      </Text>
                      <Text style={[
                        styles.addOnPrice,
                        {
                          color: theme.colors.primary,
                          ...typography.captionBold,
                        }
                      ]}>
                        +₱{Number(a.price || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {!!item.specialInstructions && (
                <View style={[
                  styles.notesContainer,
                  {
                    backgroundColor: theme.colors.warningLight,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    marginTop: spacing.sm,
                    flexDirection: 'row',
                    gap: spacing.xs,
                  }
                ]}>
                  <Icon
                    name="document-text"
                    library="ionicons"
                    size={16}
                    color={theme.colors.warning}
                  />
                  <Text style={[
                    styles.notes,
                    {
                      color: theme.colors.warning,
                      ...typography.caption,
                      flex: 1,
                      fontStyle: 'italic',
                    }
                  ]}>
                    {item.specialInstructions}
                  </Text>
                </View>
              )}
              <View style={[
                styles.qtyRow,
                {
                  borderTopColor: theme.colors.border,
                  borderTopWidth: 1,
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                }
              ]}>
                <View style={[styles.qtyControls, { gap: spacing.md }]}>
                  <AnimatedButton
                    style={[
                      styles.qtyBtn,
                      {
                        backgroundColor: theme.colors.primaryContainer,
                        borderRadius: borderRadius.round,
                        width: 40,
                        height: 40,
                      }
                    ]}
                    onPress={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                  >
                    <Icon
                      name="remove"
                      library="ionicons"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </AnimatedButton>
                  <View style={styles.qtyDisplay}>
                    <Text style={[
                      styles.qty,
                      {
                        color: theme.colors.text,
                        ...typography.bodyBold,
                      }
                    ]}>
                      {item.qty}
                    </Text>
                  </View>
                  <AnimatedButton
                    style={[
                      styles.qtyBtn,
                      {
                        backgroundColor: theme.colors.primaryContainer,
                        borderRadius: borderRadius.round,
                        width: 40,
                        height: 40,
                      }
                    ]}
                    onPress={() => updateQty(item.id, item.qty + 1)}
                  >
                    <Icon
                      name="add"
                      library="ionicons"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </AnimatedButton>
                </View>
                <Text style={[
                  styles.lineTotal,
                  {
                    color: theme.colors.primary,
                    ...typography.h4,
                  }
                ]}>
                  ₱{((item.totalItemPrice || (item.price || 0)) * item.qty).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={[styles.empty, { padding: spacing.xxl }]}>
              <Icon
                name="cart-outline"
                library="ionicons"
                size={80}
                color={theme.colors.textTertiary}
              />
              <Text style={[
                styles.emptyText,
                {
                  color: theme.colors.text,
                  ...typography.h3,
                  marginTop: spacing.lg,
                }
              ]}>
                Your cart is empty
              </Text>
              <Text style={[
                styles.emptySubtext,
                {
                  color: theme.colors.textSecondary,
                  ...typography.body,
                  marginTop: spacing.sm,
                  textAlign: 'center',
                }
              ]}>
                Add items from the menu to get started
              </Text>
              <AnimatedButton
                style={[
                  styles.emptyBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xl,
                    marginTop: spacing.lg,
                  }
                ]}
                onPress={() => navigation.navigate('CashierOrdering')}
              >
                <Text style={[
                  styles.emptyBtnText,
                  { color: theme.colors.onPrimary }
                ]}>
                  Browse Menu
                </Text>
              </AnimatedButton>
            </View>
          }
        />

        {/* Total and Place Order Button */}
        {items.length > 0 && (
          <View style={[
            styles.footer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 2,
              padding: spacing.md,
              marginTop: spacing.md,
            }
          ]}>
            <View style={[
              styles.totalRow,
              {
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
                marginBottom: spacing.md,
                paddingBottom: spacing.md,
              }
            ]}>
              <Text style={[
                styles.totalLabel,
                {
                  color: theme.colors.text,
                  ...typography.h4,
                }
              ]}>
                Total
              </Text>
              <Text style={[
                styles.total,
                {
                  color: theme.colors.primary,
                  ...typography.h2,
                }
              ]}>
                ₱{total.toFixed(2)}
              </Text>
            </View>
            <AnimatedButton
              style={[
                styles.btnPrimary,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                  shadowColor: theme.colors.primary,
                }
              ]}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} size="small" />
              ) : (
                <>
                  <Icon
                    name="checkmark-circle"
                    library="ionicons"
                    size={22}
                    color={theme.colors.onPrimary}
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={[
                    styles.btnPrimaryText,
                    { 
                      color: theme.colors.onPrimary,
                      ...typography.bodyBold,
                    }
                  ]}>
                    {paymentMethod === 'gcash' ? 'Pay with GCash' : 'Place Order (Cash)'}
                  </Text>
                </>
              )}
            </AnimatedButton>
          </View>
        )}
      </ScrollView>

      {/* Cash Payment Confirmation Modal */}
      <CashPaymentConfirmationModal
        visible={showCashConfirmation}
        onClose={() => setShowCashConfirmation(false)}
        onConfirm={processCashPayment}
        total={total}
        amount={total}
        loading={loading}
      />

      {/* Order Placed Notification Modal */}
      <NotificationModal
        visible={showOrderPlacedModal}
        onClose={() => {
          setShowOrderPlacedModal(false);
          navigation.navigate('CashierOrdering');
        }}
        title="Order Placed!"
        message="Order has been placed successfully!"
        icon="checkmark-circle"
        iconColor={theme.colors.success}
        type="success"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    // Typography handled via theme
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputSection: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  inputLabel: {
    // Typography handled via theme
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1
  },
  card: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    // Typography handled via theme
  },
  removeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  addOns: {
    // Styled inline
  },
  addOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOnLine: {
    // Typography handled via theme
  },
  addOnPrice: {
    // Typography handled via theme
  },
  notesContainer: {
    // Styled inline
  },
  notes: {
    // Typography handled via theme
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  qtyDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  qty: {
    // Typography handled via theme
  },
  lineTotal: {
    // Typography handled via theme
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    // Typography handled via theme
  },
  emptySubtext: {
    // Typography handled via theme
  },
  emptyBtn: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3
  },
  emptyBtnText: {
    // Typography handled via theme
  },
  footer: {
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    // Typography handled via theme
  },
  total: {
    // Typography handled via theme
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  btnPrimaryText: {
    // Typography handled via theme
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTypeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTypeText: {
    // Typography handled via theme
  },
  paymentMethodSection: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    // Typography handled via theme
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  methodChip: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  methodText: {
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.3
  },
  selectedMethodIndicator: {
    // Styled inline
  },
  selectedMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMethodText: {
    // Typography handled via theme
  },
  notesSection: {
    // Styled inline
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom handled inline with spacing
  },
  notesLabel: {
    // Typography handled via theme
  },
  notesInput: {
    minHeight: 80,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default CashierPaymentScreen;
