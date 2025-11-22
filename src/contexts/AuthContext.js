import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export const AuthContext = createContext({
  user: null,
  userRole: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setRole: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and last selected role from storage on mount
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    let loadingCompleted = false;
    
    const loadUser = async () => {
      try {
        // 1) Prefer last selected role from AsyncStorage
        const storedRole = await AsyncStorage.getItem('userRole');

        // 2) Try to fetch authenticated user (may be null)
        const currentUser = await authService.getCurrentUser();

        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
        }

        // 3) Determine role priority: storedRole > currentUser.role > leave as-is
        if (storedRole) {
          setUserRole(storedRole);
        } else if (currentUser && currentUser.role) {
          setUserRole(currentUser.role);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        if (isMounted) {
          loadingCompleted = true;
          setLoading(false);
          // Clear timeout if it's still pending
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      }
    };

    // Set a timeout to ensure loading completes even if getCurrentUser hangs
    timeoutId = setTimeout(() => {
      if (isMounted && !loadingCompleted) {
        // Only show warning if loading hasn't completed yet
        console.warn('AuthContext: Loading timeout, setting loading to false');
        setLoading(false);
        loadingCompleted = true;
      }
    }, 3000); // 3 second timeout - increased to reduce false positives

    loadUser();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const login = async (userData) => {
    // Update state immediately for instant UI response
    setUser(userData);
    const roleFromUser = userData?.role || 'customer';
    setUserRole(roleFromUser);
    
    // Persist role asynchronously without blocking
    AsyncStorage.getItem('userRole').then((storedRole) => {
      const roleToUse = roleFromUser || storedRole || 'customer';
      if (roleToUse !== roleFromUser) {
        setUserRole(roleToUse);
      }
      // Persist the role for next time
      AsyncStorage.setItem('userRole', roleToUse).catch(() => {});
    }).catch(() => {
      // If AsyncStorage fails, just use the role from userData
    });
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setUserRole(null);
  };

  const setRole = async (role) => {
    try {
      setUserRole(role);
      await AsyncStorage.setItem('userRole', role);
    } catch (e) {
      console.warn('Failed to persist role, using in-memory value only', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      login, 
      logout, 
      setRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
