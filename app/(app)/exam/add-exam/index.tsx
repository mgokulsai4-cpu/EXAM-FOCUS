import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

const SUBJECT_COLORS = [
  { name: 'Java Programming', color: '#ef4444', gradient: ['#ef4444', '#f97316'], icon: '☕' },
  { name: 'Python Programming', color: '#0ea5e9', gradient: ['#0ea5e9', '#8b5cf6'], icon: '🐍' },
  { name: 'JavaScript & TypeScript', color: '#f59e0b', gradient: ['#f59e0b', '#ef4444'], icon: '⚡' },
  { name: 'Data Structures & Algorithms', color: '#8b5cf6', gradient: ['#8b5cf6', '#ec4899'], icon: '📊' },
  { name: 'Database Systems', color: '#06b6d4', gradient: ['#06b6d4', '#0ea5e9'], icon: '🗄️' },
];

export default function AddExamScreen() {
  const { addExam } = useStudy();
  const { medium, heavy } = useHaptics();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState<SUBJECT_COLORS[0] | null>(SUBJECT_COLORS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);

  const handleSubmit = async () => {
    if (!name || !date || !subject) {
      setError('Please fill in all required fields');
      medium();
      return;
    }

    heavy();
    await addExam({
      name,
      subject: subject.name,
      date,
      time,
      location,
      progress: 0,
      topicsTotal: 0,
      topicsCompleted: 0,
      color: subject.color,
      gradient: subject.gradient,
      icon: subject.icon,
      isActive: true,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Exam</Text>
        </View>

        <Animated.View style={entrance1}>
          <GlassCard style={styles.card} glow="#0ea5e9">
            <Text style={styles.sectionTitle}>EXAM DETAILS</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exam Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Java Programming Final"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <View style={styles.subjectSelector}>
                {SUBJECT_COLORS.map(s => (
                  <TouchableOpacity
                    key={s.name}
                    style={[styles.subjectOption, subject?.name === s.name && styles.subjectSelected, { borderColor: s.color }]}
                    onPress={() => { medium(); setSubject(s); }}
                  >
                    <View style={styles.subjectOptionContent}>
                      <Text style={styles.subjectEmoji}>{s.icon}</Text>
                      <Text style={[styles.subjectOptionName, { color: subject?.name === s.name ? s.color : '#fff' }]}>{s.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM (24h)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Room 301, CS Building"
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance2}>
          <GlassCard style={styles.card} glow="#8b5cf6">
            <Text style={styles.sectionTitle}>PREVIEW</Text>
            <View style={styles.preview}>
              {subject && (
                <View style={[styles.previewCard, { borderColor: subject.color }]}>
                  <View style={[styles.previewIcon, { backgroundColor: subject.color + '30' }]}>
                    <Text style={styles.previewEmoji}>{subject.icon}</Text>
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={[styles.previewName, { color: subject.color }]}>{name || 'Exam Name'}</Text>
                    <Text style={styles.previewSubject}>{subject.name}</Text>
                    <Text style={styles.previewDateTime}>{date ? `${date} at ${time}` : 'Select date & time'}</Text>
                  </View>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View style={entrance3}>
          <AnimatedButton
            title="CREATE EXAM"
            onPress={handleSubmit}
            variant="gradient"
            size="lg"
            fullWidth
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  inputGroup: { gap: 8, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_600SemiBold' },
  input: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  subjectSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectOption: { flex: 1, minWidth: '45%', padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 12 },
  subjectSelected: { backgroundColor: 'rgba(14, 165, 233, 0.1)' },
  subjectOptionContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectEmoji: { fontSize: 20 },
  subjectOptionName: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  errorText: { fontSize: 13, color: '#ef4444', marginTop: 8, fontFamily: 'Inter_500Medium' },
  preview: { alignItems: 'center' },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 2, borderRadius: 16, gap: 16 },
  previewIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewEmoji: { fontSize: 24 },
  previewInfo: { flex: 1, gap: 4 },
  previewName: { fontSize: 16, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
  previewSubject: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  previewDateTime: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
});