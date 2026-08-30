import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { StatCard } from '@/components/StatCard';
import { useStaggeredEntrance, useFloatAnimation, useCountUpAnimation } from '@/hooks/useAnimations';

export default function StudyScreen() {
  const { subjects } = useStudy();
  const { user } = useAuth();

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);

  const { value: totalTopicsValue } = useCountUpAnimation(user?.totalTopicsCompleted || 0, 1500);
  const { value: totalHoursValue } = useCountUpAnimation(user?.totalStudyHours || 0, 1500);
  const { value: streakValue } = useCountUpAnimation(user?.streak || 0, 1500);

  const floatStyle = useFloatAnimation(15, 4000);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.greeting}>
                <Text style={styles.greetingLabel}>Your Subjects</Text>
                <Text style={styles.greetingTitle}>What are we learning today?</Text>
              </View>
            </View>
            <View style={[styles.floatingOrb, floatStyle]}>
              <LinearGradient colors={['#0ea5e9', '#8b5cf6']} style={styles.orbGradient}>
                <Ionicons name="school-outline" size={28} color="#fff" />
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.statsRow}>
            <StatCard
              label="TOPICS COMPLETED"
              value={Math.round(totalTopicsValue)}
              color="#0ea5e9"
              gradient={['#0ea5e9', '#8b5cf6']}
              index={0}
            />
            <StatCard
              label="STUDY HOURS"
              value={Math.round(totalHoursValue * 10) / 10}
              suffix="h"
              color="#8b5cf6"
              gradient={['#8b5cf6', '#ec4899']}
              index={1}
            />
            <StatCard
              label="CURRENT STREAK"
              value={Math.round(streakValue)}
              suffix="🔥"
              color="#ef4444"
              gradient={['#ef4444', '#f97316']}
              index={2}
            />
          </View>
        </Animated.View>

        <Animated.View style={entrance3}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ALL SUBJECTS</Text>
            <TouchableOpacity style={styles.addSubject} onPress={() => router.push('/study/add-subject')}>
              <Ionicons name="add" size={20} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
          <View style={styles.subjectsGrid}>
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                variant="featured"
                onPress={() => router.push(`/study/subject/${subject.id}`)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' },
  headerContent: { flex: 1, paddingRight: 20 },
  greeting: {},
  greetingLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  greetingTitle: { fontSize: 28, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1, marginTop: 4 },
  floatingOrb: { position: 'absolute', top: 0, right: 0 },
  orbGradient: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  addSubject: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)', alignItems: 'center', justifyContent: 'center' },
  subjectsGrid: { gap: 16 },
  bottomSpacer: { height: 40 },
});