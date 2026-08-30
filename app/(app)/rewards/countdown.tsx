import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { useHaptics } from '@/hooks/useHaptics';

export default function RewardCountdownScreen({ route }: any) {
  const { rewardId } = route.params;
  const { heavy } = useHaptics();

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale }],
  }));

  const reward = {
    id: rewardId,
    name: 'Instagram',
    icon: '📷',
    durationMinutes: 15,
    color: '#ec4899',
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.modalContainer, containerStyle]}>
        <GlassCard style={styles.card} glow={reward.color}>
          <View style={styles.content}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            
            <View style={[styles.iconWrapper, { backgroundColor: reward.color + '30', borderColor: reward.color }]}>
              <Text style={styles.iconEmoji}>{reward.icon}</Text>
            </View>
            
            <Text style={styles.title}>REWARD ACTIVE</Text>
            <Text style={styles.name}>{reward.name}</Text>
            <Text style={styles.subtitle}>{reward.durationMinutes} minutes of screen time</Text>
            
            <View style={styles.timerContainer}>
              <Text style={[styles.timer, { color: reward.color }]}>14:32</Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: reward.color,
                  width: '90%',
                }}
              />
            </View>
            
            <Text style={styles.warning}>⚠️ App will unlock when timer ends</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, { borderColor: reward.color }]} onPress={() => router.push('/rewards')}>
                <Text style={[styles.actionText, { color: reward.color }]}>VIEW VAULT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: reward.color + '30', borderColor: reward.color }]} onPress={() => { heavy(); router.back(); }}>
                <Text style={[styles.actionText, { color: reward.color }]}>DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContainer: { width: '100%' },
  card: { width: '100%', padding: 24 },
  content: { alignItems: 'center', gap: 16 },
  closeButton: { position: 'absolute', top: 8, right: 8, padding: 4 },
  iconWrapper: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, fontFamily: 'SpaceGrotesk_700Bold' },
  name: { fontSize: 28, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  timerContainer: { marginVertical: 8 },
  timer: { fontSize: 48, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -2 },
  timerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'Inter_500Medium' },
  progressBar: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  warning: { fontSize: 12, color: '#f59e0b', marginTop: 8, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
});