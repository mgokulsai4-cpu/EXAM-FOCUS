import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { useCountUpAnimation, useStaggeredEntrance } from '@/hooks/useAnimations';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string; positive: boolean };
  color?: string;
  gradient?: string[];
  index?: number;
  suffix?: string;
  prefix?: string;
}

export const StatCard = React.memo(function StatCard({
  label,
  value,
  icon,
  trend,
  color = '#0ea5e9',
  gradient,
  index = 0,
  suffix = '',
  prefix = '',
}: StatCardProps) {
  const entranceStyle = useStaggeredEntrance(index, 80);
  const { value: countUpValue, animatedStyle: countUpStyle } = useCountUpAnimation(
    typeof value === 'number' ? value : parseInt(String(value).replace(/[^\d]/g, '')) || 0,
    1500,
    index * 80
  );

  const glow = useSharedValue(0);
  React.useEffect(() => {
    glow.value = withTiming(1, { duration: 2000, delay: index * 80 + 500 });
  }, [index]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.15], Extrapolate.CLAMP),
  }));

  const displayValue = typeof value === 'number' 
    ? `${prefix}${Math.round(countUpValue)}${suffix}`
    : value;

  return (
    <Animated.View style={[entranceStyle, styles.container]}>
      <GlassCard style={styles.card} glow={color}>
        <Animated.View style={[styles.glowOverlay, glowStyle]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{label}</Text>
            </View>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
          </View>
          <View style={styles.valueContainer}>
            <Animated.Text style={[styles.value, { color: gradient?.[0] || color }, countUpStyle]}>
              {displayValue}
            </Animated.Text>
          </View>
          {trend && (
            <View style={styles.trendContainer}>
              <Text style={[styles.trend, { color: trend.positive ? '#22c55e' : '#ef4444' }]}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </Text>
            </View>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
});

StatCard.displayName = 'StatCard';

const styles = StyleSheet.create({
  container: { width: '100%' },
  card: { position: 'relative', overflow: 'hidden' },
  glowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  content: { padding: 20, position: 'relative', zIndex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  labelContainer: { flex: 1 },
  label: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, fontFamily: 'Inter_500Medium' },
  iconContainer: { opacity: 0.7 },
  valueContainer: { marginTop: 4 },
  value: { fontSize: 36, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1 },
  trendContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  trend: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});