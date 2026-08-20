import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token') || await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('user_info') || await AsyncStorage.getItem('userData');
      
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Auth check error:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await apiClient.post('auth/login/', { username, password });
      const { access, refresh, business_name, role, username: uname, business } = res.data;

      const userData = { 
        username: uname, 
        business_name: business_name || business?.name, 
        role,
        business 
      };

      // Hifadhi kwenye keys zote ili kuzuia mismatch kwenye Axios au Context
      await AsyncStorage.multiSet([
        ['access_token', access],
        ['userToken', access],
        ['refresh_token', refresh || ''],
        ['user_info', JSON.stringify(userData)],
        ['userData', JSON.stringify(userData)]
      ]);

      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.detail || 'Login imeshindikana! Angalia username au password.',
      };
    }
  };

  const register = async (formData) => {
    try {
      await apiClient.post('auth/register/', formData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Usajili umeshindikana!',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token', 
        'userToken', 
        'refresh_token', 
        'user_info', 
        'userData'
      ]);
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null); // Hii inalazimisha Stack Navigator kurudi kwenye LoginScreen mara moja
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);