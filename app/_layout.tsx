import { Stack } from 'expo-router';
import { Providers } from '@/context/Providers';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#03060a' },
        }}
      >
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(app)" options={{ presentation: 'card' }} />
        <Stack.Screen name="splash" options={{ presentation: 'card' }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#03060a" translucent />
    </Providers>
  );
}