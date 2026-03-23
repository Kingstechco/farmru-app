import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity,
  Dimensions, Animated, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';

// ── Types ────────────────────────────────────────────────────
type Period = '1H' | '1D' | '7D' | '1M' | '6M' | '1Y';

interface BarDatum { label: string; val: number; unit?: string; }
interface TooltipState { visible: boolean; x: number; y: number; label: string; value: string; }

// ── Tooltip bubble ───────────────────────────────────────────
const Tooltip = ({ state, color }: { state: TooltipState; color: string }) => {
  if (!state.visible) return null;
  return (
    <View
      pointerEvents="none"
      style={[tooltipStyles.bubble, {
        left: Math.max(0, state.x - 36),
        top: Math.max(0, state.y - 52),
        borderColor: color + '60',
        backgroundColor: '#0d1f2d',
      }]}
    >
      <Text style={[tooltipStyles.label, { color }]}>{state.label}</Text>
      <Text style={tooltipStyles.value}>{state.value}</Text>
      <View style={[tooltipStyles.caret, { borderTopColor: color + '60' }]} />
    </View>
  );
};

const tooltipStyles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    zIndex: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 72,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 10, letterSpacing: 0.5 },
  value: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff', marginTop: 1 },
  caret: {
    position: 'absolute',
    bottom: -6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
});

// ── Interactive Bar Chart ─────────────────────────────────────
interface BarChartProps {
  data: BarDatum[];
  maxVal: number;
  height?: number;
  color: string;
  gradientId: string;
  formatVal?: (val: number) => string;
}

const InteractiveBarChart = ({
  data, maxVal, height = 160, color, gradientId, formatVal
}: BarChartProps) => {
  const theme = useThemeColors();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth, 700) - 88;
  const barWidth = Math.max(16, (chartWidth / data.length) * 0.52);
  const gap = (chartWidth - barWidth * data.length) / (data.length - 1);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, label: '', value: '' });
  const scaleAnims = useRef(data.map(() => new Animated.Value(1))).current;

  const handlePressIn = (d: BarDatum, i: number) => {
    const x = i * (barWidth + gap) + barWidth / 2;
    const barH = (d.val / maxVal) * height;
    const y = height - barH;
    Animated.spring(scaleAnims[i], { toValue: 1.08, useNativeDriver: true, speed: 30 }).start();
    setTooltip({
      visible: true, x, y,
      label: d.label,
      value: formatVal ? formatVal(d.val) : String(d.val),
    });
  };

  const handlePressOut = (i: number) => {
    Animated.spring(scaleAnims[i], { toValue: 1, useNativeDriver: true, speed: 30 }).start();
    setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 600);
  };

  const gridLines = 4;
  return (
    <View style={{ position: 'relative' }}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </SvgLinearGradient>
        </Defs>
        {/* Grid lines */}
        {Array.from({ length: gridLines }).map((_, g) => {
          const y = (height / (gridLines - 1)) * g;
          return <Line key={g} x1={0} y1={y} x2={chartWidth} y2={y} stroke={theme.glassBorder} strokeWidth={1} />;
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(4, (d.val / maxVal) * height);
          const x = i * (barWidth + gap);
          const y = height - barH;
          return (
            <Rect
              key={i}
              x={x} y={y}
              width={barWidth} height={barH}
              fill={`url(#${gradientId})`}
              rx={6}
            />
          );
        })}
      </Svg>

      {/* Pressable hit targets overlaid */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', alignItems: 'flex-end' }]}
        pointerEvents="box-none"
      >
        {data.map((d, i) => (
          <Pressable
            key={i}
            style={{ width: barWidth, height, marginRight: i < data.length - 1 ? gap : 0 }}
            onPressIn={() => handlePressIn(d, i)}
            onPressOut={() => handlePressOut(i)}
            onHoverIn={Platform.OS === 'web' ? () => handlePressIn(d, i) : undefined}
            onHoverOut={Platform.OS === 'web' ? () => handlePressOut(i) : undefined}
          />
        ))}
      </View>

      <Tooltip state={tooltip} color={color} />

      {/* X axis */}
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {data.map((d, i) => (
          <View key={i} style={{ width: barWidth, marginRight: i < data.length - 1 ? gap : 0, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textSub }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Per-period data ───────────────────────────────────────────
const YIELD_DATA: Record<Period, BarDatum[]> = {
  '1H': [
    { label: '06:00', val: 0.05 }, { label: '07:00', val: 0.12 }, { label: '08:00', val: 0.18 },
    { label: '09:00', val: 0.22 }, { label: '10:00', val: 0.28 }, { label: '11:00', val: 0.31 },
    { label: '12:00', val: 0.25 }, { label: '13:00', val: 0.20 }, { label: '14:00', val: 0.27 },
    { label: '15:00', val: 0.33 }, { label: '16:00', val: 0.29 }, { label: '17:00', val: 0.15 },
  ],
  '1D': [
    { label: '00h', val: 0.0 }, { label: '03h', val: 0.0 }, { label: '06h', val: 0.08 },
    { label: '09h', val: 0.28 }, { label: '12h', val: 0.25 }, { label: '15h', val: 0.33 },
    { label: '18h', val: 0.20 }, { label: '21h', val: 0.05 },
  ],
  '7D': [
    { label: 'Mon', val: 0.4 }, { label: 'Tue', val: 0.6 }, { label: 'Wed', val: 0.8 },
    { label: 'Thu', val: 0.5 }, { label: 'Fri', val: 1.0 }, { label: 'Sat', val: 0.9 }, { label: 'Sun', val: 1.1 }
  ],
  '1M': [
    { label: 'W1', val: 1.2 }, { label: 'W2', val: 2.0 }, { label: 'W3', val: 1.8 }, { label: 'W4', val: 2.4 }
  ],
  '6M': [
    { label: 'Oct', val: 0.8 }, { label: 'Nov', val: 1.2 }, { label: 'Dec', val: 2.1 },
    { label: 'Jan', val: 3.5 }, { label: 'Feb', val: 4.2 }, { label: 'Mar', val: 3.8 }
  ],
  '1Y': [
    { label: 'Q1', val: 5.5 }, { label: 'Q2', val: 8.2 }, { label: 'Q3', val: 7.1 }, { label: 'Q4', val: 9.4 }
  ],
};

const WATER_DATA: Record<Period, BarDatum[]> = {
  '1H': [
    { label: '06:00', val: 0 }, { label: '07:00', val: 8 }, { label: '08:00', val: 14 },
    { label: '09:00', val: 18 }, { label: '10:00', val: 12 }, { label: '11:00', val: 0 },
    { label: '12:00', val: 0 }, { label: '13:00', val: 5 }, { label: '14:00', val: 9 },
    { label: '15:00', val: 20 }, { label: '16:00', val: 15 }, { label: '17:00', val: 4 },
  ],
  '1D': [
    { label: '00h', val: 0 }, { label: '03h', val: 0 }, { label: '06h', val: 12 },
    { label: '09h', val: 28 }, { label: '12h', val: 0 }, { label: '15h', val: 35 },
    { label: '18h', val: 18 }, { label: '21h', val: 0 },
  ],
  '7D': [
    { label: 'Mon', val: 45 }, { label: 'Tue', val: 20 }, { label: 'Wed', val: 56 },
    { label: 'Thu', val: 0 }, { label: 'Fri', val: 65 }, { label: 'Sat', val: 30 }, { label: 'Sun', val: 12 }
  ],
  '1M': [
    { label: 'W1', val: 228 }, { label: 'W2', val: 180 }, { label: 'W3', val: 310 }, { label: 'W4', val: 260 }
  ],
  '6M': [
    { label: 'Oct', val: 620 }, { label: 'Nov', val: 740 }, { label: 'Dec', val: 900 },
    { label: 'Jan', val: 1100 }, { label: 'Feb', val: 850 }, { label: 'Mar', val: 700 }
  ],
  '1Y': [
    { label: 'Q1', val: 3200 }, { label: 'Q2', val: 4100 }, { label: 'Q3', val: 2900 }, { label: 'Q4', val: 3700 }
  ],
};

// ── Animated progress bar for NPK ────────────────────────────
const NPKBar = ({ label, value, unit, pct, color, warning }: {
  label: string; value: string; unit: string; pct: number; color: string; warning?: string
}) => {
  const theme = useThemeColors();
  const anim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  React.useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [pct]);

  const animWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      onPress={() => setHovered(h => !h)}
      style={[{ borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1 },
        hovered || warning
          ? { backgroundColor: color + '10', borderColor: color + '30' }
          : { backgroundColor: 'transparent', borderColor: 'transparent' }
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: theme.textMain, fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color, fontFamily: 'Outfit_700Bold', fontSize: 16 }}>{value}</Text>
          <Text style={{ color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>{unit}</Text>
          {hovered && (
            <View style={{ backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color, fontFamily: 'Outfit_700Bold', fontSize: 11 }}>{Math.round(pct * 100)}%</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ height: 10, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 5, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', width: animWidth, backgroundColor: color, borderRadius: 5 }} />
      </View>
      {warning && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <MaterialIcons name="warning" size={12} color={color} />
          <Text style={{ color, fontFamily: 'Outfit_500Medium', fontSize: 11 }}>{warning}</Text>
        </View>
      )}
    </Pressable>
  );
};

// ── Period Switcher Tabs ─────────────────────────────────────
const PeriodSwitcher = ({ value, onChange }: { value: Period; onChange: (p: Period) => void }) => {
  const theme = useThemeColors();
  const periods: Period[] = ['1H', '1D', '7D', '1M', '6M', '1Y'];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {periods.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => onChange(p)}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: value === p ? theme.soilBrown : theme.glassBackground,
              borderWidth: 1, borderColor: value === p ? theme.soilBrown : theme.glassBorder,
            }}
          >
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: value === p ? '#FFF' : theme.textSub }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// ── Insight Chip ─────────────────────────────────────────────
const InsightChip = ({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string
}) => {
  const theme = useThemeColors();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{
        flex: 1, borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, padding: 16, alignItems: 'flex-start', gap: 10,
        backgroundColor: pressed ? color + '15' : theme.glassBackground,
        borderColor: pressed ? color + '50' : theme.glassBorder,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      }]}
    >
      <BlurView intensity={theme.isDark ? 20 : 50} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={{ color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 11 }}>{label}</Text>
      <Text style={{ color, fontFamily: 'Outfit_700Bold', fontSize: 18, lineHeight: 22 }}>{value}</Text>
    </Pressable>
  );
};

// ── Main Screen ──────────────────────────────────────────────
export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);

  const [yieldPeriod, setYieldPeriod] = useState<Period>('1D');
  const [waterPeriod, setWaterPeriod] = useState<Period>('1D');

  const yieldData = YIELD_DATA[yieldPeriod];
  const waterData = WATER_DATA[waterPeriod];

  const yieldMax = Math.max(...yieldData.map(d => d.val)) * 1.2;
  const waterMax = Math.max(...waterData.map(d => d.val)) * 1.2;

  const waterTotal = waterData.reduce((s, d) => s + d.val, 0);

  const healthScore = 92;
  const gaugeRadius = 45;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeStrokeDashoffset = gaugeCircumference - (healthScore / 100) * gaugeCircumference;

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
            <Text style={styles.headerSubtitle}>Farm Intelligence</Text>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.soilBrown + '20', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="auto-awesome" size={14} color={theme.soilBrown} />
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: theme.soilBrown }}>AI Insights</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero: Farm Vitality Score */}
        <View style={styles.heroCard}>
          <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.heroContent}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.heroTitle}>Farm Vitality Score</Text>
              <Text style={styles.heroSubtitle}>Your ecosystem is thriving compared to last month. Optimal growing conditions maintained.</Text>
              <View style={styles.badgePositive}>
                <MaterialIcons name="trending-up" size={14} color={theme.tintGreen} />
                <Text style={styles.badgeTextPositive}>Top 5% in your region</Text>
              </View>
            </View>
            <View style={styles.gaugeContainer}>
              <Svg width={110} height={110} viewBox="0 0 110 110">
                <Circle cx="55" cy="55" r={gaugeRadius} stroke={theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" fill="none" />
                <Circle
                  cx="55" cy="55" r={gaugeRadius}
                  stroke={theme.tintGreen}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeStrokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                />
              </Svg>
              <View style={styles.gaugeTextContainer}>
                <Text style={styles.gaugeScoreText}>{healthScore}</Text>
                <Text style={styles.gaugeSubText}>/100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Insight Row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
          <InsightChip icon="eco" label="Avg Daily Yield" value="1.2t/ha" color={theme.tintGreen} />
          <InsightChip icon="water-drop" label="Water Saved" value="40L" color="#38bdf8" />
          <InsightChip icon="thermostat" label="Soil Temp" value="22°C" color={theme.soilBrown} />
        </View>

        {/* Yield Trajectory */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionHeading}>Yield Trajectory (t/ha)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.tintGreen }} />
            <Text style={{ color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 11 }}>Tons/Ha</Text>
          </View>
        </View>
        <Text style={styles.sectionDesc}>Tap or hover any bar to see exact yield values per period.</Text>

        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <PeriodSwitcher value={yieldPeriod} onChange={setYieldPeriod} />
            <InteractiveBarChart
              data={yieldData}
              maxVal={yieldMax}
              height={160}
              color={theme.tintGreen}
              gradientId="yieldGrad"
              formatVal={v => `${v.toFixed(1)} t/ha`}
            />
          </View>
        </View>

        {/* NPK Profile */}
        <Text style={[styles.sectionHeading, { marginTop: 8 }]}>NPK Nutrient Profile</Text>
        <Text style={styles.sectionDesc}>Tap or hover a nutrient row to see percentage of optimal range.</Text>
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <NPKBar label="Nitrogen (N)" value="62" unit="mg/kg" pct={0.60} color="#38bdf8" />
            <NPKBar label="Phosphorus (P)" value="18" unit="mg/kg" pct={0.30} color="#f59e0b" warning="Critical — needs replenishment" />
            <NPKBar label="Potassium (K)" value="140" unit="mg/kg" pct={0.85} color={theme.tintGreen} />
            {/* Optimal reference line */}
            <View style={{ marginTop: 8, padding: 12, backgroundColor: theme.glassBackground, borderRadius: 12, borderWidth: 1, borderColor: theme.glassBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialIcons name="info-outline" size={14} color={theme.textSub} />
              <Text style={{ color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 12, flex: 1, lineHeight: 16 }}>
                Optimal ranges: N 80–120 • P 40–80 • K 120–200 mg/kg
              </Text>
            </View>
          </View>
        </View>

        {/* Irrigation */}
        <Text style={[styles.sectionHeading, { marginTop: 8 }]}>Irrigation Utilization</Text>
        <Text style={styles.sectionDesc}>Tap or hover bars to see exact usage per day. AI optimizations highlighted.</Text>
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{ color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 4 }}>
                  {waterPeriod === '7D' ? 'This Week' : waterPeriod === '1M' ? 'This Month' : waterPeriod === '6M' ? '6 Month Total' : 'Annual Total'}
                </Text>
                <Text style={{ color: theme.textMain, fontFamily: 'Outfit_700Bold', fontSize: 28, lineHeight: 32 }}>
                  {waterTotal.toLocaleString()}<Text style={{ fontSize: 16, color: theme.textSub }}>L</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 }}>
                  <MaterialIcons name="auto-awesome" size={14} color="#38bdf8" />
                  <Text style={{ color: '#38bdf8', fontFamily: 'Outfit_700Bold', fontSize: 12 }}>AI Saved 40L</Text>
                </View>
              </View>
            </View>
            <PeriodSwitcher value={waterPeriod} onChange={setWaterPeriod} />
            <InteractiveBarChart
              data={waterData}
              maxVal={waterMax}
              height={130}
              color="#38bdf8"
              gradientId="waterGrad"
              formatVal={v => `${v}L`}
            />
          </View>
        </View>

        {/* AI Predictive Summary */}
        <View style={[styles.glassCard, { marginTop: 8 }]}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.soilBrown + '20', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="auto-awesome" size={18} color={theme.soilBrown} />
              </View>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: theme.textMain }}>AI Predictive Summary</Text>
            </View>
            {[
              { icon: 'trending-up', text: 'Yield forecast +12% vs last quarter if phosphorus is replenished within 7 days.', color: theme.tintGreen },
              { icon: 'water-drop', text: 'Rain on Thursday will offset 38L of irrigation — AI will auto-suspend sprinklers.', color: '#38bdf8' },
              { icon: 'warning', text: 'Phosphorus at critically low 30% — schedule fertilizer application before Wednesday rain.', color: '#f59e0b' },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: theme.glassBorder }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name={item.icon as any} size={14} color={item.color} />
                </View>
                <Text style={{ flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 13, color: theme.textSub, lineHeight: 18 }}>{item.text}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
  },
  avatarBoxTop: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.glassBorderStrong,
  },
  avatarInitial: { fontSize: 20, fontFamily: 'Outfit_700Bold', color: '#FFF' },
  headerSubtitle: { color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 13 },
  headerTitle: { fontSize: 24, fontFamily: 'Outfit_700Bold', color: theme.textMain, marginTop: 2 },
  scrollContent: {
    padding: 24, paddingBottom: 120,
    maxWidth: 700, alignSelf: 'center', width: '100%',
  },
  heroCard: {
    borderRadius: 24, overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1, borderColor: theme.glassBorder, marginBottom: 20,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24 },
  heroTitle: { color: theme.textMain, fontFamily: 'Outfit_700Bold', fontSize: 18, marginBottom: 6 },
  heroSubtitle: { color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  badgePositive: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: theme.isDark ? 'rgba(98,168,85,0.15)' : 'rgba(98,168,85,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6,
  },
  badgeTextPositive: { color: theme.tintGreen, fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  gaugeContainer: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  gaugeTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeScoreText: { color: theme.textMain, fontFamily: 'Outfit_700Bold', fontSize: 26, lineHeight: 30 },
  gaugeSubText: { color: theme.textDim, fontFamily: 'Outfit_500Medium', fontSize: 11 },
  sectionHeading: { color: theme.textMain, fontFamily: 'Outfit_700Bold', fontSize: 18, paddingLeft: 4 },
  sectionDesc: { color: theme.textSub, fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 16, paddingLeft: 4, lineHeight: 18, marginTop: 4 },
  glassCard: {
    borderRadius: 24, overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1, borderColor: theme.glassBorder, marginBottom: 20,
  },
  glassContent: { padding: 20 },
});
