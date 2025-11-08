import { firestoreService } from './firestoreService';
import { appConfig } from '../config/appConfig';

/**
 * Generate order ID in format MMDDXXX
 * MM = month (2 digits)
 * DD = day (2 digits)
 * XXX = order number for the day (3 digits, starting from 001)
 */
const generateOrderId = async () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 01-12
  const day = String(now.getDate()).padStart(2, '0'); // 01-31
  const datePrefix = `${month}${day}`; // MMDD

  if (appConfig.USE_MOCKS || !firestoreService.getCollectionOnce) {
    // Mock mode - generate simple ID
    const mockOrderNum = Math.floor(Math.random() * 999) + 1;
    return `${datePrefix}${String(mockOrderNum).padStart(3, '0')}`;
  }

  try {
    // Get today's start and end timestamps
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Query all orders created today
    const todayOrders = await firestoreService.getCollectionOnce('orders', [
      ['createdAt', '>=', todayStart.toISOString()],
      ['createdAt', '<', todayEnd.toISOString()]
    ]);

    // Find the highest order number for today
    let maxOrderNum = 0;
    todayOrders.forEach((order) => {
      const orderId = order.id || '';
      // Check if order ID matches today's format (MMDDXXX)
      if (orderId.startsWith(datePrefix) && orderId.length === 7) {
        const orderNum = parseInt(orderId.substring(4), 10);
        if (!isNaN(orderNum) && orderNum > maxOrderNum) {
          maxOrderNum = orderNum;
        }
      }
    });

    // Increment for next order
    const nextOrderNum = maxOrderNum + 1;
    return `${datePrefix}${String(nextOrderNum).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback: use timestamp-based ID
    const fallbackNum = Math.floor(Date.now() % 1000);
    return `${datePrefix}${String(fallbackNum).padStart(3, '0')}`;
  }
};

export const orderService = {
  placeOrder: async (order) => {
    // Validate order data
    if (!order || (!order.items || order.items.length === 0)) {
      throw new Error('Order must contain at least one item');
    }
    
    // Generate custom order ID
    const orderId = await generateOrderId();
    
    // Safely map items with null checks
    const orderItems = (order.items || []).map((i) => ({
      itemId: i?.id || null,
      name: i?.name || 'Unknown Item',
      price: Number(i?.price || 0),
      quantity: Number(i?.qty || i?.quantity || 1),
      addOns: (i?.addOns || []).map((a) => ({ 
        name: a?.name || 'Unknown Add-on', 
        price: Number(a?.price || 0) 
      })),
      specialInstructions: i?.specialInstructions || '',
      totalItemPrice: Number(i?.totalItemPrice || i?.price || 0)
    }));
    
    // Calculate totals with null safety
    const subtotal = Number(order.subtotal || order.total || 0);
    const discountAmount = Number(order.discountAmount || 0);
    const total = Math.max(0, subtotal - discountAmount);
    
    const orderData = {
      ...order,
      items: orderItems,
      subtotal: subtotal,
      total: total,
      discountCode: order.discountCode || null,
      discountAmount: discountAmount,
      discountName: order.discountName || null,
      tableNumber: order.tableNumber || null,
      customerName: order.customerName || null,
      userId: order.userId || null,
      source: order.source || 'customer', // Track order source (cashier or customer)
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Remove undefined values (Firestore doesn't accept undefined)
    const cleanOrderData = Object.fromEntries(
      Object.entries(orderData).filter(([_, value]) => value !== undefined)
    );

    // Use upsertDocument to set custom ID
    await firestoreService.upsertDocument('orders', orderId, cleanOrderData);
    return { id: orderId };
  },

  subscribeOrders: ({ status, tableNumber, userId, paymentMethod, next, error }) => {
    const conditions = [];
    if (status) conditions.push(['status', '==', status]);
    if (tableNumber) conditions.push(['tableNumber', '==', tableNumber]);
    if (userId) conditions.push(['userId', '==', userId]);
    if (paymentMethod) conditions.push(['paymentMethod', '==', paymentMethod]);
    return firestoreService.subscribeCollection('orders', { conditions, order: ['timestamp', 'asc'], next, error });
  },

  updateStatus: async (orderId, status, extra = {}) => {
    const timeField =
      status === 'preparing' ? 'preparationStartTime' :
      status === 'ready' ? 'readyTime' :
      status === 'completed' ? 'completedTime' : null;
    const payload = { status, ...(timeField ? { [timeField]: new Date().toISOString() } : {}), ...extra };
    return firestoreService.updateDocument('orders', orderId, payload);
  },

  updateOrder: async (orderId, updates) => {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return firestoreService.updateDocument('orders', orderId, payload);
  }
};

