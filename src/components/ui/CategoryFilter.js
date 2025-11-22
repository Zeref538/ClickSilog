import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Warm color palette
const PALETTE = {
  red: '#E52020',
  orange: '#FBA518',
  yellow: '#F9CB43',
  olive: '#A89C29',
};

const CategoryFilter = ({ categories = [], selectedCategory, onSelectCategory }) => {
  const { theme, spacing, borderRadius, typography } = useTheme();

  // Base button style - compact with warm colors
  const baseButtonStyle = {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingHorizontal: spacing.md, 
            paddingVertical: spacing.xs + 2,
            flexGrow: 0,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => onSelectCategory(null)}
          style={[
            baseButtonStyle,
            {
              backgroundColor: !selectedCategory ? PALETTE.orange : theme.colors.surface,
              borderColor: !selectedCategory ? PALETTE.orange : theme.colors.border,
              flexShrink: 0,
              ...(!selectedCategory && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 1,
              }),
            }
          ]}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.tabText,
              {
              fontSize: 13,
              fontWeight: !selectedCategory ? '600' : '500',
              color: !selectedCategory ? '#FFFFFF' : theme.colors.text,
              textAlign: 'center',
              flexShrink: 0,
            }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={false}
        >
          {'All'}
        </Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => onSelectCategory(c.id)}
            style={[
              baseButtonStyle,
              {
                backgroundColor: selectedCategory === c.id ? PALETTE.orange : theme.colors.surface,
                borderColor: selectedCategory === c.id ? PALETTE.orange : theme.colors.border,
                flexShrink: 0,
                ...(selectedCategory === c.id && {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  elevation: 1,
                }),
              }
            ]}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.tabText,
                {
              fontSize: 13,
              fontWeight: selectedCategory === c.id ? '600' : '500',
              color: selectedCategory === c.id ? '#FFFFFF' : theme.colors.text,
              textAlign: 'center',
              flexShrink: 0,
            }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={false}
        >
          {c.name}
        </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  scrollContent: {
    // Padding handled inline with theme spacing
  },
  tab: {
    // Base styles moved inline for better control
  },
  tabText: {
    backgroundColor: 'transparent',
  },
  underline: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  }
});

export default CategoryFilter;
