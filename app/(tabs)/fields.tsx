import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity,
  Platform, Dimensions, Animated, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RefreshControl } from 'react-native';
import Svg, {
  Path, Circle, Defs, LinearGradient as SvgLinearGradient,
  Stop, Polyline, G, Text as SvgText, Line
} from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { store } from '@/utils/store';

// ── Extended field data with context for tooltips ─────────────
const FIELD_DATA = {
  'Field 1': {
    name: 'Maize Plot',
    details: '2.4 Hectares • Zone A',
    status: 'Optimal',
    metrics: {
      moisture: {
        value: '42%', raw: 42, unit: '%',
        optimal: '35–55%', trend: '+2% this week',
        icon: 'water-drop', color: '#38bdf8',
        context: 'Moisture is within the ideal range for maize. Roots are actively absorbing water without risk of waterlogging.',
        recommendation: 'No irrigation needed in the next 48h. Monitor after Thursday rain.',
      },
      temp: {
        value: '19°C', raw: 19, unit: '°C',
        optimal: '15–25°C', trend: 'Stable',
        icon: 'thermostat', color: '#f87171',
        context: 'Soil temperature is optimal for maize root development. Germination and nutrient uptake are both maximised.',
        recommendation: 'No action required. Mulch if temperature drops below 15°C.',
      },
      ph: {
        value: '6.8', raw: 6.8, unit: 'pH',
        optimal: '6.0–7.0', trend: 'Stable',
        icon: 'science', color: '#c1a06a',
        context: 'pH is perfectly balanced for nutrient availability. Both macro and micro nutrients are fully soluble at this level.',
        recommendation: 'Maintain current lime application cycle. Re-test in 4 weeks.',
      },
      health: {
        value: 'Good', raw: 80, unit: 'score',
        optimal: 'Excellent = 90+', trend: '↑ improving',
        icon: 'eco', color: '#4ade80',
        context: 'Crop health scored 80/100 by the AI sensor net. Canopy coverage, leaf colour, and stem thickness are all within normal range.',
        recommendation: 'Phosphorus boost within 14 days will lift score into Excellent.',
      },
    },
    npk: { n: { val: 12, max: 20 }, p: { val: 8, max: 20 }, k: { val: 14, max: 20 } },
    npkMsg: 'Soil nutrients perfectly balanced. No fertilizer required.',
    points: [41, 38, 40, 48, 45, 43, 42],
    growth: {
      planted: '2026-02-15', stage: 'Vegetative', progress: 0.35, daysLeft: 85,
      milestones: ['Germination ✓', 'Seedling ✓', 'Vegetative ←', 'Tasseling', 'Grain Fill', 'Maturity'],
    },
    aiAdvisories: [
      { icon: 'check-circle', color: '#4ade80', text: 'Optimal irrigation schedule active — no manual watering required this week.' },
      { icon: 'info', color: '#38bdf8', text: 'Vegetative stage: apply foliar nitrogen spray in next 7 days to boost canopy growth.' },
      { icon: 'warning', color: '#f59e0b', text: 'Phosphorus is borderline (8 mg/kg). Consider 20-10-10 blend before rainfall on Thursday.' },
    ],
  },
  'Field 2': {
    name: 'Tomato Grid',
    details: '1.2 Hectares • Zone B',
    status: 'Warning',
    metrics: {
      moisture: {
        value: '28%', raw: 28, unit: '%',
        optimal: '35–55%', trend: '−4% this week',
        icon: 'water-drop', color: '#38bdf8',
        context: 'Moisture is below optimal at 28%. Tomatoes in flowering stage need consistent moisture to avoid blossom drop.',
        recommendation: 'Irrigate today — target 40% soil moisture. Increase frequency to twice daily.',
      },
      temp: {
        value: '24°C', raw: 24, unit: '°C',
        optimal: '20–28°C', trend: '+3°C today',
        icon: 'thermostat', color: '#f87171',
        context: 'Temperature is approaching the upper threshold. Prolonged heat above 28°C can cause pollen sterility in tomatoes.',
        recommendation: 'Install shade netting if temperature exceeds 28°C over the next 3 days.',
      },
      ph: {
        value: '6.2', raw: 6.2, unit: 'pH',
        optimal: '5.5–6.8', trend: 'Slightly low',
        icon: 'science', color: '#c1a06a',
        context: 'pH at 6.2 is acceptable, though slightly towards the acidic end. Calcium and magnesium uptake may be marginally reduced.',
        recommendation: 'Apply agricultural lime at 0.5t/ha in the next irrigation cycle.',
      },
      health: {
        value: 'Fair', raw: 55, unit: 'score',
        optimal: 'Good = 70+', trend: '↓ declining',
        icon: 'eco', color: '#fbbf24',
        context: 'Health score 55/100. AI detected lower-than-normal chlorophyll index due to water stress and low phosphorus availability.',
        recommendation: 'Restore moisture first, then apply foliar phosphate spray for fast absorption.',
      },
    },
    npk: { n: { val: 8, max: 20 }, p: { val: 4, max: 20 }, k: { val: 18, max: 20 } },
    npkMsg: 'Phosphorus is low. AI recommends a targeted boost.',
    points: [30, 32, 28, 25, 29, 27, 28],
    growth: {
      planted: '2026-03-01', stage: 'Flowering', progress: 0.65, daysLeft: 30,
      milestones: ['Germination ✓', 'Seedling ✓', 'Vegetative ✓', 'Flowering ←', 'Fruit Set', 'Harvest'],
    },
    aiAdvisories: [
      { icon: 'warning', color: '#ef4444', text: 'Soil moisture critical at 28% — blossom drop risk in next 24h without irrigation.' },
      { icon: 'warning', color: '#f59e0b', text: 'Phosphorus deficiency (4 mg/kg). Apply liquid phosphate fertiliser during next watering.' },
      { icon: 'info', color: '#38bdf8', text: 'High potassium at 18 mg/kg is beneficial during flowering stage — no K supplement needed.' },
    ],
  },
  'Field 3': {
    name: 'Potato Patch',
    details: '3.0 Hectares • Zone C',
    status: 'Action',
    metrics: {
      moisture: {
        value: '55%', raw: 55, unit: '%',
        optimal: '40–60%', trend: '+8% this week',
        icon: 'water-drop', color: '#38bdf8',
        context: 'Moisture at 55% is within range but rising. Upcoming 38mm rain event could push into waterlogging territory.',
        recommendation: 'Pause irrigation now. Ensure drainage channels are clear before Thursday rain.',
      },
      temp: {
        value: '17°C', raw: 17, unit: '°C',
        optimal: '15–20°C', trend: 'Stable',
        icon: 'thermostat', color: '#f87171',
        context: 'Excellent soil temperature for potato bulking. Starch accumulation is highest within 15–20°C range.',
        recommendation: 'Ideal conditions — no action needed. Maintain consistent overnight temperature.',
      },
      ph: {
        value: '7.1', raw: 7.1, unit: 'pH',
        optimal: '5.0–6.5', trend: '⚠ High',
        icon: 'science', color: '#c1a06a',
        context: 'pH at 7.1 is above the ideal range for potatoes. This alkaline level reduces availability of iron, manganese, and boron.',
        recommendation: 'Apply elemental sulfur at 0.5 kg/m² to lower pH. Re-test in 3 weeks.',
      },
      health: {
        value: 'Excellent', raw: 92, unit: 'score',
        optimal: 'Excellent = 90+', trend: '↑ strong',
        icon: 'eco', color: '#4ade80',
        context: 'Health score 92/100. Maturation stage is progressing well. AI detects good tuber density from sensor vibration patterns.',
        recommendation: 'Harvest window opens in 10 days. Scout for late blight symptoms before harvest.',
      },
    },
    npk: { n: { val: 15, max: 20 }, p: { val: 12, max: 20 }, k: { val: 10, max: 20 } },
    npkMsg: 'High moisture detected. Monitoring drainage efficiency.',
    points: [50, 52, 55, 54, 56, 55, 55],
    growth: {
      planted: '2026-01-10', stage: 'Maturation', progress: 0.90, daysLeft: 10,
      milestones: ['Germination ✓', 'Sprout ✓', 'Vegetative ✓', 'Bulking ✓', 'Maturation ←', 'Harvest'],
    },
    aiAdvisories: [
      { icon: 'warning', color: '#f59e0b', text: 'pH at 7.1 is too alkaline — schedule sulfur treatment before Thursday rain.' },
      { icon: 'info', color: '#38bdf8', text: 'Harvest window in 10 days. Pre-harvest scouting recommended for late blight.' },
      { icon: 'check-circle', color: '#4ade80', text: 'Tuber development excellent. AI estimates yield of 28t/ha based on current biomass readings.' },
    ],
  },
} as const;

type FieldKey = keyof typeof FIELD_DATA;

// ── Interactive metric card ───────────────────────────────────
const MetricCard = ({ metric, label }: {
  metric: typeof FIELD_DATA['Field 1']['metrics']['moisture'];
  label: string;
}) => {
  const theme = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(anim, { toValue, useNativeDriver: false, tension: 60, friction: 10 }).start();
    setExpanded(e => !e);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const expandHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });
  const isBg = metric.color + '15';
  const borderColor = expanded ? metric.color + '60' : 'transparent';

  return (
    <Pressable
      onPress={toggle}
      onHoverIn={Platform.OS === 'web' ? () => { if (!expanded) toggle(); } : undefined}
      onHoverOut={Platform.OS === 'web' ? () => { if (expanded) toggle(); } : undefined}
      style={{ width: '48%' }}
    >
      <View style={[{
        borderRadius: 18, padding: 14, borderWidth: 1.5,
        backgroundColor: isBg, borderColor,
      }]}>
        {/* Icon + value row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: metric.color + '25', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name={metric.icon as any} size={16} color={metric.color} />
          </View>
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: metric.color }}>{metric.value}</Text>
        </View>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: theme.textSub }}>{label}</Text>

        {/* Trend pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <View style={{ backgroundColor: metric.color + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: metric.color }}>{metric.trend}</Text>
          </View>
          <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 10, color: theme.textDim }}>Tap for detail</Text>
        </View>

        {/* Expanded detail */}
        <Animated.View style={{ height: expandHeight, overflow: 'hidden' }}>
          <View style={{ marginTop: 12, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>Optimal Range</Text>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: metric.color }}>{metric.optimal}</Text>
            </View>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: theme.textSub, lineHeight: 16 }}>{metric.context}</Text>
            <View style={{ backgroundColor: metric.color + '15', borderRadius: 8, padding: 8, marginTop: 4 }}>
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: metric.color }}>💡 {metric.recommendation}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

// ── NPK animated progress row ─────────────────────────────────
const NPKBar = ({ label, item, color }: { label: string; item: { val: number; max: number }; color: string }) => {
  const theme = useThemeColors();
  const anim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);
  const pct = item.val / item.max;

  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [pct]);

  const animWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      onPress={() => setHovered(h => !h)}
      style={{ marginBottom: 14 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: theme.textMain }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color }}>{item.val} mg/kg</Text>
          {hovered && (
            <View style={{ backgroundColor: color + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color }}>{Math.round(pct * 100)}% of max</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ height: 8, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', width: animWidth, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </Pressable>
  );
};

// ── Chart point tooltip ──────────────────────────────────────
interface ChartTooltip { visible: boolean; x: number; y: number; day: string; val: number; }

// ── Main Screen ──────────────────────────────────────────────
export default function FieldsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useThemeColors();
  const styles = getStyles(theme);

  const [selectedField, setSelectedField] = useState<FieldKey>('Field 1');
  const [refreshing, setRefreshing] = useState(false);
  const [healthOverride, setHealthOverride] = useState(store.getHealthOverride());
  const [chartTooltip, setChartTooltip] = useState<ChartTooltip>({ visible: false, x: 0, y: 0, day: '', val: 0 });

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setHealthOverride(store.getHealthOverride()));
    return unsubscribe;
  }, []);

  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;
  const currentData = FIELD_DATA[selectedField];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleFieldSelect = (field: FieldKey) => {
    setSelectedField(field);
    setChartTooltip({ visible: false, x: 0, y: 0, day: '', val: 0 });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth, 700) - 88;
  const chartHeight = 160;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const interval = chartWidth / 6;
  const points = currentData.points.map((p, i) => ({
    x: interval * i, y: chartHeight - (p / 65) * chartHeight, val: p, day: days[i],
  }));

  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPathString = `${pathString} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  const displayStatus = (selectedField === 'Field 1' && healthOverride) ? healthOverride : currentData.status;
  const statusColor = displayStatus === 'Optimal' ? TINT_GREEN : displayStatus === 'Warning' ? '#f59e0b' : '#ef4444';

  const handlePointPress = (p: typeof points[0]) => {
    const mPct = p.val;
    const trend = mPct > 50 ? 'High — reduce irrigation' : mPct < 35 ? 'Low — irrigate soon' : 'Optimal range';
    setChartTooltip({ visible: true, x: p.x, y: p.y, day: p.day, val: p.val });
    setTimeout(() => setChartTooltip(t => ({ ...t, visible: false })), 2500);
  };

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
            <View style={[styles.avatarBoxTop, { backgroundColor: SOIL_BROWN }]}>
              <Text style={styles.avatarInitial}>T</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>Monitor Your Farm</Text>
            <Text style={styles.headerTitle}>All Fields & Nodes</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/filter-modal')}>
          <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="tune" size={20} color={theme.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TINT_GREEN} colors={[TINT_GREEN]} />
        }
      >

        {/* Field Selector Tabs */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {(Object.keys(FIELD_DATA) as FieldKey[]).map(key => {
            const fd = FIELD_DATA[key];
            const isActive = selectedField === key;
            const sColor = fd.status === 'Optimal' ? TINT_GREEN : fd.status === 'Warning' ? '#f59e0b' : '#ef4444';
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleFieldSelect(key)}
                style={{
                  flex: 1, borderRadius: 18, overflow: 'hidden',
                  borderWidth: 1.5,
                  borderColor: isActive ? sColor : theme.glassBorder,
                  backgroundColor: isActive ? sColor + '15' : theme.glassBackground,
                  padding: 12, alignItems: 'center', gap: 4,
                }}
                activeOpacity={0.8}
              >
                <BlurView intensity={theme.isDark ? 20 : 50} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: isActive ? sColor : theme.textSub }}>{fd.name}</Text>
                <View style={{ backgroundColor: sColor + '25', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: sColor }}>{fd.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spatial Map */}
        <Text style={styles.sectionTitle}>Spatial Map Overview</Text>
        <View style={[styles.glassCard, { marginBottom: 24 }]}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={[styles.glassContent, { alignItems: 'center', padding: 24 }]}>
            <Svg width={240} height={180} viewBox="0 0 240 180">
              <G onPress={() => handleFieldSelect('Field 1')}>
                <Path d="M10 10 L110 10 L110 90 L10 90 Z"
                  fill={selectedField === 'Field 1' ? TINT_GREEN : 'rgba(255,255,255,0.05)'}
                  stroke={selectedField === 'Field 1' ? '#FFF' : theme.glassBorderStrong} strokeWidth={2} />
                <SvgText x="35" y="55" fill={selectedField === 'Field 1' ? '#FFF' : theme.textSub} fontSize="13" fontWeight="bold">F1</SvgText>
              </G>
              <G onPress={() => handleFieldSelect('Field 2')}>
                <Path d="M120 10 L230 10 L230 90 L120 90 Z"
                  fill={selectedField === 'Field 2' ? '#f59e0b' : 'rgba(255,255,255,0.05)'}
                  stroke={selectedField === 'Field 2' ? '#FFF' : theme.glassBorderStrong} strokeWidth={2} />
                <SvgText x="165" y="55" fill={selectedField === 'Field 2' ? '#FFF' : theme.textSub} fontSize="13" fontWeight="bold">F2</SvgText>
              </G>
              <G onPress={() => handleFieldSelect('Field 3')}>
                <Path d="M10 100 L230 100 L230 170 L10 170 Z"
                  fill={selectedField === 'Field 3' ? '#ef4444' : 'rgba(255,255,255,0.05)'}
                  stroke={selectedField === 'Field 3' ? '#FFF' : theme.glassBorderStrong} strokeWidth={2} />
                <SvgText x="107" y="140" fill={selectedField === 'Field 3' ? '#FFF' : theme.textSub} fontSize="13" fontWeight="bold">Field 3</SvgText>
              </G>
            </Svg>
            <Text style={styles.mapHint}>Tap a zone to analyse plot telemetry</Text>
          </View>
        </View>

        {/* Field Identity Row */}
        <View style={styles.fieldHeader}>
          <View style={[styles.avatarBox, { backgroundColor: statusColor + '20', borderWidth: 2, borderColor: statusColor + '60' }]}>
            <MaterialIcons name="grass" size={22} color={statusColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldName}>{currentData.name}</Text>
            <Text style={styles.fieldDetails}>{currentData.details}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusColor + '60', backgroundColor: statusColor + '15' }]}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: statusColor, marginRight: 5 }} />
            <Text style={[styles.statusText, { color: statusColor }]}>{displayStatus}</Text>
          </View>
        </View>

        {/* Crop Lifecycle */}
        <View style={[styles.glassCard]}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Crop Lifecycle</Text>
              <Text style={[styles.statusText, { color: TINT_GREEN }]}>{currentData.growth.stage} Stage</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${currentData.growth.progress * 100}%`, backgroundColor: TINT_GREEN }]} />
            </View>
            {/* Milestone row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {currentData.growth.milestones.map((ms, i) => {
                  const isDone = ms.includes('✓');
                  const isCurrent = ms.includes('←');
                  return (
                    <View key={i} style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                      backgroundColor: isDone ? TINT_GREEN + '20' : isCurrent ? SOIL_BROWN + '25' : theme.glassBackground,
                      borderWidth: 1, borderColor: isDone ? TINT_GREEN + '40' : isCurrent ? SOIL_BROWN + '60' : theme.glassBorder,
                    }}>
                      <Text style={{ fontFamily: isCurrent ? 'Outfit_700Bold' : 'Outfit_500Medium', fontSize: 11, color: isDone ? TINT_GREEN : isCurrent ? SOIL_BROWN : theme.textDim }}>
                        {ms.replace(' ✓', '').replace(' ←', '')}
                        {isDone ? ' ✓' : isCurrent ? ' ◀' : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={styles.growthDetail}>Planted: {currentData.growth.planted}</Text>
              <Text style={[styles.growthDetail, { color: currentData.growth.daysLeft <= 14 ? '#f59e0b' : theme.textSub }]}>
                {currentData.growth.daysLeft <= 14 ? '⚡ ' : ''}{currentData.growth.daysLeft} days to harvest
              </Text>
            </View>
          </View>
        </View>

        {/* Sensor Node + Chart */}
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={styles.cardHeader}>
              <View style={styles.nodeIdentifier}>
                <MaterialIcons name="router" size={16} color={TINT_GREEN} />
                <Text style={styles.nodeTitle}>Sensor Node CF1B</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: TINT_GREEN }} />
                <Text style={styles.nodeStatus}>Online · updated now</Text>
              </View>
            </View>

            {/* Moisture line chart with interactive dots */}
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: theme.textSub, marginBottom: 10 }}>
              7-Day Moisture Trend (%) — tap any point
            </Text>
            <View style={[styles.chartContainer, { position: 'relative' }]}>
              <Svg width={chartWidth} height={chartHeight} style={styles.chartStyle}>
                <Defs>
                  <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={TINT_GREEN} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={TINT_GREEN} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                {[0, 40, 80, 120, 160].map(y => (
                  <Line key={y} x1={0} y1={y} x2={chartWidth} y2={y} stroke={theme.glassBorder} strokeWidth={1} />
                ))}
                <Path d={fillPathString} fill="url(#gradient)" />
                <Path d={pathString} fill="none" stroke={TINT_GREEN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <Circle
                    key={i} cx={p.x} cy={p.y} r={chartTooltip.visible && chartTooltip.day === p.day ? 8 : 5}
                    fill={theme.isDark ? '#1a2b3c' : '#fff'} stroke={SOIL_BROWN} strokeWidth={3}
                  />
                ))}
              </Svg>

              {/* Pressable day hit-targets */}
              <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', paddingHorizontal: 0 }]} pointerEvents="box-none">
                {points.map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handlePointPress(p)}
                    style={{ position: 'absolute', left: p.x - 18, top: p.y - 18, width: 36, height: 36 }}
                  />
                ))}
              </View>

              {/* Tooltip */}
              {chartTooltip.visible && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: Math.max(0, Math.min(chartWidth - 90, chartTooltip.x - 40)),
                    top: Math.max(0, chartTooltip.y - 56),
                    backgroundColor: '#0d1f2d',
                    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
                    borderWidth: 1, borderColor: TINT_GREEN + '60',
                    zIndex: 99,
                  }}
                >
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: TINT_GREEN }}>{chartTooltip.day}</Text>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' }}>{chartTooltip.val}%</Text>
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 10, color: TINT_GREEN + 'CC' }}>
                    {chartTooltip.val > 50 ? 'High — watch drainage' : chartTooltip.val < 35 ? 'Low — irrigate' : 'Optimal ✓'}
                  </Text>
                </View>
              )}

              <View style={styles.chartXAxis}>
                {days.map((d, i) => <Text key={i} style={styles.xAxisLabel}>{d}</Text>)}
              </View>
            </View>

            {/* Metric cards grid — tap/hover for full context */}
            <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Live Sensor Readings</Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: theme.textDim, marginBottom: 16, marginTop: -8 }}>
              Tap or hover any card to see full context, optimal range and AI recommendation.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <MetricCard metric={currentData.metrics.moisture} label="Soil Moisture" />
              <MetricCard metric={currentData.metrics.temp} label="Soil Temperature" />
              <MetricCard metric={currentData.metrics.ph} label="pH Level" />
              <MetricCard metric={currentData.metrics.health} label="Crop Health" />
            </View>

            {/* NPK section with animated bars */}
            <View style={[styles.npkContainer, { borderColor: theme.glassBorder }]}>
              <View style={styles.npkHeaderRow}>
                <MaterialIcons name="opacity" size={14} color={SOIL_BROWN} />
                <Text style={styles.npkTitle}>NPK Fertilizer Profile</Text>
                <Text style={{ marginLeft: 'auto', fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>tap bars for %</Text>
              </View>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: currentData.status === 'Warning' ? '#f59e0b' : theme.tintGreen, marginBottom: 14 }}>
                {currentData.npkMsg}
              </Text>
              <NPKBar label="Nitrogen (N)" item={currentData.npk.n} color="#4ade80" />
              <NPKBar label="Phosphorus (P)" item={currentData.npk.p} color="#38bdf8" />
              <NPKBar label="Potassium (K)" item={currentData.npk.k} color={SOIL_BROWN} />
              <View style={{ marginTop: 4, padding: 10, backgroundColor: theme.glassBackground, borderRadius: 10, borderWidth: 1, borderColor: theme.glassBorder, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="info-outline" size={13} color={theme.textDim} />
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim, flex: 1, lineHeight: 16 }}>
                  Optimal: N 15–20 • P 10–15 • K 12–18 mg/kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Field Advisories */}
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: SOIL_BROWN + '20', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="auto-awesome" size={16} color={SOIL_BROWN} />
              </View>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: theme.textMain }}>AI Field Advisories</Text>
            </View>
            {currentData.aiAdvisories.map((adv, i) => (
              <View key={i} style={{
                flexDirection: 'row', gap: 12, paddingVertical: 12,
                borderBottomWidth: i < currentData.aiAdvisories.length - 1 ? 1 : 0,
                borderBottomColor: theme.glassBorder,
              }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: adv.color + '20', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <MaterialIcons name={adv.icon as any} size={13} color={adv.color} />
                </View>
                <Text style={{ flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 13, color: theme.textSub, lineHeight: 19 }}>{adv.text}</Text>
              </View>
            ))}
          </View>
        </View>

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
  filterButton: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorderStrong,
  },
  scrollContent: { padding: 24, paddingBottom: 120, maxWidth: 700, alignSelf: 'center', width: '100%' },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  fieldName: { fontSize: 17, fontFamily: 'Outfit_700Bold', color: theme.textMain },
  fieldDetails: { fontSize: 13, fontFamily: 'Outfit_500Medium', color: theme.textSub, marginTop: 2 },
  statusBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: theme.tintGreen },
  mapHint: { color: theme.textDim, fontFamily: 'Outfit_500Medium', fontSize: 12, marginTop: 14 },
  glassCard: {
    borderRadius: 24, overflow: 'hidden', backgroundColor: theme.glassBackground,
    borderWidth: 1, borderColor: theme.glassBorder, marginBottom: 20,
  },
  glassContent: { padding: 20 },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder },
  progressFill: { height: '100%', borderRadius: 4 },
  growthDetail: { fontSize: 12, fontFamily: 'Outfit_500Medium', color: theme.textSub },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  nodeIdentifier: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodeTitle: { color: theme.textMain, fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  nodeStatus: { color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 12 },
  chartContainer: { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: theme.glassBorder },
  chartStyle: { marginBottom: 10 },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 2, marginTop: 8 },
  xAxisLabel: { color: theme.textDim, fontFamily: 'Outfit_500Medium', fontSize: 11 },
  sectionTitle: { color: theme.textMain, fontFamily: 'Outfit_700Bold', fontSize: 16, marginBottom: 0 },
  npkContainer: { borderRadius: 16, padding: 16, borderWidth: 1, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)' },
  npkHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  npkTitle: { color: theme.soilBrown, fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
});
