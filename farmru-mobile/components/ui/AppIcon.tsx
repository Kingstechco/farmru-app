import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

interface AppIconProps {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function AppIcon({ name, size = 24, color = '#1A237E', style }: AppIconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
