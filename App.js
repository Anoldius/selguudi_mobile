import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

function DummyHome({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Karibu {user?.business_name || user?.username}!</Text>
      <Text style={styles.subtext}>Mobile App Home ipo tayari.</Text>
      <Text style={styles.logout} onPress={logout}>Ondoka (Logout)</Text>
    </View>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Inapakia Selguudi...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={DummyHome} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
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
  center: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#10b981', fontSize: 20, fontWeight: 'bold' },
  subtext: { color: '#94a3b8', marginTop: 8 },
  logout: { color: '#ef4444', marginTop: 24, fontWeight: 'bold' }
});