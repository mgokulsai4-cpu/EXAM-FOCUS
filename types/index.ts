export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  totalStudyHours: number;
  totalQuizzesCompleted: number;
  totalTopicsCompleted: number;
  screenTimeEarned: number;
  screenTimeUsed: number;
  achievements: Achievement[];
  joinedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  focusDuration: number;
  breakDuration: number;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  ambientSound: AmbientSoundType;
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  autoStartBreak: boolean;
  dailyGoal: number;
}

export type AmbientSoundType = 'rain' | 'ocean' | 'forest' | 'cafe' | 'silent';

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  location?: string;
  progress: number;
  topicsTotal: number;
  topicsCompleted: number;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  gradient: string[];
  icon: string;
  progress: number;
  streak: number;
  topicsTotal: number;
  topicsCompleted: number;
  totalHours: number;
  weakTopics: string[];
  strongTopics: string[];
  lastStudied?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
  estimatedMinutes: number;
  xpReward: number;
  subtopics: Subtopic[];
  quizQuestions: number;
  resources: Resource[];
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  isCompleted: boolean;
  content: string;
  duration: number;
}

export interface Resource {
  id: string;
  type: 'video' | 'article' | 'pdf' | 'note';
  title: string;
  url?: string;
  duration?: number;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  type: 'single' | 'multiple' | 'true-false' | 'fill-blank';
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  xpReward: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizSession {
  id: string;
  subjectId: string;
  topicIds: string[];
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: string;
  endTime?: string;
  score: number;
  xpEarned: number;
  isCompleted: boolean;
  mode: 'practice' | 'mock' | 'ai-generated';
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  timeTaken: number;
  xpEarned: number;
}

export interface FocusSession {
  id: string;
  userId: string;
  subjectId?: string;
  topicId?: string;
  mode: 'pomodoro' | 'custom' | 'stopwatch';
  plannedDuration: number;
  actualDuration: number;
  startTime: string;
  endTime?: string;
  distractionsBlocked: number;
  appsBlocked: string[];
  isCompleted: boolean;
  xpEarned: number;
  breaksTaken: number;
}

export interface AppBlockerConfig {
  id: string;
  name: string;
  packageName: string;
  icon: string;
  isBlocked: boolean;
  category: 'social' | 'entertainment' | 'gaming' | 'other';
}

export interface Reward {
  id: string;
  name: string;
  appName: string;
  packageName: string;
  icon: string;
  durationMinutes: number;
  xpCost: number;
  category: 'social' | 'entertainment' | 'gaming' | 'other';
  isUnlocked: boolean;
  isActive: boolean;
  expiresAt?: string;
  earnedAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xpReward: number;
  requirement: AchievementRequirement;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'streak' | 'topics' | 'quizzes' | 'focus_hours' | 'xp' | 'perfect_score' | 'early_bird' | 'night_owl';
  value: number;
}

export interface AIInsight {
  id: string;
  type: 'strength' | 'weakness' | 'recommendation' | 'warning' | 'celebration';
  title: string;
  message: string;
  subjectId?: string;
  topicId?: string;
  action?: AIInsightAction;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
}

export interface AIInsightAction {
  type: 'study_topic' | 'take_quiz' | 'focus_session' | 'review_notes';
  targetId: string;
  label: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'quiz' | 'explanation' | 'summary' | 'example';
  metadata?: {
    topicId?: string;
    questionId?: string;
    quizId?: string;
  };
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIQuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: 'explain' | 'summarize' | 'example' | 'exam_important' | 'quiz_me' | 'revise';
}

export interface Notification {
  id: string;
  type: 'exam_reminder' | 'study_reminder' | 'quiz_reminder' | 'streak_reminder' | 'reward_unlocked' | 'weak_topic' | 'achievement' | 'focus_complete';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
}

export interface AnalyticsData {
  studyHours: TimeSeriesData[];
  quizAccuracy: TimeSeriesData[];
  examReadiness: TimeSeriesData[];
  focusSessions: TimeSeriesData[];
  distractionsBlocked: TimeSeriesData[];
  screenTimeEarned: TimeSeriesData[];
  weakTopics: TopicPerformance[];
  strongTopics: TopicPerformance[];
  dailyActivity: DailyActivity[];
  weeklyComparison: WeeklyComparison;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  attempts: number;
  lastAttempt: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface DailyActivity {
  date: string;
  studyMinutes: number;
  quizCount: number;
  focusMinutes: number;
  xpEarned: number;
}

export interface WeeklyComparison {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
}

export interface StudyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'topics' | 'quizzes' | 'streak' | 'focus' | 'xp';
  target: number;
  current: number;
  xpReward: number;
  expiresAt: string;
  isCompleted: boolean;
}

export interface FocusOrbState {
  readiness: number;
  status: 'idle' | 'studying' | 'focus' | 'reward' | 'celebration';
  message: string;
  particles: Particle[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  opacity: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  animation: string;
  illustration: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  Splash: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Study: undefined;
  Focus: undefined;
  Rewards: undefined;
  Profile: undefined;
};

export type StudyStackParamList = {
  Subjects: undefined;
  SubjectDetail: { subjectId: string };
  KnowledgeMap: { subjectId: string };
  TopicLearning: { subjectId: string; topicId: string };
  AIAssistant: { subjectId?: string; topicId?: string };
  VoiceAI: { subjectId?: string; topicId?: string };
  NotesUpload: { subjectId?: string };
  AIQuizGenerator: { subjectId?: string; topicIds?: string[] };
  Quiz: { quizId: string; mode: 'practice' | 'mock' | 'ai-generated' };
  QuizResult: { sessionId: string };
  MockTest: { examId: string };
  MockTestResult: { sessionId: string };
};

export type FocusStackParamList = {
  FocusMode: { subjectId?: string; topicId?: string; duration?: number };
  AppBlocker: undefined;
  FocusEnvironment: { sound?: AmbientSoundType };
};

export type RewardsStackParamList = {
  RewardVault: undefined;
  RewardCountdown: { rewardId: string };
  Achievements: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Analytics: undefined;
  AIInsights: undefined;
  Notifications: undefined;
  Settings: undefined;
  Streak: undefined;
  EditProfile: undefined;
};

export type ExamStackParamList = {
  ExamSchedule: undefined;
  AddExam: undefined;
  EditExam: { examId: string };
};