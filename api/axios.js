import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://selguudi-backend.onrender.com/api/'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Ambatanisha Bearer Token kwenye kila Request
apiClient.interceptors.request.use(
  async (config) => {
    // Tumia 'userToken' au 'access_token' kulingana na tunavyosave
    const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Kama Token ime-expire (401 Error), logout kiotomatiki na urudi Login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export default apiClient;