'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences, Subject, Exam, FocusSession, Reward, Achievement, Notification, StudyMission, AIInsight, QuizSession, AIMessage } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> };

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AUTH_STORAGE_KEY = 'examfocus_auth';
const USER_STORAGE_KEY = 'examfocus_user';

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'ADD_XP':
      if (!state.user) return state;
      let newXP = state.user.xp + action.payload;
      let newLevel = state.user.level;
      let xpToNext = state.user.xpToNextLevel;
      while (newXP >= xpToNext) {
        newXP -= xpToNext;
        newLevel++;
        xpToNext = Math.floor(xpToNext * 1.3);
      }
      return {
        ...state,
        user: {
          ...state.user,
          xp: newXP,
          level: newLevel,
          xpToNextLevel: xpToNext,
        },
      };
    case 'UPDATE_STREAK':
      return {
        ...state,
        user: state.user ? { ...state.user, streak: action.payload } : null,
      };
    case 'ADD_ACHIEVEMENT':
      return {
        ...state,
        user: state.user
          ? { ...state.user, achievements: [...state.user.achievements, action.payload] }
          : null,
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        user: state.user
          ? { ...state.user, preferences: { ...state.user.preferences, ...action.payload } }
          : null,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  addXP: (amount: number) => void;
  updateStreak: (streak: number) => void;
  addAchievement: (achievement: Achievement) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const restoreSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const saveUser = async (user: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(r => setTimeout(r, 1000));
    const mockUser: User = {
      id: '1',
      name: 'Gokul',
      email,
      level: 12,
      xp: 2450,
      xpToNextLevel: 3000,
      streak: 6,
      longestStreak: 14,
      totalStudyHours: 47,
      totalQuizzesCompleted: 89,
      totalTopicsCompleted: 156,
      screenTimeEarned: 420,
      screenTimeUsed: 280,
      achievements: [],
      joinedAt: '2024-01-15',
      preferences: {
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
      },
    };
    dispatch({ type: 'SET_USER', payload: mockUser });
    await saveUser(mockUser);
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(r => setTimeout(r, 1000));
    const mockUser: User = {
      id: '1',
      name,
      email,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      streak: 0,
      longestStreak: 0,
      totalStudyHours: 0,
      totalQuizzesCompleted: 0,
      totalTopicsCompleted: 0,
      screenTimeEarned: 0,
      screenTimeUsed: 0,
      achievements: [],
      joinedAt: new Date().toISOString(),
      preferences: {
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
      },
    };
    dispatch({ type: 'SET_USER', payload: mockUser });
    await saveUser(mockUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
    if (state.user) {
      saveUser({ ...state.user, ...data });
    }
  };

  const addXP = (amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
    if (state.user) {
      saveUser({ ...state.user, xp: state.user.xp + amount });
    }
  };

  const updateStreak = (streak: number) => {
    dispatch({ type: 'UPDATE_STREAK', payload: streak });
    if (state.user) {
      saveUser({ ...state.user, streak });
    }
  };

  const addAchievement = (achievement: Achievement) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
    if (state.user) {
      saveUser({
        ...state.user,
        achievements: [...state.user.achievements, achievement],
      });
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
    if (state.user) {
      saveUser({
        ...state.user,
        preferences: { ...state.user.preferences, ...prefs },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        addXP,
        updateStreak,
        addAchievement,
        updatePreferences,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}