import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRewards } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { mockAchievements } from '@/utils/mockData';

export default function AchievementsScreen() {
  const { achievements, totalEarned } = useRewards();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Achievements</Text>
            <Text style={styles.headerSubtitle}>{achievements.filter(a => a.isUnlocked).length} / {achievements.length} unlocked</Text>
          </View>
        </View>

        <View style={styles.achievementsList}>
          {mockAchievements.map((achievement, i) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  achievementsList: { gap: 12 },
  achievementCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  achievementUnlocked: { borderColor: 'rgba(255,255,255,0.1)' },
  achievementLocked: { opacity: 0.5, borderColor: 'rgba(255,255,255,0.03)' },
  achievementIconWrapper: { position: 'relative' },
  achievementIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  achievementEmoji: { fontSize: 24 },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  achievementInfo: { flex: 1, gap: 8 },
  achievementName: { fontSize: 16, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  achievementDesc: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  achievementProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  unlockedBadge: { alignItems: 'flex-end', paddingTop: 8 },
  unlockedText: { fontSize: 10, fontWeight: '700', color: '#22c55e', fontFamily: 'SpaceGrotesk_700Bold' },
  unlockedDate: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
});