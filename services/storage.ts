// services/storage.ts
import { Platform } from "react-native";

let AsyncStorage: any = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export async function storageGet<T>(key: string, fallback: T): Promise<T> {
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    }
    if (AsyncStorage) {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    }
  } catch (e) {
    console.error("storageGet failed:", e);
  }
  return fallback;
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  try {
    const raw = JSON.stringify(value);
    if (Platform.OS === "web") return void localStorage.setItem(key, raw);
    if (AsyncStorage) return void (await AsyncStorage.setItem(key, raw));
  } catch (e) {
    console.error("storageSet failed:", e);
  }
}
