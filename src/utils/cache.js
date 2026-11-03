import AsyncStorage from '@react-native-async-storage/async-storage';

// Tiny JSON cache over AsyncStorage for the offline behaviour: the last
// good product list is kept so browsing still works without a
// connection. Every failure is swallowed — a cache miss is never an error.

export async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function writeCache(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
