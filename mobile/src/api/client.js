import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api', timeout: 12000 });
api.interceptors.request.use(async (request) => { const token = await AsyncStorage.getItem('feedants_token'); if (token) request.headers.Authorization = `Bearer ${token}`; return request; });
export const readableError = (error) => error.response?.data?.error || error.message || 'Unable to reach the server.';

