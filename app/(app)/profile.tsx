import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
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
import { useAuth, useStudy, useFocus, useRewards } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ProgressRing } from '@/components/ProgressRing';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { formatDuration } from '@/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, updatePreferences, logout } = useAuth();
  const { subjects } = useStudy();
  const { totalFocusToday, distractionsBlockedToday } = useFocus();
  const { totalEarned, totalUsed } = useRewards();
  const { medium, heavy } = useHaptics();

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);
  const entrance5 = useStaggeredEntrance(4, 80);

  const floatStyle = useFloatAnimation(15, 5000);

  if (!user) return null;

  const totalTopics = subjects.reduce((sum, s) => sum + s.topicsTotal, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.topicsCompleted, 0);
  const avgProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={['#0ea5e9', '#8b5cf6', '#ec4899']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{user.name?.charAt(0) || 'G'}</Text>
              </LinearGradient>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{user.level}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.profileMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>XP</Text>
                  <Text style={styles.metaValue}>{user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Streak</Text>
                  <Text style={styles.metaValue}>🔥 {user.streak} days</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Rank</Text>
                  <Text style={styles.metaValue}>#{getRank(user.xp)}</Text>
                </View>
              </View>
            </View>
            <ProgressRing
              progress={(user.xp / user.xpToNextLevel) * 100}
              size={60}
              strokeWidth={4}
              gradientColors={['#0ea5e9', '#8b5cf6']}
              percentageSize={14}
              showPercentage={false}
            />
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.xpProgress}>
            <View style={styles.xpLabels}>
              <Text style={styles.xpLabel}>Level {user.level}</Text>
              <Text style={styles.xpLabel}>Level {user.level + 1}</Text>
            </View>
            <View style={styles.xpBar}>
              <Animated.View
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: '#0ea5e9',
                  width: `${(user.xp / user.xpToNextLevel) * 100}%`,
                }}
              />
            </View>
            <Text style={styles.xpRemaining}>{user.xpToNextLevel - user.xp} XP to next level</Text>
          </View>
        </Animated.View>

        <Animated.View style={entrance3}>
          <View style={styles.statsRow}>
            <StatCard
              label="TOTAL FOCUS"
              value={formatDuration(totalFocusToday)}
              color="#0ea5e9"
              gradient={['#0ea5e9', '#8b5cf6']}
              index={0}
            />
            <StatCard
              label="TOPICS DONE"
              value={completedTopics}
              suffix={` / ${totalTopics}`}
              color="#8b5cf6"
              gradient={['#8b5cf6', '#ec4899']}
              index={1}
            />
            <StatCard
              label="SCREEN TIME"
              value={totalEarned - totalUsed}
              suffix=" min"
              color="#f59e0b"
              gradient={['#f59e0b', '#ec4899']}
              index={2}
            />
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUICK STATS</Text>
          </View>
          <View style={styles.quickStatsGrid}>
            <QuickStat label="Study Hours" value={`${user.totalStudyHours}h`} icon="⏱️" color="#0ea5e9" />
            <QuickStat label="Quizzes" value={user.totalQuizzesCompleted} icon="🧠" color="#8b5cf6" />
            <QuickStat label="Topics" value={user.totalTopicsCompleted} icon="📚" color="#22c55e" />
            <QuickStat label="Avg Progress" value={`${avgProgress}%`} icon="📈" color="#f59e0b" />
            <QuickStat label="Distractions" value={distractionsBlockedToday} icon="🔒" color="#ef4444" />
            <QuickStat label="Rewards Used" value={totalUsed} icon="🎁" color="#ec4899" />
          </View>
        </Animated.View>

        <Animated.View style={entrance5}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
          </View>
          <View style={settingsList}>
            <SettingsItem icon="notifications-outline" title="Notifications" subtitle="Manage reminders & alerts" onPress={() => router.push('/notifications')} />
            <SettingsItem icon="timer-outline" title="Focus Duration" subtitle={`${user.preferences.focusDuration} min sessions`} onPress={() => {}} />
            <SettingsItem icon="musical-notes-outline" title="Ambient Sounds" subtitle={`${user.preferences.ambientSound}`} onPress={() => {}} />
            <SettingsItem icon="moon-outline" title="Dark Mode" subtitle={user.preferences.theme === 'dark' ? 'Enabled' : 'Disabled'} onPress={() => {}} />
            <SettingsItem icon="accessibility-outline" title="Reduced Motion" subtitle={user.preferences.reducedMotion ? 'Enabled' : 'Disabled'} onPress={() => {}} />
            <SettingsItem icon="person-outline" title="Edit Profile" subtitle="Update name & avatar" onPress={() => router.push('/profile/edit')} />
            <SettingsItem icon="help-outline" title="Help & Support" subtitle="FAQ & contact us" onPress={() => {}} />
            <SettingsItem icon="log-out-outline" title="Sign Out" subtitle="Log out of your account" onPress={() => { heavy(); logout(); }} destructive />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function QuickStat({ label, value, icon, color }: any) {
  return (
    <View style={styles.quickStat}>
      <View style={[styles.quickStatIcon, { backgroundColor: color + '30' }]}>
        <Text style={styles.quickStatEmoji}>{icon}</Text>
      </View>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function SettingsItem({ icon, title, subtitle, onPress, destructive }: any) {
  const pressScale = useSharedValue(1);
  
  const pressIn = () => pressScale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  const pressOut = () => pressScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View style={animatedStyle}>
        <View style={[styles.settingsIcon, { backgroundColor: destructive ? '#ef444430' : 'rgba(255,255,255,0.05)' }]}>
          <Ionicons name={icon} size={20} color={destructive ? '#ef4444' : 'rgba(255,255,255,0.6)'} />
        </View>
        <View style={styles.settingsInfo}>
          <Text style={[styles.settingsTitle, { color: destructive ? '#ef4444' : '#fff' }]}>{title}</Text>
          <Text style={styles.settingsSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </Animated.View>
    </TouchableOpacity>
  );
}

function getRank(xp: number): number {
  return Math.max(1, 1000 - Math.floor(xp / 10));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 4 },
  avatarWrapper: { position: 'relative' },
  avatarGradient: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  levelBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f59e0b', borderWidth: 3, borderColor: '#03060a', alignItems: 'center', justifyContent: 'center' },
  levelText: { fontSize: 11, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontFamily: 'Inter_500Medium' },
  profileMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  xpProgress: { paddingHorizontal: 4 },
  xpLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  xpBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  xpRemaining: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, fontFamily: 'Inter_500Medium' },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  quickStat: { width: '30%', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 8 },
  quickStatIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickStatEmoji: { fontSize: 20 },
  quickStatValue: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 4 },
  quickStatLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  settingsList: { gap: 10 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  settingsIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingsInfo: { flex: 1, gap: 2 },
  settingsTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  settingsSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  bottomSpacer: { height: 40 },
});