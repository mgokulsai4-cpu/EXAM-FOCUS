import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { StudyMission } from '@/types';
import { useStaggeredEntrance } from '@/hooks/useAnimations';

interface MissionCardProps {
  mission: StudyMission;
  onPress?: () => void;
  index?: number;
}

const ICONS: Record<string, React.ReactNode> = {
  topics: '🎯',
  quizzes: '🧠',
  streak: '🔥',
  focus: '⏱️',
  xp: '⭐',
};

export const MissionCard = React.memo(function MissionCard({ mission, onPress, index = 0 }: MissionCardProps) {
  const entranceStyle = useStaggeredEntrance(index, 100);
  
  const progress = mission.target > 0 ? mission.current / mission.target : 0;
  const animatedProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000, delay: index * 100 + 300, easing: (t) => t * t * (3 - 2 * t) });
    glowOpacity.value = withTiming(mission.isCompleted ? 1 : 0, { duration: 500, delay: index * 100 + 1000 });
  }, [progress, mission.isCompleted, index]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(animatedProgress.value, [0, 1], [0, 100], Extrapolate.CLAMP)}%`,
  }));

  const completionGlow = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.3], Extrapolate.CLAMP),
  }));

  const isComplete = mission.isCompleted || progress >= 1;

  return (
    <Animated.View style={entranceStyle}>
      <GlassCard
        style={styles.card}
        glow={isComplete ? '#22c55e' : mission.color}
        onPress={onPress}
        pressScale={0.99}
      >
        <Animated.View style={[styles.completionGlow, completionGlow]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: mission.color + '30' }]}>
              <Text style={styles.icon}>{ICONS[mission.type] || '📋'}</Text>
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.title}>{mission.title}</Text>
              <Text style={styles.description}>{mission.description}</Text>
            </View>
            {isComplete && <Text style={styles.completedBadge}>✓ COMPLETED</Text>}
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: mission.color }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{mission.current} / {mission.target}</Text>
              <Text style={[styles.xpReward, { color: mission.color }]}>+{mission.xpReward} XP</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
});

MissionCard.displayName = 'MissionCard';

const styles = StyleSheet.create({
  card: { width: '100%' },
  completionGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  content: { padding: 16, position: 'relative', zIndex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: 18 },
  missionInfo: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  description: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontFamily: 'Inter_500Medium' },
  completedBadge: { fontSize: 10, fontWeight: '700', color: '#22c55e', marginTop: 4, fontFamily: 'SpaceGrotesk_700Bold' },
  progressSection: { gap: 6 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  xpReward: { fontSize: 11, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
});