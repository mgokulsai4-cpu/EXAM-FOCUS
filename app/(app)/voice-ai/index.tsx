import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAI } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VoiceAIScreen() {
  const { isListening, isSpeaking, isThinking, setListening, setSpeaking, sendVoiceMessage } = useAI();
  const { heavy } = useHaptics();

  const [waveform, setWaveform] = useState<Array<number>>([]);
  const [transcript, setTranscript] = useState('');

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);

  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const orbGlow = useSharedValue(0);

  React.useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 500 }, () => {
          pulseScale.value = withTiming(1, { duration: 500 });
        }),
        -1
      );
      rotation.value = withTiming(360, { duration: 2000 }, () => {
        rotation.value = 0;
      });
      orbGlow.value = withRepeat(
        withTiming(1, { duration: 800 }, () => {
          orbGlow.value = withTiming(0.3, { duration: 800 });
        }),
        -1
      );

      // Simulate waveform
      const interval = setInterval(() => {
        setWaveform(Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.2));
      }, 100);

      setTimeout(() => {
        setTranscript("Explain polymorphism in Java");
        setListening(false);
        sendVoiceMessage('voice-message');
      }, 3000);

      return () => clearInterval(interval);
    } else {
      pulseScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      rotation.value = 0;
      orbGlow.value = 0;
      setWaveform([]);
    }
  }, [isListening]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(orbGlow.value, [0, 1], [0, 0.6], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(orbGlow.value, [0, 1], [1, 1.3], Extrapolate.CLAMP) }],
  }));

  const handleVoicePress = () => {
    if (isListening) {
      setListening(false);
    } else {
      heavy();
      setListening(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice AI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.orbContainer}>
            <Animated.View style={[styles.orbGlow, glowStyle]} />
            <Animated.View style={[styles.orb, pulseStyle, rotateStyle]}>
              <View style={styles.orbInner}>
                {isListening && <Ionicons name="mic" size={40} color="#fff" />}
                {!isListening && isThinking && <Ionicons name="sparkles" size={40} color="#fff" />}
                {!isListening && !isThinking && <Ionicons name="mic-outline" size={40} color="#fff" />}
              </View>
            </Animated.View>
            <Text style={styles.orbStatus}>
              {isListening ? 'Listening...' : isThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Tap to speak'}
            </Text>
            {transcript && <Text style={styles.transcript}>"{transcript}"</Text>}
          </View>
        </Animated.View>

        <Animated.View style={entrance1}>
          <View style={styles.waveformContainer}>
            {waveform.map((height, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: height * 100, backgroundColor: height > 0.5 ? '#0ea5e9' : '#8b5cf6' },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <TouchableOpacity style={styles.micButton} onPress={handleVoicePress} activeOpacity={0.9}>
            <View style={[styles.micButtonInner, isListening && styles.micListening]}>
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={32} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.micHint}>{isListening ? 'Tap to stop' : 'Hold to speak'}</Text>
        </Animated.View>

        <Animated.View style={entrance2}>
          <GlassCard style={styles.tipsCard} glow="#0ea5e9">
            <Text style={styles.sectionTitle}>VOICE COMMANDS</Text>
            <View style={styles.tipsList}>
              <TipItem command='"Explain inheritance"' description='Get a simple explanation' />
              <TipItem command='"Quiz me on OOP"' description='Start a practice quiz' />
              <TipItem command='"Summarize this topic"' description='Get key points' />
              <TipItem command='"Give me an example"' description='See code examples' />
              <TipItem command='"What\'s important for exams?"' description='High-yield topics' />
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function TipItem({ command, description }: any) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipCommand}>{command}</Text>
      <Text style={styles.tipDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100, gap: 24, alignItems: 'center' },
  orbContainer: { alignItems: 'center', gap: 16 },
  orbGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#0ea5e9' },
  orb: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 2, borderColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' },
  orbInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(14, 165, 233, 0.2)', alignItems: 'center', justifyContent: 'center' },
  orbStatus: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium' },
  transcript: { fontSize: 14, color: '#fff', fontStyle: 'italic', marginTop: 8, textAlign: 'center', fontFamily: 'Inter_500Medium' },
  waveformContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 60 },
  waveformBar: { width: 4, borderRadius: 2 },
  micButton: { marginTop: 20 },
  micButtonInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
  micListening: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
  micHint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12, fontFamily: 'Inter_500Medium' },
  tipsCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  tipsList: { gap: 12 },
  tipItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tipCommand: { fontSize: 14, fontWeight: '600', color: '#0ea5e9', fontFamily: 'SpaceGrotesk_700Bold' },
  tipDescription: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
});