import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Subject, Topic, Exam, QuizSession, AIInsight, Notification } from '@/types';
import { mockSubjects, mockExams, mockTopics, mockAIInsights, mockNotifications } from '@/utils/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      await delay(300);
      return mockSubjects as Subject[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubject(subjectId: string) {
  return useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      await delay(200);
      return mockSubjects.find(s => s.id === subjectId) as Subject;
    },
    enabled: !!subjectId,
  });
}

export function useSubjectTopics(subjectId: string) {
  return useQuery({
    queryKey: ['topics', subjectId],
    queryFn: async () => {
      await delay(200);
      return mockTopics[subjectId] || [];
    },
    enabled: !!subjectId,
  });
}

export function useTopic(subjectId: string, topicId: string) {
  return useQuery({
    queryKey: ['topic', subjectId, topicId],
    queryFn: async () => {
      await delay(150);
      const topics = mockTopics[subjectId] || [];
      return topics.find(t => t.id === topicId);
    },
    enabled: !!subjectId && !!topicId,
  });
}

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      await delay(200);
      return mockExams as Exam[];
    },
  });
}

export function useExam(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      await delay(150);
      return mockExams.find(e => e.id === examId);
    },
    enabled: !!examId,
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      await delay(300);
      return mockAIInsights as AIInsight[];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay(200);
      return mockNotifications as Notification[];
    },
  });
}

export function useQuizSessions() {
  return useQuery({
    queryKey: ['quiz-sessions'],
    queryFn: async () => {
      await delay(200);
      return [] as QuizSession[];
    },
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subjectId, topicIds, count, difficulty }: { 
      subjectId: string; 
      topicIds?: string[]; 
      count: number; 
      difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    }) => {
      await delay(2000);
      return {
        id: `quiz-${Date.now()}`,
        questions: Array.from({ length: count }, (_, i) => ({
          id: `q-${i}`,
          question: `Sample question ${i + 1} about ${subjectId}`,
          type: 'single' as const,
          options: [
            { id: 'a', text: 'Option A', isCorrect: i % 4 === 0 },
            { id: 'b', text: 'Option B', isCorrect: i % 4 === 1 },
            { id: 'c', text: 'Option C', isCorrect: i % 4 === 2 },
            { id: 'd', text: 'Option D', isCorrect: i % 4 === 3 },
          ],
          correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
          explanation: 'This is the explanation for the answer.',
          difficulty: difficulty === 'mixed' ? ['easy', 'medium', 'hard'][i % 3] as any : difficulty,
          timeLimit: 30,
          xpReward: 10,
        })),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (session: QuizSession) => {
      await delay(500);
      return { ...session, isCompleted: true, endTime: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exam: Omit<Exam, 'id'>) => {
      await delay(500);
      return { ...exam, id: `exam-${Date.now()}` } as Exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exam: Exam) => {
      await delay(500);
      return exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (examId: string) => {
      await delay(300);
      return examId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}