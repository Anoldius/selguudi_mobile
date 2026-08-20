import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList 
} from '@react-navigation/drawer';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

import DashboardScreen from './screens/DashboardScreen';
import POSScreen from './screens/POSScreen';
import InventoryScreen from './screens/InventoryScreen';
import DebtsScreen from './screens/DebtsScreen';
import ReportsScreen from './screens/ReportsScreen';

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Store 
} from 'lucide-react-native';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Content ya Side Bar (Drawer)
function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  const businessName = user?.business?.name || user?.business_name || "DUKA LAKO";

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
        
        {/* Header ya Side Bar */}
        <View style={drawerStyles.header}>
          <View style={drawerStyles.iconBadge}>
            <Store size={24} color="#10b981" />
          </View>
          <Text style={drawerStyles.brandTitle}>Selguudi <Text style={{ color: '#10b981' }}>POS</Text></Text>
          <Text style={drawerStyles.businessName} numberOfLines={1}>{businessName}</Text>
        </View>

        <View style={drawerStyles.divider} />

        {/* Orodha ya Menu Links */}
        <DrawerItemList {...props} />

      </DrawerContentScrollView>

      {/* Kitufe cha Logout Chini ya Side Bar */}
      <TouchableOpacity onPress={logout} style={drawerStyles.logoutBtn}>
        <LogOut size={18} color="#f87171" />
        <Text style={drawerStyles.logoutText}>Ondoka (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

// Main Drawer Navigation Setup
function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#020617',
          borderBottomWidth: 1,
          borderBottomColor: '#1e293b',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
        },
        drawerStyle: {
          backgroundColor: '#020617',
          width: 280,
        },
        drawerActiveBackgroundColor: 'rgba(16, 185, 129, 0.15)',
        drawerActiveTintColor: '#10b981',
        drawerInactiveTintColor: '#94a3b8',
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Muhtasari (Home)',
          drawerIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="POS" 
        component={POSScreen} 
        options={{
          title: 'Mauzo (POS)',
          drawerIcon: ({ color }) => <ShoppingCart size={20} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          title: 'Usimamizi wa Stoko',
          drawerIcon: ({ color }) => <Package size={20} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Debts" 
        component={DebtsScreen} 
        options={{
          title: 'Daftari la Madeni',
          drawerIcon: ({ color }) => <CreditCard size={20} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{
          title: 'Ripoti za Mauzo',
          drawerIcon: ({ color }) => <BarChart3 size={20} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// App Root Navigation
function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.text}>Inapakia Selguudi...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainApp" component={MainDrawerNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    backgroundColor: '#020617', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 12
  },
  text: { 
    color: '#94a3b8', 
    fontSize: 14, 
    fontWeight: '500' 
  },
});

const drawerStyles = StyleSheet.create({
  header: {
    padding: 16,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  businessName: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    marginBottom: Platform.OS === 'android' ? 16 : 24,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
  },
});