import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { formatTimeRemaining } from '@/utils/formatters';
import { Exam } from '@/types';

export default function ExamScheduleScreen() {
  const { exams, deleteExam } = useStudy();
  const { medium, heavy } = useHaptics();

  const activeExams = exams.filter(e => e.isActive);
  const upcomingExams = exams.filter(e => !e.isActive);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Exam Schedule</Text>
            <Text style={styles.headerSubtitle}>{exams.length} exams scheduled</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/exam/add-exam')} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        {activeExams.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ACTIVE EXAMS</Text>
            </View>
            <View style={styles.examsList}>
              {activeExams.map((exam, i) => (
                <ExamCard key={exam.id} exam={exam} index={i} onDelete={() => { heavy(); deleteExam(exam.id); }} />
              ))}
            </View>
          </>
        )}

        {upcomingExams.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>UPCOMING EXAMS</Text>
            </View>
            <View style={styles.examsList}>
              {upcomingExams.map((exam, i) => (
                <ExamCard key={exam.id} exam={exam} index={i} onDelete={() => { heavy(); deleteExam(exam.id); }} />
              ))}
            </View>
          </>
        )}

        {exams.length === 0 && (
          <GlassCard style={styles.emptyCard} glow="#0ea5e9">
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No exams scheduled</Text>
            <Text style={styles.emptySubtitle}>Add your first exam to start tracking</Text>
            <TouchableOpacity onPress={() => router.push('/exam/add-exam')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>ADD EXAM</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function ExamCard({ exam, index, onDelete }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  const timeRemaining = formatTimeRemaining(exam.date, exam.time);

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity style={styles.examCard} onPress={() => {}} activeOpacity={0.8}>
        <View style={styles.examLeft}>
          <View style={[styles.examIcon, { backgroundColor: exam.color + '30' }]}>
            <Text style={styles.examEmoji}>{exam.icon}</Text>
          </View>
          <View style={styles.examInfo}>
            <Text style={[styles.examName, { color: exam.color }]}>{exam.name}</Text>
            <View style={styles.examMeta}>
              <Text style={styles.examSubject}>{exam.subject}</Text>
              <Text style={styles.examLocation}>{exam.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.examRight}>
          <View style={styles.countdown}>
            <Text style={[styles.countdownValue, { color: exam.color }]}>{timeRemaining.days}</Text>
            <Text style={styles.countdownUnit}>days</Text>
          </View>
          <ProgressRing progress={exam.progress} size={50} strokeWidth={4} gradientColors={exam.gradient || [exam.color, exam.color]} percentageSize={14} showPercentage />
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  addButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  examsList: { gap: 12 },
  examCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  examLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  examIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  examEmoji: { fontSize: 24 },
  examInfo: { flex: 1, gap: 4 },
  examName: { fontSize: 16, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  examMeta: { flexDirection: 'row', gap: 16 },
  examSubject: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  examLocation: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  examRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  countdown: { alignItems: 'center', gap: 2 },
  countdownValue: { fontSize: 24, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  countdownUnit: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  deleteBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' },
  emptyCard: { width: '100%', padding: 40, alignItems: 'center', gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  emptyAction: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)', borderRadius: 100 },
  emptyActionText: { fontSize: 13, fontWeight: '700', color: '#0ea5e9', fontFamily: 'SpaceGrotesk_700Bold' },
});