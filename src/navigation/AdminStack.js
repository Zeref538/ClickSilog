import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import MenuManager from '../screens/admin/MenuManager';
import AddOnsManager from '../screens/admin/AddOnsManager';
import DiscountManager from '../screens/admin/DiscountManager';
import SalesReportScreen from '../screens/admin/SalesReportScreen';
import UserManager from '../screens/admin/UserManager';
import SeedDatabaseScreen from '../screens/admin/SeedDatabaseScreen';
import PaymentSettingsScreen from '../screens/admin/PaymentSettingsScreen';

const Stack = createStackNavigator();

const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#D97706',
        elevation: 0,
        shadowOpacity: 0,
        height: 72
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: 0.3 },
      headerBackTitleVisible: false
    }}
  >
    <Stack.Screen
      name="Admin"
      component={AdminDashboard}
      options={{
        headerShown: false
      }}
    />
           <Stack.Screen name="MenuManager" component={MenuManager} options={{ headerShown: false }} />
           <Stack.Screen name="AddOnsManager" component={AddOnsManager} options={{ headerShown: false }} />
           <Stack.Screen name="DiscountManager" component={DiscountManager} options={{ headerShown: false }} />
           <Stack.Screen name="UserManager" component={UserManager} options={{ headerShown: false }} />
           <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ headerShown: false }} />
           <Stack.Screen name="SeedDatabase" component={SeedDatabaseScreen} options={{ headerShown: false }} />
           <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AdminStack;
