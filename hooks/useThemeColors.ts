import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

let globalThemeOverride: 'light' | 'dark' | null = null;
const listeners = new Set<() => void>();

export function toggleThemeOverride() {
  globalThemeOverride = globalThemeOverride === 'dark' ? 'light' : 'dark';
  listeners.forEach(l => l());
}

export function useThemeColors() {
  const systemScheme = useColorScheme() ?? 'dark';
  const [override, setOverride] = useState(globalThemeOverride);

  useEffect(() => {
    const notify = () => setOverride(globalThemeOverride);
    listeners.add(notify);
    return () => { listeners.delete(notify); };
  }, []);

  const isDark = override ? override === 'dark' : systemScheme === 'dark';

  return {
    isDark,
    
    // Core Brand Colors
    tintGreen: Colors.light.primary,
    soilBrown: Colors.light.secondary,
    
    // Ambient Background Gradients (Muted, earthy off-whites to prevent eye strain)
    bgGradientStart: isDark ? '#172635' : '#E6E9E6',
    bgGradientEnd: isDark ? '#1B3526' : '#C7CDC9',
    
    authGradientStart: isDark ? '#111822' : '#EFF1F0',
    authGradientEnd: isDark ? '#1B3526' : '#BFC6C2',

    // Core Typography
    textMain: isDark ? '#FFFFFF' : '#142129', // Deep navy
    textSub: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(20, 33, 41, 0.65)',
    textDim: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(20, 33, 41, 0.45)',
    
    // Glassmorphism System
    // Much more opaque for clarity against dimmer background
    glassBackground: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
    glassBackgroundStrong: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
    glassBackgroundDarker: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(240, 244, 241, 0.95)',
    // Brand colored translucent borders to accent panels perfectly
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(98, 168, 85, 0.25)', // Tint Green
    glassBorderStrong: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(193, 154, 92, 0.45)', // Soil Brown
    
    // Blur Views
    blurTint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    
    // Interactive Elements
    cardIconBg: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(98, 168, 85, 0.1)', // Subtle tint green
    inputBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)',
    dangerBg: isDark ? 'rgba(235, 127, 127, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    dangerText: isDark ? '#eb7f7f' : '#DC2626',
    
    // Graph Analytics
    graphStrokeDark: isDark ? '#2D4537' : '#B1C7BA',
    graphTooltipBg: isDark ? '#2A4434' : '#FFFFFF',
  };
}
