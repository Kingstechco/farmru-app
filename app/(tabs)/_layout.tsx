import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';

export default function TabLayout() {
  const activeColor = Colors.light.secondary; // Warm brand color
  const inactiveColor = 'rgba(255,255,255,0.5)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 11,
          paddingBottom: Platform.OS === 'web' ? 4 : 0, // Micro-adjust for web rendering
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 24, // Floating margin from bottom edge
          left: 20,
          right: 20,
          elevation: 15, // Android shadow
          shadowColor: '#000', // iOS/Web shadow
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.35,
          shadowRadius: 24,
          backgroundColor: 'transparent', // Let BlurView handle background
          borderRadius: 35, // True pill shape
          borderTopWidth: 1, // Override default react-navigation double border
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)', // Sleek glassy edge
          height: 72, 
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: 34, overflow: 'hidden' }}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(12, 22, 33, 0.4)' }]} />
            <BlurView tint="dark" intensity={70} style={StyleSheet.absoluteFill} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="grid-view" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fields"
        options={{
          title: 'Fields',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="grass" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="auto-awesome" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="query-stats" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color }: { color: string }) => <MaterialIcons name="memory" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
