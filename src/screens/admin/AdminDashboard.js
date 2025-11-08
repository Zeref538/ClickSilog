import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Icon from '../../components/ui/Icon';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { logout } = React.useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const MenuCard = ({ icon, iconColor, title, subtitle, onPress }) => {
    // Safety guard for spacing
    const safeSpacing = theme?.spacing ?? { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

    return (
      <AnimatedButton
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          padding: 18,
          marginBottom: safeSpacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={onPress}
      >
        <View
          style={{
            width: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: safeSpacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: hexToRgba(iconColor, 0.1), // Soft 10% opacity halo
              padding: safeSpacing.md,
              borderRadius: 999, // Perfect circle
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: iconColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Icon
              name={icon}
              library="ionicons"
              size={28}
              color={iconColor}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.h4,
              {
                color: theme.colors.text,
                marginBottom: safeSpacing.xs,
              }
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              typography.caption,
              {
                color: theme.colors.textSecondary,
              }
            ]}
          >
            {subtitle}
          </Text>
        </View>
        <Icon
          name="chevron-forward"
          library="ionicons"
          size={24}
          color={iconColor}
          style={{ marginLeft: safeSpacing.sm }}
        />
      </AnimatedButton>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingTop: spacing.xl + spacing.sm,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Icon
              name="settings"
              library="ionicons"
              size={28}
              color={theme.colors.primary}
              style={{ marginRight: spacing.sm }}
            />
            <View>
              <Text style={[
                styles.title,
                {
                  color: theme.colors.text,
                  ...typography.h2,
                  marginBottom: spacing.xs,
                }
              ]}>
                Admin Dashboard
              </Text>
              <Text style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  ...typography.caption,
                }
              ]}>
                Manage your restaurant
              </Text>
          </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ThemeToggle />
            <AnimatedButton
              style={[
                {
                  backgroundColor: theme.colors.error + '20',
                  borderColor: theme.colors.error,
                  borderRadius: borderRadius.md,
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderWidth: 1.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }
              ]}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" library="ionicons" size={18} color={theme.colors.error} />
              <Text style={[{ color: theme.colors.error, ...typography.captionBold }]}>
                Logout
              </Text>
            </AnimatedButton>
          </View>
          </View>
          </View>

      <ScrollView contentContainerStyle={[
        styles.content,
        {
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }
      ]} showsVerticalScrollIndicator={false}>
        <MenuCard
          icon="restaurant"
          iconColor={theme.colors.primary}
          title="Menu Management"
          subtitle="Add, edit, and manage menu items"
          onPress={() => navigation.navigate('MenuManager')}
        />

        <MenuCard
          icon="add-circle"
          iconColor={theme.colors.secondary}
          title="Add-on Management"
          subtitle="Manage add-ons (rice, drinks, extras)"
          onPress={() => navigation.navigate('AddOnsManager')}
        />

        <MenuCard
          icon="pricetag"
          iconColor={theme.colors.info}
          title="Discount Management"
          subtitle="Create and manage discount codes"
          onPress={() => navigation.navigate('DiscountManager')}
        />

        <MenuCard
          icon="people"
          iconColor={theme.colors.warning}
          title="User Management"
          subtitle="Manage staff accounts and roles"
          onPress={() => navigation.navigate('UserManager')}
        />

        <MenuCard
          icon="bar-chart"
          iconColor={theme.colors.success}
          title="Sales Report"
          subtitle="View sales analytics and reports"
          onPress={() => navigation.navigate('SalesReport')}
        />

        <MenuCard
          icon="cloud-upload"
          iconColor={theme.colors.info}
          title="Seed Database"
          subtitle="Populate Firestore with initial data"
          onPress={() => navigation.navigate('SeedDatabase')}
        />

        <MenuCard
          icon="lock-closed"
          iconColor={theme.colors.primary}
          title="Payment Settings"
          subtitle="Configure payment confirmation password"
          onPress={() => navigation.navigate('PaymentSettings')}
        />
             </ScrollView>

             {/* Logout Confirmation Modal */}
             <ConfirmationModal
               visible={showLogoutModal}
               onClose={() => setShowLogoutModal(false)}
               onConfirm={confirmLogout}
               title="Logout"
               message="Are you sure you want to logout?"
               confirmText="Logout"
               cancelText="Cancel"
               type="warning"
               icon="log-out-outline"
             />
           </View>
         );
       };

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  title: {
    // Typography handled via theme
  },
  subtitle: {
    // Typography handled via theme
  },
  content: {
    // Padding handled inline
  },
  card: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5
  },
  cardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    // Typography handled via theme
  },
  cardSubtitle: {
    // Typography handled via theme
  }
});

export default AdminDashboard;
