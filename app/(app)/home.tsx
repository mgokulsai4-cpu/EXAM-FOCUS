import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
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
import { useAuth, useStudy, useRewards, useFocus } from '@/context';
import { FocusOrb } from '@/components/FocusOrb';
import { SubjectCard } from '@/components/SubjectCard';
import { MissionCard } from '@/components/MissionCard';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { StatCard } from '@/components/StatCard';
import { useStaggeredEntrance, useFloatAnimation, useCountUpAnimation, useShimmerAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { formatTimeRemaining } from '@/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { subjects, exams, missions, getExamReadiness } = useStudy();
  const { rewards, totalEarned } = useRewards();
  const { totalFocusToday, distractionsBlockedToday } = useFocus();
  const { light, medium } = useHaptics();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  const floatStyle = useFloatAnimation(10, 4000);
  const shimmerStyle = useShimmerAnimation();

  const nextExam = exams.find(e => e.isActive) || exams[0];
  const readiness = nextExam ? getExamReadiness(nextExam.id) : 0;
  const timeRemaining = nextExam ? formatTimeRemaining(nextExam.date, nextExam.time) : null;

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);
  const entrance5 = useStaggeredEntrance(4, 80);
  const entrance6 = useStaggeredEntrance(5, 80);

  const { value: focusTodayValue } = useCountUpAnimation(totalFocusToday / 60, 1500);
  const { value: distractionsValue } = useCountUpAnimation(distractionsBlockedToday, 1500);
  const { value: screenTimeValue } = useCountUpAnimation(totalEarned, 1500);

  const onRefresh = async () => {
    setRefreshing(true);
    medium();
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const scrollHandler = Animated.createAnimatedComponent(ScrollView);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
            progressBackgroundColor="#0a111e"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <Animated.View style={entrance1}>
          <View style={styles.header}>
            <View style={styles.greeting}>
              <Text style={styles.greetingTime}>Good evening</Text>
              <Text style={styles.greetingName}>{user?.name || 'Student'} 👋</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
                <Ionicons name="person-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          {nextExam && (
            <GlassCard style={styles.examCard} glow={nextExam.color}>
              <View style={styles.examHeader}>
                <View style={styles.examIconWrapper}>
                  <Ionicons name="calendar-outline" size={20} color={nextExam.color} />
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examLabel}>NEXT EXAM</Text>
                  <Text style={[styles.examName, { color: nextExam.color }]}>{nextExam.name}</Text>
                </View>
              </View>
              {timeRemaining && (
                <View style={styles.examCountdown}>
                  <View style={styles.countdownItem}>
                    <Text style={[styles.countdownNumber, { color: nextExam.color }]}>{timeRemaining.days}</Text>
                    <Text style={styles.countdownUnit}>Days</Text>
                  </View>
                  <View style={styles.countdownSeparator}>:</View>
                  <View style={styles.countdownItem}>
                    <Text style={[styles.countdownNumber, { color: nextExam.color }]}>{timeRemaining.hours}</Text>
                    <Text style={styles.countdownUnit}>Hours</Text>
                  </View>
                  <View style={styles.countdownSeparator}>:</View>
                  <View style={styles.countdownItem}>
                    <Text style={[styles.countdownNumber, { color: nextExam.color }]}>{timeRemaining.minutes}</Text>
                    <Text style={styles.countdownUnit}>Minutes</Text>
                  </View>
                </View>
              )}
              <View style={styles.examProgress}>
                <View style={styles.examProgressBar}>
                  <Animated.View
                    style={{
                      height: '100%',
                      borderRadius: 3,
                      backgroundColor: nextExam.color,
                      width: `${readiness}%`,
                    }}
                  />
                </View>
                <Text style={styles.examProgressText}>Exam Readiness: {readiness}%</Text>
              </View>
            </GlassCard>
          )}
        </Animated.View>

        <Animated.View style={entrance3}>
          <FocusOrb
            readiness={readiness}
            status={readiness >= 80 ? 'focus' : readiness >= 50 ? 'studying' : 'idle'}
            message={readiness >= 80 ? 'Exam Ready' : readiness >= 50 ? 'Keep Going' : 'Just Started'}
            size={240}
            showParticles={true}
          />
        </Animated.View>

        <Animated.View style={entrance4}>
          <Text style={styles.sectionTitle}>TODAY'S MISSION</Text>
          <View style={styles.missionsList}>
            {missions.map((mission, i) => (
              <MissionCard key={mission.id} mission={mission} index={i} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance5}>
          <View style={styles.statsRow}>
            <StatCard
              label="FOCUS TODAY"
              value={Math.round(focusTodayValue * 10) / 10}
              suffix="h"
              color="#0ea5e9"
              gradient={['#0ea5e9', '#8b5cf6']}
              index={0}
            />
            <StatCard
              label="DISTRACTIONS BLOCKED"
              value={distractionsValue}
              suffix="×"
              color="#ef4444"
              gradient={['#ef4444', '#f97316']}
              index={1}
            />
            <StatCard
              label="SCREEN TIME EARNED"
              value={screenTimeValue}
              suffix=" min"
              color="#f59e0b"
              gradient={['#f59e0b', '#ec4899']}
              index={2}
            />
          </View>
        </Animated.View>

        <Animated.View style={entrance6}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CONTINUE LEARNING</Text>
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/study')}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
          <View style={styles.subjectsList}>
            {subjects.slice(0, 3).map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                variant="default"
                onPress={() => router.push(`/study/subject/${subject.id}`)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 4, paddingTop: 8 },
  greeting: { flex: 1 },
  greetingTime: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  greetingName: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  examCard: { width: '100%' },
  examHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  examIconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  examInfo: { flex: 1 },
  examLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  examName: { fontSize: 18, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  examCountdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 },
  countdownItem: { alignItems: 'center' },
  countdownNumber: { fontSize: 32, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  countdownUnit: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium', marginTop: 2 },
  countdownSeparator: { fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.2)', fontFamily: 'SpaceGrotesk_700Bold' },
  examProgress: { gap: 6 },
  examProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  examProgressText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontFamily: 'Inter_600SemiBold' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 16, letterSpacing: -0.3 },
  missionsList: { gap: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: '#0ea5e9', fontFamily: 'Inter_600SemiBold' },
  subjectsList: { gap: 12 },
  bottomSpacer: { height: 40 },
});