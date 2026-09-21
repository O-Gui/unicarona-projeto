import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

export const ACCESS_TOKEN_KEY = 'unicarona.accessToken';
export const USER_KEY = 'unicarona.user';

export async function saveSession(accessToken: string, user: User) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getSession() {
  const [storedUser, storedToken] = await Promise.all([
    AsyncStorage.getItem(USER_KEY),
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  ]);

  return {
    user: storedUser ? (JSON.parse(storedUser) as User) : null,
    token: storedToken,
  };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_KEY]);
}
