import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/context';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function StreakScreen() {
  const { user } = useAuth();
  const { medium } = useHaptics();

  if (!user) return null;

  const floatStyle = useFloatAnimation(15, 5000);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withSpring(1.1, { damping: 15, stiffness: 100 });
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakData = [true, true, true, true, true, true, false];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Study Streak</Text>
        </View>

        <View style={styles.streakHero}>
          <View style={[styles.streakBadge, floatStyle, pulseStyle]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{user.streak}</Text>
            <Text style={styles.streakLabel}>DAY STREAK</Text>
          </View>
          <Text style={styles.streakSubtitle}>{user.longestStreak} day longest streak</Text>
        </View>

        <GlassCard style={styles.weekCard} glow="#ef4444">
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <View style={styles.weekGrid}>
            {days.map((day, i) => (
              <View key={day} style={[styles.dayCell, streakData[i] && styles.dayActive]}>
                <Text style={[styles.dayLetter, { color: streakData[i] ? '#fff' : 'rgba(255,255,255,0.4)' }]}>{day}</Text>
                <View style={[styles.dayDot, streakData[i] && styles.dayDotActive]} />
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.statsCard} glow="#0ea5e9">
          <Text style={styles.sectionTitle}>STREAK STATS</Text>
          <View style={styles.statsGrid}>
            <StreakStat label="Current Streak" value={`${user.streak} days`} icon="🔥" color="#ef4444" />
            <StreakStat label="Longest Streak" value={`${user.longestStreak} days`} icon="🏆" color="#f59e0b" />
            <StreakStat label="Total Days" value={`${Math.floor(user.totalStudyHours / 2)} days`} icon="📅" color="#0ea5e9" />
            <StreakStat label="This Month" value={`${user.streak * 2} days`} icon="📈" color="#8b5cf6" />
          </View>
        </GlassCard>

        <GlassCard style={styles.milestonesCard} glow="#8b5cf6">
          <Text style={styles.sectionTitle}>UPCOMING MILESTONES</Text>
          <View style={styles.milestonesList}>
            <Milestone day={7} label="Week Warrior" reward="500 XP" progress={user.streak} color="#ef4444" />
            <Milestone day={14} label="Fortnight Fighter" reward="1000 XP" progress={user.streak} color="#f59e0b" />
            <Milestone day={30} label="Monthly Master" reward="2500 XP" progress={user.streak} color="#8b5cf6" />
            <Milestone day={100} label="Century Scholar" reward="10000 XP" progress={user.streak} color="#ec4899" />
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function StreakStat({ label, value, icon, color }: any) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
        <Text style={styles.statEmoji}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Milestone({ day, label, reward, progress, color }: any) {
  const isReached = progress >= day;
  const progressPercent = Math.min((progress / day) * 100, 100);

  return (
    <View style={styles.milestone}>
      <View style={styles.milestoneLeft}>
        <View style={[styles.milestoneIcon, { backgroundColor: color + '30', borderColor: color }]}>
          <Text style={styles.milestoneDay}>{day}</Text>
        </View>
        <View style={styles.milestoneInfo}>
          <Text style={[styles.milestoneLabel, { color: isReached ? '#fff' : 'rgba(255,255,255,0.4)' }]}>{label}</Text>
          <Text style={styles.milestoneReward}>{reward}</Text>
        </View>
      </View>
      <View style={styles.milestoneRight}>
        <View style={styles.milestoneProgress}>
          <View style={styles.progressBar}>
            <View style={{ height: '100%', borderRadius: 2, backgroundColor: color, width: `${progressPercent}%` }} />
          </View>
          <Text style={styles.progressText}>{progress} / {day}</Text>
        </View>
        {isReached && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  streakHero: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  streakBadge: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ef444430', borderWidth: 3, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  streakEmoji: { fontSize: 36 },
  streakNumber: { fontSize: 32, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: -4 },
  streakLabel: { fontSize: 11, fontWeight: '700', color: '#ef4444', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  streakSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  weekCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  weekGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  dayCell: { alignItems: 'center', gap: 8 },
  dayActive: {},
  dayLetter: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  dayDotActive: { backgroundColor: '#ef4444' },
  statsCard: { width: '100%' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  stat: { width: '45%', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 8 },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  milestonesCard: { width: '100%' },
  milestonesList: { gap: 12 },
  milestone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  milestoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  milestoneIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  milestoneDay: { fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  milestoneInfo: { gap: 2 },
  milestoneLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  milestoneReward: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  milestoneRight: { alignItems: 'flex-end', gap: 8 },
  milestoneProgress: { alignItems: 'flex-end' },
  progressBar: { width: 80, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressText: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'Inter_500Medium' },
});