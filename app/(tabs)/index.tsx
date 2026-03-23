import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Platform, Modal, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { store, Activity, SoilData } from '@/utils/store';
import { WeatherAdvisoryCard } from '@/components/WeatherAdvisoryCard';
// Transitions handled at tab navigator level via animation:'fade'
import { 
  WEATHER_FORECAST, 
  weatherAdvisories, 
  ADVISORY_COLORS, 
  rainLabel, 
  conditionLabel 
} from '@/utils/weatherEngine';

// Custom Glass Component for inner elements
const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  const theme = useThemeColors();
  const styles = getStyles(theme);
  return (
    <View style={[styles.glassCard, style]}>
      <BlurView intensity={theme.isDark ? 20 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      <View style={styles.glassContent}>
        {children}
      </View>
    </View>
  );
};

// ── Interactive KPI card ────────────────────────────────────
interface KPICardProps {
  icon: string; iconColor: string; iconBg: string;
  value: string; label: string; subText?: string;
  detail: string; recommendation: string; optimalRange: string;
}
const InteractiveKPICard = (p: KPICardProps) => {
  const theme = useThemeColors();
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    Animated.spring(anim, { toValue: open ? 0 : 1, useNativeDriver: false, tension: 60, friction: 10 }).start();
    setOpen(o => !o);
  };
  const expandH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
      onPress={toggle}
      onHoverIn={Platform.OS === 'web' ? () => { if (!open) toggle(); } : undefined}
      onHoverOut={Platform.OS === 'web' ? () => { if (open) toggle(); } : undefined}
    >
      <Animated.View style={[{
        borderRadius: 20, overflow: 'hidden', borderWidth: 1.5,
        borderColor: open ? p.iconColor + '50' : theme.glassBorder,
        backgroundColor: open ? p.iconColor + '08' : theme.glassBackground,
        transform: [{ scale }], marginBottom: 12,
      }]}>
        <BlurView intensity={theme.isDark ? 20 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: p.iconBg }]}>
            <MaterialIcons name={p.icon as any} size={22} color={p.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 22, color: p.iconColor }}>{p.value}</Text>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: theme.textSub }}>{p.label}</Text>
            {p.subText && <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: p.iconColor, marginTop: 2 }}>{p.subText}</Text>}
          </View>
          <View style={{ backgroundColor: p.iconColor + '15', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={18} color={p.iconColor} />
          </View>
        </View>
        <Animated.View style={{ height: expandH, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim }}>Optimal Range</Text>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: p.iconColor }}>{p.optimalRange}</Text>
            </View>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: theme.textSub, lineHeight: 17 }}>{p.detail}</Text>
            <View style={{ backgroundColor: p.iconColor + '12', borderRadius: 8, padding: 8, marginTop: 2 }}>
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: p.iconColor }}>💡 {p.recommendation}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(store.getActivities());
  const [moistureBoost, setMoistureBoost] = useState(store.getMoistureBoost());
  const [soilData, setSoilData] = useState<SoilData>(store.getSoilData());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
       setActivities([...store.getActivities()]);
       setMoistureBoost(store.getMoistureBoost());
       setSoilData({ ...store.getSoilData() });
    });
    return unsubscribe;
  }, []);

  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;

  return (
    <LinearGradient 
      colors={[theme.bgGradientStart, theme.bgGradientEnd]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        
        {/* Floating Glass Header */}
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => router.push('/menu')} activeOpacity={0.8}>
              <View style={[styles.avatarBoxTop, { backgroundColor: SOIL_BROWN }]}>
                <Text style={styles.avatarInitial}>T</Text>
              </View>
            </TouchableOpacity>
            <View>
              <Text style={styles.greetingHeader}>Good Morning,</Text>
              <Text style={styles.farmerName}>Tsedzu <Text style={{fontSize: 22}}>🌿</Text></Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Notifications Button */}
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} 
              activeOpacity={0.7} 
              onPress={() => router.push('/notifications')}
            >
              <MaterialIcons name="notifications-none" size={24} color={theme.textMain} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            {/* Settings Button */}
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} 
              activeOpacity={0.7} 
              onPress={() => router.push('/settings')}
            >
              <MaterialIcons name="settings" size={22} color={theme.textMain} />
            </TouchableOpacity>

            {/* Weather Badge */}
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} 
              activeOpacity={0.7} 
              onPress={() => setIsWeatherOpen(true)}
            >
              <MaterialIcons name="wb-sunny" size={24} color={SOIL_BROWN} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* AI Insight Glass Card */}
          <GlassCard style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconWrapper, { backgroundColor: SOIL_BROWN }]}>
                <MaterialIcons name="auto-awesome" size={20} color="#FFF" />
              </View>
              <Text style={styles.insightTitle}>Farmru AI Insight</Text>
            </View>
            <Text style={styles.insightBody}>
              AI detected multiple critical operations pending for your fields. Open the Action Center to orchestrate and apply recommendations.
            </Text>
            <TouchableOpacity style={[styles.insightButton, { backgroundColor: TINT_GREEN }]} activeOpacity={0.7} onPress={() => router.push('/action-center')}>
              <Text style={styles.insightButtonText}>View Action Plan</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </GlassCard>

          {/* Weather Advisory Card */}
          <WeatherAdvisoryCard onOpenDrawer={() => setIsWeatherOpen(true)} />

          {/* KPI Interactive Grid */}
          <Text style={styles.sectionTitle}>Environment Overview</Text>
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: theme.textDim, marginBottom: 14, marginTop: -10 }}>Tap or hover any card to see full context and AI recommendation.</Text>
          <InteractiveKPICard
            icon="water-drop" iconColor="#38bdf8" iconBg="rgba(56,189,248,0.15)"
            value={`${28 + moistureBoost}%`} label="Soil Moisture"
            subText={moistureBoost > 0 ? 'Projected after irrigation' : '⚠ Too dry. Needs water.'}
            optimalRange="35–55%"
            detail={`Current moisture is ${28 + moistureBoost}%. Maize roots need consistent 35–55% to absorb nitrogen efficiently. Below 30% causes wilting; above 60% risks root rot.`}
            recommendation={moistureBoost > 0 ? 'Irrigation scheduled. Monitor after Thursday rain to avoid overwatering.' : 'Irrigate Field 2 immediately. Target 40% moisture before sundown.'}
          />
          <InteractiveKPICard
            icon="thermostat" iconColor="#f87171" iconBg="rgba(248,113,113,0.15)"
            value="24°C" label="Ambient Temperature"
            subText="Stable · within range"
            optimalRange="20–30°C"
            detail="Ambient temperature is ideal for crop growth. Prolonged exposure above 33°C risks heat stress on tomato flowering and maize pollination."
            recommendation="No action needed. If forecast exceeds 32°C, deploy shade netting on Field 2."
          />
          <InteractiveKPICard
            icon="air" iconColor="#a78bfa" iconBg="rgba(167,139,250,0.15)"
            value="14 km/h" label="Wind Speed"
            subText="Moderate · good for drying"
            optimalRange="< 20 km/h"
            detail="Wind at 14 km/h helps dry leaf surfaces after irrigation, reducing fungal disease risk. Above 25 km/h can cause spray drift and lodging in tall crops."
            recommendation="Good spray conditions today. Avoid herbicide application if wind exceeds 20 km/h."
          />

          {/* Soil Vitality Card */}
          <Text style={styles.sectionTitle}>Soil Vitality</Text>
          <GlassCard style={styles.soilCard}>
            <View style={styles.soilCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="science" size={20} color={theme.soilBrown} />
                <Text style={styles.soilCardTitle}>Nutrient Analysis</Text>
              </View>
              <Text style={styles.lastSyncText}>Last tested: {soilData.lastTested}</Text>
            </View>
            
            <View style={styles.npkGrid}>
              <View style={styles.npkItem}>
                <Text style={styles.npkLabel}>Nitrogen (N)</Text>
                <View style={styles.pillContainer}>
                  <View style={[styles.npkPill, { backgroundColor: soilData.nitrogen > 40 ? theme.tintGreen : '#fbbf24', width: `${Math.min(soilData.nitrogen, 100)}%` }]} />
                </View>
                <Text style={styles.npkValue}>{soilData.nitrogen} mg/kg</Text>
              </View>

              <View style={styles.npkItem}>
                <Text style={styles.npkLabel}>Phosphorus (P)</Text>
                <View style={styles.pillContainer}>
                  <View style={[styles.npkPill, { backgroundColor: soilData.phosphorus > 30 ? theme.tintGreen : '#fbbf24', width: `${Math.min(soilData.phosphorus * 2, 100)}%` }]} />
                </View>
                <Text style={styles.npkValue}>{soilData.phosphorus} mg/kg</Text>
              </View>

              <View style={styles.npkItem}>
                <Text style={styles.npkLabel}>Potassium (K)</Text>
                <View style={styles.pillContainer}>
                  <View style={[styles.npkPill, { backgroundColor: soilData.potassium > 50 ? theme.tintGreen : '#fbbf24', width: `${Math.min(soilData.potassium, 100)}%` }]} />
                </View>
                <Text style={styles.npkValue}>{soilData.potassium} mg/kg</Text>
              </View>

              <View style={styles.npkItem}>
                <Text style={styles.npkLabel}>pH Balance</Text>
                <View style={styles.phIndicator}>
                  <Text style={[styles.phValue, { color: soilData.ph >= 6.0 && soilData.ph <= 7.5 ? theme.tintGreen : theme.dangerText }]}>{soilData.ph}</Text>
                  <Text style={styles.phLabel}>{soilData.ph >= 6.0 && soilData.ph <= 7.5 ? 'Optimal' : 'Adjust Needed'}</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Live Activity */}
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Latest Activity</Text>
            <TouchableOpacity onPress={() => router.push('/activity-log')}>
              <Text style={[styles.seeAllText, { color: SOIL_BROWN }]}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <GlassCard style={styles.activityCard}>
            {activities.slice(0, 3).map((activity, idx) => (
              <Pressable
                key={activity.id}
                onPress={() => router.push('/activity-log')}
                style={({ pressed }) => [styles.activityRow, {
                  backgroundColor: pressed ? activity.color + '08' : 'transparent',
                  borderRadius: 14, marginBottom: idx < 2 ? 2 : 0,
                  borderBottomWidth: idx < 2 ? 1 : 0,
                  borderBottomColor: theme.glassBorder,
                }]}
              >
                <View style={[styles.activityIconBg, { backgroundColor: activity.color + '15' }]}>
                  <MaterialIcons name={activity.icon as any} size={22} color={activity.color} />
                </View>
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <MaterialIcons name="chevron-right" size={14} color={theme.textDim} />
                </View>
              </Pressable>
            ))}
          </GlassCard>

          {/* Health Streak Gamification - now interactive */}
          <Pressable
            onPress={() => router.push('/activity-log')}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, marginBottom: 24, marginTop: 8 })}
          >
            <GlassCard style={{ marginBottom: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 215, 0, 0.12)', marginBottom: 0 }]}>
                   <MaterialIcons name="local-blooming" size={24} color="#FFD700" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kpiLabel}>Current Health Streak</Text>
                  <Text style={styles.kpiValue}>12 Days 🔥</Text>
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 11, color: theme.textDim, marginTop: 2 }}>Consecutive days of optimal farm conditions</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ backgroundColor: TINT_GREEN, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'Outfit_700Bold' }}>SEEDLING BADGE</Text>
                  </View>
                  <Text style={{ color: theme.textDim, fontSize: 11 }}>3 days to Harvester 🏆</Text>
                </View>
              </View>
              {/* Mini progress bar */}
              <View style={{ marginTop: 12, height: 6, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '80%', height: '100%', backgroundColor: '#FFD700', borderRadius: 3 }} />
              </View>
            </GlassCard>
          </Pressable>

        </ScrollView>

        {/* Weather Forecast Modal */}
        <Modal
          visible={isWeatherOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsWeatherOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={() => setIsWeatherOpen(false)} 
            />
            <View style={styles.weatherDrawer}>
              <BlurView intensity={theme.isDark ? 80 : 90} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
              <View style={styles.drawerHandle} />
              
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Microclimate Forecast</Text>
                <TouchableOpacity onPress={() => setIsWeatherOpen(false)}>
                  <MaterialIcons name="close" size={24} color={theme.textMain} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                 {/* AI Advisory Summary Banner */}
                 <View style={styles.aiAdviceBox}>
                    <MaterialIcons name="auto-awesome" size={18} color={TINT_GREEN} />
                    <Text style={styles.aiAdviceText}>
                      {`${weatherAdvisories.length} active advisories detected — ${weatherAdvisories.filter(a => a.urgency === 'critical').length} critical. Review and action below.`}
                    </Text>
                 </View>

                 {/* 7-Day Forecast with Rainfall Bars */}
                 <Text style={[styles.drawerSectionLabel, { marginBottom: 12 }]}>7-Day Forecast</Text>
                 {WEATHER_FORECAST.map((item, idx) => {
                   const isRainy = item.rainMm >= 20;
                   const isHot   = item.tempHigh >= 32 && item.rainMm === 0;
                   return (
                     <View key={idx} style={styles.forecastItem}>
                       <View style={{ width: 36 }}>
                         <Text style={styles.forecastDay}>{item.day}</Text>
                         <Text style={styles.forecastDate}>{item.date.split(' ')[0]}</Text>
                       </View>
                       <MaterialIcons name={item.icon as any} size={22} color={item.iconColor} />
                       <View style={{ flex: 1, gap: 4 }}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems:'center' }}>
                           <Text style={styles.forecastTemp}>{item.tempHigh}° / {item.tempLow}°</Text>
                           {isRainy && (
                             <View style={styles.riskBadge}>
                               <MaterialIcons name="storm" size={11} color="#3b82f6" />
                               <Text style={[styles.riskBadgeText, { color: '#3b82f6' }]}>Heavy Rain</Text>
                             </View>
                           )}
                           {isHot && (
                             <View style={[styles.riskBadge, { backgroundColor: '#ef444420', borderColor: '#ef444430'}]}>
                               <MaterialIcons name="thermostat" size={11} color="#ef4444" />
                               <Text style={[styles.riskBadgeText, { color: '#ef4444' }]}>Heat Alert</Text>
                             </View>
                           )}
                         </View>
                         {/* Rainfall intensity bar */}
                         {item.rainMm > 0 && (
                           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                             <View style={styles.rainBarBg}>
                               <View style={[styles.rainBarFill, { 
                                 width: `${Math.min((item.rainMm / 50) * 100, 100)}%`,
                                 backgroundColor: item.rainMm >= 30 ? '#ef4444' : item.rainMm >= 15 ? '#f59e0b' : '#38bdf8'
                               }]} />
                             </View>
                             <Text style={styles.rainMmText}>{item.rainMm}mm · {rainLabel(item.rainMm)}</Text>
                           </View>
                         )}
                       </View>
                     </View>
                   );
                 })}

                 {/* Predictive Advisory List */}
                 <Text style={[styles.drawerSectionLabel, { marginTop: 28, marginBottom: 12 }]}>Predictive Advisories</Text>
                 {weatherAdvisories.map((advisory) => {
                   const color = ADVISORY_COLORS[advisory.urgency];
                   return (
                     <View key={advisory.id} style={[styles.advisoryItem, { borderLeftColor: color, backgroundColor: color + '0A' }]}>
                       <View style={styles.advisoryHeader}>
                         <MaterialIcons name={advisory.icon as any} size={20} color={color} />
                         <Text style={[styles.advisoryTitle, { color: theme.textMain }]}>{advisory.title}</Text>
                       </View>
                       <Text style={styles.advisoryDetail}>{advisory.detail}</Text>
                       <View style={styles.actionsList}>
                         {advisory.actions.map((action, i) => (
                           <View key={i} style={styles.actionItem}>
                             <View style={[styles.actionDot, { backgroundColor: color }]} />
                             <Text style={styles.actionItemText}>{action}</Text>
                           </View>
                         ))}
                       </View>
                     </View>
                   );
                 })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: { flex: 1 },
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
  greetingHeader: { 
    fontSize: 15, 
    color: theme.textSub, 
    fontFamily: 'Outfit_500Medium' 
  },
  farmerName: { 
    fontSize: 28, 
    color: theme.textMain, 
    fontFamily: 'Outfit_700Bold', 
    marginTop: 4 
  },
  weatherBadgeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 24, 
    gap: 8,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    paddingHorizontal: 12, 
    paddingVertical: 8,
    overflow: 'hidden',
  },
  weatherText: { 
    color: theme.textMain, 
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scrollContent: { 
    padding: 24, 
    paddingBottom: 110, 
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  glassContent: {
    padding: 20,
  },
  insightCard: { 
    marginBottom: 32,
  },
  insightHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 16 
  },
  insightIconWrapper: {
    padding: 8,
    borderRadius: 12,
  },
  insightTitle: { 
    color: theme.textMain, 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 18 
  },
  insightBody: { 
    color: theme.textMain,
    opacity: 0.85,
    fontSize: 15, 
    fontFamily: 'Outfit_400Regular', 
    lineHeight: 24, 
    marginBottom: 20 
  },
  insightButton: { 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
  },
  insightButtonText: { 
    color: '#FFF', 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 16 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  weatherDrawer: {
    height: '65%',
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    padding: 24,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.glassBorderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  drawerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  aiAdviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.1)' : 'rgba(98, 168, 85, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(98, 168, 85, 0.2)',
    marginBottom: 24,
  },
  aiAdviceText: {
    flex: 1,
    fontSize: 13,
    color: theme.textMain,
    fontFamily: 'Outfit_500Medium',
    lineHeight: 18,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    gap: 16,
  },
  forecastDay: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textMain,
  },
  forecastTemp: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
    width: 40,
  },
  forecastAdvice: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: theme.textSub,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontFamily: 'Outfit_700Bold', 
    color: theme.textMain, 
    marginBottom: 16, 
  },
  kpiGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginBottom: 32, 
  },
  kpiCard: { 
    width: '47%', 
    marginBottom: 16,
  },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  kpiTextGroup: { 
    gap: 2,
    flexShrink: 1, 
  },
  kpiValue: { 
    fontSize: 22, 
    fontFamily: 'Outfit_700Bold', 
    color: theme.textMain,
    flexShrink: 1,
  },
  kpiLabel: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  kpiSubText: {
    fontFamily: 'Outfit_500Medium',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  activityCard: { },
  activityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.glassBorder, 
    paddingBottom: 20,
    marginBottom: 20,
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextContainer: { flex: 1, gap: 4 },
  activityTitle: { 
    fontSize: 16, 
    color: theme.textMain, 
    fontFamily: 'Outfit_600SemiBold' 
  },
  activitySubtitle: { 
    fontSize: 13, 
    color: theme.textSub, 
    fontFamily: 'Outfit_400Regular' 
  },
  activityTime: { 
    fontSize: 13, 
    color: theme.textDim, 
    fontFamily: 'Outfit_500Medium' 
  },
  soilCard: {
    marginBottom: 32,
  },
  soilCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  soilCardTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  lastSyncText: {
    fontSize: 11,
    fontFamily: 'Outfit_500Medium',
    color: theme.textDim,
  },
  npkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  npkItem: {
    width: '46%',
    gap: 8,
  },
  npkLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: theme.textSub,
  },
  pillContainer: {
    height: 6,
    backgroundColor: theme.glassBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  npkPill: {
    height: '100%',
    borderRadius: 3,
  },
  npkValue: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  phIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  phValue: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
  },
  phLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textSub,
  },
  // ── Weather Drawer new styles ─────────────────────────────
  drawerSectionLabel: {
    fontSize: 13,
    fontFamily: 'Outfit_700Bold',
    color: theme.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  forecastDate: {
    fontSize: 10,
    fontFamily: 'Outfit_400Regular',
    color: theme.textDim,
    marginTop: 1,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#3b82f620',
    borderWidth: 1,
    borderColor: '#3b82f630',
  },
  riskBadgeText: {
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
  },
  rainBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: theme.glassBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rainBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rainMmText: {
    fontSize: 11,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textSub,
  },
  advisoryItem: {
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  advisoryTitle: {
    flex: 1,
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    lineHeight: 20,
  },
  advisoryDetail: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: theme.textSub,
    lineHeight: 18,
  },
  actionsList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
    paddingTop: 10,
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  actionItemText: {
    flex: 1,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: theme.textMain,
    lineHeight: 19,
  },
});
