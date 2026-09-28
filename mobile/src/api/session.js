import AsyncStorage from '@react-native-async-storage/async-storage';
export async function ensureSession() {
  if (await AsyncStorage.getItem('feedants_token')) return;
  throw new Error('Please log in to continue.');
}
export const saveSession = (token) => AsyncStorage.setItem('feedants_token', token);
export const clearSession = () => AsyncStorage.removeItem('feedants_token');

