import { appConfig } from '../config/appConfig';
import { firestoreService } from './firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword, isPasswordHashed } from '../utils/passwordHash';

// Production-safe logging
const log = (...args) => { if (__DEV__) console.log(...args); };
const logError = (...args) => { console.error(...args); }; // Always log errors
const logWarn = (...args) => { if (__DEV__) console.warn(...args); };

// Mock users for development
const mockUsers = [
  { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', displayName: 'Admin User' },
  { id: 'cashier1', username: 'cashier', password: 'cashier123', role: 'cashier', displayName: 'Cashier User' },
  { id: 'kitchen1', username: 'kitchen', password: 'kitchen123', role: 'kitchen', displayName: 'Kitchen User' },
  { id: 'developer1', username: 'developer', password: 'dev123', role: 'developer', displayName: 'Developer User' }
];

const STAFF_ROLES = ['admin', 'cashier', 'kitchen', 'developer'];

// Mock table numbers (1-8)
const mockTables = Array.from({ length: 8 }, (_, i) => i + 1);

// Current session user
let currentUser = null;

export const authService = {
  /**
   * Login with username and password (for staff roles)
   */
  loginWithUsername: async (username, password) => {
    log('authService.loginWithUsername called with:', { username, USE_MOCKS: appConfig.USE_MOCKS });
    
    // Hardcoded dev login (ONLY in development mode)
    // ⚠️ This is disabled in production builds for security
    if (__DEV__ && username === 'DevDrei' && password === '8425') {
      const devUser = {
        id: 'dev_drei',
        username: 'DevDrei',
        role: 'admin',
        displayName: 'Developer Drei',
        uid: 'dev_drei'
      };
      currentUser = devUser;
      await AsyncStorage.setItem('userToken', devUser.id);
      await AsyncStorage.setItem('userRole', devUser.role);
      await AsyncStorage.setItem('userData', JSON.stringify(devUser));
      return currentUser;
    }

    if (appConfig.USE_MOCKS) {
      log('Using MOCK users for login');
      // Case-insensitive username comparison for better UX
      const user = mockUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      log('Mock user lookup result:', user ? 'Found' : 'Not found');
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Check if account is inactive in mock mode (check Firestore for actual status)
      try {
        const firestoreUsers = await firestoreService.getCollectionOnce('users', [
          ['username', '==', user.username]
        ]);
        const firestoreUser = firestoreUsers[0];
        if (firestoreUser && (firestoreUser.status === 'inactive' || firestoreUser.status === 'deactivated')) {
          throw new Error('ACCOUNT_DEACTIVATED');
        }
      } catch (error) {
        // If error is ACCOUNT_DEACTIVATED, re-throw it
        if (error.message === 'ACCOUNT_DEACTIVATED') {
          throw error;
        }
        // Otherwise, continue with mock login (Firestore might not be available)
      }
      
      currentUser = { ...user, uid: user.id };
      await AsyncStorage.setItem('userToken', user.id);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return currentUser;
    }

    try {
      log('Querying Firestore for users...');
      // Query Firestore for user with matching username (check all statuses)
      // Note: Firestore queries are case-sensitive, so we'll filter after fetching
      const users = await firestoreService.getCollectionOnce('users', []);
      log('Firestore users found:', users.length);

      // Case-insensitive username comparison for better UX
      const user = users.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      log('Matching user found:', user ? 'Yes' : 'No');

      if (!user) {
        // Fallback to mock users if Firestore doesn't have the user and we're in development
        log('User not found in Firestore, checking mock users as fallback...');
        const mockUser = mockUsers.find(u => 
          u.username.toLowerCase() === username.toLowerCase() && 
          u.password === password
        );
        if (mockUser) {
          log('Found user in mock users, using mock login');
          currentUser = { ...mockUser, uid: mockUser.id };
          await AsyncStorage.setItem('userToken', mockUser.id);
          await AsyncStorage.setItem('userRole', mockUser.role);
          await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
          return currentUser;
        }
        throw new Error('Invalid username or password');
      }

      // Check if account is deactivated or inactive
      if (user.status === 'deactivated' || user.status === 'inactive' || user.available === false) {
        throw new Error('ACCOUNT_DEACTIVATED');
      }
      
      // Verify password (supports both hashed and plain text for migration)
      // verifyPassword handles both cases automatically
      const passwordMatches = verifyPassword(password, user.password);
      
      if (!passwordMatches) {
        throw new Error('Invalid username or password');
      }

      // Remove password from user object before storing
      const { password: _, ...userData } = user;
      currentUser = { ...userData, uid: user.id };
      
      await AsyncStorage.setItem('userToken', user.id);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      return currentUser;
    } catch (error) {
      logError('Login error:', error);
      // If Firestore query failed, try mock users as fallback
      if (error.message !== 'Invalid username or password' && error.message !== 'ACCOUNT_DEACTIVATED') {
        log('Firestore error, trying mock users as fallback...');
        const mockUser = mockUsers.find(u => 
          u.username.toLowerCase() === username.toLowerCase() && 
          u.password === password
        );
        if (mockUser) {
          log('Found user in mock users, using mock login as fallback');
          currentUser = { ...mockUser, uid: mockUser.id };
          await AsyncStorage.setItem('userToken', mockUser.id);
          await AsyncStorage.setItem('userRole', mockUser.role);
          await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
          return currentUser;
        }
      }
      throw error;
    }
  },

  /**
   * Verify if a password belongs to any active staff member
   */
  verifyStaffPassword: async (password) => {
    const trimmed = password?.trim();
    if (!trimmed) {
      return null;
    }

    const sanitizeUser = (user) => {
      if (!user) return null;
      const { password: _pw, ...rest } = user;
      const uid = user.uid || user.id || rest.uid;
      return { ...rest, uid };
    };

    const findMatchingUser = (users) => {
      if (!Array.isArray(users)) return null;
      const match = users.find((user) =>
        user?.role && STAFF_ROLES.includes(user.role) && verifyPassword(trimmed, user.password)
      );
      return sanitizeUser(match);
    };

    if (appConfig.USE_MOCKS) {
      return findMatchingUser(mockUsers);
    }

    try {
      const users = await firestoreService.getCollectionOnce('users', [
        ['status', '==', 'active']
      ]);
      return findMatchingUser(users);
    } catch (error) {
      logError('verifyStaffPassword error:', error);
      throw new Error('Unable to verify staff password');
    }
  },

  /**
   * Login with table number (for customers)
   */
  loginWithTableNumber: async (tableNumber) => {
    // Handle both string and number inputs
    const tableNum = typeof tableNumber === 'string' ? parseInt(tableNumber, 10) : tableNumber;
    
    // Validate table number
    if (isNaN(tableNum) || tableNum < 1) {
      throw new Error('Please enter a valid table number');
    }
    
    if (appConfig.USE_MOCKS) {
      if (!mockTables.includes(tableNum)) {
        throw new Error(`Table ${tableNum} is not available. Please enter a table number between 1-8.`);
      }
      currentUser = {
        uid: `table-${tableNum}`,
        tableNumber: tableNum,
        role: 'customer',
        orderMode: 'dine-in',
        displayName: `Table ${tableNum}`
      };
      
      // Batch AsyncStorage operations for better performance
      const storageOps = [
        AsyncStorage.setItem('userToken', `table-${tableNum}`),
        AsyncStorage.setItem('userRole', 'customer'),
        AsyncStorage.setItem('tableNumber', tableNum.toString()),
        AsyncStorage.setItem('orderMode', 'dine-in'),
        AsyncStorage.setItem('userData', JSON.stringify(currentUser))
      ];
      
      // Don't await - let it happen in background for faster login
      Promise.all(storageOps).catch((err) => {
        logWarn('AsyncStorage write error (non-blocking):', err);
      });
      
      return currentUser;
    }

    try {
      // Validate table number range (1-8)
      if (tableNum < 1 || tableNum > 8) {
        throw new Error(`Table ${tableNum} is not available. Please enter a table number between 1-8.`);
      }

      // Create user immediately - don't wait for Firestore query
      // This makes login instant instead of waiting for network
      currentUser = {
        uid: `table-${tableNum}`,
        tableNumber: tableNum,
        role: 'customer',
        orderMode: 'dine-in',
        displayName: `Table ${tableNum}`,
        tableId: `table_${tableNum}` // Default ID, will be updated if table exists
      };

      // Batch AsyncStorage operations for better performance
      const storageOps = [
        AsyncStorage.setItem('userToken', `table-${tableNum}`),
        AsyncStorage.setItem('userRole', 'customer'),
        AsyncStorage.setItem('tableNumber', tableNum.toString()),
        AsyncStorage.setItem('orderMode', 'dine-in'),
        AsyncStorage.setItem('userData', JSON.stringify(currentUser))
      ];
      
      // Don't await - let it happen in background for faster login
      Promise.all(storageOps).catch((err) => {
        logWarn('AsyncStorage write error (non-blocking):', err);
      });

      // Check and create table in background (non-blocking)
      // This doesn't delay login - user can proceed immediately
      firestoreService.getCollectionOnce('tables', [
        ['number', '==', tableNum],
        ['active', '==', true]
      ]).then((tables) => {
        if (tables.length === 0) {
          // If no tables found, create it on-the-fly (works in both mock and Firestore mode)
          log(`Table ${tableNum} not found, creating it...`);
          firestoreService.upsertDocument('tables', `table_${tableNum}`, {
            number: tableNum,
            active: true,
            createdAt: new Date().toISOString()
          }).catch((createError) => {
            logError('Error creating table:', createError);
            // Non-blocking - login already succeeded
          });
        } else if (tables.length > 0) {
          // Update tableId if table exists
          const table = tables[0];
          if (table.id && table.id !== currentUser.tableId) {
            currentUser.tableId = table.id;
            // Update stored user data (non-blocking)
            AsyncStorage.setItem('userData', JSON.stringify(currentUser)).catch(() => {});
          }
        }
      }).catch((error) => {
        logWarn('Table check failed (non-blocking):', error);
        // If Firestore fails, still allow login (table is valid 1-8)
        // Try to create table anyway
        firestoreService.upsertDocument('tables', `table_${tableNum}`, {
          number: tableNum,
          active: true,
          createdAt: new Date().toISOString()
        }).catch(() => {
          // Ignore errors - login already succeeded
        });
      });

      return currentUser;
    } catch (error) {
      logError('Table login error:', error);
      // If Firestore fails but table number is valid (1-8), allow login anyway
      if (tableNum >= 1 && tableNum <= 8) {
        logWarn('Firestore error, but table number is valid. Allowing login.');
        currentUser = {
          uid: `table-${tableNum}`,
          tableNumber: tableNum,
          role: 'customer',
          orderMode: 'dine-in',
          displayName: `Table ${tableNum}`,
          tableId: `table_${tableNum}`
        };
        // Batch AsyncStorage operations for better performance
        const storageOps = [
          AsyncStorage.setItem('userToken', `table-${tableNum}`),
          AsyncStorage.setItem('userRole', 'customer'),
          AsyncStorage.setItem('tableNumber', tableNum.toString()),
          AsyncStorage.setItem('orderMode', 'dine-in'),
          AsyncStorage.setItem('userData', JSON.stringify(currentUser))
        ];
        
        // Don't await - let it happen in background for faster login
        Promise.all(storageOps).catch((err) => {
          logWarn('AsyncStorage write error (non-blocking):', err);
        });
        
        return currentUser;
      }
      throw error;
    }
  },

  /**
   * Login with ticket number (for take-out orders)
   */
  loginWithTicketNumber: async (ticketInput) => {
    const ticket = typeof ticketInput === 'string' ? ticketInput.trim() : `${ticketInput}`.trim();
    if (!ticket) {
      throw new Error('Please enter a valid ticket number');
    }

    const sanitizedTicket = ticket.toUpperCase().slice(0, 8);

    const buildUserPayload = (ticketId = null) => ({
      uid: `ticket-${sanitizedTicket}`,
      ticketNumber: sanitizedTicket,
      role: 'customer',
      orderMode: 'take-out',
      displayName: `Ticket ${sanitizedTicket}`,
      ticketId,
    });

    if (appConfig.USE_MOCKS) {
      currentUser = buildUserPayload();
      await AsyncStorage.setItem('userToken', currentUser.uid);
      await AsyncStorage.setItem('userRole', 'customer');
      await AsyncStorage.setItem('ticketNumber', sanitizedTicket);
      await AsyncStorage.setItem('orderMode', 'take-out');
      await AsyncStorage.setItem('userData', JSON.stringify(currentUser));
      return currentUser;
    }

    try {
      let ticketDoc = null;
      try {
        const tickets = await firestoreService.getCollectionOnce('tickets', [
          ['code', '==', sanitizedTicket],
        ]);
        ticketDoc = tickets[0];
      } catch (lookupError) {
        logWarn('Ticket lookup failed, proceeding without Firestore match', lookupError);
      }

      if (!ticketDoc) {
        try {
          await firestoreService.upsertDocument('tickets', `ticket_${sanitizedTicket}`, {
            code: sanitizedTicket,
            active: true,
            createdAt: new Date().toISOString(),
          });
          ticketDoc = { id: `ticket_${sanitizedTicket}`, code: sanitizedTicket };
        } catch (createError) {
          logWarn('Ticket creation failed, fallback to local session only', createError);
        }
      }

      currentUser = buildUserPayload(ticketDoc?.id || null);
      await AsyncStorage.setItem('userToken', currentUser.uid);
      await AsyncStorage.setItem('userRole', 'customer');
      await AsyncStorage.setItem('ticketNumber', sanitizedTicket);
      await AsyncStorage.setItem('orderMode', 'take-out');
      await AsyncStorage.setItem('userData', JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      logError('Ticket login error:', error);
      throw error;
    }
  },

  /**
   * Login with customer name (for take-out orders)
   */
  loginWithCustomerName: async (customerNameInput) => {
    try {
      const name = typeof customerNameInput === 'string' ? customerNameInput.trim() : `${customerNameInput}`.trim();
      if (!name) {
        throw new Error('Please enter your customer name');
      }

      // Sanitize name: allow letters, spaces, hyphens, apostrophes (common in names)
      const sanitizedName = name.replace(/[^a-zA-Z\s\-']/g, '').trim();
      if (!sanitizedName) {
        throw new Error('Please enter a valid customer name');
      }

      // Create a unique ID from the name (for session tracking)
      const nameId = sanitizedName.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

      const buildUserPayload = () => ({
        uid: `customer-${nameId}-${Date.now()}`,
        customerName: sanitizedName,
        role: 'customer',
        orderMode: 'take-out',
        displayName: sanitizedName,
      });

      // Build user payload immediately
      currentUser = buildUserPayload();
      
      // Batch AsyncStorage operations for better performance
      const storageOps = [
        AsyncStorage.setItem('userToken', currentUser.uid),
        AsyncStorage.setItem('userRole', 'customer'),
        AsyncStorage.setItem('customerName', sanitizedName),
        AsyncStorage.setItem('orderMode', 'take-out'),
        AsyncStorage.setItem('userData', JSON.stringify(currentUser))
      ];
      
      // Don't await - let it happen in background for faster login
      Promise.all(storageOps).catch((err) => {
        logWarn('AsyncStorage write error (non-blocking):', err);
      });
      
      // Return immediately without waiting for AsyncStorage
      return currentUser;
    } catch (error) {
      logError('Customer name login error:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    currentUser = null;
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('tableNumber');
    await AsyncStorage.removeItem('ticketNumber');
    await AsyncStorage.removeItem('customerName');
    await AsyncStorage.removeItem('orderMode');
    await AsyncStorage.removeItem('userData');
    return true;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    if (currentUser) {
      return currentUser;
    }

    // Try to restore from AsyncStorage
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        currentUser = JSON.parse(userData);
        return currentUser;
      }
    } catch (error) {
      logError('Error restoring user:', error);
    }

    return null;
  },

  /**
   * Get user role
   */
  getUserRole: async (userId) => {
    if (appConfig.USE_MOCKS) {
      const user = mockUsers.find(u => u.id === userId);
      return user ? user.role : null;
    }

    try {
      const user = await firestoreService.getDocument('users', userId);
      return user ? user.role : null;
    } catch (error) {
      logError('Error getting user role:', error);
      return null;
    }
  },

  /**
   * Get user data from Firestore
   */
  getUserData: async (userId) => {
    if (appConfig.USE_MOCKS) {
      const user = mockUsers.find(u => u.id === userId);
      return user || null;
    }

    try {
      const user = await firestoreService.getDocument('users', userId);
      return user;
    } catch (error) {
      logError('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const user = await authService.getCurrentUser();
    return user !== null;
  },

  /**
   * Auth state change listener (for compatibility with existing code)
   */
  onAuthStateChange: (callback) => {
    // Check for existing session on mount
    authService.getCurrentUser().then((user) => {
      if (user) {
        callback(user);
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function (no-op for now)
    return () => {};
  }
};
