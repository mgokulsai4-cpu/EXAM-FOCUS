import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function NotesUploadScreen() {
  const { medium } = useHaptics();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Notes</Text>
        </View>

        <View style={styles.uploadZone}>
          <Ionicons name="cloud-upload-outline" size={64} color="#0ea5e9" />
          <Text style={styles.uploadTitle}>Drag & Drop or Tap to Upload</Text>
          <Text style={styles.uploadSubtitle}>PDF, Images, Text Files</Text>
        </View>

        <View style={styles.options}>
          <UploadOption icon="document-outline" title="PDF Document" subtitle="Textbook pages, notes" onPress={() => {}} />
          <UploadOption icon="image-outline" title="Image" subtitle="Photos of handwritten notes" onPress={() => {}} />
          <UploadOption icon="create-outline" title="Plain Text" subtitle="Copy-paste your notes" onPress={() => {}} />
        </View>

        <GlassCard style={styles.recentCard} glow="#0ea5e9">
          <Text style={styles.sectionTitle}>RECENT UPLOADS</Text>
          <View style={styles.recentList}>
            <RecentItem name="Java OOP Notes.pdf" date="2 hours ago" status="Processed" questions={12} />
            <RecentItem name="Data Structures Cheat Sheet.png" date="Yesterday" status="Processing" questions={0} />
            <RecentItem name="Exception Handling.txt" date="3 days ago" status="Processed" questions={8} />
          </View>
        </GlassCard>

        <AnimatedButton
          title="GENERATE QUIZ FROM NOTES"
          onPress={() => router.push('/study/ai-quiz-generator')}
          variant="gradient"
          size="lg"
          fullWidth
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
}

function UploadOption({ icon, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity style={styles.optionCard} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={24} color="#0ea5e9" />
      <View style={styles.optionInfo}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

function RecentItem({ name, date, status, questions }: any) {
  const statusColors: Record<string, string> = {
    Processed: '#22c55e',
    Processing: '#f59e0b',
    Failed: '#ef4444',
  };

  return (
    <View style={styles.recentItem}>
      <View style={styles.recentInfo}>
        <Text style={styles.recentName}>{name}</Text>
        <Text style={styles.recentDate}>{date}</Text>
      </View>
      <View style={styles.recentMeta}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status] + '30', borderColor: statusColors[status] }]}>
          <Text style={[styles.statusText, { color: statusColors[status] }]}>{status}</Text>
        </View>
        <Text style={styles.questionsText}>{questions} questions</Text>
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
  uploadZone: { alignItems: 'center', padding: 40, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 2, borderColor: 'rgba(14, 165, 233, 0.3)', borderRadius: 20, borderStyle: 'dashed', gap: 16 },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  uploadSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  options: { gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  optionInfo: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  optionSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  recentCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  recentList: { gap: 10 },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, gap: 12 },
  recentInfo: { flex: 1, gap: 2 },
  recentName: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  recentDate: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '600', fontFamily: 'SpaceGrotesk_700Bold' },
  questionsText: { fontSize: 12, color: '#0ea5e9', fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});