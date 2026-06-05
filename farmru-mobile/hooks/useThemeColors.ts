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
    
    // Core Brand Colors (Shifted to vibrant modern equivalents)
    tintGreen: isDark ? '#4ade80' : '#16a34a', // Neon Spring Green / Deep Emerald
    soilBrown: isDark ? '#fbbf24' : '#d97706', // Rich Gold / Amber
    
    // Ambient Background Gradients (Deep, immersive themes)
    bgGradientStart: isDark ? '#020617' : '#f8fafc', // Ultra-dark slate / Frost white
    bgGradientEnd: isDark ? '#134e4a' : '#e2e8f0',   // Deep Teal shadow / Pearl grey
    
    authGradientStart: isDark ? '#020617' : '#f8fafc',
    authGradientEnd: isDark ? '#0f172a' : '#cbd5e1',

    // Core Typography
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textSub: isDark ? 'rgba(248, 250, 252, 0.7)' : 'rgba(15, 23, 42, 0.7)',
    textDim: isDark ? 'rgba(248, 250, 252, 0.4)' : 'rgba(15, 23, 42, 0.5)',
    
    // Glassmorphism System
    // Vastly reduced opacity and border thickness for high-fidelity frost
    glassBackground: isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.65)',
    glassBackgroundStrong: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
    glassBackgroundDarker: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.95)',
    
    // Extremely subtle borders to catch the light, not box the component
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 1)',
    glassBorderStrong: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
    
    // Blur Views
    blurTint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    
    // Interactive Elements
    cardIconBg: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.08)',
    inputBackground: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
    dangerBg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    dangerText: isDark ? '#f87171' : '#dc2626',
    
    // Graph Analytics
    graphStrokeDark: isDark ? '#2D4537' : '#B1C7BA',
    graphTooltipBg: isDark ? '#2A4434' : '#FFFFFF',
  };
}
