import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Polyline } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function FieldsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;

  const screenWidth = Dimensions.get("window").width;
  // Chart width calculation to fit within glass card paddings
  const chartWidth = Math.min(screenWidth, 700) - 88;
  const chartHeight = 160;

  const interval = chartWidth / 6;
  const points = [
    { x: 0, y: 108, val: 41 },
    { x: interval * 1, y: 144, val: 38 },
    { x: interval * 2, y: 120, val: 40 },
    { x: interval * 3, y: 24, val: 48 },
    { x: interval * 4, y: 60, val: 45 },
    { x: interval * 5, y: 84, val: 43 },
    { x: interval * 6, y: 96, val: 42 },
  ];

  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPathString = `${pathString} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <LinearGradient 
      colors={[theme.bgGradientStart, theme.bgGradientEnd]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
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
      >
        <View style={styles.fieldHeader}>
          <View style={[styles.avatarBox, { backgroundColor: SOIL_BROWN }]}>
            <MaterialIcons name="grass" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.fieldName}>Maize Plot</Text>
            <Text style={styles.fieldDetails}>Field 1 • 2.4 Hectares</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Optimal</Text>
          </View>
        </View>

        {/* Node Card - Glassmorphism */}
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          
          <View style={styles.glassContent}>
            
            <View style={styles.cardHeader}>
              <View style={styles.nodeIdentifier}>
                <MaterialIcons name="router" size={16} color={theme.textMain} />
                <Text style={styles.nodeTitle}>Sensor Node CF1B</Text>
              </View>
              <Text style={styles.nodeStatus}>Online</Text>
            </View>

            {/* Custom SVG Moisture Graph replacing buggy dependencies */}
            <View style={styles.chartContainer}>
              <Svg width={chartWidth} height={chartHeight} style={styles.chartStyle}>
                <Defs>
                  <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={TINT_GREEN} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={TINT_GREEN} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>

                {/* Grid Lines */}
                {[0, 40, 80, 120, 160].map(y => (
                  <Polyline key={y} points={`0,${y} ${chartWidth},${y}`} stroke={theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="1" />
                ))}

                <Path d={fillPathString} fill="url(#gradient)" />

                <Path 
                  d={pathString} 
                  fill="none" 
                  stroke={theme.graphStrokeDark} 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {points.map((p, i) => (
                  <Circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r="5" 
                    fill={theme.graphTooltipBg} 
                    stroke={SOIL_BROWN} 
                    strokeWidth="3" 
                  />
                ))}
              </Svg>
              <View style={styles.chartXAxis}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <Text key={i} style={styles.xAxisLabel}>{day}</Text>
                ))}
              </View>
              <Text style={styles.chartLabel}>7-Day Moisture Trend (%)</Text>
            </View>

            <Text style={styles.sectionTitle}>Last Readings</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View style={[styles.metricIconBox, { backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.2)' : 'rgba(98, 168, 85, 0.15)' }]}>
                  <MaterialIcons name="water-drop" size={18} color={TINT_GREEN} />
                </View>
                <View>
                  <Text style={styles.metricValue}>42%</Text>
                  <Text style={styles.metricLabel}>Soil Moisture</Text>
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={[styles.metricIconBox, { backgroundColor: theme.dangerBg }]}>
                  <MaterialIcons name="thermostat" size={18} color={theme.dangerText} />
                </View>
                <View>
                  <Text style={styles.metricValue}>19°C</Text>
                  <Text style={styles.metricLabel}>Soil Temp</Text>
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={[styles.metricIconBox, { backgroundColor: theme.isDark ? 'rgba(193, 154, 92, 0.2)' : 'rgba(193, 154, 92, 0.15)' }]}>
                  <MaterialIcons name="science" size={18} color={SOIL_BROWN} />
                </View>
                <View>
                  <Text style={styles.metricValue}>6.8</Text>
                  <Text style={styles.metricLabel}>pH Level</Text>
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={[styles.metricIconBox, { backgroundColor: theme.cardIconBg }]}>
                  <MaterialIcons name="eco" size={18} color={theme.textMain} />
                </View>
                <View>
                  <Text style={styles.metricValue}>Good</Text>
                  <Text style={styles.metricLabel}>Crop Health</Text>
                </View>
              </View>
            </View>

            {/* NPK Section */}
            <View style={styles.npkContainer}>
              <View style={styles.npkHeaderRow}>
                <MaterialIcons name="opacity" size={14} color={SOIL_BROWN} />
                <Text style={styles.npkTitle}>NPK Fertilizer Levels</Text>
              </View>
              <Text style={{color: theme.tintGreen, fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 16, marginTop: -4}}>Soil nutrients perfectly balanced. No fertilizer required.</Text>
              <View style={styles.npkValuesRow}>
                <View style={[styles.npkPill, {backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)', borderColor: theme.tintGreen}]}>
                  <Text style={styles.npkPillText}><Text style={{color: theme.textDim}}>N </Text>12</Text>
                </View>
                <View style={[styles.npkPill, {backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8'}]}>
                  <Text style={styles.npkPillText}><Text style={{color: theme.textDim}}>P </Text>8</Text>
                </View>
                <View style={[styles.npkPill, {backgroundColor: theme.isDark ? 'rgba(193, 154, 92, 0.15)' : 'rgba(193, 154, 92, 0.1)', borderColor: SOIL_BROWN}]}>
                  <Text style={styles.npkPillText}><Text style={{color: theme.textDim}}>K </Text>14</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
  },
  avatarBoxTop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.glassBorderStrong,
    shadowColor: '#000',
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: '#FFF',
  },
  headerSubtitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
    marginTop: 2,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110, 
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fieldName: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  fieldDetails: {
    fontSize: 13,
    fontFamily: 'Outfit_500Medium',
    color: theme.textSub,
    marginTop: 2,
  },
  statusBadge: {
    marginLeft: 'auto',
    backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(98, 168, 85, 0.3)' : 'rgba(98, 168, 85, 0.5)',
  },
  statusText: {
    color: theme.tintGreen,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 20,
  },
  glassContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  nodeIdentifier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  nodeStatus: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  chartStyle: {
    marginBottom: 12,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  xAxisLabel: {
    color: theme.textDim,
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
  },
  chartLabel: {
    color: theme.textSub,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },
  sectionTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricItem: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
  },
  metricLabel: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  npkContainer: {
    backgroundColor: theme.cardIconBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  npkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  npkTitle: {
    color: theme.soilBrown,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },
  npkValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  npkPill: {
    flex: 1,
    backgroundColor: theme.cardIconBg,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
  },
  npkPillText: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  }
});
