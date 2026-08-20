import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Screens Zote
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

import DashboardScreen from './screens/DashboardScreen';
import POSScreen from './screens/POSScreen';
import InventoryScreen from './screens/InventoryScreen';
import DebtsScreen from './screens/DebtsScreen';
import ReportsScreen from './screens/ReportsScreen';

import { LayoutDashboard, ShoppingCart, Package, CreditCard, BarChart3 } from 'lucide-react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopColor: '#1e293b',
          height: 70, // Imeongezwa ili isibanwe na navigation bar ya simu
          paddingBottom: 12, // Icons zimepandishwa juu kidogo
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="POS" 
        component={POSScreen} 
        options={{
          tabBarLabel: 'Mauzo',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          tabBarLabel: 'Stoko',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Debts" 
        component={DebtsScreen} 
        options={{
          tabBarLabel: 'Madeni',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{
          tabBarLabel: 'Ripoti',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 2. Main Navigation Wrapper
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
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