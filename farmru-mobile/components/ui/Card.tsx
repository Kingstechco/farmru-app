import React from 'react';
import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'flat';
  padding?: number;
}

export function Card({ children, style, variant = 'elevated', padding = 16, ...props }: CardProps) {
  const colorScheme = useColorScheme();
  const C = Colors[colorScheme ?? 'light'];

  return (
    <View 
      style={[
        styles.card,
        { backgroundColor: C.card, padding },
        variant === 'elevated' && [
          styles.elevated, 
          { shadowColor: colorScheme === 'dark' ? '#000' : '#1A237E', shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.08 }
        ],
        variant === 'outline' && [styles.outline, { borderColor: C.border }],
        style,
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  outline: {
    borderWidth: 1,
  },
});
