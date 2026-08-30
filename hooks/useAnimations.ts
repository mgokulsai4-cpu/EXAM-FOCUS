import { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, withRepeat, interpolate, Extrapolate, runOnJS } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useFocusOrbAnimation(readiness: number, status: 'idle' | 'studying' | 'focus' | 'reward' | 'celebration') {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.8);
  const progress = useSharedValue(0);
  const particlePositions = Array.from({ length: 12 }, (_, i) => ({
    angle: useSharedValue((i * 360) / 12),
    radius: useSharedValue(60 + Math.random() * 20),
    opacity: useSharedValue(Math.random() * 0.5 + 0.3),
    size: useSharedValue(Math.random() * 4 + 2),
  }));

  useEffect(() => {
    progress.value = withTiming(readiness / 100, { duration: 1500, easing: (t) => t * t * (3 - 2 * t) });
  }, [readiness]);

  useEffect(() => {
    const animate = () => {
      if (status === 'celebration') {
        scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
        pulseOpacity.value = withSpring(1, { damping: 10, stiffness: 100 });
        rotation.value = withTiming(360, { duration: 2000 }, () => {
          rotation.value = 0;
        });
      } else if (status === 'focus') {
        scale.value = withSpring(1.05, { damping: 15, stiffness: 120 });
        pulseOpacity.value = withSpring(1, { damping: 15, stiffness: 120 });
      } else if (status === 'reward') {
        scale.value = withSpring(1.15, { damping: 12, stiffness: 110 });
        pulseOpacity.value = withRepeat(
          withTiming(1, { duration: 800 }, () => {
            pulseOpacity.value = withTiming(0.5, { duration: 800 });
          }),
          -1,
          true
        );
      } else if (status === 'studying') {
        scale.value = withSpring(1.02, { damping: 20, stiffness: 150 });
        pulseOpacity.value = withRepeat(
          withTiming(1, { duration: 2000 }, () => {
            pulseOpacity.value = withTiming(0.6, { duration: 2000 });
          }),
          -1,
          true
        );
      } else {
        scale.value = withSpring(1, { damping: 20, stiffness: 150 });
        pulseOpacity.value = withRepeat(
          withTiming(0.9, { duration: 3000 }, () => {
            pulseOpacity.value = withTiming(0.6, { duration: 3000 });
          }),
          -1,
          true
        );
      }
    };
    animate();
  }, [status]);

  useEffect(() => {
    particlePositions.forEach((particle, i) => {
      particle.angle.value = withRepeat(
        withTiming(particle.angle.value + 360, { duration: 15000 + i * 500, easing: (t) => t }),
        -1
      );
      particle.radius.value = withRepeat(
        withTiming(60 + Math.sin(Date.now() / 1000 + i) * 15, { duration: 3000 + i * 200, easing: (t) => t }),
        -1,
        true
      );
      particle.opacity.value = withRepeat(
        withTiming(Math.random() * 0.5 + 0.3, { duration: 2000 + i * 300 }, () => {
          particle.opacity.value = withTiming(Math.random() * 0.5 + 0.3, { duration: 2000 + i * 300 });
        }),
        -1,
        true
      );
    });
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: pulseOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [283, 0], Extrapolate.CLAMP),
  }));

  const particleStyles = particlePositions.map(p =>
    useAnimatedStyle(() => {
      const angleRad = (p.angle.value * Math.PI) / 180;
      return {
        transform: [
          { translateX: p.radius.value * Math.cos(angleRad) },
          { translateY: p.radius.value * Math.sin(angleRad) },
        ],
        opacity: p.opacity.value,
        width: p.size.value,
        height: p.size.value,
      };
    })
  );

  return {
    orbStyle,
    ringStyle,
    particleStyles,
    progress,
    scale,
  };
}

export function useCountUpAnimation(endValue: number, duration: number = 1500, delay: number = 0) {
  const value = useSharedValue(0);
  const displayValue = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(delay, withTiming(endValue, { duration, easing: (t) => t * t * (3 - 2 * t) }));
    displayValue.value = withDelay(delay, withTiming(endValue, { duration, easing: (t) => t * t * (3 - 2 * t) }));
  }, [endValue, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(displayValue.value, [0, 1], [0, 1], Extrapolate.CLAMP),
    transform: [{ translateY: interpolate(displayValue.value, [0, endValue * 0.1], [20, 0], Extrapolate.CLAMP) }],
  }));

  return { value: displayValue, animatedStyle };
}

export function useStaggeredEntrance(index: number, baseDelay: number = 100) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(index * baseDelay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * baseDelay, withSpring(0, { damping: 20, stiffness: 150 }));
    scale.value = withDelay(index * baseDelay, withSpring(1, { damping: 20, stiffness: 150 }));
  }, [index, baseDelay]);

  return useAnimatedStyle(() => ({
    opacity,
    transform: [{ translateY }, { scale }],
  }));
}

export function useShimmerAnimation() {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(200, { duration: 1500, easing: (t) => t }), -1);
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }));
}

export function useFloatAnimation(amplitude: number = 10, duration: number = 6000) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-amplitude, { duration: duration / 2, easing: (t) => t * t * (3 - 2 * t) }),
      -1,
      true
    );
  }, [amplitude, duration]);

  return useAnimatedStyle(() => ({ transform: [{ translateY }] }));
}

export function useGlowAnimation(color: string, intensity: number = 1) {
  const glowRadius = useSharedValue(20);

  useEffect(() => {
    glowRadius.value = withRepeat(
      withTiming(20 + 20 * intensity, { duration: 2000, easing: (t) => t * t * (3 - 2 * t) }),
      -1,
      true
    );
  }, [intensity]);

  return { glowRadius };
}

export function usePressAnimation() {
  const scale = useSharedValue(1);

  const pressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale }],
  }));

  return { animatedStyle, pressIn, pressOut };
}

export function useSlideAnimation(direction: 'left' | 'right' | 'up' | 'down', distance: number = 50) {
  const translate = useSharedValue(direction === 'left' || direction === 'up' ? -distance : distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translate.value = withSpring(0, { damping: 20, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  return useAnimatedStyle(() => ({
    opacity,
    transform: [
      direction === 'left' || direction === 'right'
        ? { translateX: translate }
        : { translateY: translate },
    ],
  }));
}

export function useModalAnimation() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const show = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    backdropOpacity.value = withTiming(0.5, { duration: 200 });
  };

  const hide = (callback?: () => void) => {
    scale.value = withSpring(0.8, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(0, { duration: 150 });
    backdropOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(callback)?.();
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity,
  }));

  return { containerStyle, backdropStyle, show, hide };
}