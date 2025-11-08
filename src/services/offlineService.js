import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@clicksilog_cache_';
const QUEUE_PREFIX = '@clicksilog_queue_';
const CACHE_TIMESTAMP_PREFIX = '@clicksilog_timestamp_';
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class OfflineService {
  constructor() {
    this.isOnline = true; // Assume online by default
    this.listeners = new Set();
    this.syncInProgress = false;
  }

  /**
   * Check network status by attempting a simple fetch
   * This is a fallback method when network detection libraries aren't available
   */
  async checkNetworkStatus() {
    try {
      // Simple network check - try to fetch a small resource
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set network status manually (can be called from UI components)
   */
  setNetworkStatus(isOnline) {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;
    
    if (!wasOnline && isOnline) {
      // Connection restored - trigger sync
      this.syncPendingOperations();
    }
    
    // Notify listeners if state changed
    if (wasOnline !== isOnline) {
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to network status changes
   */
  onNetworkChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of network status change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return this.isOnline;
  }

  /**
   * Cache collection data locally
   */
  async cacheCollection(collectionName, data) {
    try {
      const cacheKey = `${CACHE_PREFIX}${collectionName}`;
      const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${collectionName}`;
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
      console.error(`Error caching collection ${collectionName}:`, error);
    }
  }

  /**
   * Get cached collection data
   */
  async getCachedCollection(collectionName) {
    try {
      const cacheKey = `${CACHE_PREFIX}${collectionName}`;
      const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${collectionName}`;
      
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const timestamp = await AsyncStorage.getItem(timestampKey);
      
      if (!cachedData || !timestamp) {
        return null;
      }
      
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > MAX_CACHE_AGE) {
        // Cache expired
        await this.clearCache(collectionName);
        return null;
      }
      
      return JSON.parse(cachedData);
    } catch (error) {
      console.error(`Error getting cached collection ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Clear cache for a collection
   */
  async clearCache(collectionName) {
    try {
      const cacheKey = `${CACHE_PREFIX}${collectionName}`;
      const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${collectionName}`;
      
      await AsyncStorage.removeItem(cacheKey);
      await AsyncStorage.removeItem(timestampKey);
    } catch (error) {
      console.error(`Error clearing cache for ${collectionName}:`, error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing all caches:', error);
    }
  }

  /**
   * Queue a write operation for offline sync
   */
  async queueOperation(operation) {
    try {
      const queueKey = `${QUEUE_PREFIX}operations`;
      const existingQueue = await AsyncStorage.getItem(queueKey);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      queue.push({
        ...operation,
        id: operation.id || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      });
      
      await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
      
      // If online, try to sync immediately
      if (this.isOnline) {
        this.syncPendingOperations();
      }
    } catch (error) {
      console.error('Error queueing operation:', error);
    }
  }

  /**
   * Get pending operations queue
   */
  async getPendingOperations() {
    try {
      const queueKey = `${QUEUE_PREFIX}operations`;
      const queue = await AsyncStorage.getItem(queueKey);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  /**
   * Remove operation from queue
   */
  async removeOperation(operationId) {
    try {
      const queueKey = `${QUEUE_PREFIX}operations`;
      const queue = await this.getPendingOperations();
      const filtered = queue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(queueKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing operation:', error);
    }
  }

  /**
   * Clear all queued operations
   */
  async clearQueue() {
    try {
      const queueKey = `${QUEUE_PREFIX}operations`;
      await AsyncStorage.removeItem(queueKey);
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  /**
   * Sync pending operations when connection is restored
   */
  async syncPendingOperations() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const queue = await this.getPendingOperations();
      
      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }

      // Import firestoreService dynamically to avoid circular dependencies
      const { firestoreService } = await import('./firestoreService');
      
      const results = [];
      
      for (const operation of queue) {
        try {
          let result;
          
          switch (operation.type) {
            case 'add':
              result = await firestoreService.addDocument(operation.collection, operation.data);
              break;
            case 'update':
              result = await firestoreService.updateDocument(operation.collection, operation.id, operation.data);
              break;
            case 'upsert':
              result = await firestoreService.upsertDocument(operation.collection, operation.id, operation.data);
              break;
            case 'delete':
              result = await firestoreService.deleteDocument(operation.collection, operation.id);
              break;
            default:
              console.warn('Unknown operation type:', operation.type);
              continue;
          }
          
          results.push({ operation, success: true, result });
          await this.removeOperation(operation.id);
        } catch (error) {
          console.error(`Error syncing operation ${operation.id}:`, error);
          results.push({ operation, success: false, error });
          
          // If it's a permanent error (not network), remove from queue
          if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
            await this.removeOperation(operation.id);
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error syncing pending operations:', error);
      return [];
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get queue size
   */
  async getQueueSize() {
    const queue = await this.getPendingOperations();
    return queue.length;
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

