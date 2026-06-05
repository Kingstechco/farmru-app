import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, LayoutAnimation, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { MaterialIcons as ExpoMaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, Stack } from 'expo-router';
import { BrandedHeader } from '@/components/BrandedHeader';

interface ActionItem {
  id: string;
  title: string;
  desc: string;
  priorityBadge: string;
  icon: keyof typeof ExpoMaterialIcons.glyphMap;
  colorHex: string;
  btnLabel: string;
  completedAt?: string;
}

export default function ActionCenterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);

  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'task_1',
      title: 'Irrigate Tomatoes',
      desc: 'Moisture dropping below 30%. Trigger the pump for 45 minutes to prevent heat stress.',
      priorityBadge: 'CRITICAL • Due Today',
      icon: 'water-drop',
      colorHex: '#38bdf8',
      btnLabel: 'Start Pump Remotely'
    },
    {
      id: 'task_2',
      title: 'Phosphorus Boost',
      desc: 'Maize Plot B is reaching the flowering stage. Apply organic Phosphorus to help the crop grow strong.',
      priorityBadge: 'Upcoming • This Week',
      icon: 'local-florist',
      colorHex: theme.soilBrown,
      btnLabel: 'Mark as Completed'
    }
  ]);

  const [completedLog, setCompletedLog] = useState<ActionItem[]>([]);

  const handleActionCompletion = (targetItem: ActionItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setActions(actions.filter(a => a.id !== targetItem.id));
    setCompletedLog([{ ...targetItem, completedAt: `Today, ${timeString}` }, ...completedLog]);
  };

  return (
    <LinearGradient 
      colors={[theme.bgGradientStart, theme.bgGradientEnd]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      
      {/* Branded Action Center Header */}
      <BrandedHeader
        imageVariant="leaf"
        title="Action Center"
        subtitle="Farmru AI Directives"
        leftSlot={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="close" size={24} color={theme.textMain} />
          </TouchableOpacity>
        }
        rightSlot={<View style={{ width: 44 }} />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Explicit Action Points */}
        {actions.length > 0 ? (
          <>
            <Text style={styles.sectionHeading}>Priority Action Points</Text>
            {actions.map(action => (
              <View key={action.id} style={styles.actionCardWrapper}>
                <View style={styles.actionCardBackground}>
                  <LinearGradient colors={[`${action.colorHex}33`, 'transparent']} style={StyleSheet.absoluteFill} start={{x:0, y:0}} end={{x:1, y:1}} />
                  <ImageBackground
                    source={require('../assets/images/farmru_leaf.webp')}
                    style={StyleSheet.absoluteFill}
                    imageStyle={{ opacity: 0.08, resizeMode: 'cover' }}
                  />
                </View>
                <BlurView intensity={theme.isDark ? 30 : 60} tint={theme.blurTint} style={[StyleSheet.absoluteFill, {borderRadius: 20}]} />
                <View style={styles.actionCardContent}>
                  <View style={styles.actionCardHeader}>
                    <View style={[styles.actionIconBox, { backgroundColor: `${action.colorHex}33` }]}>
                      {/* @ts-ignore dynamic strict literal cast safely passed runtime bounds */}
                      <MaterialIcons name={action.icon} size={22} color={action.colorHex} />
                    </View>
                    <Text style={styles.actionTimeBadge}>{action.priorityBadge}</Text>
                  </View>
                  <Text style={styles.actionCardTitle}>{action.title}</Text>
                  <Text style={styles.actionCardDesc}>{action.desc}</Text>
                  <TouchableOpacity onPress={() => handleActionCompletion(action)} style={[styles.actionButton, { backgroundColor: action.colorHex }]} activeOpacity={0.8}>
                    <Text style={[styles.actionButtonText, { color: action.colorHex === '#38bdf8' ? '#000' : '#FFF' }]}>{action.btnLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.allClearBox}>
            <MaterialIcons name="check-circle" size={48} color={theme.tintGreen} />
            <Text style={styles.allClearTitle}>All Caught Up!</Text>
            <Text style={styles.allClearDesc}>Everything looks great. Your farm doesn't need any immediate attention right now.</Text>
          </View>
        )}

        {/* Dynamic Completed Actions Log */}
        {completedLog.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Completed Actions History</Text>
            {completedLog.map(log => (
              <View key={log.id} style={styles.logItemRow}>
                <View style={[styles.logIconTrack, { backgroundColor: 'rgba(98, 168, 85, 0.15)' }]}>
                  <MaterialIcons name="check" size={16} color={theme.tintGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logItemTitle}>{log.title}</Text>
                  <Text style={styles.logItemTime}>Executed: {log.completedAt}</Text>
                </View>
              </View>
            ))}
          </View>
        )}


        {/* Crop Recommendations */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>AI Crop Recommendations</Text>
        <Text style={styles.sectionDesc}>Based on your soil nutrients (12-8-14), 18°C average temperature, and 6.8 pH, Farmru AI suggests these next crops for a strong harvest:</Text>

        <View style={styles.cropGrid}>
          {/* Crop 1 */}
          <View style={styles.cropCard}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.cropIconRing}>
               <MaterialIcons name="eco" size={32} color={theme.tintGreen} />
            </View>
            <Text style={styles.cropName}>Spinach</Text>
            <Text style={styles.cropReasoning}>Grows well in cool weather and loves nitrogen. Great chance for a strong harvest.</Text>
            <View style={[styles.matchBadge, { backgroundColor: theme.isDark ? 'rgba(98,168,85,0.2)' : 'rgba(98,168,85,0.1)' }]}>
              <Text style={[styles.matchText, { color: theme.tintGreen }]}>98% Match</Text>
            </View>
          </View>

          {/* Crop 2 */}
          <View style={styles.cropCard}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.cropIconRing}>
               <MaterialIcons name="grass" size={32} color="#f59e0b" />
            </View>
            <Text style={styles.cropName}>Cabbage</Text>
            <Text style={styles.cropReasoning}>Thrives in 6.5-7.0 pH. It consumes heavy nutrients, which your soil easily supports right now.</Text>
            <View style={[styles.matchBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.matchText, { color: '#f59e0b' }]}>85% Match</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeading: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionDesc: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    marginBottom: 20,
    paddingLeft: 4,
    lineHeight: 22,
  },
  actionCardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: theme.glassBorder,
    borderWidth: 1,
  },
  actionCardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.glassBackground,
  },
  actionCardContent: {
    padding: 24,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTimeBadge: {
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionCardTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    marginBottom: 8,
  },
  actionCardDesc: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
  },
  allClearBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.glassBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 16,
  },
  allClearTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  allClearDesc: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  logContainer: {
    marginBottom: 16,
  },
  logItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    gap: 12,
  },
  logIconTrack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logItemTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  logItemTime: {
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
  cropGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  cropCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    padding: 20,
    alignItems: 'center',
  },
  cropIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cropName: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  cropReasoning: {
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  matchBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  matchText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
  }
});
