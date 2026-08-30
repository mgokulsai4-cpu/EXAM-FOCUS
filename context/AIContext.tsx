'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AIMessage, AIQuickAction, AIInsight } from '@/types';

interface AIState {
  messages: AIMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  currentTopic: string | null;
  quickActions: AIQuickAction[];
  insights: AIInsight[];
  voiceEnabled: boolean;
  isLoading: boolean;
}

type AIAction =
  | { type: 'ADD_MESSAGE'; payload: AIMessage }
  | { type: 'SET_MESSAGES'; payload: AIMessage[] }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_CURRENT_TOPIC'; payload: string | null }
  | { type: 'SET_INSIGHTS'; payload: AIInsight[] }
  | { type: 'MARK_INSIGHT_READ'; payload: string }
  | { type: 'TOGGLE_VOICE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AIState = {
  messages: [],
  isListening: false,
  isSpeaking: false,
  isThinking: false,
  currentTopic: null,
  quickActions: [
    { id: '1', label: 'Explain Simply', icon: 'brain', color: '#0ea5e9', action: 'explain' },
    { id: '2', label: 'Summarize', icon: 'file-text', color: '#8b5cf6', action: 'summarize' },
    { id: '3', label: 'Give Example', icon: 'lightbulb', color: '#22c55e', action: 'example' },
    { id: '4', label: 'Exam Important', icon: 'target', color: '#f59e0b', action: 'exam_important' },
    { id: '5', label: 'Quiz Me', icon: 'help-circle', color: '#ec4899', action: 'quiz_me' },
    { id: '6', label: 'Revise', icon: 'rotate-ccw', color: '#00d4ff', action: 'revise' },
  ],
  insights: [],
  voiceEnabled: true,
  isLoading: false,
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    case 'SET_THINKING':
      return { ...state, isThinking: action.payload };
    case 'SET_CURRENT_TOPIC':
      return { ...state, currentTopic: action.payload };
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    case 'MARK_INSIGHT_READ':
      return {
        ...state,
        insights: state.insights.map(i => (i.id === action.payload ? { ...i, isRead: true } : i)),
      };
    case 'TOGGLE_VOICE':
      return { ...state, voiceEnabled: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AIContextType extends AIState {
  sendMessage: (content: string, type?: AIMessage['type']) => Promise<void>;
  sendVoiceMessage: (audioUri: string) => Promise<void>;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setThinking: (thinking: boolean) => void;
  setCurrentTopic: (topic: string | null) => void;
  clearChat: () => void;
  toggleVoice: () => void;
  getQuickActionPrompt: (action: AIQuickAction['action']) => string;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const AI_RESPONSES: Record<string, string[]> = {
  explain: [
    "Think of it like a blueprint. A class defines the structure, and objects are the actual houses built from that blueprint.",
    "Inheritance is like genetic traits - a child class inherits properties and behaviors from its parent class.",
    "Polymorphism means 'many forms' - the same method can behave differently based on the object type.",
  ],
  summarize: [
    "Key points: 1) Classes define structure 2) Objects are instances 3) Inheritance enables reuse 4) Polymorphism enables flexibility.",
    "Summary: This topic covers the four pillars of OOP - Encapsulation, Inheritance, Polymorphism, and Abstraction.",
  ],
  example: [
    "Example: `class Animal { speak() {} } class Dog extends Animal { speak() { return 'Woof'; } }` - Dog inherits from Animal but overrides speak().",
    "Real-world: A 'Vehicle' class with subclasses 'Car', 'Bike', 'Truck' - each has wheels but different behaviors.",
  ],
  exam_important: [
    "🎯 HIGH YIELD: Method overriding vs overloading, diamond problem in multiple inheritance, abstract vs interface.",
    "Must know: Constructor chaining in inheritance, super() keyword, final keyword prevents overriding.",
  ],
  quiz_me: [
    "Q: What happens when a subclass doesn't call super() in its constructor? A: Parent constructor runs automatically (no-arg).",
    "Q: Can you override a static method? A: No, static methods belong to class, not instance - they're hidden, not overridden.",
  ],
  revise: [
    "Revision plan: 1) Review class vs object 2) Practice inheritance hierarchy 3) Trace polymorphic calls 4) Solve 5 practice questions.",
    "Focus areas: Access modifiers in inheritance, method resolution order, interface default methods.",
  ],
};

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const sendMessage = async (content: string, type: AIMessage['type'] = 'text') => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_THINKING', payload: true });

    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

    const topic = state.currentTopic || 'general';
    const responses = AI_RESPONSES[type as keyof typeof AI_RESPONSES] || AI_RESPONSES.explain;
    const response = responses[Math.floor(Math.random() * responses.length)];

    const aiMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      type,
      metadata: { topicId: state.currentTopic || undefined },
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    dispatch({ type: 'SET_THINKING', payload: false });
  };

  const sendVoiceMessage = async (audioUri: string) => {
    dispatch({ type: 'SET_LISTENING', payload: false });
    dispatch({ type: 'SET_THINKING', payload: true });

    await new Promise(r => setTimeout(r, 1000));

    const transcript = "Explain polymorphism in Java";
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript,
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    await new Promise(r => setTimeout(r, 1500));

    const response = AI_RESPONSES.explain[0];
    const aiMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      type: 'explanation',
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    dispatch({ type: 'SET_THINKING', payload: false });
  };

  const setListening = (listening: boolean) => dispatch({ type: 'SET_LISTENING', payload: listening });
  const setSpeaking = (speaking: boolean) => dispatch({ type: 'SET_SPEAKING', payload: speaking });
  const setThinking = (thinking: boolean) => dispatch({ type: 'SET_THINKING', payload: thinking });
  const setCurrentTopic = (topic: string | null) => dispatch({ type: 'SET_CURRENT_TOPIC', payload: topic });
  const clearChat = () => dispatch({ type: 'CLEAR_MESSAGES' });
  const toggleVoice = () => dispatch({ type: 'TOGGLE_VOICE', payload: !state.voiceEnabled });
  const getQuickActionPrompt = (action: AIQuickAction['action']) => {
    const prompts: Record<AIQuickAction['action'], string> = {
      explain: 'Explain this concept simply with an analogy',
      summarize: 'Summarize the key points of this topic',
      example: 'Give me a practical code example',
      exam_important: 'What are the most exam-critical points?',
      quiz_me: 'Quiz me on this topic',
      revise: 'Create a revision plan for this topic',
    };
    return prompts[action];
  };

  return (
    <AIContext.Provider
      value={{
        ...state,
        sendMessage,
        sendVoiceMessage,
        setListening,
        setSpeaking,
        setThinking,
        setCurrentTopic,
        clearChat,
        toggleVoice,
        getQuickActionPrompt,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
}