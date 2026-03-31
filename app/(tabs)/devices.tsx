import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  TouchableOpacity, Pressable, Animated, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Polyline, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

// ── Sensor node data, grouped by field ───────────────────────
const FIELD_GROUPS = [
  {
    field: 'Field 1 — Maize Plot',
    fieldKey: 'F1',
    color: '#4ade80',
    nodes: [
      {
        id: 'CF1B', type: 'Gateway Hub', icon: 'router',
        status: 'Online', battery: 88, signal: 92, signalLabel: 'Strong',
        lastSync: '2m ago', firmware: 'v3.2.1', uptime: '99.8%',
        readings: {
          moisture: 42, temp: 19, ph: 6.8, light: 780,
          humidity: 55, co2: 412,
        },
        history: [38, 40, 41, 43, 47, 44, 42],
        aiDiagnosis: {
          verdict: 'Healthy', color: '#4ade80',
          message: 'Everything is running smoothly. Connection is strong.',
        },
        alerts: [],
      },
      {
        id: 'SM1A', type: 'Soil Moisture Sensor', icon: 'water-drop',
        status: 'Online', battery: 62, signal: 78, signalLabel: 'Good',
        lastSync: '5m ago', firmware: 'v2.8.4', uptime: '97.2%',
        readings: {
          moisture: 44, temp: 18, ph: 6.9, light: null,
          humidity: null, co2: null,
        },
        history: [40, 42, 44, 46, 45, 44, 44],
        aiDiagnosis: {
          verdict: 'Healthy', color: '#4ade80',
          message: 'Moisture levels are good. Replace the battery in about a month.',
        },
        alerts: [],
      },
    ],
  },
  {
    field: 'Field 2 — Tomato Grid',
    fieldKey: 'F2',
    color: '#f59e0b',
    nodes: [
      {
        id: 'CF2A', type: 'Soil Sensor', icon: 'sensors',
        status: 'Online', battery: 45, signal: 60, signalLabel: 'Moderate',
        lastSync: '12m ago', firmware: 'v2.8.4', uptime: '94.1%',
        readings: {
          moisture: 28, temp: 24, ph: 6.2, light: null,
          humidity: null, co2: null,
        },
        history: [33, 30, 28, 25, 29, 27, 28],
        aiDiagnosis: {
          verdict: 'Warning', color: '#f59e0b',
          message: 'Moisture is very low. The signal is weak—check if the antenna is blocked. Battery needs changing in 2 weeks.',
        },
        alerts: ['Low moisture detected', 'Signal degraded'],
      },
      {
        id: 'VL2X', type: 'Smart Valve Controller', icon: 'water',
        status: 'Online', battery: 78, signal: 85, signalLabel: 'Good',
        lastSync: '3m ago', firmware: 'v1.9.0', uptime: '99.1%',
        readings: {
          moisture: null, temp: null, ph: null, light: null,
          humidity: null, co2: null,
          flowRate: 14.2, pressureBar: 2.1, cyclesCompleted: 42, valveOpen: false,
        },
        history: [14.0, 14.1, 13.8, 14.2, 14.5, 14.3, 14.2],
        aiDiagnosis: {
          verdict: 'Healthy', color: '#4ade80',
          message: 'Water is flowing normally. Pressure is good.',
        },
        alerts: [],
      },
    ],
  },
  {
    field: 'Field 3 — Potato Patch',
    fieldKey: 'F3',
    color: '#38bdf8',
    nodes: [
      {
        id: 'WT3R', type: 'Weather Station', icon: 'wb-sunny',
        status: 'Online', battery: 98, signal: 97, signalLabel: 'Excellent',
        lastSync: '1m ago', firmware: 'v4.0.2', uptime: '99.9%',
        readings: {
          moisture: null, temp: 22, ph: null, light: 1240,
          humidity: 61, co2: 398, windKph: 14, rainMm: 0,
        },
        history: [20, 21, 22, 23, 22, 22, 22],
        aiDiagnosis: {
          verdict: 'Excellent', color: '#4ade80',
          message: 'Everything is working perfectly. The sun is keeping the battery full.',
        },
        alerts: [],
      },
      {
        id: 'PH3X', type: 'Pump Controller', icon: 'opacity',
        status: 'Offline', battery: 12, signal: 0, signalLabel: 'Lost',
        lastSync: '4h ago', firmware: 'v1.5.3', uptime: '78.4%',
        readings: {
          moisture: null, temp: null, ph: null, light: null,
          humidity: null, co2: null,
        },
        history: [0, 0, 0, 0, 0, 0, 0],
        aiDiagnosis: {
          verdict: 'Critical', color: '#ef4444',
          message: "This device hasn't connected in 4 hours. Battery is almost dead. Please check it in the field.",
        },
        alerts: ['Node offline', 'Critical battery', 'No signal'],
      },
    ],
  },
] as const;

type NodeType = typeof FIELD_GROUPS[0]['nodes'][0];

// ── Battery bar ───────────────────────────────────────────────
const BatteryBar = ({ pct, color }: { pct: number; color: string }) => {
  const theme = useThemeColors();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct / 100, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [pct]);
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', flex: 1 }}>
      <Animated.View style={{ height: '100%', width: w, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
};

// ── Signal ring (SVG) ─────────────────────────────────────────
const SignalRing = ({ pct, color }: { pct: number; color: string }) => {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44">
      <Circle cx={22} cy={22} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={4} fill="none" />
      <Circle
        cx={22} cy={22} r={r}
        stroke={color} strokeWidth={4} fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </Svg>
  );
};

// ── Sparkline chart ───────────────────────────────────────────
const Sparkline = ({ data, color }: { data: readonly number[]; color: string }) => {
  const w = 100;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <Svg width={w} height={h}>
      <Defs>
        <SvgGradient id={`sg-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path d={`M ${fillPts} Z`} fill={`url(#sg-${color})`} />
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// ── Node Reading Row ──────────────────────────────────────────
const ReadingRow = ({ label, value, unit, icon, color }: {
  label: string; value: number | null; unit: string; icon: string; color: string;
}) => {
  const theme = useThemeColors();
  if (value === null) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.glassBorder }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name={icon as any} size={13} color={color} />
      </View>
      <Text style={{ flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 13, color: theme.textSub }}>{label}</Text>
      <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: theme.textMain }}>{value}<Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: theme.textDim }}> {unit}</Text></Text>
    </View>
  );
};

// ── Node Card ─────────────────────────────────────────────────
const NodeCard = ({ node, fieldColor }: { node: NodeType; fieldColor: string }) => {
  const theme = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isOnline = node.status === 'Online';
  const statusColor = node.aiDiagnosis.color;

  const toggle = () => {
    Animated.spring(anim, { toValue: expanded ? 0 : 1, useNativeDriver: false, tension: 55, friction: 11 }).start();
    setExpanded(e => !e);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const batteryColor = node.battery > 50 ? '#4ade80' : node.battery > 20 ? '#f59e0b' : '#ef4444';
  const signalColor = node.signal > 70 ? '#4ade80' : node.signal > 30 ? '#f59e0b' : '#ef4444';
  const expandH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 490] });

  const readings = node.readings as any;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
      onPress={toggle}
    >
      <Animated.View style={[{
        borderRadius: 22, overflow: 'hidden', borderWidth: 1.5, marginBottom: 14,
        borderColor: expanded ? statusColor + '55' : theme.glassBorder,
        backgroundColor: theme.glassBackground,
        transform: [{ scale: scaleAnim }],
      }]}>
        <BlurView intensity={theme.isDark ? 30 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />

        {/* Card header */}
        <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {/* Signal ring with icon in center */}
          <View style={{ width: 44, height: 44, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <SignalRing pct={node.signal} color={signalColor} />
            <View style={{ position: 'absolute' }}>
              <MaterialIcons name={node.icon as any} size={16} color={isOnline ? fieldColor : theme.textDim} />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: theme.textMain }}>Node {node.id}</Text>
              {node.alerts.length > 0 && (
                <View style={{ backgroundColor: '#ef444420', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#ef4444' }}>⚠ {node.alerts.length}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: theme.textSub }}>{node.type}</Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: theme.textDim, marginTop: 1 }}>Last sync: {node.lastSync}</Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
              backgroundColor: isOnline ? statusColor + '18' : '#ef444418',
              borderWidth: 1, borderColor: (isOnline ? statusColor : '#ef4444') + '40',
            }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: isOnline ? statusColor : '#ef4444' }}>
                {isOnline ? `● ${node.status}` : `○ ${node.status}`}
              </Text>
            </View>
            <MaterialIcons name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={theme.textDim} />
          </View>
        </View>

        {/* Quick stats strip */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 18, paddingBottom: 16, gap: 12, alignItems: 'center' }}>
          <MaterialIcons name="battery-full" size={13} color={batteryColor} />
          <BatteryBar pct={node.battery} color={batteryColor} />
          <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: batteryColor, minWidth: 34 }}>{node.battery}%</Text>
          <View style={{ width: 1, height: 14, backgroundColor: theme.glassBorder }} />
          <MaterialIcons name="wifi" size={13} color={signalColor} />
          <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: signalColor }}>{node.signalLabel}</Text>
        </View>

        {/* Expanded detail panel */}
        <Animated.View style={{ height: expandH, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 18, paddingBottom: 20, gap: 0 }}>

            {/* 7-day sparkline */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: theme.textSub }}>7-Day Trend</Text>
              <Sparkline data={node.history} color={fieldColor} />
            </View>

            {/* Sensor readings */}
            <View style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: theme.glassBorder }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: theme.textMain, marginBottom: 6 }}>Live Readings</Text>
              <ReadingRow label="Soil Moisture"   value={readings.moisture}         unit="%"      icon="water-drop"   color="#38bdf8" />
              <ReadingRow label="Soil Temperature" value={readings.temp !== undefined ? readings.temp : null} unit="°C" icon="thermostat" color="#f87171" />
              <ReadingRow label="pH Level"          value={readings.ph}               unit=""       icon="science"      color="#c1a06a" />
              <ReadingRow label="Light Intensity"   value={readings.light}            unit="lux"    icon="wb-sunny"     color="#fbbf24" />
              <ReadingRow label="Ambient Humidity"  value={readings.humidity}         unit="%"      icon="water"        color="#a78bfa" />
              <ReadingRow label="CO₂ Level"         value={readings.co2}              unit="ppm"    icon="eco"          color="#4ade80" />
              <ReadingRow label="Wind Speed"        value={readings.windKph ?? null}  unit="km/h"   icon="air"          color="#e2e8f0" />
              <ReadingRow label="Rainfall"          value={readings.rainMm ?? null}   unit="mm"     icon="grain"        color="#38bdf8" />
              <ReadingRow label="Flow Rate"         value={readings.flowRate ?? null} unit="L/min"  icon="opacity"      color="#38bdf8" />
              <ReadingRow label="Pressure"          value={readings.pressureBar ?? null} unit="bar" icon="compress"    color="#a78bfa" />
              {readings.cyclesCompleted !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#38bdf820', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="loop" size={13} color="#38bdf8" />
                  </View>
                  <Text style={{ flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 13, color: theme.textSub }}>Cycles Completed</Text>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: theme.textMain }}>{readings.cyclesCompleted}</Text>
                </View>
              )}
              {readings.valveOpen !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: (readings.valveOpen ? '#4ade80' : '#ef4444') + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="toggle-on" size={13} color={readings.valveOpen ? '#4ade80' : '#ef4444'} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 13, color: theme.textSub }}>Valve State</Text>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: readings.valveOpen ? '#4ade80' : '#ef4444' }}>{readings.valveOpen ? 'OPEN' : 'CLOSED'}</Text>
                </View>
              )}
            </View>

            {/* Alerts */}
            {node.alerts.length > 0 && (
              <View style={{ marginBottom: 14, gap: 6 }}>
                {node.alerts.map((alert, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ef444415', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ef444430' }}>
                    <MaterialIcons name="warning" size={13} color="#ef4444" />
                    <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#ef4444' }}>{alert}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Diagnosis */}
            <View style={{ backgroundColor: node.aiDiagnosis.color + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: node.aiDiagnosis.color + '35' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <MaterialIcons name="auto-awesome" size={14} color={node.aiDiagnosis.color} />
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: node.aiDiagnosis.color }}>AI Diagnosis: {node.aiDiagnosis.verdict}</Text>
              </View>
              <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: theme.textSub, lineHeight: 18 }}>{node.aiDiagnosis.message}</Text>
            </View>

            {/* Device info row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <View>
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>Firmware</Text>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: theme.textSub }}>{node.firmware}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>Signal %</Text>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: signalColor }}>{node.signal}%</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>Uptime</Text>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: theme.tintGreen }}>{node.uptime}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

// ── Main screen ───────────────────────────────────────────────
export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);

  const [activeField, setActiveField] = useState<string | null>(null);

  const totalNodes = FIELD_GROUPS.flatMap((g: any) => g.nodes).length;
  const onlineNodes = FIELD_GROUPS.flatMap((g: any) => g.nodes).filter((n: any) => n.status === 'Online').length;
  const criticalNodes = FIELD_GROUPS.flatMap((g: any) => g.nodes).filter((n: any) => n.alerts.length > 0).length;

  const visibleGroups = activeField
    ? FIELD_GROUPS.filter(g => g.fieldKey === activeField)
    : FIELD_GROUPS;

  return (
    <LinearGradient
      colors={[theme.bgGradientStart, theme.bgGradientEnd]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => router.push('/menu')} activeOpacity={0.8}>
            <View style={[styles.avatarBoxTop, { backgroundColor: theme.soilBrown }]}>
              <Text style={styles.avatarInitial}>T</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>Hardware Status</Text>
            <Text style={styles.headerTitle}>Device Center</Text>
          </View>
        </View>
        <View style={{ backgroundColor: onlineNodes === totalNodes ? '#4ade8020' : '#f59e0b20', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: onlineNodes === totalNodes ? '#4ade8050' : '#f59e0b50' }}>
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: onlineNodes === totalNodes ? '#4ade80' : '#f59e0b' }}>{onlineNodes}/{totalNodes} Online</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Network status summary */}
        <View style={[styles.glassCard, { marginBottom: 20 }]}>
          <BlurView intensity={theme.isDark ? 30 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={{ padding: 16, flexDirection: 'row', gap: 0 }}>
            {[
              { label: 'Total Nodes', value: totalNodes, color: theme.textMain, icon: 'devices' },
              { label: 'Online', value: onlineNodes, color: '#4ade80', icon: 'check-circle' },
              { label: 'Offline', value: totalNodes - onlineNodes, color: '#ef4444', icon: 'cancel' },
              { label: 'Alerts', value: criticalNodes, color: '#f59e0b', icon: 'warning' },
            ].map((s, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: theme.glassBorder }}>
                <MaterialIcons name={s.icon as any} size={16} color={s.color} />
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: s.color, marginTop: 4 }}>{s.value}</Text>
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 10, color: theme.textDim, textAlign: 'center' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Field filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
            <Pressable
              onPress={() => setActiveField(null)}
              style={({ pressed }) => ({
                paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
                backgroundColor: !activeField ? theme.soilBrown + '25' : theme.glassBackground,
                borderWidth: 1.5, borderColor: !activeField ? theme.soilBrown + '60' : theme.glassBorder,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: !activeField ? theme.soilBrown : theme.textSub }}>All Fields</Text>
            </Pressable>
            {FIELD_GROUPS.map(g => (
              <Pressable
                key={g.fieldKey}
                onPress={() => setActiveField(activeField === g.fieldKey ? null : g.fieldKey)}
                style={({ pressed }) => ({
                  paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
                  backgroundColor: activeField === g.fieldKey ? g.color + '25' : theme.glassBackground,
                  borderWidth: 1.5, borderColor: activeField === g.fieldKey ? g.color + '60' : theme.glassBorder,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: activeField === g.fieldKey ? g.color : theme.textSub }}>{g.fieldKey}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Grouped node cards */}
        {visibleGroups.map(group => (
          <View key={group.fieldKey} style={{ marginBottom: 8 }}>
            {/* Field group header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: group.color }} />
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: theme.textMain }}>{group.field}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: theme.glassBorder, marginLeft: 4 }} />
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>{group.nodes.length} nodes</Text>
            </View>
            {([...group.nodes] as NodeType[]).map(node => (
              <NodeCard key={node.id} node={node} fieldColor={group.color} />
            ))}
          </View>
        ))}

        {/* Add node CTA */}
        <Pressable
          style={({ pressed }) => ({
            borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed',
            borderColor: theme.glassBorderStrong,
            padding: 18, alignItems: 'center', gap: 6,
            opacity: pressed ? 0.7 : 1, marginTop: 8, marginBottom: 16,
          })}
        >
          <MaterialIcons name="add-circle-outline" size={24} color={theme.textDim} />
          <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: theme.textDim }}>Register New Node</Text>
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: theme.textDim }}>Add a sensor, valve, or gateway</Text>
        </Pressable>

      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: theme.glassBorder,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
  },
  avatarBoxTop: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.glassBorderStrong,
  },
  avatarInitial: { fontSize: 20, fontFamily: 'Outfit_700Bold', color: '#FFF' },
  headerSubtitle: { color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 13 },
  headerTitle: { fontSize: 24, fontFamily: 'Outfit_700Bold', color: theme.textMain, marginTop: 2 },
  scrollContent: { padding: 24, paddingBottom: 120, maxWidth: 700, alignSelf: 'center', width: '100%' },
  glassCard: {
    borderRadius: 20, overflow: 'hidden', borderWidth: 1,
    borderColor: theme.glassBorder, backgroundColor: theme.glassBackground,
  },
});
