'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface UIState {
  isSidebarOpen: boolean;
  isBottomSheetOpen: boolean;
  bottomSheetContent: string | null;
  activeTab: number;
  modalStack: string[];
  toasts: Toast[];
  isReducedMotion: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  title: string;
  message?: string;
  duration?: number;
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_BOTTOM_SHEET'; payload: string }
  | { type: 'CLOSE_BOTTOM_SHEET' }
  | { type: 'SET_ACTIVE_TAB'; payload: number }
  | { type: 'PUSH_MODAL'; payload: string }
  | { type: 'POP_MODAL' }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean }
  | { type: 'SET_HAPTICS'; payload: boolean }
  | { type: 'SET_SOUND'; payload: boolean };

const initialState: UIState = {
  isSidebarOpen: false,
  isBottomSheetOpen: false,
  bottomSheetContent: null,
  activeTab: 0,
  modalStack: [],
  toasts: [],
  isReducedMotion: false,
  hapticsEnabled: true,
  soundEnabled: true,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'OPEN_BOTTOM_SHEET':
      return { ...state, isBottomSheetOpen: true, bottomSheetContent: action.payload };
    case 'CLOSE_BOTTOM_SHEET':
      return { ...state, isBottomSheetOpen: false, bottomSheetContent: null };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'PUSH_MODAL':
      return { ...state, modalStack: [...state.modalStack, action.payload] };
    case 'POP_MODAL':
      return { ...state, modalStack: state.modalStack.slice(0, -1) };
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Date.now().toString() }],
      };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_REDUCED_MOTION':
      return { ...state, isReducedMotion: action.payload };
    case 'SET_HAPTICS':
      return { ...state, hapticsEnabled: action.payload };
    case 'SET_SOUND':
      return { ...state, soundEnabled: action.payload };
    default:
      return state;
  }
}

interface UIContextType extends UIState {
  toggleSidebar: () => void;
  openBottomSheet: (content: string) => void;
  closeBottomSheet: () => void;
  setActiveTab: (tab: number) => void;
  pushModal: (modal: string) => void;
  popModal: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIContext.Provider
      value={{
        ...state,
        toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
        openBottomSheet: (content: string) => dispatch({ type: 'OPEN_BOTTOM_SHEET', payload: content }),
        closeBottomSheet: () => dispatch({ type: 'CLOSE_BOTTOM_SHEET' }),
        setActiveTab: (tab: number) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
        pushModal: (modal: string) => dispatch({ type: 'PUSH_MODAL', payload: modal }),
        popModal: () => dispatch({ type: 'POP_MODAL' }),
        showToast: (toast: Omit<Toast, 'id'>) => dispatch({ type: 'ADD_TOAST', payload: toast }),
        hideToast: (id: string) => dispatch({ type: 'REMOVE_TOAST', payload: id }),
        setReducedMotion: (enabled: boolean) => dispatch({ type: 'SET_REDUCED_MOTION', payload: enabled }),
        setHaptics: (enabled: boolean) => dispatch({ type: 'SET_HAPTICS', payload: enabled }),
        setSound: (enabled: boolean) => dispatch({ type: 'SET_SOUND', payload: enabled }),
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}