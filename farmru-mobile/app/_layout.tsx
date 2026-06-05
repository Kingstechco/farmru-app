import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'ios_from_right',
          animationDuration: 280,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 220 }} />
        <Stack.Screen name="menu" options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 320 }} />
        <Stack.Screen name="filter-modal" options={{ presentation: 'transparentModal', animation: 'fade', animationDuration: 200 }} />
        <Stack.Screen name="analytics" options={{ animation: 'ios_from_right', animationDuration: 280 }} />
        <Stack.Screen name="devices" options={{ animation: 'ios_from_right', animationDuration: 280 }} />
        {/* Secondary pages reached via router.push */}
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_bottom', presentation: 'modal', animationDuration: 320 }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom', presentation: 'modal', animationDuration: 320 }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
