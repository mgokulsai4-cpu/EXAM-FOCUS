import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStudy } from '@/context';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { mockAIInsights } from '@/utils/mockData';

export default function AIInsightsScreen() {
  const { medium } = useHaptics();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Insights</Text>
            <Text style={styles.headerSubtitle}>Personalized recommendations</Text>
          </View>
        </View>

        <View style={styles.insightsList}>
          {mockAIInsights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function InsightCard({ insight, index }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);

  const typeConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    strength: { icon: 'trophy-outline', color: '#22c55e', bgColor: '#22c55e30' },
    weakness: { icon: 'alert-circle-outline', color: '#ef4444', bgColor: '#ef444430' },
    recommendation: { icon: 'lightbulb-outline', color: '#0ea5e9', bgColor: '#0ea5e930' },
    warning: { icon: 'warning-outline', color: '#f59e0b', bgColor: '#f59e0b30' },
    celebration: { icon: 'party-outline', color: '#ec4899', bgColor: '#ec489930' },
  };

  const config = typeConfig[insight.type] || typeConfig.recommendation;

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity style={[styles.insightCard, { borderColor: config.color }]} onPress={() => {}} activeOpacity={0.8}>
        <View style={styles.insightContent}>
          <View style={[styles.insightIcon, { backgroundColor: config.bgColor, borderColor: config.color }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
          </View>
          <View style={styles.insightInfo}>
            <View style={styles.insightHeader}>
              <Text style={[styles.insightType, { color: config.color }]}>{insight.type.toUpperCase()}</Text>
              <Text style={styles.insightTime}>{new Date(insight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightMessage}>{insight.message}</Text>
            {insight.action && (
              <AnimatedButton
                title={insight.action.label}
                onPress={() => {}}
                variant="primary"
                size="sm"
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
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
  insightsList: { gap: 12 },
  insightCard: { padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 16 },
  insightContent: { flexDirection: 'row', gap: 12 },
  insightIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  insightInfo: { flex: 1, gap: 6 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightType: { fontSize: 10, fontWeight: '700', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  insightTime: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  insightMessage: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 20, fontFamily: 'Inter_500Medium' },
});