import React, { useState } from 'react';
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
import { useRewards, useAuth } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ProgressRing } from '@/components/ProgressRing';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { Reward, Achievement } from '@/types';
import { mockRewards, mockAchievements } from '@/utils/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RewardsScreen() {
  const { rewards, activeReward, rewardCountdown, isCountdownActive, totalEarned, totalUsed, useReward, startCountdown } = useRewards();
  const { user } = useAuth();
  const { medium, heavy } = useHaptics();

  const [selectedTab, setSelectedTab] = useState<'vault' | 'achievements'>('vault');

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);

  const floatStyle = useFloatAnimation(10, 4000);

  const unlockedRewards = rewards.filter(r => r.isUnlocked && !r.isActive);
  const availableRewards = rewards.filter(r => !r.isUnlocked);
  const earnedCount = unlockedRewards.length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLabel}>REWARD VAULT</Text>
              <Text style={styles.headerTitle}>Earned Screen Time</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/rewards/countdown')} style={styles.vaultButton} disabled={!isCountdownActive}>
              <Ionicons name="timer-outline" size={24} color={isCountdownActive ? '#fff' : 'rgba(255,255,255,0.4)'} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tab, selectedTab === 'vault' && styles.tabActive]} 
              onPress={() => { medium(); setSelectedTab('vault'); }}
            >
              <Text style={[styles.tabText, { color: selectedTab === 'vault' ? '#fff' : 'rgba(255,255,255,0.4)' }]}>VAULT</Text>
              <Text style={[styles.tabCount, { color: selectedTab === 'vault' ? '#0ea5e9' : 'rgba(255,255,255,0.3)' }]}>{earnedCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]} 
              onPress={() => { medium(); setSelectedTab('achievements'); }}
            >
              <Text style={[styles.tabText, { color: selectedTab === 'achievements' ? '#fff' : 'rgba(255,255,255,0.4)' }]}>ACHIEVEMENTS</Text>
              <Text style={[styles.tabCount, { color: selectedTab === 'achievements' ? '#f59e0b' : 'rgba(255,255,255,0.3)' }]}>{mockAchievements.filter(a => a.isUnlocked).length}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {selectedTab === 'vault' && (
          <>
            <Animated.View style={entrance3}>
              {isCountdownActive && activeReward && (
                <GlassCard style={styles.activeRewardCard} glow="#f59e0b">
                  <View style={styles.activeRewardContent}>
                    <View style={styles.activeRewardIcon}>
                      <Text style={styles.activeRewardEmoji}>{activeReward.icon}</Text>
                    </View>
                    <View style={styles.activeRewardInfo}>
                      <Text style={styles.activeRewardLabel}>ACTIVE REWARD</Text>
                      <Text style={styles.activeRewardName}>{activeReward.name}</Text>
                    </View>
                    <View style={styles.activeRewardTimer}>
                      <Text style={styles.timerValue}>{formatCountdown(rewardCountdown)}</Text>
                      <Text style={styles.timerLabel}>remaining</Text>
                    </View>
                  </View>
                  <View style={styles.activeRewardProgress}>
                    <View style={styles.progressBar}>
                      <Animated.View
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          backgroundColor: '#f59e0b',
                          width: `${(rewardCountdown / (activeReward.durationMinutes * 60)) * 100}%`,
                        }}
                      />
                    </View>
                  </View>
                </GlassCard>
              )}
            </Animated.View>

            <Animated.View style={entrance3}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>UNLOCKED REWARDS</Text>
                <Text style={styles.sectionSubtitle}>{unlockedRewards.length} ready to use</Text>
              </View>
              <View style={styles.rewardsGrid}>
                {unlockedRewards.map((reward, i) => (
                  <RewardCard key={reward.id} reward={reward} index={i} onUse={() => { heavy(); useReward(reward.id); startCountdown(reward.id); }} />
                ))}
                {unlockedRewards.length === 0 && (
                  <View style={styles.emptyVault}>
                    <Ionicons name="lock-closed-outline" size={48} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>No rewards unlocked yet</Text>
                    <Text style={styles.emptySubtitle}>Complete missions to earn screen time</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            <Animated.View style={entrance4}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AVAILABLE REWARDS</Text>
                <Text style={styles.sectionSubtitle}>Unlock with XP</Text>
              </View>
              <View style={styles.rewardsGrid}>
                {availableRewards.map((reward, i) => (
                  <RewardCard key={reward.id} reward={reward} index={i} isLocked={true} />
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {selectedTab === 'achievements' && (
          <Animated.View style={entrance3}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
              <Text style={styles.sectionSubtitle}>{mockAchievements.filter(a => a.isUnlocked).length} / {mockAchievements.length} unlocked</Text>
            </View>
            <View style={styles.achievementsList}>
              {mockAchievements.map((achievement, i) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={i} />
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function RewardCard({ reward, index, onUse, isLocked = false }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  const pressScale = useSharedValue(1);
  
  const pressIn = () => pressScale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  const pressOut = () => pressScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const categoryColors: Record<string, string> = {
    social: '#ec4899',
    entertainment: '#f59e0b',
    gaming: '#8b5cf6',
    other: '#64748b',
  };

  const categoryColor = categoryColors[reward.category] || '#64748b';

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity
        style={[styles.rewardCard, isLocked && styles.rewardLocked, { borderColor: isLocked ? 'rgba(255,255,255,0.1)' : categoryColor }]}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onUse}
        disabled={isLocked}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>
          <View style={[styles.rewardIconWrapper, { backgroundColor: categoryColor + '30' }]}>
            <Text style={styles.rewardEmoji}>{reward.icon}</Text>
            {isLocked && <View style={styles.lockOverlay}><Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.5)" /></View>}
          </View>
          <View style={styles.rewardInfo}>
            <Text style={[styles.rewardName, { color: isLocked ? 'rgba(255,255,255,0.4)' : '#fff' }]}>{reward.name}</Text>
            <View style={styles.rewardMeta}>
              <Text style={styles.rewardDuration}>{reward.durationMinutes} min</Text>
              <Text style={[styles.rewardXP, { color: isLocked ? 'rgba(255,255,255,0.4)' : '#f59e0b' }]}>{reward.xpCost} XP</Text>
            </View>
          </View>
          {onUse && (
            <TouchableOpacity style={[styles.useButton, { backgroundColor: categoryColor + '30', borderColor: categoryColor }]} onPress={onUse} activeOpacity={0.8}>
              <Text style={[styles.useButtonText, { color: categoryColor }]}>USE</Text>
            </TouchableOpacity>
          )}
          {isLocked && (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AchievementCard({ achievement, index }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  const isUnlocked = achievement.isUnlocked;

  return (
    <Animated.View style={entranceStyle}>
      <View style={[styles.achievementCard, isUnlocked ? styles.achievementUnlocked : styles.achievementLocked]}>
        <View style={styles.achievementIconWrapper}>
          <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '30', borderColor: achievement.color }]}>
            <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
          </View>
          {!isUnlocked && <View style={styles.lockOverlay}><Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.3)" /></View>}
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementName, { color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.4)' }]}>{achievement.name}</Text>
          <Text style={[styles.achievementDesc, { color: isUnlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }]}>{achievement.description}</Text>
          <View style={styles.achievementProgress}>
            <View style={styles.progressBar}>
              <View
                style={{
                  height: '100%',
                  borderRadius: 2,
                  backgroundColor: achievement.color,
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                }}
              />
            </View>
            <Text style={styles.progressText}>{achievement.progress} / {achievement.maxProgress}</Text>
          </View>
        </View>
        {isUnlocked && achievement.unlockedAt && (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>UNLOCKED</Text>
            <Text style={styles.unlockedDate}>{new Date(achievement.unlockedAt).toLocaleDateString()}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 4 },
  headerLeft: { flex: 1 },
  headerLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 4, letterSpacing: -1 },
  vaultButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabText: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  tabCount: { fontSize: 12, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  activeRewardCard: { width: '100%' },
  activeRewardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  activeRewardIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f59e0b30', alignItems: 'center', justifyContent: 'center' },
  activeRewardEmoji: { fontSize: 28 },
  activeRewardInfo: { flex: 1 },
  activeRewardLabel: { fontSize: 10, fontWeight: '600', color: '#f59e0b', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  activeRewardName: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 2 },
  activeRewardTimer: { alignItems: 'flex-end' },
  timerValue: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  timerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  activeRewardProgress: { marginTop: 4 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' },
  rewardCard: { width: (SCREEN_WIDTH - 52) / 2, borderWidth: 2 },
  rewardLocked: { opacity: 0.6 },
  rewardIconWrapper: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  rewardEmoji: { fontSize: 28 },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  rewardInfo: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
  rewardName: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  rewardMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  rewardDuration: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  rewardXP: { fontSize: 12, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  useButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  useButtonText: { fontSize: 11, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  lockedOverlay: { position: 'absolute', top: 8, right: 8 },
  emptyVault: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_600SemiBold' },
  emptySubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  achievementsList: { gap: 12 },
  achievementCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  achievementUnlocked: { borderColor: 'rgba(255,255,255,0.1)' },
  achievementLocked: { opacity: 0.5, borderColor: 'rgba(255,255,255,0.03)' },
  achievementIconWrapper: { position: 'relative' },
  achievementIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  achievementEmoji: { fontSize: 24 },
  achievementInfo: { flex: 1, gap: 8 },
  achievementName: { fontSize: 16, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  achievementDesc: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  achievementProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  unlockedBadge: { alignItems: 'flex-end', paddingTop: 8 },
  unlockedText: { fontSize: 10, fontWeight: '700', color: '#22c55e', fontFamily: 'SpaceGrotesk_700Bold' },
  unlockedDate: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  bottomSpacer: { height: 40 },
});