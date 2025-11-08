import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { appConfig } from '../../config/appConfig';

const HeaderHomeButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const goToHome = () => {
    const rootNavigation = navigation.getParent() || navigation;
    
    // Only navigate to Home if it exists (mock mode)
    if (appConfig.USE_MOCKS) {
      try {
        rootNavigation.navigate('Home');
      } catch (e) {
        // If Home doesn't exist, try to go back
        if (rootNavigation.canGoBack()) {
          rootNavigation.goBack();
        }
      }
    } else {
      // In production mode, navigate to Login or go back
      try {
        rootNavigation.navigate('Login');
      } catch (e) {
        if (rootNavigation.canGoBack()) {
          rootNavigation.goBack();
        }
      }
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.primaryLight + '30', 
          borderColor: theme.colors.primary + '40'
        }
      ]} 
      onPress={goToHome} 
      activeOpacity={0.7}
    >
      <Text style={styles.homeEmoji}>🏠</Text>
      <Text style={[styles.text, { color: theme.colors.primary }]}>Home</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 6
  },
  homeEmoji: {
    fontSize: 14
  },
  text: { 
    fontWeight: '900', 
    fontSize: 13,
    letterSpacing: 0.3
  }
});

export default HeaderHomeButton;
