import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function AIQuizGeneratorScreen() {
  const { medium } = useHaptics();

  const [count, setCount] = React.useState(10);
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [topics, setTopics] = React.useState<string[]>(['java-oop', 'java-exceptions']);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Quiz Generator</Text>
        </View>

        <GlassCard style={styles.card} glow="#8b5cf6">
          <Text style={styles.sectionTitle}>CONFIGURE YOUR QUIZ</Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Number of Questions</Text>
            <View style={styles.countSelector}>
              <TouchableOpacity onPress={() => setCount(Math.max(5, count - 5))} style={styles.countBtn}>
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.countValue}>{count}</Text>
              <TouchableOpacity onPress={() => setCount(Math.min(50, count + 5))} style={styles.countBtn}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Difficulty</Text>
            <View style={styles.difficultySelector}>
              {(['easy', 'medium', 'hard', 'mixed'] as const).map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.difficultyBtn, difficulty === d && styles.difficultyActive, { borderColor: difficulty === d ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.difficultyText, { color: difficulty === d ? '#8b5cf6' : '#fff' }]}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Topics</Text>
            <View style={styles.topicChips}>
              {['java-oop', 'java-exceptions', 'java-collections', 'java-multithreading'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.topicChip, topics.includes(t) && styles.topicActive, { borderColor: topics.includes(t) ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }]}
                  onPress={() => setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                >
                  <Text style={[styles.topicChipText, { color: topics.includes(t) ? '#8b5cf6' : '#fff' }]}>{t.replace('java-', '').replace(/-/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        <AnimatedButton
          title="GENERATE QUIZ"
          onPress={() => {}}
          variant="gradient"
          size="xl"
          fullWidth
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  card: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 20 },
  setting: { marginBottom: 20 },
  settingLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 12, fontFamily: 'Inter_600SemiBold' },
  countSelector: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  countBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)', alignItems: 'center', justifyContent: 'center' },
  countValue: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  difficultySelector: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  difficultyBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 100 },
  difficultyActive: { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
  difficultyText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 100 },
  topicActive: { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
  topicChipText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});