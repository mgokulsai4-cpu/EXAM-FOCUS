import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
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
import { useAuth } from '@/context';
import { AnimatedButton } from '@/components/AnimatedButton';
import { GlassCard } from '@/components/GlassCard';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function LoginScreen() {
  const { login } = useAuth();
  const { medium } = useHaptics();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(30);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  const floatStyle = useFloatAnimation(15, 4000);

  React.useEffect(() => {
    containerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    containerTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 150 }));
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity,
    transform: [{ translateY: containerTranslateY }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      medium();
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)/home');
    } catch (e) {
      setError('Login failed. Please try again.');
      medium();
    } finally {
      setIsLoading(false);
    }
  };

  const entrance1 = useStaggeredEntrance(0, 100);
  const entrance2 = useStaggeredEntrance(1, 100);
  const entrance3 = useStaggeredEntrance(2, 100);
  const entrance4 = useStaggeredEntrance(3, 100);
  const entrance5 = useStaggeredEntrance(4, 100);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.bgDecoration} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.logoContainer, logoStyle, floatStyle]}>
          <LinearGradient colors={['#0ea5e9', '#8b5cf6', '#ec4899']} style={styles.logoGradient}>
            <Text style={styles.logoText}>EF</Text>
          </LinearGradient>
          <View style={styles.logoGlow} />
        </Animated.View>

        <Animated.View style={[styles.titleContainer, containerStyle, entrance1]}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your focus journey</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, containerStyle, entrance2]}>
          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </GlassCard>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, containerStyle, entrance3]}>
          <AnimatedButton
            title="SIGN IN"
            onPress={handleLogin}
            variant="gradient"
            size="lg"
            fullWidth
            loading={isLoading}
          />
        </Animated.View>

        <Animated.View style={[styles.dividerContainer, containerStyle, entrance4]}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.divider} />
        </Animated.View>

        <Animated.View style={[styles.socialContainer, containerStyle, entrance5]}>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={() => {}}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => {}}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.signupContainer, containerStyle, entrance5]}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Text style={styles.signupLink} onPress={() => router.push('/signup')}>Create Account</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  bgDecoration: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0ea5e9',
    opacity: 0.05,
  },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  logoGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 35,
    backgroundColor: 'transparent',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  titleContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'Inter_500Medium' },
  formContainer: { width: '100%', marginBottom: 24 },
  formCard: { width: '100%', padding: 24 },
  inputGroup: { gap: 8, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_600SemiBold' },
  input: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  errorText: { fontSize: 13, color: '#ef4444', marginTop: 8, fontFamily: 'Inter_500Medium' },
  buttonContainer: { width: '100%', marginBottom: 24 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  socialContainer: { width: '100%', marginBottom: 24 },
  socialButtons: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  socialButton: {
    flex: 1,
    maxWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  socialIcon: { fontSize: 18 },
  socialText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_600SemiBold' },
  signupContainer: { alignItems: 'center' },
  signupText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  signupLink: { fontSize: 14, fontWeight: '700', color: '#0ea5e9', fontFamily: 'SpaceGrotesk_700Bold' },
});