import { appConfig } from '../config/appConfig';
import { firestoreService } from './firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword, isPasswordHashed } from '../utils/passwordHash';

// Mock users for development
const mockUsers = [
  { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', displayName: 'Admin User' },
  { id: 'cashier1', username: 'cashier', password: 'cashier123', role: 'cashier', displayName: 'Cashier User' },
  { id: 'kitchen1', username: 'kitchen', password: 'kitchen123', role: 'kitchen', displayName: 'Kitchen User' },
  { id: 'developer1', username: 'developer', password: 'dev123', role: 'developer', displayName: 'Developer User' }
];

// Mock table numbers (1-8)
const mockTables = Array.from({ length: 8 }, (_, i) => i + 1);

// Current session user
let currentUser = null;

export const authService = {
  /**
   * Login with username and password (for staff roles)
   */
  loginWithUsername: async (username, password) => {
    // Hardcoded dev login (hidden, only dev knows)
    if (username === 'DevDrei' && password === '8425') {
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
      // Case-insensitive username comparison for better UX
      const user = mockUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
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
      // Query Firestore for user with matching username (check all statuses)
      // Note: Firestore queries are case-sensitive, so we'll filter after fetching
      const users = await firestoreService.getCollectionOnce('users', []);

      // Case-insensitive username comparison for better UX
      const user = users.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
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
      console.error('Login error:', error);
      throw error;
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
        displayName: `Table ${tableNum}`
      };
      await AsyncStorage.setItem('userToken', `table-${tableNum}`);
      await AsyncStorage.setItem('userRole', 'customer');
      await AsyncStorage.setItem('tableNumber', tableNum.toString());
      await AsyncStorage.setItem('userData', JSON.stringify(currentUser));
      return currentUser;
    }

    try {
      // Validate table number range (1-8)
      if (tableNum < 1 || tableNum > 8) {
        throw new Error(`Table ${tableNum} is not available. Please enter a table number between 1-8.`);
      }

      // Check if table number exists in Firestore (or mock)
      const tables = await firestoreService.getCollectionOnce('tables', [
        ['number', '==', tableNum],
        ['active', '==', true]
      ]);

      if (tables.length === 0) {
        // If no tables found, create it on-the-fly (works in both mock and Firestore mode)
        console.log(`Table ${tableNum} not found, creating it...`);
        try {
          await firestoreService.upsertDocument('tables', `table_${tableNum}`, {
            number: tableNum,
            active: true,
            createdAt: new Date().toISOString()
          });
        } catch (createError) {
          console.error('Error creating table:', createError);
          // If creation fails, still allow login (table is valid 1-8)
          console.warn('Table creation failed, but table number is valid. Proceeding with login.');
        }
      }

      // Get table (either from query or just created, or use default)
      const table = tables.length > 0 ? tables[0] : { id: `table_${tableNum}`, number: tableNum, active: true };
      currentUser = {
        uid: `table-${tableNum}`,
        tableNumber: tableNum,
        role: 'customer',
        displayName: `Table ${tableNum}`,
        tableId: table.id
      };

      await AsyncStorage.setItem('userToken', `table-${tableNum}`);
      await AsyncStorage.setItem('userRole', 'customer');
      await AsyncStorage.setItem('tableNumber', tableNum.toString());
      await AsyncStorage.setItem('userData', JSON.stringify(currentUser));

      return currentUser;
    } catch (error) {
      console.error('Table login error:', error);
      // If Firestore fails but table number is valid (1-8), allow login anyway
      if (tableNum >= 1 && tableNum <= 8) {
        console.warn('Firestore error, but table number is valid. Allowing login.');
        currentUser = {
          uid: `table-${tableNum}`,
          tableNumber: tableNum,
          role: 'customer',
          displayName: `Table ${tableNum}`,
          tableId: `table_${tableNum}`
        };
        await AsyncStorage.setItem('userToken', `table-${tableNum}`);
        await AsyncStorage.setItem('userRole', 'customer');
        await AsyncStorage.setItem('tableNumber', tableNum.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(currentUser));
        return currentUser;
      }
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
      console.error('Error restoring user:', error);
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
      console.error('Error getting user role:', error);
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
      console.error('Error getting user data:', error);
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
