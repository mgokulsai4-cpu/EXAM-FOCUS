import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function AnalyticsScreen() {
  const { medium } = useHaptics();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="STUDY HOURS" value={47.5} suffix="h" color="#0ea5e9" gradient={['#0ea5e9', '#8b5cf6']} index={0} />
          <StatCard label="QUIZ ACCURACY" value={82} suffix="%" color="#22c55e" gradient={['#22c55e', '#10b981']} index={1} />
          <StatCard label="EXAM READINESS" value={82} suffix="%" color="#8b5cf6" gradient={['#8b5cf6', '#ec4899']} index={2} />
          <StatCard label="FOCUS SESSIONS" value={34} suffix="×" color="#f59e0b" gradient={['#f59e0b', '#ec4899']} index={3} />
          <StatCard label="DISTRACTIONS" value={127} suffix="×" color="#ef4444" gradient={['#ef4444', '#f97316']} index={4} />
          <StatCard label="SCREEN TIME" value={420} suffix=" min" color="#ec4899" gradient={['#ec4899', '#b300ff']} index={5} />
        </View>

        <GlassCard style={styles.chartCard} glow="#0ea5e9">
          <Text style={styles.sectionTitle}>STUDY HEATMAP</Text>
          <View style={styles.heatmap}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} style={styles.weekColumn}>
                <Text style={styles.dayLabel}>{['S','M','T','W','T','F','S'][i]}</Text>
                <View style={styles.heatmapCells}>
                  {Array.from({ length: 4 }, (_, j) => (
                    <View key={j} style={[styles.heatmapCell, { backgroundColor: (i + j) % 3 === 0 ? '#0ea5e9' : (i + j) % 3 === 1 ? '#0ea5e930' : 'rgba(255,255,255,0.05)' }]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.chartCard} glow="#8b5cf6">
          <Text style={styles.sectionTitle}>WEEKLY COMPARISON</Text>
          <View style={styles.weeklyStats}>
            <WeeklyStat label="Study Hours" thisWeek={12.5} lastWeek={9.2} change={36} color="#0ea5e9" />
            <WeeklyStat label="Quiz Accuracy" thisWeek={82} lastWeek={76} change={8} color="#22c55e" />
            <WeeklyStat label="Focus Sessions" thisWeek={8} lastWeek={6} change={33} color="#8b5cf6" />
          </View>
        </GlassCard>

        <GlassCard style={styles.chartCard} glow="#ef4444">
          <Text style={styles.sectionTitle}>WEAK TOPICS</Text>
          <View style={styles.weakTopics}>
            <WeakTopic name="Exception Handling" accuracy={45} trend="declining" color="#ef4444" />
            <WeakTopic name="Multithreading" accuracy={52} trend="stable" color="#f59e0b" />
            <WeakTopic name="Dynamic Programming" accuracy={38} trend="declining" color="#ef4444" />
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function WeeklyStat({ label, thisWeek, lastWeek, change, color }: any) {
  return (
    <View style={styles.weeklyStat}>
      <Text style={styles.weeklyLabel}>{label}</Text>
      <View style={styles.weeklyValues}>
        <Text style={[styles.weeklyValue, { color }]}>{thisWeek}</Text>
        <Text style={styles.weeklyChange}>{change > 0 ? '↑' : '↓'} {Math.abs(change)}%</Text>
      </View>
    </View>
  );
}

function WeakTopic({ name, accuracy, trend, color }: any) {
  const trendIcons = { improving: '↑', declining: '↓', stable: '→' };
  const trendColors = { improving: '#22c55e', declining: '#ef4444', stable: '#f59e0b' };

  return (
    <View style={styles.weakTopic}>
      <View style={styles.weakInfo}>
        <Text style={styles.weakName}>{name}</Text>
        <Text style={styles.weakAccuracy}>{accuracy}% accuracy</Text>
      </View>
      <View style={styles.weakTrend}>
        <Text style={[styles.trendText, { color: trendColors[trend] }]}>{trendIcons[trend]} {trend}</Text>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chartCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  heatmap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingHorizontal: 8 },
  weekColumn: { alignItems: 'center', gap: 8 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'SpaceGrotesk_700Bold' },
  heatmapCells: { flexDirection: 'column', gap: 4 },
  heatmapCell: { width: 28, height: 28, borderRadius: 6 },
  weeklyStats: { gap: 16 },
  weeklyStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
  weeklyLabel: { fontSize: 14, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  weeklyValues: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weeklyValue: { fontSize: 20, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  weeklyChange: { fontSize: 12, fontWeight: '700', color: '#22c55e', fontFamily: 'SpaceGrotesk_700Bold' },
  weakTopics: { gap: 10 },
  weakTopic: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
  weakInfo: { gap: 2 },
  weakName: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  weakAccuracy: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  weakTrend: { alignItems: 'flex-end' },
  trendText: { fontSize: 12, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
});