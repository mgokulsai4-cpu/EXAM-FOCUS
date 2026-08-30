'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Reward, Achievement } from '@/types';
import { mockRewards, mockAchievements } from '@/utils/mockData';

interface RewardsState {
  rewards: Reward[];
  achievements: Achievement[];
  activeReward: Reward | null;
  rewardCountdown: number;
  isCountdownActive: boolean;
  totalEarned: number;
  totalUsed: number;
  isLoading: boolean;
}

type RewardsAction =
  | { type: 'SET_REWARDS'; payload: Reward[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UNLOCK_REWARD'; payload: string }
  | { type: 'USE_REWARD'; payload: string }
  | { type: 'START_COUNTDOWN'; payload: { rewardId: string; duration: number } }
  | { type: 'TICK_COUNTDOWN'; payload: number }
  | { type: 'END_COUNTDOWN' }
  | { type: 'ADD_REWARD'; payload: Reward }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: RewardsState = {
  rewards: [],
  achievements: [],
  activeReward: null,
  rewardCountdown: 0,
  isCountdownActive: false,
  totalEarned: 0,
  totalUsed: 0,
  isLoading: true,
};

function rewardsReducer(state: RewardsState, action: RewardsAction): RewardsState {
  switch (action.type) {
    case 'SET_REWARDS':
      return { ...state, rewards: action.payload, isLoading: false, totalEarned: action.payload.filter(r => r.isUnlocked).length };
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'UNLOCK_REWARD':
      return {
        ...state,
        rewards: state.rewards.map(r =>
          r.id === action.payload ? { ...r, isUnlocked: true, earnedAt: new Date().toISOString() } : r
        ),
        totalEarned: state.totalEarned + 1,
      };
    case 'USE_REWARD':
      return {
        ...state,
        rewards: state.rewards.map(r =>
          r.id === action.payload ? { ...r, isActive: true, isUnlocked: false } : r
        ),
        activeReward: state.rewards.find(r => r.id === action.payload) || null,
        totalUsed: state.totalUsed + 1,
      };
    case 'START_COUNTDOWN':
      return {
        ...state,
        activeReward: state.rewards.find(r => r.id === action.payload.rewardId) || null,
        rewardCountdown: action.payload.duration,
        isCountdownActive: true,
      };
    case 'TICK_COUNTDOWN':
      return {
        ...state,
        rewardCountdown: Math.max(0, state.rewardCountdown - action.payload),
        isCountdownActive: state.rewardCountdown > action.payload,
      };
    case 'END_COUNTDOWN':
      return {
        ...state,
        activeReward: null,
        rewardCountdown: 0,
        isCountdownActive: false,
        rewards: state.rewards.map(r => (r.isActive ? { ...r, isActive: false } : r)),
      };
    case 'ADD_REWARD':
      return { ...state, rewards: [...state.rewards, action.payload] };
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.payload ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface RewardsContextType extends RewardsState {
  unlockReward: (rewardId: string) => void;
  useReward: (rewardId: string) => void;
  startCountdown: (rewardId: string) => void;
  tickCountdown: (seconds: number) => void;
  endCountdown: () => void;
  checkAchievements: (userStats: { streak: number; topicsCompleted: number; quizzesCompleted: number; xp: number; focusHours: number }) => Achievement[];
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rewardsReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await new Promise(r => setTimeout(r, 300));
      dispatch({ type: 'SET_REWARDS', payload: mockRewards });
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: mockAchievements });
    };
    loadData();
  }, []);

  const unlockReward = (rewardId: string) => {
    dispatch({ type: 'UNLOCK_REWARD', payload: rewardId });
  };

  const useReward = (rewardId: string) => {
    dispatch({ type: 'USE_REWARD', payload: rewardId });
    const reward = state.rewards.find(r => r.id === rewardId);
    if (reward) {
      dispatch({ type: 'START_COUNTDOWN', payload: { rewardId, duration: reward.durationMinutes * 60 } });
    }
  };

  const startCountdown = (rewardId: string) => {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (reward) {
      dispatch({ type: 'START_COUNTDOWN', payload: { rewardId, duration: reward.durationMinutes * 60 } });
    }
  };

  const tickCountdown = (seconds: number) => {
    dispatch({ type: 'TICK_COUNTDOWN', payload: seconds });
  };

  const endCountdown = () => {
    dispatch({ type: 'END_COUNTDOWN' });
  };

  const checkAchievements = (userStats: { streak: number; topicsCompleted: number; quizzesCompleted: number; xp: number; focusHours: number }): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];
    state.achievements.forEach(achievement => {
      if (!achievement.isUnlocked) {
        let current = 0;
        switch (achievement.requirement.type) {
          case 'streak': current = userStats.streak; break;
          case 'topics': current = userStats.topicsCompleted; break;
          case 'quizzes': current = userStats.quizzesCompleted; break;
          case 'xp': current = userStats.xp; break;
          case 'focus_hours': current = userStats.focusHours; break;
        }
        if (current >= achievement.requirement.value) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id });
          newlyUnlocked.push({ ...achievement, isUnlocked: true, unlockedAt: new Date().toISOString() });
        }
      }
    });
    return newlyUnlocked;
  };

  return (
    <RewardsContext.Provider
      value={{
        ...state,
        unlockReward,
        useReward,
        startCountdown,
        tickCountdown,
        endCountdown,
        checkAchievements,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) throw new Error('useRewards must be used within RewardsProvider');
  return context;
}