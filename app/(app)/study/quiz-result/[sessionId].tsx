import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ProgressRing } from '@/components/ProgressRing';
import { StatCard } from '@/components/StatCard';
import { useStaggeredEntrance, useCountUpAnimation, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizResultScreen({ route }: any) {
  const { sessionId } = route.params;
  const { addXP } = useAuth();
  const { heavy, success } = useHaptics();

  const mockSession = {
    id: sessionId,
    score: 80,
    xpEarned: 120,
    questions: 5,
    correctAnswers: 4,
    timeTaken: 85,
    answers: [
      { questionId: 'q1', isCorrect: true, timeTaken: 12, xpEarned: 22 },
      { questionId: 'q2', isCorrect: true, timeTaken: 8, xpEarned: 25 },
      { questionId: 'q3', isCorrect: false, timeTaken: 30, xpEarned: 0 },
      { questionId: 'q4', isCorrect: true, timeTaken: 15, xpEarned: 28 },
      { questionId: 'q5', isCorrect: true, timeTaken: 20, xpEarned: 25 },
    ],
  };

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);

  const { value: scoreValue } = useCountUpAnimation(mockSession.score, 1500);
  const { value: xpValue } = useCountUpAnimation(mockSession.xpEarned, 1500);

  const floatStyle = useFloatAnimation(15, 5000);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withSpring(1.1, { damping: 15, stiffness: 100 });
    success();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'A+', color: '#22c55e', emoji: '🏆' };
    if (score >= 80) return { label: 'A', color: '#0ea5e9', emoji: '🥇' };
    if (score >= 70) return { label: 'B', color: '#8b5cf6', emoji: '🥈' };
    if (score >= 60) return { label: 'C', color: '#f59e0b', emoji: '🥉' };
    return { label: 'F', color: '#ef4444', emoji: '📚' };
  };

  const grade = getGrade(mockSession.score);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.gradeContainer}>
            <View style={[styles.gradeBadge, { backgroundColor: grade.color + '30', borderColor: grade.color }, floatStyle, pulseStyle]}>
              <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
            </View>
            <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label} GRADE</Text>
            <Animated.Text style={[styles.scoreValue, { color: grade.color }]}>{Math.round(scoreValue)}%</Animated.Text>
            <Text style={styles.scoreSubtitle}>{mockSession.correctAnswers} / {mockSession.questions} correct</Text>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <GlassCard style={styles.xpCard} glow="#f59e0b">
            <View style={styles.xpContent}>
              <View style={styles.xpIconWrapper}>
                <View style={[styles.xpIcon, { backgroundColor: '#f59e0b30', borderColor: '#f59e0b' }]}>
                  <Ionicons name="flash-outline" size={24} color="#f59e0b" />
                </View>
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpLabel}>XP EARNED</Text>
                <Animated.Text style={[styles.xpValue, { color: '#f59e0b' }]}>+{Math.round(xpValue)}</Animated.Text>
              </View>
              <View style={styles.xpBreakdown}>
                <Text style={styles.breakdownItem}>Base XP: 80</Text>
                <Text style={styles.breakdownItem}>Time Bonus: 40</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance3}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DETAILED BREAKDOWN</Text>
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="ACCURACY"
              value={mockSession.score}
              suffix="%"
              color="#22c55e"
              gradient={['#22c55e', '#10b981']}
              index={0}
            />
            <StatCard
              label="TIME TAKEN"
              value={mockSession.timeTaken}
              suffix="s"
              color="#0ea5e9"
              gradient={['#0ea5e9', '#8b5cf6']}
              index={1}
            />
            <StatCard
              label="AVG/QUESTION"
              value={Math.round(mockSession.timeTaken / mockSession.questions)}
              suffix="s"
              color="#8b5cf6"
              gradient={['#8b5cf6', '#ec4899']}
              index={2}
            />
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUESTION REVIEW</Text>
          </View>
          <View style={styles.reviewList}>
            {mockSession.answers.map((answer, i) => (
              <AnswerReviewItem key={answer.questionId} answer={answer} index={i} questionNum={i + 1} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.actions}>
            <AnimatedButton
              title="REVIEW MISTAKES"
              onPress={() => {}}
              variant="gradient"
              size="lg"
              fullWidth
            />
            <AnimatedButton
              title="TRY AGAIN"
              onPress={() => router.back()}
              variant="ghost"
              size="lg"
              fullWidth
            />
            <AnimatedButton
              title="BACK TO STUDY"
              onPress={() => router.push('/study')}
              variant="primary"
              size="md"
              fullWidth
            />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function AnswerReviewItem({ answer, index, questionNum }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);

  return (
    <Animated.View style={entranceStyle}>
      <View style={[styles.reviewItem, answer.isCorrect && styles.reviewCorrect]}>
        <View style={styles.reviewLeft}>
          <View style={[styles.reviewNumber, { backgroundColor: answer.isCorrect ? '#22c55e30' : '#ef444430', borderColor: answer.isCorrect ? '#22c55e' : '#ef4444' }]}>
            <Text style={[styles.reviewNumberText, { color: answer.isCorrect ? '#22c55e' : '#ef4444' }]}>{questionNum}</Text>
          </View>
          <View style={styles.reviewStatus}>
            <Ionicons name={answer.isCorrect ? 'checkmark-circle' : 'close-circle'} size={20} color={answer.isCorrect ? '#22c55e' : '#ef4444'} />
            <Text style={[styles.reviewStatusText, { color: answer.isCorrect ? '#22c55e' : '#ef4444' }]}>
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </Text>
          </View>
        </View>
        <View style={styles.reviewRight}>
          <View style={[styles.reviewXP, { backgroundColor: answer.isCorrect ? '#22c55e30' : 'rgba(255,255,255,0.05)', borderColor: answer.isCorrect ? '#22c55e' : 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.reviewXPText, { color: answer.isCorrect ? '#22c55e' : 'rgba(255,255,255,0.5)' }]}>{answer.isCorrect ? '+' : ''}{answer.xpEarned} XP</Text>
          </View>
          <Text style={styles.reviewTime}>{answer.timeTaken}s</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  gradeContainer: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  gradeBadge: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  gradeEmoji: { fontSize: 40 },
  gradeLabel: { fontSize: 14, fontWeight: '600', letterSpacing: 2, fontFamily: 'SpaceGrotesk_700Bold' },
  scoreValue: { fontSize: 56, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -2 },
  scoreSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  xpCard: { width: '100%' },
  xpContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  xpIconWrapper: { flexShrink: 0 },
  xpIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  xpInfo: { flex: 1 },
  xpLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  xpValue: { fontSize: 32, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  xpBreakdown: { marginTop: 8, paddingLeft: 60, gap: 4 },
  breakdownItem: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', gap: 12 },
  reviewList: { gap: 10 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  reviewCorrect: { borderColor: '#22c55e30', backgroundColor: '#22c55e10' },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  reviewNumberText: { fontSize: 13, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  reviewStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewStatusText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  reviewRight: { alignItems: 'flex-end', gap: 8 },
  reviewXP: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  reviewXPText: { fontSize: 12, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  reviewTime: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  actions: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  bottomSpacer: { height: 40 },
});