import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const VARIANT_STYLES = {
  primary: { colors: ['#0ea5e9', '#0284c7'], textColor: '#fff' },
  secondary: { colors: ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.1)'], textColor: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  ghost: { colors: ['transparent', 'transparent'], textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.1)' },
  gradient: { colors: ['#0ea5e9', '#8b5cf6', '#ec4899'], textColor: '#fff' },
  danger: { colors: ['#ef4444', '#dc2626'], textColor: '#fff' },
};

const SIZE_STYLES = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13, borderRadius: 10, iconSize: 16, gap: 6 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: 12, iconSize: 18, gap: 8 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, borderRadius: 16, iconSize: 20, gap: 10 },
  xl: { paddingVertical: 22, paddingHorizontal: 40, fontSize: 19, borderRadius: 20, iconSize: 22, gap: 12 },
};

export const AnimatedButton = React.forwardRef<TouchableOpacity, AnimatedButtonProps>(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    hapticFeedback = true,
  }, ref) => {
    const { light, medium, success } = useHaptics();
    
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const loadingRotation = useSharedValue(0);

    const variantStyle = VARIANT_STYLES[variant];
    const sizeStyle = SIZE_STYLES[size];

    const pressIn = () => {
      if (!disabled && !loading) {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(0.8, { duration: 50 });
        if (hapticFeedback) light();
      }
    };

    const pressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 100 });
    };

    const handlePress = () => {
      if (!disabled && !loading) {
        if (hapticFeedback) medium();
        onPress();
      }
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const loadingSpin = useAnimatedStyle(() => ({
      transform: [{ rotate: `${loadingRotation.value}deg` }],
    }));

    React.useEffect(() => {
      if (loading) {
        loadingRotation.value = withTiming(360, { duration: 1000, easing: (t) => t }, () => {
          loadingRotation.value = 0;
        });
      }
    }, [loading]);

    const isGradient = variant === 'primary' || variant === 'gradient' || variant === 'danger';

    const buttonContent = (
      <View style={[styles.content, { gap: sizeStyle.gap, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
        {loading ? (
          <Animated.View style={[styles.spinner, loadingSpin]}>
            <View style={[
              styles.spinnerCircle,
              { width: sizeStyle.iconSize, height: sizeStyle.iconSize, borderWidth: 2 }
            ]} />
          </Animated.View>
        ) : icon ? (
          <View style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }}>{icon}</View>
        ) : null}
        <Text style={[
          styles.title,
          { fontSize: sizeStyle.fontSize, color: variantStyle.textColor },
          textStyle,
        ]}>
          {title}
        </Text>
        {iconRight && !loading && <View style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }}>{iconRight}</View>}
      </View>
    );

    if (isGradient) {
      return (
        <LinearGradient
          ref={ref as any}
          colors={variantStyle.colors}
          style={[
            styles.button,
            { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal, borderRadius: sizeStyle.borderRadius },
            fullWidth && styles.fullWidth,
            style,
          ]}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handlePress}
          disabled={disabled || loading}
        >
          <Animated.View style={animatedStyle}>{buttonContent}</Animated.View>
        </LinearGradient>
      );
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.button,
          { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal, borderRadius: sizeStyle.borderRadius },
          { backgroundColor: variantStyle.colors[0], borderWidth: variantStyle.border ? 1 : 0, borderColor: variantStyle.border },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>{buttonContent}</Animated.View>
      </TouchableOpacity>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  spinner: { position: 'absolute' },
  spinnerCircle: {
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: 9999,
  },
});