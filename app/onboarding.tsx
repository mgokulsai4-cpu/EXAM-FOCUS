import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
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
import { router } from 'expo-router';
import { AnimatedButton } from '@/components/AnimatedButton';
import { GlassCard } from '@/components/GlassCard';
import { useOnboardingComplete } from '@/hooks/useStorage';
import { useStaggeredEntrance, useFloatAnimation, useShimmerAnimation } from '@/hooks/useAnimations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Your exams are coming.',
    subtitle: 'Track every exam with precision countdowns. Never miss a deadline again.',
    illustration: '📅',
    gradient: ['#0ea5e9', '#8b5cf6'],
    animation: 'countdown',
  },
  {
    id: '2',
    title: 'Your distractions don\'t have to.',
    subtitle: 'Block Instagram, YouTube, Games. Focus Mode locks them away while you study.',
    illustration: '🔒',
    gradient: ['#ef4444', '#f97316'],
    animation: 'lock',
  },
  {
    id: '3',
    title: 'Study with AI.',
    subtitle: 'Your personal AI tutor explains, quizzes, summarizes, and creates practice tests from your notes.',
    illustration: '🤖',
    gradient: ['#8b5cf6', '#ec4899'],
    animation: 'ai',
  },
  {
    id: '4',
    title: 'Prove what you learned.',
    subtitle: 'Game-like quizzes with timers, XP, and instant feedback. Turn notes into exams instantly.',
    illustration: '🧠',
    gradient: ['#22c55e', '#0ea5e9'],
    animation: 'quiz',
  },
  {
    id: '5',
    title: 'Earn your screen time.',
    subtitle: 'Every minute studied = minutes earned. Unlock Instagram, YouTube, Gaming as rewards.',
    illustration: '🎁',
    gradient: ['#f59e0b', '#ec4899'],
    animation: 'reward',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { value: onboardingComplete, setValue: setOnboardingComplete } = useOnboardingComplete();
  
  const pageOpacity = useSharedValue(0);
  const pageScale = useSharedValue(0.9);
  const pageTranslateX = useSharedValue(0);
  const nextButtonScale = useSharedValue(1);

  const floatStyle = useFloatAnimation(20, 5000);
  const shimmerStyle = useShimmerAnimation();

  const step = ONBOARDING_STEPS[currentStep];

  React.useEffect(() => {
    pageOpacity.value = withTiming(1, { duration: 400 });
    pageScale.value = withSpring(1, { damping: 20, stiffness: 150 });
    pageTranslateX.value = withSpring(0, { damping: 20, stiffness: 150 });
  }, [currentStep]);

  const animateToNext = () => {
    nextButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 150 }, () => {
      nextButtonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    });
    
    pageOpacity.value = withTiming(0, { duration: 200 }, () => {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }
    });
    pageScale.value = withTiming(0.9, { duration: 200 });
    pageTranslateX.value = withTiming(-50, { duration: 200 });
  };

  const completeOnboarding = async () => {
    await setOnboardingComplete(true);
    router.replace('/(auth)/login');
  };

  const pageStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity,
    transform: [{ scale: pageScale }, { translateX: pageTranslateX }],
  }));

  const nextButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextButtonScale }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
  }));

  const illustrationScale = useSharedValue(1);
  React.useEffect(() => {
    illustrationScale.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, [currentStep]);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: illustrationScale }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: step.gradient[0] }]} />
        </View>
        <Text style={styles.stepIndicator}>{currentStep + 1} / {ONBOARDING_STEPS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.pageContainer, pageStyle]}>
          <View style={[styles.illustrationContainer, floatStyle]}>
            <Animated.View style={illustrationStyle}>
              <Text style={styles.illustration}>{step.illustration}</Text>
              <Animated.View style={[styles.illustrationGlow, { backgroundColor: step.gradient[0] + '40' }, shimmerStyle]} />
            </Animated.View>
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: step.gradient[0] }]}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          </View>

          <View style={styles.featuresPreview}>
            {step.id === '1' && <CountdownPreview gradient={step.gradient} />}
            {step.id === '2' && <LockPreview gradient={step.gradient} />}
            {step.id === '3' && <AIPreview gradient={step.gradient} />}
            {step.id === '4' && <QuizPreview gradient={step.gradient} />}
            {step.id === '5' && <RewardPreview gradient={step.gradient} />}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <Animated.View style={[styles.buttonContainer, nextButtonStyle]}>
          <AnimatedButton
            title={currentStep === ONBOARDING_STEPS.length - 1 ? 'START MY FOCUS JOURNEY →' : 'NEXT →'}
            onPress={animateToNext}
            variant="gradient"
            size="lg"
            fullWidth
            style={{ maxWidth: 320 }}
          />
        </Animated.View>
        {currentStep > 0 && (
          <Text style={styles.skipText} onPress={completeOnboarding}>
            Skip for now
          </Text>
        )}
      </View>
    </View>
  );
}

function CountdownPreview({ gradient }: { gradient: string[] }) {
  return (
    <GlassCard style={styles.previewCard} glow={gradient[0]}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewLabel}>NEXT EXAM</Text>
        <Text style={[styles.previewValue, { color: gradient[0] }]}>Java Programming</Text>
      </View>
      <View style={styles.previewCountdown}>
        <Text style={[styles.countdownNumber, { color: gradient[0] }]}>05</Text>
        <Text style={styles.countdownLabel}>Days</Text>
        <Text style={[styles.countdownNumber, { color: gradient[1] }]}>14</Text>
        <Text style={styles.countdownLabel}>Hours</Text>
      </View>
    </GlassCard>
  );
}

function LockPreview({ gradient }: { gradient: string[] }) {
  return (
    <GlassCard style={styles.previewCard} glow={gradient[0]}>
      <View style={styles.previewApps}>
        {['Instagram', 'YouTube', 'Games', 'Netflix'].map((app, i) => (
          <View key={app} style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: gradient[i % 2] + '30' }]} />
            <Text style={styles.appName}>{app}</Text>
            <View style={[styles.lockIcon, { borderColor: gradient[0] }]}>🔒</View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function AIPreview({ gradient }: { gradient: string[] }) {
  return (
    <GlassCard style={styles.previewCard} glow={gradient[0]}>
      <View style={styles.aiPreview}>
        <View style={[styles.aiOrb, { borderColor: gradient[0] }]}>✦</View>
        <Text style={styles.aiMessage}>"Hey! What are we learning today?"</Text>
        <View style={styles.aiActions}>
          {['Explain', 'Quiz Me', 'Example'].map((action, i) => (
            <View key={action} style={[styles.aiAction, { borderColor: gradient[i % gradient.length] }]}>
              <Text style={styles.aiActionText}>{action}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}

function QuizPreview({ gradient }: { gradient: string[] }) {
  return (
    <GlassCard style={styles.previewCard} glow={gradient[0]}>
      <View style={styles.quizPreview}>
        <Text style={styles.quizQuestion}>What is inheritance in OOP?</Text>
        <View style={styles.quizOptions}>
          {['A. Data hiding', 'B. Acquiring properties', 'C. Exception handling', 'D. Object creation'].map((opt, i) => (
            <View key={opt} style={[styles.quizOption, { borderColor: i === 1 ? gradient[0] : 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.quizOptionText, { color: i === 1 ? gradient[0] : '#fff' }]}>{opt}</Text>
            </View>
          ))}
        </View>
        <View style={styles.quizTimer}>
          <Text style={[styles.timerText, { color: gradient[0] }]}>15s</Text>
        </View>
      </View>
    </GlassCard>
  );
}

function RewardPreview({ gradient }: { gradient: string[] }) {
  return (
    <GlassCard style={styles.previewCard} glow={gradient[0]}>
      <View style={styles.rewardPreview}>
        <Text style={[styles.rewardIcon, { color: gradient[0] }]}>🎁</Text>
        <Text style={[styles.rewardAmount, { color: gradient[0] }]}>25 MINUTES EARNED</Text>
        <Text style={styles.rewardSubtitle}>Complete today's quiz to earn more</Text>
        <View style={[styles.rewardButton, { backgroundColor: gradient[0] + '30', borderColor: gradient[0] }]}>
          <Text style={[styles.rewardButtonText, { color: gradient[0] }]}>VIEW REWARDS</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  progressContainer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, gap: 8 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  stepIndicator: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  scrollContent: { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },
  pageContainer: { minHeight: '100%' },
  illustrationContainer: { alignItems: 'center', marginBottom: 32 },
  illustration: { fontSize: 80, lineHeight: 100 },
  illustrationGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -40,
    left: -40,
    opacity: 0.3,
  },
  textContainer: { alignItems: 'center', marginBottom: 32, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1, lineHeight: 34 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24, fontFamily: 'Inter_500Medium' },
  featuresPreview: { marginBottom: 20 },
  previewCard: { width: '100%' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  previewLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  previewValue: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  previewCountdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  countdownNumber: { fontSize: 32, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  countdownLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  previewApps: { gap: 10 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIcon: { width: 32, height: 32, borderRadius: 8 },
  appName: { fontSize: 14, fontWeight: '500', color: '#fff', flex: 1, fontFamily: 'Inter_500Medium' },
  lockIcon: { padding: 6, borderRadius: 8, borderWidth: 1 },
  aiPreview: { alignItems: 'center', gap: 16 },
  aiOrb: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  aiMessage: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Inter_500Medium' },
  aiActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  aiAction: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  aiActionText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_600SemiBold' },
  quizPreview: { gap: 12 },
  quizQuestion: { fontSize: 15, fontWeight: '600', color: '#fff', textAlign: 'center', fontFamily: 'Inter_600SemiBold' },
  quizOptions: { gap: 8 },
  quizOption: { padding: 12, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  quizOptionText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  quizTimer: { alignItems: 'center', marginTop: 8 },
  timerText: { fontSize: 20, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  rewardPreview: { alignItems: 'center', gap: 12 },
  rewardIcon: { fontSize: 36 },
  rewardAmount: { fontSize: 18, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  rewardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  rewardButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100, borderWidth: 1, marginTop: 8 },
  rewardButtonText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, fontFamily: 'SpaceGrotesk_700Bold' },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16, gap: 16, alignItems: 'center' },
  buttonContainer: { width: '100%' },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
});