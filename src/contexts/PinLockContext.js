import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { hashPassword, verifyPassword } from '../utils/passwordHash';

export const PinLockContext = createContext();

const PIN_STORAGE_KEY = 'app_pin_hash';
const PIN_ENABLED_KEY = 'app_pin_enabled';
const PIN_TIMEOUT_KEY = 'app_pin_timeout_minutes';
const LAST_ACTIVITY_KEY = 'app_last_activity_time';
const LOCK_STATE_KEY = 'app_lock_state';

// Default timeout: 5 minutes (300000 ms)
const DEFAULT_TIMEOUT_MINUTES = 5;

export const PinLockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(DEFAULT_TIMEOUT_MINUTES);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const activityListenersRef = useRef([]);
  const isInitializedRef = useRef(false);

  // Load PIN configuration and state on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const [enabled, timeout, lockState] = await Promise.all([
          AsyncStorage.getItem(PIN_ENABLED_KEY),
          AsyncStorage.getItem(PIN_TIMEOUT_KEY),
          AsyncStorage.getItem(LOCK_STATE_KEY),
        ]);

        const isEnabled = enabled === 'true';
        const timeoutMins = timeout ? parseInt(timeout, 10) : DEFAULT_TIMEOUT_MINUTES;
        const wasLocked = lockState === 'locked';

        setPinEnabled(isEnabled);
        setTimeoutMinutes(timeoutMins);

        if (isEnabled && wasLocked) {
          // App was locked before, restore lock state
          setIsLocked(true);
        } else if (isEnabled) {
          // Check if timeout has expired
          const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
          if (lastActivity) {
            const lastActivityTime = parseInt(lastActivity, 10);
            const now = Date.now();
            const timeoutMs = timeoutMins * 60 * 1000;
            
            if (now - lastActivityTime > timeoutMs) {
              // Timeout expired, lock the app
              setIsLocked(true);
              await AsyncStorage.setItem(LOCK_STATE_KEY, 'locked');
            } else {
              // Still within timeout, update last activity
              await updateLastActivity();
              startActivityTimer();
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize PIN lock:', error);
      } finally {
        setLoading(false);
        isInitializedRef.current = true;
      }
    };

    initialize();
  }, []);

  // Update last activity time
  const updateLastActivity = async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to update last activity:', error);
    }
  };

  // Start activity timer - clears existing timer and starts new one
  const startActivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!pinEnabled || isLocked) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(async () => {
      setIsLocked(true);
      await AsyncStorage.setItem(LOCK_STATE_KEY, 'locked');
    }, timeoutMs);
  }, [pinEnabled, timeoutMinutes, isLocked]);

  // Reset activity timer on user interaction
  const resetActivityTimer = useCallback(() => {
    if (!pinEnabled || isLocked || !isInitializedRef.current) {
      return;
    }

    updateLastActivity();
    startActivityTimer();
  }, [pinEnabled, isLocked, startActivityTimer]);

  // Monitor app state changes
  useEffect(() => {
    if (!pinEnabled || loading) return;

    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - save last activity time
        await updateLastActivity();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else if (nextAppState === 'active') {
        // App coming to foreground - check if lock is needed
        const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity) {
          const lastActivityTime = parseInt(lastActivity, 10);
          const now = Date.now();
          const timeoutMs = timeoutMinutes * 60 * 1000;
          
          if (now - lastActivityTime > timeoutMs) {
            // Timeout expired while app was in background
            setIsLocked(true);
            await AsyncStorage.setItem(LOCK_STATE_KEY, 'locked');
          } else {
            // Still within timeout, resume activity timer
            startActivityTimer();
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [pinEnabled, timeoutMinutes, startActivityTimer, loading]);

  // Start timer when PIN is enabled and app is unlocked
  useEffect(() => {
    if (pinEnabled && !isLocked && isInitializedRef.current) {
      startActivityTimer();
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pinEnabled, isLocked, startActivityTimer]);

  // Global activity monitoring - to be called from app-level event handlers
  useEffect(() => {
    if (!pinEnabled || isLocked || !isInitializedRef.current) return;

    // Set up global event listeners for user activity
    const handleActivity = () => {
      resetActivityTimer();
    };

    // Store listeners for cleanup
    activityListenersRef.current.push(handleActivity);

    // Return cleanup function
    return () => {
      activityListenersRef.current = activityListenersRef.current.filter(
        l => l !== handleActivity
      );
    };
  }, [pinEnabled, isLocked, resetActivityTimer]);

  // Unlock with PIN
  const unlock = useCallback(async (pin) => {
    try {
      const pinHash = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (!pinHash) {
        return { success: false, error: 'No PIN is set' };
      }

      const isValid = verifyPassword(pin, pinHash);
      if (isValid) {
        setIsLocked(false);
        await AsyncStorage.setItem(LOCK_STATE_KEY, 'unlocked');
        await updateLastActivity();
        startActivityTimer();
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect PIN' };
      }
    } catch (error) {
      console.error('Unlock error:', error);
      return { success: false, error: 'Failed to unlock' };
    }
  }, [startActivityTimer]);

  // Set PIN
  const setPin = useCallback(async (pin) => {
    try {
      if (!pin || pin.length < 4) {
        return { success: false, error: 'PIN must be at least 4 digits' };
      }

      const pinHash = hashPassword(pin);
      await AsyncStorage.setItem(PIN_STORAGE_KEY, pinHash);
      await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
      setPinEnabled(true);
      setIsLocked(false);
      await AsyncStorage.setItem(LOCK_STATE_KEY, 'unlocked');
      await updateLastActivity();
      startActivityTimer();
      return { success: true };
    } catch (error) {
      console.error('Set PIN error:', error);
      return { success: false, error: 'Failed to set PIN' };
    }
  }, [startActivityTimer]);

  // Change PIN (requires current PIN)
  const changePin = useCallback(async (currentPin, newPin) => {
    try {
      // Verify current PIN first
      const pinHash = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (!pinHash) {
        return { success: false, error: 'No PIN is set' };
      }

      const isValid = verifyPassword(currentPin, pinHash);
      if (!isValid) {
        return { success: false, error: 'Current PIN is incorrect' };
      }

      // Set new PIN
      if (!newPin || newPin.length < 4) {
        return { success: false, error: 'PIN must be at least 4 digits' };
      }

      const newPinHash = hashPassword(newPin);
      await AsyncStorage.setItem(PIN_STORAGE_KEY, newPinHash);
      await updateLastActivity();
      return { success: true };
    } catch (error) {
      console.error('Change PIN error:', error);
      return { success: false, error: 'Failed to change PIN' };
    }
  }, []);

  // Reset PIN (for admin - requires admin password)
  const resetPin = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PIN_STORAGE_KEY);
      await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
      await AsyncStorage.setItem(LOCK_STATE_KEY, 'unlocked');
      setPinEnabled(false);
      setIsLocked(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Reset PIN error:', error);
      return { success: false, error: 'Failed to reset PIN' };
    }
  }, []);

  // Enable/Disable PIN lock
  const setPinEnabledState = useCallback(async (enabled) => {
    try {
      await AsyncStorage.setItem(PIN_ENABLED_KEY, enabled.toString());
      setPinEnabled(enabled);
      
      if (!enabled) {
        setIsLocked(false);
        await AsyncStorage.setItem(LOCK_STATE_KEY, 'unlocked');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        await updateLastActivity();
        startActivityTimer();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Set PIN enabled error:', error);
      return { success: false, error: 'Failed to update PIN lock state' };
    }
  }, [startActivityTimer]);

  // Set timeout minutes
  const setTimeoutMinutesValue = useCallback(async (minutes) => {
    try {
      if (minutes < 1 || minutes > 60) {
        return { success: false, error: 'Timeout must be between 1 and 60 minutes' };
      }

      await AsyncStorage.setItem(PIN_TIMEOUT_KEY, minutes.toString());
      setTimeoutMinutes(minutes);
      
      // Restart timer with new timeout
      if (pinEnabled && !isLocked) {
        startActivityTimer();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Set timeout error:', error);
      return { success: false, error: 'Failed to update timeout' };
    }
  }, [pinEnabled, isLocked, startActivityTimer]);

  // Check if PIN is set
  const checkPinExists = useCallback(async () => {
    try {
      const pinHash = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      return !!pinHash;
    } catch (error) {
      return false;
    }
  }, []);

  // Manual lock (for testing or explicit lock action)
  const lock = useCallback(async () => {
    if (!pinEnabled) return;
    setIsLocked(true);
    await AsyncStorage.setItem(LOCK_STATE_KEY, 'locked');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [pinEnabled]);

  // Export activity reset function for external use
  const registerActivity = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  const value = {
    isLocked,
    pinEnabled,
    timeoutMinutes,
    loading,
    unlock,
    setPin,
    changePin,
    resetPin,
    setPinEnabled: setPinEnabledState,
    setTimeoutMinutes: setTimeoutMinutesValue,
    checkPinExists,
    lock,
    registerActivity, // Call this from app-level to reset timer on user interaction
  };

  return <PinLockContext.Provider value={value}>{children}</PinLockContext.Provider>;
};

export const usePinLock = () => {
  const context = useContext(PinLockContext);
  if (!context) {
    throw new Error('usePinLock must be used within PinLockProvider');
  }
  return context;
};

