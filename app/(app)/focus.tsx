import React, { useEffect, useState } from 'react';
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
import { useFocus, useAuth } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ProgressRing } from '@/components/ProgressRing';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { formatDuration } from '@/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FocusScreen() {
  const { 
    isActive, 
    currentSession, 
    timeRemaining, 
    isBreak, 
    blockedApps, 
    focusDuration, 
    breakDuration,
    ambientSound,
    totalFocusToday,
    distractionsBlockedToday,
    startFocus,
    endFocus,
    pauseFocus,
    resumeFocus,
    startBreak,
    endBreak,
    setAmbientSound,
  } = useFocus();
  
  const { user } = useAuth();
  const { medium, heavy } = useHaptics();

  const [selectedDuration, setSelectedDuration] = useState(focusDuration / 60);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);
  const entrance4 = useStaggeredEntrance(3, 80);

  const floatStyle = useFloatAnimation(15, 5000);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive && !isBreak) {
      pulseScale.value = withSpring(1.02, { damping: 15, stiffness: 100 });
    } else {
      pulseScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [isActive, isBreak]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleStartFocus = () => {
    heavy();
    startFocus({ 
      duration: selectedDuration * 60, 
      mode: 'pomodoro' 
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerLabel}>FOCUS MODE</Text>
              <Text style={styles.headerTitle}>Deep Work Session</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/focus/app-blocker')} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.timerContainer}>
            <View style={[styles.timerWrapper, pulseStyle]}>
              <ProgressRing
                progress={isActive ? ((isBreak ? breakDuration : selectedDuration * 60) - timeRemaining) / (isBreak ? breakDuration : selectedDuration * 60) * 100 : 0}
                size={200}
                strokeWidth={8}
                gradientColors={isBreak ? ['#22c55e', '#10b981'] : ['#0ea5e9', '#8b5cf6']}
                percentageSize={42}
                showPercentage={false}
              >
                <View style={styles.timerTextContainer}>
                  <Text style={styles.timerLabel}>{isBreak ? 'BREAK' : 'FOCUS'}</Text>
                  <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                </View>
              </ProgressRing>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={entrance3}>
          {isActive ? (
            <View style={styles.activeControls}>
              <View style={styles.controlButtons}>
                <TouchableOpacity 
                  style={[styles.controlButton, { backgroundColor: isActive && !isBreak ? '#ef444430' : 'rgba(255,255,255,0.05)' }]}
                  onPress={isActive && !isBreak ? pauseFocus : resumeFocus}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isActive && !isBreak ? 'pause' : 'play'} size={28} color={isActive && !isBreak ? '#ef4444' : '#22c55e'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={() => { heavy(); endFocus(); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="stop" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
              {isBreak && (
                <TouchableOpacity style={styles.endBreakButton} onPress={endBreak} activeOpacity={0.8}>
                  <Text style={styles.endBreakText}>END BREAK</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.setupControls}>
              <GlassCard style={styles.durationCard} glow="#0ea5e9">
                <Text style={styles.durationLabel}>SESSION DURATION</Text>
                <TouchableOpacity onPress={() => { medium(); setShowDurationPicker(true); }} style={styles.durationButton}>
                  <Text style={styles.durationValue}>{selectedDuration} min</Text>
                  <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </GlassCard>
              <AnimatedButton
                title="START FOCUS SESSION"
                onPress={handleStartFocus}
                variant="gradient"
                size="xl"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DISTRACTIONS BLOCKED</Text>
            <Text style={styles.sectionSubtitle}>{distractionsBlockedToday} apps blocked today</Text>
          </View>
          <View style={styles.blockedAppsList}>
            {blockedApps.filter(a => a.isBlocked).map((app, i) => (
              <TouchableOpacity key={app.id} style={styles.blockedAppItem} activeOpacity={0.8}>
                <Text style={styles.blockedAppIcon}>{app.icon}</Text>
                <Text style={styles.blockedAppName}>{app.name}</Text>
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AMBIENT SOUNDS</Text>
          </View>
          <View style={styles.soundsGrid}>
            {['rain', 'ocean', 'forest', 'cafe', 'silent'].map((sound, i) => (
              <TouchableOpacity
                key={sound}
                style={[styles.soundCard, ambientSound === sound && styles.soundActive, { borderColor: ambientSound === sound ? '#0ea5e9' : 'rgba(255,255,255,0.08)' }]}
                onPress={() => { medium(); setAmbientSound(sound as any); }}
                activeOpacity={0.8}
              >
                <View style={[styles.soundIcon, { backgroundColor: '#0ea5e930' }]}>
                  <Text style={styles.soundEmoji}>{getSoundEmoji(sound)}</Text>
                </View>
                <Text style={styles.soundName}>{sound.charAt(0).toUpperCase() + sound.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S STATS</Text>
          </View>
          <View style={styles.statsRow}>
            <StatItem label="Focus Time" value={formatDuration(totalFocusToday)} color="#0ea5e9" />
            <StatItem label="Sessions" value={Math.floor(totalFocusToday / (selectedDuration * 60)) || 0} color="#8b5cf6" />
            <StatItem label="Blocked" value={distractionsBlockedToday} color="#ef4444" />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {showDurationPicker && (
        <DurationPicker 
          selected={selectedDuration} 
          onSelect={setSelectedDuration} 
          onClose={() => setShowDurationPicker(false)} 
        />
      )}
    </View>
  );
}

function StatItem({ label, value, color }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DurationPicker({ selected, onSelect, onClose }: any) {
  const durations = [15, 25, 30, 45, 50, 60, 90, 120];
  
  return (
    <View style={styles.pickerOverlay} onTouchEnd={onClose}>
      <View style={styles.pickerContainer} onTouchEnd={e => e.stopPropagation()}>
        <View style={styles.pickerHandle} />
        <Text style={styles.pickerTitle}>Select Duration</Text>
        <View style={styles.pickerGrid}>
          {durations.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerOption, selected === d && styles.pickerSelected, { borderColor: selected === d ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }]}
              onPress={() => { onSelect(d); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerOptionText, { color: selected === d ? '#0ea5e9' : '#fff' }]}>{d} min</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function getSoundEmoji(sound: string): string {
  const emojis: Record<string, string> = {
    rain: '🌧️',
    ocean: '🌊',
    forest: '🌲',
    cafe: '☕',
    silent: '🔇',
  };
  return emojis[sound] || '🔇';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 4 },
  headerLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', marginTop: 4, letterSpacing: -0.5 },
  settingsButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  timerContainer: { alignItems: 'center', paddingVertical: 20 },
  timerWrapper: { position: 'relative' },
  timerTextContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  timerLabel: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 2, fontFamily: 'SpaceGrotesk_700Bold' },
  timerValue: { fontSize: 48, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -2, marginTop: 8 },
  activeControls: { gap: 16 },
  controlButtons: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  controlButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  endBreakButton: { alignSelf: 'center', paddingHorizontal: 32, paddingVertical: 12, backgroundColor: '#22c55e30', borderWidth: 1, borderColor: '#22c55e', borderRadius: 100 },
  endBreakText: { fontSize: 13, fontWeight: '700', color: '#22c55e', fontFamily: 'SpaceGrotesk_700Bold' },
  setupControls: { gap: 16 },
  durationCard: { width: '100%', padding: 20, alignItems: 'center' },
  durationLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 12 },
  durationButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)', borderRadius: 100 },
  durationValue: { fontSize: 24, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  blockedAppsList: { gap: 10 },
  blockedAppItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, gap: 12 },
  blockedAppIcon: { fontSize: 24 },
  blockedAppName: { fontSize: 15, fontWeight: '600', color: '#fff', flex: 1, fontFamily: 'Inter_600SemiBold' },
  lockBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ef444430', alignItems: 'center', justifyContent: 'center' },
  soundsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  soundCard: { flex: 1, minWidth: '30%', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 16, gap: 8 },
  soundActive: { backgroundColor: 'rgba(14, 165, 233, 0.1)' },
  soundIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  soundEmoji: { fontSize: 24 },
  soundName: { fontSize: 13, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'SpaceGrotesk_700Bold' },
  bottomSpacer: { height: 40 },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 1000 },
  pickerContainer: { backgroundColor: '#0a111e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 20, fontFamily: 'SpaceGrotesk_700Bold' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pickerOption: { flex: 1, minWidth: '30%', alignItems: 'center', paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 14 },
  pickerSelected: { backgroundColor: 'rgba(14, 165, 233, 0.1)' },
  pickerOptionText: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
});