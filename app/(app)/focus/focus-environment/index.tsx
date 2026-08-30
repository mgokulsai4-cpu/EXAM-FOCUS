import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ProgressRing } from '@/components/ProgressRing';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function FocusEnvironmentScreen() {
  const { medium } = useHaptics();

  const sounds = [
    { id: 'rain', name: 'Rain', emoji: '🌧️', color: '#0ea5e9' },
    { id: 'ocean', name: 'Ocean', emoji: '🌊', color: '#06b6d4' },
    { id: 'forest', name: 'Forest', emoji: '🌲', color: '#22c55e' },
    { id: 'cafe', name: 'Café', emoji: '☕', color: '#f59e0b' },
    { id: 'silent', name: 'Silent', emoji: '🔇', color: '#64748b' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Focus Environment</Text>
        </View>

        <View style={styles.timerSection}>
          <ProgressRing progress={45} size={180} strokeWidth={8} gradientColors={['#0ea5e9', '#8b5cf6']} percentageSize={42} showPercentage={false}>
            <View style={styles.timerCenter}>
              <Text style={styles.timerLabel}>FOCUS</Text>
              <Text style={styles.timerValue}>12:34:56</Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8}>
            <Ionicons name="pause" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, styles.endBtn]} activeOpacity={0.8}>
            <Ionicons name="stop" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.soundsCard} glow="#0ea5e9">
          <Text style={styles.sectionTitle}>AMBIENT SOUNDS</Text>
          <View style={styles.soundsGrid}>
            {sounds.map(sound => (
              <TouchableOpacity
                key={sound.id}
                style={[styles.soundCard, { borderColor: sound.color }]}
                onPress={() => { medium(); }}
                activeOpacity={0.8}
              >
                <View style={[styles.soundIcon, { backgroundColor: sound.color + '30' }]}>
                  <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                </View>
                <Text style={styles.soundName}>{sound.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.topicCard} glow="#8b5cf6">
          <View style={styles.topicHeader}>
            <Text style={styles.sectionTitle}>CURRENT TOPIC</Text>
            <TouchableOpacity onPress={() => {}} style={styles.changeBtn}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topicInfo}>
            <View style={[styles.topicIcon, { backgroundColor: '#ef444430' }]}>
              <Ionicons name="construct-outline" size={20} color="#ef4444" />
            </View>
            <View style={styles.topicDetails}>
              <Text style={styles.topicName}>Object-Oriented Programming</Text>
              <Text style={styles.topicSubject}>Java Programming</Text>
            </View>
            <ProgressRing progress={80} size={50} strokeWidth={4} gradientColors={['#ef4444', '#f97316']} percentageSize={14} showPercentage />
          </View>
        </GlassCard>

        <AnimatedButton
          title="END FOCUS SESSION"
          onPress={() => router.back()}
          variant="danger"
          size="lg"
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
  timerSection: { alignItems: 'center', paddingVertical: 20 },
  timerCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  timerLabel: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 2, fontFamily: 'SpaceGrotesk_700Bold' },
  timerValue: { fontSize: 42, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -2, marginTop: 8 },
  controls: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 20 },
  controlBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  endBtn: { backgroundColor: '#ef444430', borderColor: '#ef4444' },
  soundsCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  soundsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  soundCard: { flex: 1, minWidth: '30%', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 16, gap: 8 },
  soundIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  soundEmoji: { fontSize: 24 },
  soundName: { fontSize: 13, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  topicCard: { width: '100%' },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  changeBtn: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
  changeText: { fontSize: 12, fontWeight: '600', color: '#0ea5e9', fontFamily: 'Inter_600SemiBold' },
  topicInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topicIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topicDetails: { flex: 1, gap: 2 },
  topicName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  topicSubject: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
});