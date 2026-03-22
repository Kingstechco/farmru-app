import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth, 700) - 88;
  const chartHeight = 180;

  // Mock Data for Bar Chart
  const yieldData = [
    { label: 'Jan', val: 0.8 },
    { label: 'Feb', val: 1.2 },
    { label: 'Mar', val: 2.1 },
    { label: 'Apr', val: 3.5 },
    { label: 'May', val: 4.2 },
    { label: 'Jun', val: 3.8 },
  ];

  const maxVal = Math.max(...yieldData.map(d => d.val));
  const barWidth = 24;
  const spacing = (chartWidth - (yieldData.length * barWidth)) / (yieldData.length - 1);

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
            <View style={[styles.avatarBoxTop, { backgroundColor: theme.soilBrown }]}>
              <Text style={styles.avatarInitial}>T</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>Historical Data</Text>
            <Text style={styles.headerTitle}>Yield Analytics</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Primary Chart Card */}
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            <View style={styles.cardHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <MaterialIcons name="bar-chart" size={18} color={theme.textMain} />
                <Text style={styles.sectionTitle}>Maize Yield Projection (Tons/Ha)</Text>
              </View>
              <Text style={styles.badgeTextPositive}>+12.4% YoY</Text>
            </View>

            <View style={styles.chartContainer}>
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <SvgLinearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={theme.tintGreen} stopOpacity="1" />
                    <Stop offset="100%" stopColor={theme.tintGreen} stopOpacity="0.4" />
                  </SvgLinearGradient>
                </Defs>
                
                {/* Horizontal Grid lines */}
                {[0, 1, 2, 3, 4].map(line => {
                  const y = chartHeight - (line * (chartHeight / 4));
                  return (
                    <Rect key={line} x="0" y={y - 1} width={chartWidth} height="1" fill={theme.glassBorderStrong} />
                  );
                })}

                {yieldData.map((d, i) => {
                  const barH = (d.val / 5.0) * chartHeight; // Extrapolating to 5 tons max visually
                  const x = i * (barWidth + spacing);
                  const y = chartHeight - barH;
                  return (
                    <Rect 
                      key={i} 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barH} 
                      fill="url(#barGrad)" 
                      rx="4"
                    />
                  );
                })}
              </Svg>
              <View style={styles.chartXAxis}>
                {yieldData.map((d, i) => (
                  <Text key={i} style={styles.xAxisLabel}>{d.label}</Text>
                ))}
              </View>
            </View>

          </View>
        </View>

        {/* Predictive Data Grid */}
        <Text style={styles.gridTitle}>Predictive Insights</Text>
        <View style={styles.metricsGrid}>
          
          <View style={[styles.glassCard, styles.gridItemContainer]}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.gridItemContent}>
              <View style={[styles.iconBox, {backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)'}]}>
                <MaterialIcons name="science" size={20} color={theme.tintGreen} />
              </View>
              <Text style={styles.metricVal}>86%</Text>
              <Text style={styles.metricDesc}>Soil Vitality Index</Text>
            </View>
          </View>

          <View style={[styles.glassCard, styles.gridItemContainer]}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.gridItemContent}>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(56, 189, 248, 0.15)'}]}>
                <MaterialIcons name="water-drop" size={20} color="#38bdf8" />
              </View>
              <Text style={styles.metricVal}>142mm</Text>
              <Text style={styles.metricDesc}>Projected Rainfall</Text>
            </View>
          </View>

          <View style={[styles.glassCard, styles.gridItemContainer]}>
             <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.gridItemContent}>
              <View style={[styles.iconBox, {backgroundColor: theme.isDark ? 'rgba(193, 154, 92, 0.15)' : 'rgba(193, 154, 92, 0.1)'}]}>
                <MaterialIcons name="bug-report" size={20} color={theme.soilBrown} />
              </View>
              <Text style={styles.metricVal}>Low</Text>
              <Text style={styles.metricDesc}>Pest Risk Factor</Text>
            </View>
          </View>

          <View style={[styles.glassCard, styles.gridItemContainer]}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.gridItemContent}>
              <View style={[styles.iconBox, {backgroundColor: theme.isDark ? 'rgba(235, 127, 127, 0.15)' : 'rgba(220, 38, 38, 0.1)'}]}>
                <MaterialIcons name="thermostat" size={20} color={theme.dangerText} />
              </View>
              <Text style={styles.metricVal}>Mild</Text>
              <Text style={styles.metricDesc}>Heat Stress Alert</Text>
            </View>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 110,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
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
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  badgeTextPositive: {
    color: theme.tintGreen,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartContainer: {
    alignItems: 'center',
    height: 220,
    justifyContent: 'flex-end',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  xAxisLabel: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    width: 24,
    textAlign: 'center',
  },
  gridTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    marginBottom: 16,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemContainer: {
    width: '47%',
    marginBottom: 16,
  },
  gridItemContent: {
    padding: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  metricVal: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    marginBottom: 4,
  },
  metricDesc: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  }
});
