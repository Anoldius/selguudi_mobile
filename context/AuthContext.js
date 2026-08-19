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
      const token = await AsyncStorage.getItem('access_token');
      const userInfo = await AsyncStorage.getItem('user_info');
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await apiClient.post('auth/login/', { username, password });
      const { access, refresh, business_name, role, username: uname } = res.data;

      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      const userData = { username: uname, business_name, role };
      await AsyncStorage.setItem('user_info', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.detail || 'Login imeshindikana!',
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
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);