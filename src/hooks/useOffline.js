import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

/**
 * Hook to get offline status and queue size
 */
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(offlineService.getNetworkStatus());
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Get initial queue size
    offlineService.getQueueSize().then(setQueueSize);

    // Subscribe to network status changes
    const unsubscribe = offlineService.onNetworkChange((online) => {
      setIsOnline(online);
      // Update queue size when network status changes
      offlineService.getQueueSize().then(setQueueSize);
    });

    // Periodically update queue size
    const interval = setInterval(() => {
      offlineService.getQueueSize().then(setQueueSize);
    }, 5000); // Check every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    queueSize,
    syncPendingOperations: () => offlineService.syncPendingOperations(),
  };
};

