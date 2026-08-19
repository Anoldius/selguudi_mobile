import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tumia live Render API yako au Local IP ya PC ikiwa unatesiti kwenye local network
const API_BASE_URL = 'https://selguudi-backend.onrender.com/api/'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;