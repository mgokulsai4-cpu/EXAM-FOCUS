import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
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
import { FocusOrb } from '@/components/FocusOrb';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';

export default function SplashScreen() {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const orbOpacity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  const floatStyle = useFloatAnimation(15, 4000);

  useEffect(() => {
    const init = async () => {
      bgOpacity.value = withTiming(1, { duration: 800 });
      logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      logoScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
      
      textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      textTranslateY.value = withDelay(600, withSpring(0, { damping: 20, stiffness: 150 }));
      
      taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
      orbOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));

      setTimeout(() => {
        router.replace('/onboarding');
      }, 3500);
    };
    init();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity,
    transform: [{ translateY: textTranslateY }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity }));
  const orbContainerStyle = useAnimatedStyle(() => ({ opacity: orbOpacity }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#03060a" translucent />
      
      <Animated.View style={[styles.bgGradient, { opacity: bgOpacity }]} />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient colors={['#0ea5e9', '#8b5cf6', '#ec4899']} style={styles.logoGradient}>
            <Text style={styles.logoText}>EF</Text>
          </LinearGradient>
          <Animated.View style={[styles.logoGlow, floatStyle]} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.appName}>Exam Focus</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, taglineStyle]}>
          <Text style={styles.tagline}>"First Study. Then Earn Your Screen Time."</Text>
        </Animated.View>

        <Animated.View style={[styles.orbContainer, orbContainerStyle]}>
          <FocusOrb
            readiness={82}
            status="idle"
            message="Exam Ready"
            size={160}
            showParticles={true}
          />
        </Animated.View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: withTiming('100%', { duration: 3000, easing: (t) => t * t * (3 - 2 * t) }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Preparing your focus journey...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoContainer: { position: 'relative', marginBottom: 24 },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1 },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 34,
    backgroundColor: 'transparent',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  textContainer: { marginBottom: 8 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1.5 },
  taglineContainer: { marginBottom: 40 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24, fontStyle: 'italic', fontFamily: 'Inter_500Medium' },
  orbContainer: { marginBottom: 40 },
  loadingContainer: { width: '100%', maxWidth: 280, alignItems: 'center', gap: 12 },
  loadingBar: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  loadingFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 2 },
  loadingText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
});