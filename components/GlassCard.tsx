import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blur?: 'light' | 'medium' | 'heavy';
  border?: boolean;
  glow?: string;
  onPress?: () => void;
  pressScale?: number;
}

const BLUR_INTENSITY = {
  light: 'rgba(255, 255, 255, 0.05)',
  medium: 'rgba(255, 255, 255, 0.08)',
  heavy: 'rgba(255, 255, 255, 0.12)',
};

export const GlassCard = React.forwardRef<Animated.View, GlassCardProps>(
  ({ children, style, blur = 'medium', border = true, glow, onPress, pressScale = 0.98 }, ref) => {
    const scale = useSharedValue(1);

    const pressIn = () => {
      scale.value = withSpring(pressScale, { damping: 15, stiffness: 150 });
    };

    const pressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const backgroundColor = BLUR_INTENSITY[blur];
    const borderColor = border ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
    const shadowColor = glow || 'transparent';

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.container,
          { backgroundColor, borderColor },
          { shadowColor, shadowOpacity: glow ? 0.4 : 0, shadowRadius: glow ? 20 : 0, elevation: glow ? 10 : 0 },
          style,
        ]}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
      >
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </Animated.View>
    );
  }
);

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
});