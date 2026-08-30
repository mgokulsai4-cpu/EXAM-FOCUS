import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useHaptics } from '@/hooks/useHaptics';
import { mockTopics } from '@/utils/mockData';
import { Topic } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NODE_SIZE = 60;
const NODE_SPACING_X = 140;
const NODE_SPACING_Y = 120;

export default function KnowledgeMapScreen({ route }: any) {
  const { subjectId } = route.params;
  const { subjects, getSubjectTopics, setCurrentSubject } = useStudy();
  const { medium } = useHaptics();

  const subject = subjects.find(s => s.id === subjectId);
  const topics = getSubjectTopics(subjectId);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setPan({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
      },
      onPanResponderMove: (e) => {
        setPan(prev => ({
          x: prev.x + e.nativeEvent.pageX - e.nativeEvent.pageX,
          y: prev.y + e.nativeEvent.pageY - e.nativeEvent.pageY,
        }));
      },
    })
  ).current;

  const gradientColors = subject?.gradient || ['#0ea5e9', '#8b5cf6'];

  const buildTopicTree = (topics: Topic[]) => {
    const rootTopics = topics.filter(t => t.order <= 3);
    return rootTopics.map((topic, i) => ({
      topic,
      x: SCREEN_WIDTH / 2 + (i - 1) * NODE_SPACING_X,
      y: 150,
      children: topics.filter(t => t.order > 3 && t.order <= 6).slice(i * 2, (i + 1) * 2).map((child, j) => ({
        topic: child,
        x: SCREEN_WIDTH / 2 + (i - 1) * NODE_SPACING_X + (j - 0.5) * 80,
        y: 150 + NODE_SPACING_Y,
      })),
    }));
  };

  const topicTree = buildTopicTree(topics);

  const renderConnections = () => {
    return topicTree.flatMap(branch => 
      branch.children.map(child => (
        <View
          key={`${branch.topic.id}-${child.topic.id}`}
          style={[
            styles.connectionLine,
            {
              left: branch.x + NODE_SIZE / 2,
              top: branch.y + NODE_SIZE / 2,
              width: Math.hypot(child.x - branch.x, child.y - branch.y),
              transform: [{ rotate: `${Math.atan2(child.y - branch.y, child.x - branch.x)}rad` }],
              backgroundColor: branch.topic.isCompleted ? gradientColors[0] : 'rgba(255,255,255,0.08)',
            },
          ]}
        />
      ))
    );
  };

  const renderNodes = () => {
    return topicTree.flatMap((branch, branchIndex) => [
      <TopicNode
        key={branch.topic.id}
        topic={branch.topic}
        x={branch.x}
        y={branch.y}
        gradientColors={gradientColors}
        onPress={() => handleTopicPress(branch.topic)}
        isMain={true}
      />,
      ...branch.children.map((child, childIndex) => (
        <TopicNode
          key={child.topic.id}
          topic={child.topic}
          x={child.x}
          y={child.y}
          gradientColors={gradientColors}
          onPress={() => handleTopicPress(child.topic)}
          isMain={false}
        />
      )),
    ]);
  };

  const handleTopicPress = (topic: Topic) => {
    if (!topic.isLocked) {
      medium();
      setSelectedTopic(topic);
    }
  };

  const handleStartLearning = () => {
    if (selectedTopic) {
      router.push(`/study/topic/${subjectId}/${selectedTopic.id}`);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{subject?.name} Knowledge Map</Text>
          <Text style={styles.headerSubtitle}>{topics.length} topics connected</Text>
        </View>
        <View style={styles.headerRight}>
          <ProgressRing progress={subject?.progress || 0} size={50} strokeWidth={4} gradientColors={gradientColors} percentageSize={14} showPercentage />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          {renderConnections()}
          {renderNodes()}
        </View>
      </View>

      {selectedTopic && (
        <View style={styles.bottomSheet}>
          <GlassCard style={styles.bottomSheetCard} glow={gradientColors[0]}>
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIcon, { backgroundColor: gradientColors[0] + '30' }]}>
                <Ionicons name="book-outline" size={20} color={gradientColors[0]} />
              </View>
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetTitle}>{selectedTopic.name}</Text>
                <Text style={styles.sheetDescription}>{selectedTopic.description}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTopic(null)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{selectedTopic.estimatedMinutes} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>XP Reward</Text>
                <Text style={styles.metaValue}>+{selectedTopic.xpReward} XP</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Quiz Questions</Text>
                <Text style={styles.metaValue}>{selectedTopic.quizQuestions}</Text>
              </View>
            </View>
            <AnimatedButton
              title={selectedTopic.isCompleted ? 'REVIEW' : 'START LEARNING'}
              onPress={handleStartLearning}
              variant="gradient"
              size="md"
              fullWidth
            />
          </GlassCard>
        </View>
      )}
    </View>
  );
}

function TopicNode({ topic, x, y, gradientColors, onPress, isMain }: any) {
  const [pressed, setPressed] = useState(false);
  const isCompleted = topic.isCompleted;
  const isLocked = topic.isLocked;
  const isCurrent = !isCompleted && !isLocked && topic.progress > 0;

  const nodeStyle = {
    position: 'absolute',
    left: x - NODE_SIZE / 2,
    top: y - NODE_SIZE / 2,
    width: NODE_SIZE * (isMain ? 1 : 0.85),
    height: NODE_SIZE * (isMain ? 1 : 0.85),
  };

  return (
    <TouchableOpacity
      style={nodeStyle}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isLocked}
      activeOpacity={1}
    >
      <View
        style={[
          styles.node,
          {
            width: NODE_SIZE * (isMain ? 1 : 0.85),
            height: NODE_SIZE * (isMain ? 1 : 0.85),
            borderColor: isCompleted ? '#22c55e' : isCurrent ? gradientColors[0] : isLocked ? 'rgba(255,255,255,0.15)' : gradientColors[0],
            backgroundColor: isCompleted ? '#22c55e30' : isCurrent ? gradientColors[0] + '30' : isLocked ? 'rgba(255,255,255,0.03)' : 'transparent',
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={isMain ? 24 : 20} color="#22c55e" />
        ) : isLocked ? (
          <Ionicons name="lock-closed" size={isMain ? 24 : 20} color="rgba(255,255,255,0.3)" />
        ) : (
          <Ionicons name={getTopicIcon(topic.id)} size={isMain ? 24 : 20} color={isCurrent ? gradientColors[0] : 'rgba(255,255,255,0.6)'} />
        )}
        {isCurrent && !isLocked && (
          <Animated.View style={styles.pulseRing} />
        )}
      </View>
      <Text style={[styles.nodeLabel, { left: x, top: y + NODE_SIZE / 2 + 8 }]} numberOfLines={1}>
        {topic.name}
      </Text>
    </TouchableOpacity>
  );
}

function getTopicIcon(topicId: string): string {
  if (topicId.includes('oop') || topicId.includes('class')) return 'construct-outline';
  if (topicId.includes('inheritance')) return 'git-branch';
  if (topicId.includes('polymorphism')) return 'shuffle-outline';
  if (topicId.includes('exception')) return 'warning-outline';
  if (topicId.includes('collection')) return 'grid-outline';
  if (topicId.includes('thread')) return 'sync-outline';
  return 'document-outline';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  headerRight: { width: 44 },
  mapContainer: { flex: 1, overflow: 'hidden' },
  mapWrapper: { flex: 1, paddingHorizontal: 20, paddingVertical: 20 },
  connectionLine: { position: 'absolute', height: 2, borderRadius: 1, opacity: 0.6 },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40 },
  bottomSheetCard: { width: '100%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  sheetIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sheetInfo: { flex: 1 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  sheetDescription: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: 'Inter_500Medium' },
  closeButton: { padding: 4 },
  sheetMeta: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, fontFamily: 'SpaceGrotesk_700Bold' },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 2, fontFamily: 'SpaceGrotesk_700Bold' },
  node: { borderRadius: 9999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  pulseRing: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 9999, borderWidth: 2, borderColor: gradientColors[0] },
  nodeLabel: { position: 'absolute', fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textAlign: 'center', width: 80, marginLeft: -40, fontFamily: 'Inter_600SemiBold' },
});