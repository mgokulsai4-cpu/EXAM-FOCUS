import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressRing } from './ProgressRing';
import { GlassCard } from './GlassCard';
import { Subject } from '@/types';

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'featured';
  showStreak?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  java: '☕',
  python: '🐍',
  javascript: '⚡',
  cpp: '⚙️',
  datastructures: '📊',
  algorithms: '🧮',
  databases: '🗄️',
  networking: '🌐',
  operating_systems: '💻',
  machine_learning: '🤖',
};

export const SubjectCard = React.memo(function SubjectCard({
  subject,
  onPress,
  variant = 'default',
  showStreak = true,
}: SubjectCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const pressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
    glowOpacity.value = withTiming(0.3, { duration: 100 });
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const gradientColors = subject.gradient || ['#0ea5e9', '#8b5cf6'];

  if (variant === 'compact') {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.compactCard}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={onPress}
          activeOpacity={1}
        >
          <View style={[styles.compactIcon, { backgroundColor: gradientColors[0] + '30' }]}>
            <Text style={styles.compactIconText}>{ICONS[subject.id] || '📚'}</Text>
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{subject.shortName}</Text>
            <View style={styles.compactProgressBar}>
              <Animated.View
                style={[
                  styles.compactProgressFill,
                  {
                    width: `${interpolate(subject.progress, [0, 100], [0, 100], Extrapolate.CLAMP)}%`,
                    backgroundColor: gradientColors[0],
                  },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.compactPercent, { color: gradientColors[0] }]}>{subject.progress}%</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'featured') {
    return (
      <Animated.View style={animatedStyle}>
        <GlassCard
          style={styles.featuredCard}
          glow={gradientColors[0]}
          onPress={onPress}
          pressScale={0.99}
        >
          <View style={styles.featuredHeader}>
            <View style={[styles.featuredIcon, { backgroundColor: gradientColors[0] + '30' }]}>
              <Text style={styles.featuredIconText}>{ICONS[subject.id] || '📚'}</Text>
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{subject.name}</Text>
              <Text style={styles.featuredSubtitle}>
                {subject.topicsCompleted} / {subject.topicsTotal} Topics
              </Text>
            </View>
          </View>
          <View style={styles.featuredProgress}>
            <ProgressRing
              progress={subject.progress}
              size={100}
              strokeWidth={6}
              gradientColors={gradientColors}
              percentageSize={24}
            />
            {showStreak && subject.streak > 0 && (
              <View style={styles.featuredStreak}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>{subject.streak} Day Streak</Text>
              </View>
            )}
          </View>
          <View style={styles.featuredAction}>
            <Text style={[styles.continueText, { color: gradientColors[0] }]}>CONTINUE</Text>
          </View>
        </GlassCard>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard
        style={styles.defaultCard}
        glow={gradientColors[0]}
        onPress={onPress}
        pressScale={0.98}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: gradientColors[0] + '30' }]}>
            <Text style={styles.cardIconText}>{ICONS[subject.id] || '📚'}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{subject.name}</Text>
            <View style={styles.cardMeta}>
              {showStreak && subject.streak > 0 && (
                <Text style={[styles.streakBadge, { backgroundColor: gradientColors[0] + '30', borderColor: gradientColors[0] }]}>
                  🔥 {subject.streak} Days
                </Text>
              )}
              <Text style={styles.cardTopics}>{subject.topicsCompleted} / {subject.topicsTotal}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardProgress}>
          <ProgressRing
            progress={subject.progress}
            size={80}
            strokeWidth={5}
            gradientColors={gradientColors}
            percentageSize={20}
            showPercentage={true}
          />
        </View>
        <View style={styles.cardAction}>
          <Text style={[styles.continueText, { color: gradientColors[0] }]}>CONTINUE</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
});

SubjectCard.displayName = 'SubjectCard';

const styles = StyleSheet.create({
  defaultCard: { width: '100%' },
  featuredCard: { width: '100%' },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featuredIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  compactIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 20 },
  featuredIconText: { fontSize: 26 },
  compactIconText: { fontSize: 18 },
  cardInfo: { flex: 1 },
  featuredInfo: { flex: 1 },
  compactInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  featuredName: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  compactName: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  cardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  featuredSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  streakBadge: { fontSize: 10, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, borderWidth: 1 },
  cardTopics: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  cardProgress: { alignItems: 'center', marginVertical: 8 },
  featuredProgress: { alignItems: 'center', marginVertical: 8 },
  compactProgressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  compactProgressFill: { height: '100%', borderRadius: 2 },
  compactPercent: { fontSize: 13, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  featuredStreak: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  streakIcon: { fontSize: 14 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#f59e0b' },
  cardAction: { paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  featuredAction: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  continueText: { fontSize: 13, fontWeight: '700', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
});