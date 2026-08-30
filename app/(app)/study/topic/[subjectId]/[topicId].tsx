import React, { useState, useEffect } from 'react';
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
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance, useCountUpAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { mockTopics } from '@/utils/mockData';
import { Topic, Subtopic } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TopicLearningScreen({ route }: any) {
  const { subjectId, topicId } = route.params;
  const { subjects, getSubjectTopics, completeTopic, setCurrentTopic } = useStudy();
  const { addXP, updateStreak } = useAuth();
  const { medium, success } = useHaptics();

  const subject = subjects.find(s => s.id === subjectId);
  const topics = getSubjectTopics(subjectId);
  const topic = topics.find(t => t.id === topicId);
  const currentTopicIndex = topics.findIndex(t => t.id === topicId);

  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);

  const { value: progressValue } = useCountUpAnimation(topic?.progress || 0, 1500);

  const gradientColors = subject?.gradient || ['#0ea5e9', '#8b5cf6'];

  const handleSubtopicComplete = (subtopic: Subtopic) => {
    if (!completedSubtopics.includes(subtopic.id)) {
      success();
      setCompletedSubtopics([...completedSubtopics, subtopic.id]);
      const newProgress = Math.round((completedSubtopics.length + 1) / topic!.subtopics.length * 100);
      if (newProgress >= 100) {
        setShowCompleteModal(true);
      }
    }
    setActiveSubtopic(null);
  };

  const handleCompleteTopic = () => {
    completeTopic(subjectId, topicId);
    addXP(topic?.xpReward || 100);
    const newStreak = (subjects.find(s => s.id === subjectId)?.streak || 0) + 1;
    updateStreak(newStreak);
    setShowCompleteModal(false);
    router.back();
  };

  if (!topic || !subject) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.topicLabel, { color: gradientColors[0] }]}>TOPIC {topic.order} / {topics.length}</Text>
              <Text style={styles.topicName}>{topic.name}</Text>
            </View>
            <ProgressRing progress={topic.progress} size={50} strokeWidth={4} gradientColors={gradientColors} percentageSize={14} showPercentage />
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <GlassCard style={styles.overviewCard} glow={gradientColors[0]}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Overview</Text>
              <ProgressRing progress={topic.progress} size={50} strokeWidth={4} gradientColors={gradientColors} percentageSize={14} showPercentage />
            </View>
            <Text style={styles.overviewDescription}>{topic.description}</Text>
            <View style={styles.overviewMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Estimated Time</Text>
                <Text style={styles.metaValue}>{topic.estimatedMinutes} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>XP Reward</Text>
                <Text style={[styles.metaValue, { color: '#f59e0b' }]}>+{topic.xpReward} XP</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Quiz Questions</Text>
                <Text style={styles.metaValue}>{topic.quizQuestions}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance3}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SUBTOPICS</Text>
            <Text style={styles.sectionSubtitle}>{completedSubtopics.length} / {topic.subtopics.length} completed</Text>
          </View>
          <View style={styles.subtopicsList}>
            {topic.subtopics.map((subtopic, i) => (
              <SubtopicCard
                key={subtopic.id}
                subtopic={subtopic}
                index={i}
                isCompleted={completedSubtopics.includes(subtopic.id)}
                isActive={activeSubtopic?.id === subtopic.id}
                subjectColor={gradientColors[0]}
                onPress={() => setActiveSubtopic(activeSubtopic?.id === subtopic.id ? null : subtopic)}
                onComplete={() => handleSubtopicComplete(subtopic)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RESOURCES</Text>
          </View>
          <View style={styles.resourcesList}>
            {topic.resources.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} subjectColor={gradientColors[0]} />
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {showCompleteModal && (
        <CompleteModal
          topicName={topic.name}
          xpReward={topic.xpReward}
          gradientColors={gradientColors}
          onClose={handleCompleteTopic}
        />
      )}

      {activeSubtopic && (
        <SubtopicModal
          subtopic={activeSubtopic}
          subjectColor={gradientColors[0]}
          onClose={() => setActiveSubtopic(null)}
          onComplete={() => handleSubtopicComplete(activeSubtopic)}
        />
      )}
    </View>
  );
}

function SubtopicCard({ subtopic, index, isCompleted, isActive, subjectColor, onPress, onComplete }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity style={[styles.subtopicCard, isActive && styles.subtopicActive, { borderColor: subjectColor }]} onPress={onPress} activeOpacity={1}>
        <View style={styles.subtopicLeft}>
          <View style={[styles.subtopicStatus, { backgroundColor: isCompleted ? '#22c55e' : subjectColor }]}>
            {isCompleted ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Ionicons name="play" size={16} color="#fff" />}
          </View>
          <View style={styles.subtopicInfo}>
            <Text style={styles.subtopicTitle}>{subtopic.name}</Text>
            <Text style={styles.subtopicDuration}>{subtopic.duration} min</Text>
          </View>
        </View>
        <View style={styles.subtopicRight}>
          {isCompleted ? (
            <Text style={styles.completedText}>✓ Completed</Text>
          ) : (
            <TouchableOpacity onPress={onComplete} style={[styles.completeBtn, { backgroundColor: subjectColor + '30', borderColor: subjectColor }]}>
              <Text style={[styles.completeBtnText, { color: subjectColor }]}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ResourceCard({ resource, index, subjectColor }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  
  const ICONS: Record<string, string> = {
    video: 'videocam-outline',
    article: 'document-text-outline',
    pdf: 'document-outline',
    note: 'create-outline',
  };

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity style={[styles.resourceCard, { borderColor: subjectColor }]} activeOpacity={1}>
        <View style={[styles.resourceIcon, { backgroundColor: subjectColor + '30' }]}>
          <Ionicons name={ICONS[resource.type] || 'document-outline'} size={20} color={subjectColor} />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle}>{resource.title}</Text>
          <View style={styles.resourceMeta}>
            <Text style={styles.resourceType}>{resource.type}</Text>
            {resource.duration && <Text style={styles.resourceDuration}>{resource.duration} min</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

function CompleteModal({ topicName, xpReward, gradientColors, onClose }: any) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale }],
  }));

  return (
    <Animated.View style={[styles.modalOverlay, { opacity }]} onTouchEnd={() => {}}>
      <Animated.View style={[styles.modalContainer, containerStyle]}>
        <GlassCard style={styles.modalCard} glow={gradientColors[0]}>
          <View style={styles.modalContent}>
            <View style={[styles.celebrationIcon, { backgroundColor: gradientColors[0] + '30' }]}>
              <Ionicons name="trophy" size={40} color={gradientColors[0]} />
            </View>
            <Text style={styles.modalTitle}>Topic Complete!</Text>
            <Text style={styles.modalSubtitle}>{topicName}</Text>
            <View style={[styles.xpReward, { backgroundColor: gradientColors[0] + '30', borderColor: gradientColors[0] }]}>
              <Text style={[styles.xpText, { color: gradientColors[0] }]}>+{xpReward} XP Earned</Text>
            </View>
            <AnimatedButton title="CONTINUE" onPress={onClose} variant="gradient" size="md" fullWidth />
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
}

function SubtopicModal({ subtopic, subjectColor, onClose, onComplete }: any) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale }],
  }));

  return (
    <Animated.View style={[styles.modalOverlay, { opacity }]} onTouchEnd={onClose}>
      <Animated.View style={[styles.modalContainer, containerStyle]}>
        <GlassCard style={styles.modalCard} glow={subjectColor}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <View style={[styles.subtopicModalIcon, { backgroundColor: subjectColor + '30' }]}>
              <Ionicons name="book-outline" size={28} color={subjectColor} />
            </View>
            <Text style={styles.modalTitle}>{subtopic.name}</Text>
            <Text style={styles.modalSubtitle}>{subtopic.content}</Text>
            <View style={styles.subtopicMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{subtopic.duration} min</Text>
              </View>
            </View>
            <AnimatedButton
              title="MARK COMPLETE"
              onPress={onComplete}
              variant="gradient"
              size="md"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, paddingHorizontal: 16 },
  topicLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  topicName: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 4, letterSpacing: -0.3 },
  overviewCard: { width: '100%' },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  overviewTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  overviewDescription: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 24, marginBottom: 16, fontFamily: 'Inter_500Medium' },
  overviewMeta: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  metaValue: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4, fontFamily: 'SpaceGrotesk_700Bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  subtopicsList: { gap: 10 },
  subtopicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    gap: 16,
  },
  subtopicActive: { borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  subtopicLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  subtopicStatus: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  subtopicInfo: { gap: 2 },
  subtopicTitle: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  subtopicDuration: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  subtopicRight: { alignItems: 'flex-end' },
  completedText: { fontSize: 13, fontWeight: '600', color: '#22c55e', fontFamily: 'Inter_600SemiBold' },
  completeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  completeBtnText: { fontSize: 12, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  resourcesList: { gap: 10 },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    gap: 12,
  },
  resourceIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resourceInfo: { flex: 1, gap: 4 },
  resourceTitle: { fontSize: 14, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  resourceMeta: { flexDirection: 'row', gap: 12 },
  resourceType: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  resourceDuration: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  bottomSpacer: { height: 40 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, zIndex: 1000 },
  modalContainer: { width: '100%' },
  modalCard: { width: '100%', padding: 24 },
  modalContent: { alignItems: 'center', gap: 16 },
  modalClose: { position: 'absolute', top: 8, right: 8, padding: 4 },
  celebrationIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', textAlign: 'center' },
  modalSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  xpReward: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 100, borderWidth: 1, marginVertical: 8 },
  xpText: { fontSize: 16, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  subtopicModalIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
});