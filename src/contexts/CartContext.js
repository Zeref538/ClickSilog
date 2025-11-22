import React, { createContext, useContext, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { discountService } from '../services/discountService';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

// Helper to get cart storage key based on table number, ticket number, or customer name
const getCartStorageKey = (tableNumber, ticketNumber, customerName) => {
  if (tableNumber) {
    return `cart_table_${tableNumber}`;
  }
  // For take-out orders, prefer customerName over ticketNumber
  if (customerName) {
    // Create a safe key from customer name (replace spaces with underscores)
    const safeName = customerName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return `cart_customer_${safeName}`;
  }
  if (ticketNumber) {
    return `cart_ticket_${ticketNumber}`;
  }
  return 'cart_guest';
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const currentTableRef = useRef(null);
  const currentTicketRef = useRef(null);
  const currentCustomerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Get current table/customer info from user
  const tableNumber = user?.tableNumber || null;
  // For take-out orders, use customerName instead of ticketNumber
  const customerName = user?.customerName || null;
  const ticketNumber = user?.ticketNumber || null; // Keep for backward compatibility
  const orderMode = user?.orderMode || null;

  // Save cart to storage
  const saveCartToStorage = useCallback(async (cartItems, cartDiscount, cartDiscountCode) => {
    if (isLoadingRef.current) return; // Don't save while loading
    try {
      const storageKey = getCartStorageKey(tableNumber, ticketNumber, customerName);
      const cartData = {
        items: cartItems || [],
        discount: cartDiscount,
        discountCode: cartDiscountCode || '',
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(cartData));
    } catch (error) {
      console.warn('Failed to save cart to storage:', error);
    }
  }, [tableNumber, ticketNumber, customerName]);

  // Load cart from storage (non-blocking)
  const loadCartFromStorage = async (targetTable, targetTicket, targetCustomerName) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    // Use requestAnimationFrame to defer AsyncStorage read to next frame
    // This allows UI to render immediately
    requestAnimationFrame(async () => {
      try {
        const storageKey = getCartStorageKey(targetTable, targetTicket, targetCustomerName);
        const stored = await AsyncStorage.getItem(storageKey);
        
        if (stored) {
          const cartData = JSON.parse(stored);
          if (cartData.items && Array.isArray(cartData.items)) {
            setItems(cartData.items);
          }
          if (cartData.discount) {
            setDiscount(cartData.discount);
          }
          if (cartData.discountCode) {
            setDiscountCode(cartData.discountCode);
          }
        } else {
          // No stored cart - ensure clean state
          setItems([]);
          setDiscount(null);
          setDiscountCode('');
        }
      } catch (error) {
        console.warn('Failed to load cart from storage:', error);
        // Ensure clean state on error
        setItems([]);
        setDiscount(null);
        setDiscountCode('');
      } finally {
        isLoadingRef.current = false;
      }
    });
  };

  // Watch for table/ticket/customer changes and load appropriate cart
  useEffect(() => {
    // Safety check - ensure values are defined
    const safeTableNumber = tableNumber || null;
    const safeTicketNumber = ticketNumber || null;
    const safeCustomerName = customerName || null;
    
    const hasTableChanged = currentTableRef.current !== safeTableNumber;
    const hasTicketChanged = currentTicketRef.current !== safeTicketNumber;
    const hasCustomerChanged = currentCustomerRef.current !== safeCustomerName;
    
    if (hasTableChanged || hasTicketChanged || hasCustomerChanged) {
      // Table/ticket/customer changed - clear cart immediately for instant UI response
      setItems([]);
      setDiscount(null);
      setDiscountCode('');
      
      // Update refs immediately
      currentTableRef.current = safeTableNumber;
      currentTicketRef.current = safeTicketNumber;
      currentCustomerRef.current = safeCustomerName;
      
      // Load cart in background (non-blocking) - already deferred in loadCartFromStorage
      loadCartFromStorage(safeTableNumber, safeTicketNumber, safeCustomerName);
    } else if (safeTableNumber === null && safeTicketNumber === null && safeCustomerName === null && (currentTableRef.current !== null || currentTicketRef.current !== null || currentCustomerRef.current !== null)) {
      // User logged out - clear refs
      currentTableRef.current = null;
      currentTicketRef.current = null;
      currentCustomerRef.current = null;
      setItems([]);
      setDiscount(null);
      setDiscountCode('');
    }
  }, [tableNumber, ticketNumber, customerName]);

  // Save cart whenever items, discount, or discountCode changes
  useEffect(() => {
    if (!isLoadingRef.current && (tableNumber || ticketNumber || customerName)) {
      saveCartToStorage(items, discount, discountCode);
    }
  }, [items, discount, discountCode, tableNumber, ticketNumber, customerName, saveCartToStorage]);

  const calculateTotalPrice = (basePrice, selectedAddOns = []) => {
    const addOnTotal = selectedAddOns.reduce((sum, a) => sum + (a.price || 0), 0);
    return basePrice + addOnTotal;
  };

  const addToCart = (item, { qty = 1, selectedAddOns = [], specialInstructions = '', totalItemPrice: providedTotalPrice } = {}) => {
    setItems((prev) => {
      // Items are unique by id + selected add-ons + instructions
      const signature = JSON.stringify({ addOns: selectedAddOns.map((a) => a.id).sort(), specialInstructions });
      const idx = prev.findIndex((p) => p.id === item.id && JSON.stringify({ addOns: (p.addOns || []).map((a) => a.id).sort(), specialInstructions: p.specialInstructions || '' }) === signature);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      // Use provided totalItemPrice if available (from customization modal), otherwise calculate it
      // This ensures size-adjusted prices for drinks/snacks are preserved
      const totalItemPrice = providedTotalPrice !== undefined 
        ? providedTotalPrice 
        : calculateTotalPrice(item.price || 0, selectedAddOns);
      return [...prev, { ...item, qty, addOns: selectedAddOns, specialInstructions, totalItemPrice }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQty = (id, qty) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const clearCart = async () => {
    // Clear UI state first
    setItems([]);
    setDiscount(null);
    setDiscountCode('');
    // Clear from storage
    try {
      const storageKey = getCartStorageKey(tableNumber, ticketNumber, customerName);
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear cart from storage:', error);
    }
  };

  const applyDiscountCode = async (code) => {
    try {
      const discountData = await discountService.getDiscountByCode(code);
      if (!discountData) {
        setDiscount(null);
        setDiscountCode('');
        return { success: false, error: 'Invalid discount code' };
      }
      setDiscount(discountData);
      setDiscountCode(code.toUpperCase());
      return { success: true, discount: discountData };
    } catch (error) {
      setDiscount(null);
      setDiscountCode('');
      return { success: false, error: error.message || 'Failed to apply discount' };
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setDiscountCode('');
  };

  const subtotal = useMemo(() => items.reduce((sum, i) => {
    const base = typeof i.totalItemPrice === 'number' ? i.totalItemPrice : calculateTotalPrice(i.price || 0, i.addOns || []);
    return sum + base * i.qty;
  }, 0), [items]);

  const discountCalculation = useMemo(() => {
    if (!discount || subtotal <= 0) {
      return { discountAmount: 0, finalTotal: subtotal };
    }
    return discountService.applyDiscount(discount, subtotal);
  }, [discount, subtotal]);

  const total = useMemo(() => discountCalculation.finalTotal, [discountCalculation]);

  const value = { 
    items, 
    addToCart, 
    removeFromCart, 
    updateQty, 
    clearCart, 
    total, 
    subtotal,
    discount,
    discountCode,
    discountAmount: discountCalculation.discountAmount,
    applyDiscountCode,
    removeDiscount,
    calculateTotalPrice 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
