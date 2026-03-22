import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
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
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.farmerName}>Tsedzu <Text style={{fontSize: 22}}>🌿</Text></Text>
            </View>
          </View>
          
          <View style={styles.weatherBadgeContainer}>
            <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <MaterialIcons name="wb-sunny" size={20} color={SOIL_BROWN} />
            <Text style={styles.weatherText}>24°C</Text>
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
              Moisture in Field 2 is dropping faster than usual. We recommend adding 2 hours of irrigation before the afternoon heat peaks.
            </Text>
            <TouchableOpacity style={[styles.insightButton, { backgroundColor: TINT_GREEN }]} activeOpacity={0.7}>
              <Text style={styles.insightButtonText}>Apply Irrigation</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </GlassCard>

          {/* KPI Glass Grid */}
          <Text style={styles.sectionTitle}>Weather & Environment</Text>
          <View style={styles.kpiGrid}>
            <GlassCard style={styles.kpiCard}>
               <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                 <MaterialIcons name="water-drop" size={22} color="#38bdf8" />
               </View>
               <View style={styles.kpiTextGroup}>
                  <Text style={styles.kpiValue}>28%</Text>
                  <Text style={styles.kpiLabel}>Moisture</Text>
                  <Text style={[styles.kpiSubText, {color: theme.tintGreen, marginTop: 4, fontSize: 11}]}>Too dry. Needs water.</Text>
               </View>
            </GlassCard>
            
            <GlassCard style={styles.kpiCard}>
               <View style={[styles.iconCircle, { backgroundColor: theme.isDark ? 'rgba(235, 127, 127, 0.15)' : 'rgba(220, 38, 38, 0.1)' }]}>
                 <MaterialIcons name="thermostat" size={22} color={theme.dangerText} />
               </View>
               <View style={styles.kpiTextGroup}>
                  <Text style={styles.kpiValue}>32°C</Text>
                  <Text style={styles.kpiLabel}>Soil Temp</Text>
                  <Text style={[styles.kpiSubText, {color: theme.dangerText, marginTop: 4, fontSize: 11}]}>Watch for heat stress.</Text>
               </View>
            </GlassCard>
          </View>

          {/* Live Activity */}
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Latest Activity</Text>
            <TouchableOpacity><Text style={[styles.seeAllText, { color: SOIL_BROWN }]}>See all</Text></TouchableOpacity>
          </View>
          
          <GlassCard style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={[styles.activityIconBg, { backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.2)' : 'rgba(98, 168, 85, 0.15)' }]}>
                <MaterialIcons name="check" size={20} color={TINT_GREEN} />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Irrigation Completed</Text>
                <Text style={styles.activitySubtitle}>Field 1 • Maize Plot</Text>
              </View>
              <Text style={styles.activityTime}>2h ago</Text>
            </View>
            
            <View style={[styles.activityRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <View style={[styles.activityIconBg, { backgroundColor: theme.isDark ? 'rgba(193, 154, 92, 0.2)' : 'rgba(193, 154, 92, 0.15)' }]}>
                <MaterialIcons name="science" size={20} color={SOIL_BROWN} />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Fertilizer Applied</Text>
                <Text style={styles.activitySubtitle}>Field 3 • Tomatoes</Text>
              </View>
              <Text style={styles.activityTime}>1d ago</Text>
            </View>
          </GlassCard>

        </ScrollView>
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
  greeting: { 
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
  scrollContent: { 
    padding: 24, 
    paddingBottom: 110, // Buffer for absolute bottom tabs
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden', // clips blurview to border limits
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
});
