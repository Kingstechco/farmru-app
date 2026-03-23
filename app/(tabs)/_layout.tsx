import React, { useRef, useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Tabs, useRouter } from 'expo-router';
import { AskFarmruSheet } from '@/components/AskFarmruSheet';
import { BlurView } from 'expo-blur';
import {
  StyleSheet, View, Platform, TouchableOpacity, Text,
  Modal, Animated, Pressable
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { store } from '@/utils/store';
import { SoilAnalysisModal } from '@/components/SoilAnalysisModal';

// ─── Quick Log actions ───────────────────────────────────────
const QUICK_ACTIONS = [
  { key: 'water' as const, label: 'Log Water',   sublabel: 'Record irrigation event', icon: 'water-drop', color: '#38bdf8' },
  { key: 'soil'  as const, label: 'Soil Test',   sublabel: 'Run soil analysis',       icon: 'science',    color: '#c1a06a' },
  { key: 'pest'  as const, label: 'Report Pest', sublabel: 'Flag field issue',         icon: 'bug-report', color: '#ef4444' },
];

// ─── Floating Ask Farmru pill button (Circle → Pill Morph) ──
function FloatingAIButton({ onPress, sheetOpen }: { onPress: () => void; sheetOpen: boolean }) {
  const theme = useThemeColors();

  // Animations
  // pillW: 0 = collapsed circle (52px wide), 1 = expanded pill (~145px wide)
  const pillW    = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(1)).current;
  const slideX   = useRef(new Animated.Value(0)).current;

  // On mount: expand to pill, then retract to circle after 3.5s
  useEffect(() => {
    Animated.sequence([
      Animated.spring(pillW, { toValue: 1, useNativeDriver: false, tension: 50, friction: 10, delay: 600 }),
      Animated.delay(3500),
      Animated.timing(pillW, { toValue: 0, duration: 280, useNativeDriver: false }),
    ]).start();
  }, []);

  // Slide off-screen (right) when sheet is open, back in when closed
  useEffect(() => {
    Animated.spring(slideX, {
      toValue: sheetOpen ? 100 : 0,
      useNativeDriver: true,
      tension: 65, friction: 13,
    }).start();
  }, [sheetOpen]);

  // Width morphs from 52px (circle) to 145px (pill)
  const containerWidth = pillW.interpolate({ inputRange: [0, 1], outputRange: [52, 145] });
  // Text opacity kicks in late during expansion
  const textOpacity    = pillW.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.86, useNativeDriver: true, speed: 55, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 14 }),
    ]).start();
    onPress();
  };

  const expandPill = () => {
    Animated.sequence([
      Animated.spring(pillW, { toValue: 1, useNativeDriver: false, tension: 50, friction: 10 }),
      Animated.delay(3000),
      Animated.timing(pillW, { toValue: 0, duration: 260, useNativeDriver: false }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.fabWrap, { transform: [{ translateX: slideX }] }]}>
      <Pressable
        onPress={handlePress}
        onHoverIn={Platform.OS === 'web' ? expandPill : undefined}
        accessible
        accessibilityLabel="Ask Farmru AI Assistant"
        accessibilityRole="button"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {/* Animated width container with gradient filling it */}
          <Animated.View style={[styles.pillContainer, { width: containerWidth }]}>
            <LinearGradient
              colors={['#3D7A3A', '#6B9E3A', '#A6892E']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* The content row inside the pill */}
            <View style={styles.pillContent}>
              {/* Icon circle (always visible, always 52x52 area) */}
              <View style={styles.pillIconArea}>
                <View style={styles.fabInner}>
                  <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="eco" size={26} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', top: 1, left: 1 }} />
                    <MaterialIcons name="eco" size={24} color="#fff" />
                  </View>
                </View>
              </View>

              {/* Text area (fades in as container expands) */}
              <Animated.View style={[{ paddingRight: 16, justifyContent: 'center', opacity: textOpacity }]}>
                <Text numberOfLines={1} style={styles.pillTextSlick}>Ask Farmru</Text>
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Custom centre Quick Log button ──────────────────────────
function QuickLogTabButton({ onPress }: { onPress: () => void; children?: React.ReactNode }) {
  const theme = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
      onPress={onPress}
      style={styles.centreSlot}
    >
      <Animated.View style={{ alignItems: 'center', gap: 3, transform: [{ scale }] }}>
        <LinearGradient
          colors={[theme.soilBrown, '#7A4520']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.centreButton, { shadowColor: theme.soilBrown }]}
        >
          <MaterialIcons name="add" size={26} color="#FFF" />
        </LinearGradient>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: theme.soilBrown }}>
          Quick Log
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main layout ─────────────────────────────────────────────
export default function TabLayout() {
  const theme = useThemeColors();
  const router = useRouter();

  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [soilVisible, setSoilVisible]   = React.useState(false);
  const [askOpen, setAskOpen]           = React.useState(false);

  // Quick Log animations
  const qlSlide   = useRef(new Animated.Value(320)).current;
  const qlOverlay = useRef(new Animated.Value(0)).current;
  const qlItems   = useRef(QUICK_ACTIONS.map(() => new Animated.Value(0))).current;

  const activeColor   = Colors.light.secondary;
  const inactiveColor = theme.isDark ? 'rgba(255,255,255,0.45)' : 'rgba(80,70,60,0.55)';

  const openQL = () => {
    setQuickLogOpen(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(qlSlide, { toValue: 0, useNativeDriver: true, tension: 68, friction: 13 }),
      Animated.timing(qlOverlay, { toValue: 1, duration: 200, useNativeDriver: true }),
      ...qlItems.map((a, i) => Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 55, friction: 10, delay: i * 55 })),
    ]).start();
  };
  const closeQL = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(qlSlide, { toValue: 320, duration: 200, useNativeDriver: true }),
      Animated.timing(qlOverlay, { toValue: 0, duration: 180, useNativeDriver: true }),
      ...qlItems.map(a => Animated.timing(a, { toValue: 0, duration: 120, useNativeDriver: true })),
    ]).start(() => setQuickLogOpen(false));
  };

  const handleQL = (key: typeof QUICK_ACTIONS[0]['key']) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (key === 'water') {
      store.addActivity({ title: 'Manual Irrigation', subtitle: 'Applied via Quick Log', icon: 'water-drop', color: '#38bdf8' });
      store.setMoistureBoost(15);
      closeQL();
    } else if (key === 'soil') {
      closeQL();
      setTimeout(() => setSoilVisible(true), 280);
    } else if (key === 'pest') {
      store.addActivity({ title: 'Pest Sighting', subtitle: 'Immediate action needed', icon: 'bug-report', color: '#ef4444' });
      store.setHealthOverride('Warning');
      closeQL();
    }
  };

  return (
    <>
      {/* ════════════ Tab navigator ════════════ */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          headerShown: false,
          tabBarLabelStyle: {
            fontFamily: 'Outfit_500Medium',
            fontSize: 11,
            paddingBottom: Platform.OS === 'web' ? 4 : 0,
          },
          animation: 'fade',
          tabBarStyle: {
            position: 'absolute', bottom: 24, left: 20, right: 20,
            elevation: 15,
            shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3, shadowRadius: 20,
            backgroundColor: 'transparent',
            borderRadius: 35, borderTopWidth: 0,
            borderWidth: 1,
            borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
            height: 72, paddingBottom: 8, paddingTop: 8,
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, borderRadius: 34, overflow: 'hidden' }}>
              <View style={[StyleSheet.absoluteFill, {
                backgroundColor: theme.isDark ? 'rgba(10,18,28,0.88)' : 'rgba(252,248,244,0.9)',
              }]} />
              <BlurView tint={theme.isDark ? 'dark' : 'light'} intensity={85} style={StyleSheet.absoluteFill} />
            </View>
          ),
        }}
      >
        {/* Slot 1 — Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <MaterialIcons name="grid-view" size={22} color={color} />,
          }}
        />
        {/* Slot 2 — Fields */}
        <Tabs.Screen
          name="fields"
          options={{
            title: 'Fields',
            tabBarIcon: ({ color }) => <MaterialIcons name="grass" size={22} color={color} />,
          }}
        />
        {/* Slot 3 — Quick Log (custom button, no navigation) */}
        <Tabs.Screen
          name="chat"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon:  () => null,
            tabBarButton: () => <QuickLogTabButton onPress={openQL} />,
          }}
        />
        {/* Slot 4 — Analytics */}
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <MaterialIcons name="query-stats" size={22} color={color} />,
          }}
        />
        {/* Slot 5 — Devices */}
        <Tabs.Screen
          name="devices"
          options={{
            title: 'Devices',
            tabBarIcon: ({ color }) => <MaterialIcons name="router" size={22} color={color} />,
          }}
        />
      </Tabs>

      {/* ════════════ Floating AI Assistant button ════════════ */}
      <FloatingAIButton onPress={() => setAskOpen(true)} sheetOpen={askOpen} />

      {/* ════════════ Ask Farmru bottom sheet ════════════ */}
      <AskFarmruSheet visible={askOpen} onClose={() => setAskOpen(false)} />

      {/* ════════════ Quick Log tray ════════════ */}
      {quickLogOpen && (
        <Modal visible transparent animationType="none" onRequestClose={closeQL}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: qlOverlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeQL}>
              <BlurView intensity={theme.isDark ? 35 : 20} tint="dark" style={StyleSheet.absoluteFill} />
            </Pressable>
          </Animated.View>
          <Animated.View style={[styles.tray, {
            backgroundColor: theme.isDark ? 'rgba(14,22,34,0.97)' : 'rgba(252,248,244,0.97)',
            borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            transform: [{ translateY: qlSlide }],
          }]}>
            <BlurView intensity={theme.isDark ? 90 : 95} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[styles.handle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)' }]} />
            <View style={styles.trayHeader}>
              <Text style={[styles.trayTitle, { color: theme.textMain }]}>Quick Log</Text>
              <Text style={[styles.traySub, { color: theme.textSub }]}>Record a farm activity instantly</Text>
            </View>
            <View style={styles.actionRow}>
              {QUICK_ACTIONS.map((a, i) => {
                const sc = qlItems[i].interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
                return (
                  <Animated.View key={a.key} style={{ flex: 1, opacity: qlItems[i], transform: [{ scale: sc }] }}>
                    <Pressable
                      onPress={() => handleQL(a.key)}
                      style={({ pressed }) => [styles.actionCard, {
                        backgroundColor: pressed ? a.color + '28' : a.color + '12',
                        borderColor: a.color + '45',
                        transform: [{ scale: pressed ? 0.94 : 1 }],
                      }]}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                        <MaterialIcons name={a.icon as any} size={28} color={a.color} />
                      </View>
                      <Text style={[styles.actionLabel, { color: theme.textMain }]}>{a.label}</Text>
                      <Text style={[styles.actionSub, { color: theme.textSub }]}>{a.sublabel}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
            <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
            <TouchableOpacity onPress={closeQL} style={styles.cancelBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={16} color={theme.textDim} />
              <Text style={[styles.cancelText, { color: theme.textDim }]}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}

      <SoilAnalysisModal visible={soilVisible} onClose={() => setSoilVisible(false)} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Tab bar slots
  centreSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centreButton: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.22)',
  },

  // Floating pill button
  fabWrap: {
    position: 'absolute',
    bottom: 110,
    right: 16,
    zIndex: 999,
  },
  pillContainer: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#3D7A3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    // Add white background so gradient looks solid during morph
    backgroundColor: '#fff',
  },
  pillContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIconArea: {
    width: 49, // match inner - borders
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fabInner: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillTextSlick: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.2,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    includeFontPadding: false,
  },

  // Shared tray styles
  tray: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    overflow: 'hidden',
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  trayHeader: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18 },
  trayTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  traySub: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  actionCard: { borderRadius: 22, borderWidth: 1.5, padding: 16, alignItems: 'center', gap: 8 },
  actionIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 13, textAlign: 'center' },
  actionSub: { fontFamily: 'Outfit_400Regular', fontSize: 10, textAlign: 'center' },
  divider: { height: 1, marginHorizontal: 24, marginBottom: 10 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  cancelText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
});
