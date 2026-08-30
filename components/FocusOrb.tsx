import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useFocusOrbAnimation, useCountUpAnimation } from '@/hooks/useAnimations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORB_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);
const STROKE_WIDTH = 8;
const RADIUS = (ORB_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface FocusOrbProps {
  readiness: number;
  status: 'idle' | 'studying' | 'focus' | 'reward' | 'celebration';
  message: string;
  size?: number;
  showParticles?: boolean;
}

const PARTICLE_COUNT = 12;
const ORB_GRADIENTS: Record<string, string[]> = {
  idle: ['#0ea5e9', '#8b5cf6'],
  studying: ['#00d4ff', '#00fff5'],
  focus: ['#22c55e', '#10b981'],
  reward: ['#f59e0b', '#f97316'],
  celebration: ['#ec4899', '#b300ff', '#00d4ff'],
};

export const FocusOrb = React.memo(function FocusOrb({
  readiness,
  status,
  message,
  size = ORB_SIZE,
  showParticles = true,
}: FocusOrbProps) {
  const {
    orbStyle,
    ringStyle,
    particleStyles,
    progress,
    scale,
  } = useFocusOrbAnimation(readiness, status);

  const { value: countUpValue, animatedStyle: countUpStyle } = useCountUpAnimation(readiness, 1500);

  const gradientColors = ORB_GRADIENTS[status] || ORB_GRADIENTS.idle;
  const gradientId = `orb-gradient-${status}`;

  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: (t) => t }), -1);
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseGlow = useSharedValue(0);
  React.useEffect(() => {
    if (status === 'celebration' || status === 'reward') {
      pulseGlow.value = withRepeat(
        withTiming(1, { duration: 1000 }, () => {
          pulseGlow.value = withTiming(0, { duration: 1000 });
        }),
        -1
      );
    } else {
      pulseGlow.value = 0;
    }
  }, [status]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseGlow.value, [0, 1], [0, 0.6], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(pulseGlow.value, [0, 1], [1, 1.2], Extrapolate.CLAMP) }],
  }));

  const renderParticles = () => {
    if (!showParticles) return null;
    return (
      <G style={styles.particleContainer}>
        {particleStyles.map((particleStyle, i) => (
          <Animated.View key={i} style={[styles.particle, particleStyle]} />
        ))}
      </G>
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS * (size / ORB_SIZE)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={STROKE_WIDTH * (size / ORB_SIZE)}
        />
        <Animated.Path
          d={`M ${size / 2} ${(size - ORB_SIZE) / 2 + STROKE_WIDTH / 2} 
             A ${RADIUS * (size / ORB_SIZE)} ${RADIUS * (size / ORB_SIZE)} 0 1 1 ${size / 2 - 0.01} ${(size - ORB_SIZE) / 2 + STROKE_WIDTH / 2}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE_WIDTH * (size / ORB_SIZE)}
          strokeLinecap="round"
          style={ringStyle}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        
        <Animated.View style={[styles.glowLayer, glowStyle]} />
        {renderParticles()}
      </Svg>

      <Animated.View style={[styles.content, orbStyle]}>
        <Animated.Text style={[styles.percentage, countUpStyle]}>
          {Math.round(countUpValue)}%
        </Animated.Text>
        <Text style={styles.statusLabel}>{message}</Text>
      </Animated.View>
    </View>
  );
});

FocusOrb.displayName = 'FocusOrb';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  content: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#00d4ff',
    opacity: 0.5,
  },
  glowLayer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
});