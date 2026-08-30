import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    loadValue();
  }, [key]);

  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting ${key}:`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue, isLoading };
}

export function useOnboardingComplete() {
  return useStorage<boolean>('onboarding_complete', false);
}

export function useUserPreferences() {
  return useStorage('user_preferences', {
    focusDuration: 25,
    breakDuration: 5,
    notificationsEnabled: true,
    hapticsEnabled: true,
    soundEnabled: true,
    ambientSound: 'rain',
    theme: 'dark',
    reducedMotion: false,
    autoStartBreak: false,
    dailyGoal: 60,
  });
}

export function useRecentSearches() {
  return useStorage<string[]>('recent_searches', []);
}