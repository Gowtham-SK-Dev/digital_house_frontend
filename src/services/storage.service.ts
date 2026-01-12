/**
 * Storage Service for local data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Auth
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  // User
  async setCurrentUser(user: any): Promise<void> {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
  }

  async getCurrentUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  async removeCurrentUser(): Promise<void> {
    await AsyncStorage.removeItem('currentUser');
  }

  // Preferences
  async setPreference(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(`pref_${key}`, JSON.stringify(value));
  }

  async getPreference(key: string): Promise<any | null> {
    const value = await AsyncStorage.getItem(`pref_${key}`);
    return value ? JSON.parse(value) : null;
  }

  // Cache
  async setCacheData(key: string, data: any, ttl?: number): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 60 * 60 * 1000, // Default 1 hour
    };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  }

  async getCacheData(key: string): Promise<any | null> {
    const cached = await AsyncStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const { data, timestamp, ttl } = JSON.parse(cached);
    if (Date.now() - timestamp > ttl) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data;
  }

  async clearCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  }

  // Generic
  async setItem(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async getItem(key: string): Promise<any | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storageService = new StorageService();
