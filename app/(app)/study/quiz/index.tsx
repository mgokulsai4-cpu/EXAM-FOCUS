import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy, useAuth } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { QuizQuestion, QuizAnswer } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizScreen() {
  const { subjectId, quizId, mode } = useLocalSearchParams();
  const { addQuizSession, updateQuizSession } = useStudy();
  const { user, addXP } = useAuth();
  const { medium, heavy, success, error } = useHaptics();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      topicId: 'java-oop',
      question: 'What is inheritance in Object-Oriented Programming?',
      type: 'single',
      options: [
        { id: 'a', text: 'Data hiding', isCorrect: false },
        { id: 'b', text: 'Acquiring properties from another class', isCorrect: true },
        { id: 'c', text: 'Exception handling', isCorrect: false },
        { id: 'd', text: 'Object creation', isCorrect: false },
      ],
      correctAnswer: 'b',
      explanation: 'Inheritance allows a class to acquire properties and behaviors from another class.',
      difficulty: 'easy',
      timeLimit: 30,
      xpReward: 10,
    },
    {
      id: 'q2',
      topicId: 'java-oop',
      question: 'Which keyword is used to inherit a class in Java?',
      type: 'single',
      options: [
        { id: 'a', text: 'implements', isCorrect: false },
        { id: 'b', text: 'extends', isCorrect: true },
        { id: 'c', text: 'inherits', isCorrect: false },
        { id: 'd', text: 'super', isCorrect: false },
      ],
      correctAnswer: 'b',
      explanation: 'The "extends" keyword is used for class inheritance in Java.',
      difficulty: 'easy',
      timeLimit: 30,
      xpReward: 10,
    },
    {
      id: 'q3',
      topicId: 'java-oop',
      question: 'Can a class extend multiple classes in Java?',
      type: 'single',
      options: [
        { id: 'a', text: 'Yes, Java supports multiple inheritance', isCorrect: false },
        { id: 'b', text: 'No, Java supports single inheritance only', isCorrect: true },
        { id: 'c', text: 'Only if they are abstract classes', isCorrect: false },
        { id: 'd', text: 'Only through interfaces', isCorrect: false },
      ],
      correctAnswer: 'b',
      explanation: 'Java supports single inheritance for classes. Multiple inheritance is achieved through interfaces.',
      difficulty: 'medium',
      timeLimit: 30,
      xpReward: 15,
    },
    {
      id: 'q4',
      topicId: 'java-oop',
      question: 'What is method overriding?',
      type: 'single',
      options: [
        { id: 'a', text: 'Creating a new method with same name', isCorrect: false },
        { id: 'b', text: 'Redefining a parent method in child class', isCorrect: true },
        { id: 'c', text: 'Calling parent method using super()', isCorrect: false },
        { id: 'd', text: 'Hiding a static method', isCorrect: false },
      ],
      correctAnswer: 'b',
      explanation: 'Method overriding allows a subclass to provide a specific implementation of a method already defined in its superclass.',
      difficulty: 'medium',
      timeLimit: 30,
      xpReward: 15,
    },
    {
      id: 'q5',
      topicId: 'java-oop',
      question: 'Which of the following are true about abstract classes?',
      type: 'multiple',
      options: [
        { id: 'a', text: 'Cannot be instantiated', isCorrect: true },
        { id: 'b', text: 'Can have both abstract and concrete methods', isCorrect: true },
        { id: 'c', text: 'Must have at least one abstract method', isCorrect: false },
        { id: 'd', text: 'Can be instantiated if all methods are implemented', isCorrect: false },
      ],
      correctAnswer: ['a', 'b'],
      explanation: 'Abstract classes cannot be instantiated and can have both abstract and concrete methods. They don\'t require abstract methods.',
      difficulty: 'hard',
      timeLimit: 45,
      xpReward: 20,
    },
  ];

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const timerRef = useRef<NodeJS.Timeout>();

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);

  const pulseScale = useSharedValue(1);
  const timerProgress = useSharedValue(timeLeft / 30);

  useEffect(() => {
    timerProgress.value = withTiming(timeLeft / 30, { duration: 500 });
  }, [timeLeft]);

  useEffect(() => {
    if (!isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentIndex, isAnswered]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    if (currentQuestion.type === 'multiple') {
      setSelectedOption(null);
    }
    handleSelectOption('');
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    
    if (currentQuestion.type === 'multiple') {
      setSelectedOption(prev => {
        const selected = prev ? prev.split(',') : [];
        const updated = selected.includes(optionId) 
          ? selected.filter(id => id !== optionId)
          : [...selected, optionId];
        return updated.join(',');
      });
    } else {
      setSelectedOption(optionId);
      submitAnswer(optionId);
    }
  };

  const submitAnswer = (answer: string) => {
    setIsAnswered(true);
    clearInterval(timerRef.current);
    
    const isCorrect = currentQuestion.type === 'multiple' 
      ? JSON.stringify(answer.split(',').sort()) === JSON.stringify((currentQuestion.correctAnswer as string[]).sort())
      : answer === currentQuestion.correctAnswer;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeTaken: currentQuestion.timeLimit - timeLeft,
      xpEarned: isCorrect ? currentQuestion.xpReward + Math.floor((timeLeft / currentQuestion.timeLimit) * 10) : 0,
    };

    setAnswers([...answers, newAnswer]);
    
    if (isCorrect) {
      success();
    } else {
      error();
    }
  };

  const handleNext = () => {
    if (!isAnswered && currentQuestion.type === 'single') return;
    medium();
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(currentQuestion.timeLimit);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    heavy();
    const score = Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100);
    const totalXP = answers.reduce((sum, a) => sum + a.xpEarned, 0);
    
    addXP(totalXP);
    
    const session = {
      id: `quiz-${Date.now()}`,
      subjectId: subjectId || 'java',
      topicIds: ['java-oop'],
      questions,
      currentQuestionIndex: 0,
      answers,
      startTime: new Date(Date.now() - 300000).toISOString(),
      endTime: new Date().toISOString(),
      score,
      xpEarned: totalXP,
      isCompleted: true,
      mode: mode as any || 'practice',
    };
    
    addQuizSession(session);
    router.push(`/study/quiz-result/${session.id}`);
  };

  const isOptionCorrect = (optionId: string) => {
    if (currentQuestion.type === 'multiple') {
      return (currentQuestion.correctAnswer as string[]).includes(optionId);
    }
    return currentQuestion.correctAnswer === optionId;
  };

  const isOptionSelected = (optionId: string) => {
    if (!selectedOption) return false;
    if (currentQuestion.type === 'multiple') {
      return selectedOption.split(',').includes(optionId);
    }
    return selectedOption === optionId;
  };

  const getOptionStyle = (optionId: string) => {
    if (!isAnswered) return styles.option;
    if (isOptionCorrect(optionId)) return styles.optionCorrect;
    if (isOptionSelected(optionId) && !isOptionCorrect(optionId)) return styles.optionIncorrect;
    return styles.option;
  };

  if (showResult) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <Animated.View
                style={{
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: '#0ea5e9',
                  width: `${progress}%`,
                }}
              />
            </View>
            <Text style={styles.questionCounter}>Question {currentIndex + 1} / {questions.length}</Text>
          </View>
        </View>
        <View style={styles.timerWrapper}>
          <Animated.View
            style={[
              styles.timerRing,
              {
                strokeDashoffset: interpolate(timerProgress, [0, 1], [100, 0]),
              },
            ]}
          />
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerUrgent]}>{timeLeft}s</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <GlassCard style={styles.questionCard} glow="#0ea5e9">
            <View style={styles.questionHeader}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) + '30', borderColor: getDifficultyColor(currentQuestion.difficulty) }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(currentQuestion.difficulty) }]}>{currentQuestion.difficulty.toUpperCase()}</Text>
              </View>
              <Text style={styles.xpReward}>+{currentQuestion.xpReward} XP</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            <View style={styles.optionsList}>
              {currentQuestion.options.map((option, i) => (
                <TouchableOpacity
                  key={option.id}
                  style={getOptionStyle(option.id)}
                  onPress={() => handleSelectOption(option.id)}
                  disabled={isAnswered}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIndicator, isOptionSelected(option.id) && styles.optionSelected, isOptionCorrect(option.id) && isAnswered && styles.optionCorrectIndicator]} />
                    <Text style={styles.optionLetter}>{option.id.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                  {isAnswered && isOptionCorrect(option.id) && (
                    <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                  )}
                  {isAnswered && isOptionSelected(option.id) && !isOptionCorrect(option.id) && (
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {isAnswered && (
              <GlassCard style={styles.explanationCard} glow={answers[answers.length - 1]?.isCorrect ? '#22c55e' : '#ef4444'}>
                <View style={styles.explanationHeader}>
                  <Ionicons name={answers[answers.length - 1]?.isCorrect ? 'checkmark-circle' : 'close-circle'} size={20} color={answers[answers.length - 1]?.isCorrect ? '#22c55e' : '#ef4444'} />
                  <Text style={[styles.explanationTitle, { color: answers[answers.length - 1]?.isCorrect ? '#22c55e' : '#ef4444' }]}>
                    {answers[answers.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect'}
                  </Text>
                </View>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </GlassCard>
            )}
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.bottomActions}>
            {currentIndex < questions.length - 1 ? (
              <AnimatedButton
                title={isAnswered ? 'NEXT QUESTION →' : 'SELECT AN ANSWER'}
                onPress={handleNext}
                variant={isAnswered ? 'gradient' : 'ghost'}
                size="lg"
                fullWidth
                disabled={!isAnswered && currentQuestion.type === 'single'}
              />
            ) : (
              <AnimatedButton
                title={isAnswered ? 'FINISH QUIZ →' : 'SELECT AN ANSWER'}
                onPress={finishQuiz}
                variant={isAnswered ? 'gradient' : 'ghost'}
                size="lg"
                fullWidth
                disabled={!isAnswered && currentQuestion.type === 'single'}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: '#22c55e',
    medium: '#f59e0b',
    hard: '#ef4444',
  };
  return colors[difficulty] || '#0ea5e9';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, paddingHorizontal: 16 },
  progressWrapper: { gap: 4 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  questionCounter: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  timerWrapper: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  timerRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#0ea5e9', borderStyle: 'solid' },
  timerText: { position: 'absolute', fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  timerUrgent: { color: '#ef4444' },
  content: { paddingHorizontal: 20, paddingVertical: 20, gap: 20 },
  questionCard: { width: '100%' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  difficultyText: { fontSize: 10, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  xpReward: { fontSize: 14, fontWeight: '700', color: '#f59e0b', fontFamily: 'SpaceGrotesk_700Bold' },
  questionText: { fontSize: 18, fontWeight: '600', color: '#fff', lineHeight: 26, marginBottom: 20, fontFamily: 'Inter_600SemiBold' },
  optionsList: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, gap: 14 },
  optionCorrect: { backgroundColor: '#22c55e30', borderColor: '#22c55e' },
  optionIncorrect: { backgroundColor: '#ef444430', borderColor: '#ef4444' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionIndicator: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  optionSelected: { borderColor: '#0ea5e9', backgroundColor: '#0ea5e930' },
  optionCorrectIndicator: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  optionLetter: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  optionText: { flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter_500Medium' },
  explanationCard: { width: '100%', marginTop: 8 },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  explanationTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  explanationText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22, fontFamily: 'Inter_500Medium' },
  bottomActions: { paddingHorizontal: 20, paddingBottom: 40 },
});