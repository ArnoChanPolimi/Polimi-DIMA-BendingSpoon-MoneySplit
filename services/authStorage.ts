// services/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from './AuthContext';

const TOKEN = 'ms_token';
const USER  = 'ms_user';

const isWeb = Platform.OS === 'web';

// 统一封装：Web ⟶ AsyncStorage；iOS/Android ⟶ SecureStore
async function getItem(key: string): Promise<string | null> {
  try {
    if (isWeb) return await AsyncStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveSession(s: Session) {
  await setItem(TOKEN, s.token);
  await setItem(USER, JSON.stringify(s.user));
}

export async function loadSession(): Promise<Session | null> {
  const token = await getItem(TOKEN);
  const userStr = await getItem(USER);
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export async function clearSession() {
  await deleteItem(TOKEN);
  await deleteItem(USER);
}