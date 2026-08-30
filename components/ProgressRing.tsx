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
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  gradientColors?: string[];
  showPercentage?: boolean;
  percentageSize?: number;
  children?: React.ReactNode;
  animateOnMount?: boolean;
  duration?: number;
}

export const ProgressRing = React.memo(function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  trackColor = 'rgba(255, 255, 255, 0.1)',
  gradientColors = ['#0ea5e9', '#8b5cf6'],
  showPercentage = true,
  percentageSize = 32,
  children,
  animateOnMount = true,
  duration = 1500,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgress = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (animateOnMount) {
      animatedProgress.value = withTiming(progress / 100, { 
        duration, 
        easing: (t) => t * t * (3 - 2 * t) 
      });
      animatedOpacity.value = withTiming(1, { duration: 300 });
    } else {
      animatedProgress.value = progress / 100;
      animatedOpacity.value = 1;
    }
  }, [progress, animateOnMount, duration]);

  const strokeDashoffset = useAnimatedStyle(() => ({
    strokeDashoffset: interpolate(animatedProgress.value, [0, 1], [circumference, 0], Extrapolate.CLAMP),
    opacity: animatedOpacity.value,
  }));

  const countUp = useSharedValue(0);
  React.useEffect(() => {
    countUp.value = withTiming(progress, { duration, easing: (t) => t * t * (3 - 2 * t) });
  }, [progress, duration]);

  const gradientId = `progress-gradient-${progress}-${size}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Animated.Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={strokeDashoffset}
          transform="rotate(-90, 60, 60)"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / Math.max(1, gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
      </Svg>
      <View style={styles.centerContent}>
        {showPercentage ? (
          <Animated.Text style={[styles.percentage, { fontSize: percentageSize }]}>
            {Math.round(countUp.value)}%
          </Animated.Text>
        ) : null}
        {children}
      </View>
    </View>
  );
});

ProgressRing.displayName = 'ProgressRing';

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute', top: 0, left: 0 },
  centerContent: { position: 'relative', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  percentage: { fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.5 },
});