import React, { useEffect, useState } from 'react';
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
import { useStudy, useAuth } from '@/context';
import { SubjectCard } from '@/components/SubjectCard';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { mockTopics } from '@/utils/mockData';
import { Topic } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SubjectDetailScreen({ route }: any) {
  const { subjectId } = route.params;
  const { subjects, getSubjectTopics, setCurrentSubject, completeTopic } = useStudy();
  const { medium } = useHaptics();

  const subject = subjects.find(s => s.id === subjectId);
  const topics = getSubjectTopics(subjectId);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);

  const floatStyle = useFloatAnimation(10, 4000);

  React.useEffect(() => {
    if (subject) setCurrentSubject(subject);
  }, [subject]);

  const handleTopicPress = (topic: Topic) => {
    if (!topic.isLocked) {
      medium();
      setSelectedTopic(topic);
      router.push(`/study/topic/${subjectId}/${topic.id}`);
    }
  };

  if (!subject) return null;

  const gradientColors = subject.gradient || ['#0ea5e9', '#8b5cf6'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.hero}>
            <View style={styles.heroContent}>
              <View style={[styles.subjectIcon, { backgroundColor: gradientColors[0] + '30' }]}>
                <Ionicons name={getSubjectIcon(subjectId)} size={36} color={gradientColors[0]} />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <View style={styles.subjectMeta}>
                  <Text style={styles.metaItem}>{subject.topicsCompleted} / {subject.topicsTotal} Topics</Text>
                  <Text style={styles.metaItem}>🔥 {subject.streak} Day Streak</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroProgress}>
              <ProgressRing
                progress={subject.progress}
                size={100}
                strokeWidth={6}
                gradientColors={gradientColors}
                percentageSize={28}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <GlassCard style={styles.actionCard} glow={gradientColors[0]}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/study/knowledge-map/${subjectId}`)}>
                <Ionicons name="git-network" size={22} color="#fff" />
                <Text style={styles.actionText}>Knowledge Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/study/ai-assistant/${subjectId}`)}>
                <Ionicons name="sparkles" size={22} color="#fff" />
                <Text style={styles.actionText}>AI Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/study/quiz/${subjectId}`)}>
                <Ionicons name="help-circle-outline" size={22} color="#fff" />
                <Text style={styles.actionText}>Practice Quiz</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance3}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TOPICS</Text>
            <Text style={styles.sectionSubtitle}>{topics.length} topics • {subject.totalHours}h total</Text>
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.topicsList}>
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={i}
                subjectColor={gradientColors[0]}
                onPress={() => handleTopicPress(topic)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function TopicCard({ topic, index, subjectColor, onPress }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  
  const pressScale = useSharedValue(1);
  const pressIn = () => pressScale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  const pressOut = () => pressScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const isCompleted = topic.isCompleted;
  const isLocked = topic.isLocked;

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity
        style={styles.topicCard}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.topicStatus}>
            {isCompleted && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            {isLocked && !isCompleted && <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.3)" />}
            {!isCompleted && !isLocked && (
              <View style={[styles.statusRing, { borderColor: subjectColor }]} />
            )}
          </View>
          <View style={styles.topicContent}>
            <Text style={styles.topicNumber}>Topic {topic.order}</Text>
            <Text style={styles.topicName}>{topic.name}</Text>
            <View style={styles.topicMeta}>
              <Text style={[styles.metaTag, { backgroundColor: subjectColor + '30', borderColor: subjectColor }]}>
                {topic.estimatedMinutes} min
              </Text>
              <Text style={[styles.metaTag, { backgroundColor: '#f59e0b30', borderColor: '#f59e0b' }]}>
                +{topic.xpReward} XP
              </Text>
            </View>
            <View style={styles.topicProgress}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: subjectColor,
                    width: `${topic.progress}%`,
                  }}
                />
              </View>
            </View>
          </View>
          {!isLocked && (
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={styles.chevron} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getSubjectIcon(subjectId: string): string {
  const icons: Record<string, string> = {
    java: 'logo-java',
    python: 'logo-python',
    javascript: 'logo-javascript',
    cpp: 'cube-outline',
    datastructures: 'git-network',
    algorithms: 'calculator-outline',
    databases: 'server-outline',
    networking: 'globe-outline',
    operating_systems: 'desktop-outline',
    machine_learning: 'construct-outline',
  };
  return icons[subjectId] || 'book-outline';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  subjectIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.5 },
  subjectMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  heroProgress: { alignItems: 'center' },
  actionCard: { width: '100%', padding: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  topicsList: { gap: 10 },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    gap: 16,
  },
  topicStatus: { width: 32, alignItems: 'center' },
  statusRing: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  topicContent: { flex: 1, gap: 8 },
  topicNumber: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  topicName: { fontSize: 16, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  topicMeta: { flexDirection: 'row', gap: 8 },
  metaTag: { fontSize: 10, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, borderWidth: 1, fontFamily: 'Inter_600SemiBold' },
  topicProgress: { marginTop: 4 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  chevron: { marginLeft: 8 },
  bottomSpacer: { height: 40 },
});