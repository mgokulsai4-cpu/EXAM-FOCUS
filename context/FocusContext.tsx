'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { FocusSession, AppBlockerConfig, AmbientSoundType } from '@/types';
import { mockBlockedApps } from '@/utils/mockData';

interface FocusState {
  isActive: boolean;
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  blockedApps: AppBlockerConfig[];
  focusDuration: number;
  breakDuration: number;
  ambientSound: AmbientSoundType;
  isBreak: boolean;
  timeRemaining: number;
  totalFocusToday: number;
  distractionsBlockedToday: number;
  isLoading: boolean;
}

type FocusAction =
  | { type: 'START_FOCUS'; payload: { subjectId?: string; topicId?: string; duration: number; mode: 'pomodoro' | 'custom' | 'stopwatch' } }
  | { type: 'END_FOCUS' }
  | { type: 'PAUSE_FOCUS' }
  | { type: 'RESUME_FOCUS' }
  | { type: 'TICK'; payload: number }
  | { type: 'START_BREAK'; payload: number }
  | { type: 'END_BREAK' }
  | { type: 'SET_BLOCKED_APPS'; payload: AppBlockerConfig[] }
  | { type: 'TOGGLE_APP_BLOCK'; payload: string }
  | { type: 'SET_FOCUS_DURATION'; payload: number }
  | { type: 'SET_BREAK_DURATION'; payload: number }
  | { type: 'SET_AMBIENT_SOUND'; payload: AmbientSoundType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'COMPLETE_SESSION'; payload: FocusSession };

const initialState: FocusState = {
  isActive: false,
  currentSession: null,
  sessions: [],
  blockedApps: mockBlockedApps,
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
  ambientSound: 'rain',
  isBreak: false,
  timeRemaining: 25 * 60,
  totalFocusToday: 0,
  distractionsBlockedToday: 0,
  isLoading: false,
};

function focusReducer(state: FocusState, action: FocusAction): FocusState {
  switch (action.type) {
    case 'START_FOCUS':
      return {
        ...state,
        isActive: true,
        isBreak: false,
        currentSession: {
          id: Date.now().toString(),
          userId: '1',
          subjectId: action.payload.subjectId,
          topicId: action.payload.topicId,
          mode: action.payload.mode,
          plannedDuration: action.payload.duration,
          actualDuration: 0,
          startTime: new Date().toISOString(),
          distractionsBlocked: 0,
          appsBlocked: state.blockedApps.filter(a => a.isBlocked).map(a => a.packageName),
          isCompleted: false,
          xpEarned: 0,
          breaksTaken: 0,
        },
        timeRemaining: action.payload.duration,
      };
    case 'END_FOCUS':
      return {
        ...state,
        isActive: false,
        currentSession: null,
        timeRemaining: state.focusDuration,
      };
    case 'PAUSE_FOCUS':
      return { ...state, isActive: false };
    case 'RESUME_FOCUS':
      return { ...state, isActive: true };
    case 'TICK':
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - action.payload),
        currentSession: state.currentSession
          ? { ...state.currentSession, actualDuration: state.currentSession.actualDuration + action.payload }
          : null,
      };
    case 'START_BREAK':
      return {
        ...state,
        isBreak: true,
        isActive: true,
        timeRemaining: action.payload,
        currentSession: state.currentSession
          ? { ...state.currentSession, breaksTaken: state.currentSession.breaksTaken + 1 }
          : null,
      };
    case 'END_BREAK':
      return {
        ...state,
        isBreak: false,
        timeRemaining: state.focusDuration,
      };
    case 'SET_BLOCKED_APPS':
      return { ...state, blockedApps: action.payload };
    case 'TOGGLE_APP_BLOCK':
      return {
        ...state,
        blockedApps: state.blockedApps.map(app =>
          app.id === action.payload ? { ...app, isBlocked: !app.isBlocked } : app
        ),
      };
    case 'SET_FOCUS_DURATION':
      return { ...state, focusDuration: action.payload, timeRemaining: action.payload };
    case 'SET_BREAK_DURATION':
      return { ...state, breakDuration: action.payload };
    case 'SET_AMBIENT_SOUND':
      return { ...state, ambientSound: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'COMPLETE_SESSION':
      return {
        ...state,
        isActive: false,
        isBreak: false,
        sessions: [action.payload, ...state.sessions],
        currentSession: null,
        totalFocusToday: state.totalFocusToday + action.payload.actualDuration,
        timeRemaining: state.focusDuration,
      };
    default:
      return state;
  }
}

interface FocusContextType extends FocusState {
  startFocus: (config: { subjectId?: string; topicId?: string; duration: number; mode: 'pomodoro' | 'custom' | 'stopwatch' }) => void;
  endFocus: () => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  startBreak: (duration: number) => void;
  endBreak: () => void;
  toggleAppBlock: (appId: string) => void;
  setFocusDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setAmbientSound: (sound: AmbientSoundType) => void;
  completeSession: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(focusReducer, initialState);

  const startFocus = (config: { subjectId?: string; topicId?: string; duration: number; mode: 'pomodoro' | 'custom' | 'stopwatch' }) => {
    dispatch({ type: 'START_FOCUS', payload: config });
  };

  const endFocus = () => {
    if (state.currentSession) {
      const completedSession: FocusSession = {
        ...state.currentSession,
        endTime: new Date().toISOString(),
        isCompleted: true,
        xpEarned: Math.floor(state.currentSession.actualDuration / 60) * 10,
      };
      dispatch({ type: 'COMPLETE_SESSION', payload: completedSession });
    } else {
      dispatch({ type: 'END_FOCUS' });
    }
  };

  const pauseFocus = () => dispatch({ type: 'PAUSE_FOCUS' });
  const resumeFocus = () => dispatch({ type: 'RESUME_FOCUS' });
  const startBreak = (duration: number) => dispatch({ type: 'START_BREAK', payload: duration });
  const endBreak = () => dispatch({ type: 'END_BREAK' });
  const toggleAppBlock = (appId: string) => dispatch({ type: 'TOGGLE_APP_BLOCK', payload: appId });
  const setFocusDuration = (duration: number) => dispatch({ type: 'SET_FOCUS_DURATION', payload: duration });
  const setBreakDuration = (duration: number) => dispatch({ type: 'SET_BREAK_DURATION', payload: duration });
  const setAmbientSound = (sound: AmbientSoundType) => dispatch({ type: 'SET_AMBIENT_SOUND', payload: sound });
  const completeSession = () => {
    if (state.currentSession) {
      const completedSession: FocusSession = {
        ...state.currentSession,
        endTime: new Date().toISOString(),
        isCompleted: true,
        xpEarned: Math.floor(state.currentSession.actualDuration / 60) * 10,
      };
      dispatch({ type: 'COMPLETE_SESSION', payload: completedSession });
    }
  };

  return (
    <FocusContext.Provider
      value={{
        ...state,
        startFocus,
        endFocus,
        pauseFocus,
        resumeFocus,
        startBreak,
        endBreak,
        toggleAppBlock,
        setFocusDuration,
        setBreakDuration,
        setAmbientSound,
        completeSession,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocus must be used within FocusProvider');
  return context;
}