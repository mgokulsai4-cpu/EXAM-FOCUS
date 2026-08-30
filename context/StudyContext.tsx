'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, Topic, Exam, StudyMission, QuizSession, AIInsight } from '@/types';
import { mockSubjects, mockExams, mockMissions, mockTopics } from '@/utils/mockData';

interface StudyState {
  subjects: Subject[];
  exams: Exam[];
  missions: StudyMission[];
  currentSubject: Subject | null;
  currentTopic: Topic | null;
  quizSessions: QuizSession[];
  aiInsights: AIInsight[];
  isLoading: boolean;
}

type StudyAction =
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'SET_EXAMS'; payload: Exam[] }
  | { type: 'SET_MISSIONS'; payload: StudyMission[] }
  | { type: 'SET_CURRENT_SUBJECT'; payload: Subject | null }
  | { type: 'SET_CURRENT_TOPIC'; payload: Topic | null }
  | { type: 'UPDATE_SUBJECT_PROGRESS'; payload: { subjectId: string; progress: number; completedTopics: number } }
  | { type: 'COMPLETE_TOPIC'; payload: { subjectId: string; topicId: string } }
  | { type: 'ADD_QUIZ_SESSION'; payload: QuizSession }
  | { type: 'UPDATE_QUIZ_SESSION'; payload: QuizSession }
  | { type: 'SET_AI_INSIGHTS'; payload: AIInsight[] }
  | { type: 'MARK_INSIGHT_READ'; payload: string }
  | { type: 'ADD_EXAM'; payload: Exam }
  | { type: 'UPDATE_EXAM'; payload: Exam }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: StudyState = {
  subjects: [],
  exams: [],
  missions: [],
  currentSubject: null,
  currentTopic: null,
  quizSessions: [],
  aiInsights: [],
  isLoading: true,
};

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'SET_SUBJECTS':
      return { ...state, subjects: action.payload, isLoading: false };
    case 'SET_EXAMS':
      return { ...state, exams: action.payload };
    case 'SET_MISSIONS':
      return { ...state, missions: action.payload };
    case 'SET_CURRENT_SUBJECT':
      return { ...state, currentSubject: action.payload };
    case 'SET_CURRENT_TOPIC':
      return { ...state, currentTopic: action.payload };
    case 'UPDATE_SUBJECT_PROGRESS':
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? { ...s, progress: action.payload.progress, topicsCompleted: action.payload.completedTopics }
            : s
        ),
      };
    case 'COMPLETE_TOPIC':
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topicsCompleted: s.topicsCompleted + 1,
                progress: Math.min(100, s.progress + (100 / s.topicsTotal)),
              }
            : s
        ),
      };
    case 'ADD_QUIZ_SESSION':
      return { ...state, quizSessions: [action.payload, ...state.quizSessions] };
    case 'UPDATE_QUIZ_SESSION':
      return {
        ...state,
        quizSessions: state.quizSessions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'SET_AI_INSIGHTS':
      return { ...state, aiInsights: action.payload };
    case 'MARK_INSIGHT_READ':
      return {
        ...state,
        aiInsights: state.aiInsights.map(i =>
          i.id === action.payload ? { ...i, isRead: true } : i
        ),
      };
    case 'ADD_EXAM':
      return { ...state, exams: [...state.exams, action.payload] };
    case 'UPDATE_EXAM':
      return {
        ...state,
        exams: state.exams.map(e => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'DELETE_EXAM':
      return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface StudyContextType extends StudyState {
  setCurrentSubject: (subject: Subject | null) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  completeTopic: (subjectId: string, topicId: string) => void;
  addQuizSession: (session: QuizSession) => void;
  updateQuizSession: (session: QuizSession) => void;
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  refreshMissions: () => void;
  getSubjectTopics: (subjectId: string) => Topic[];
  getExamReadiness: (examId: string) => number;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studyReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await new Promise(r => setTimeout(r, 500));
      dispatch({ type: 'SET_SUBJECTS', payload: mockSubjects });
      dispatch({ type: 'SET_EXAMS', payload: mockExams });
      dispatch({ type: 'SET_MISSIONS', payload: mockMissions });
      dispatch({ type: 'SET_AI_INSIGHTS', payload: generateAIInsights(mockSubjects) });
    };
    loadData();
  }, []);

  const setCurrentSubject = (subject: Subject | null) => {
    dispatch({ type: 'SET_CURRENT_SUBJECT', payload: subject });
  };

  const setCurrentTopic = (topic: Topic | null) => {
    dispatch({ type: 'SET_CURRENT_TOPIC', payload: topic });
  };

  const completeTopic = (subjectId: string, topicId: string) => {
    dispatch({ type: 'COMPLETE_TOPIC', payload: { subjectId, topicId } });
  };

  const addQuizSession = (session: QuizSession) => {
    dispatch({ type: 'ADD_QUIZ_SESSION', payload: session });
  };

  const updateQuizSession = (session: QuizSession) => {
    dispatch({ type: 'UPDATE_QUIZ_SESSION', payload: session });
  };

  const addExam = (exam: Exam) => {
    dispatch({ type: 'ADD_EXAM', payload: exam });
  };

  const updateExam = (exam: Exam) => {
    dispatch({ type: 'UPDATE_EXAM', payload: exam });
  };

  const deleteExam = (examId: string) => {
    dispatch({ type: 'DELETE_EXAM', payload: examId });
  };

  const refreshMissions = () => {
    dispatch({ type: 'SET_MISSIONS', payload: generateDailyMissions(state.subjects) });
  };

  const getSubjectTopics = (subjectId: string): Topic[] => {
    return mockTopics[subjectId] || [];
  };

  const getExamReadiness = (examId: string): number => {
    const exam = state.exams.find(e => e.id === examId);
    if (!exam) return 0;
    const subject = state.subjects.find(s => s.name === exam.subject);
    return subject?.progress || 0;
  };

  return (
    <StudyContext.Provider
      value={{
        ...state,
        setCurrentSubject,
        setCurrentTopic,
        completeTopic,
        addQuizSession,
        updateQuizSession,
        addExam,
        updateExam,
        deleteExam,
        refreshMissions,
        getSubjectTopics,
        getExamReadiness,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within StudyProvider');
  return context;
}

function generateAIInsights(subjects: Subject[]): AIInsight[] {
  return [
    {
      id: '1',
      type: 'strength',
      title: 'Strong Foundation',
      message: "You're excelling in Object-Oriented Programming with 94% accuracy. Your understanding of inheritance and polymorphism is solid.",
      subjectId: 'java',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: false,
    },
    {
      id: '2',
      type: 'weakness',
      title: 'Attention Needed',
      message: 'Your performance in Exception Handling has dropped by 18% this week. Recommend a 20-minute revision session followed by a 5-question quiz.',
      subjectId: 'java',
      topicId: 'exception-handling',
      action: { type: 'study_topic', targetId: 'exception-handling', label: 'Start Revision' },
      priority: 'high',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      isRead: false,
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Optimal Study Time',
      message: 'Based on your patterns, you retain 23% more information during 9-11 AM sessions. Consider scheduling difficult topics then.',
      priority: 'medium',
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      isRead: false,
    },
    {
      id: '4',
      type: 'celebration',
      title: 'Streak Milestone!',
      message: '6-day streak achieved! You\'ve studied 4.2 hours more than last week. Keep the momentum going!',
      priority: 'low',
      createdAt: new Date().toISOString(),
      isRead: false,
    },
  ];
}

function generateDailyMissions(subjects: Subject[]): StudyMission[] {
  const activeSubjects = subjects.filter(s => s.progress > 0 && s.progress < 100);
  const primarySubject = activeSubjects[0] || subjects[0];
  
  return [
    {
      id: 'mission-1',
      title: 'Complete 2 Topics',
      description: `Finish 2 topics in ${primarySubject.name}`,
      icon: 'target',
      color: primarySubject.color,
      type: 'topics',
      target: 2,
      current: 0,
      xpReward: 150,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isCompleted: false,
    },
    {
      id: 'mission-2',
      title: 'Finish 10 Quiz Questions',
      description: 'Test your knowledge with practice questions',
      icon: 'brain',
      color: '#8b5cf6',
      type: 'quizzes',
      target: 10,
      current: 0,
      xpReward: 100,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isCompleted: false,
    },
    {
      id: 'mission-3',
      title: 'Maintain Your Streak',
      description: 'Complete at least one study session today',
      icon: 'fire',
      color: '#ef4444',
      type: 'streak',
      target: 1,
      current: 0,
      xpReward: 200,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isCompleted: false,
    },
  ];
}