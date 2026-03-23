import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppIcon as MaterialIcons } from './ui/AppIcon';
import { useThemeColors } from '@/hooks/useThemeColors';
import { 
  Advisory, 
  ADVISORY_COLORS, 
  weatherAdvisories,
  WEATHER_FORECAST,
  rainLabel,
} from '@/utils/weatherEngine';

interface WeatherAdvisoryCardProps {
  onOpenDrawer?: () => void;
}

const UrgencyBadge = ({ urgency }: { urgency: Advisory['urgency'] }) => {
  const theme = useThemeColors();
  const color = ADVISORY_COLORS[urgency];
  const labels = { critical: 'CRITICAL', warning: 'WARNING', positive: 'OPTIMAL', info: 'INFO' };
  return (
    <View style={{ 
      backgroundColor: color + '20', 
      borderColor: color + '50', 
      borderWidth: 1, 
      borderRadius: 8, 
      paddingHorizontal: 8, 
      paddingVertical: 3 
    }}>
      <Text style={{ color, fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.5 }}>
        {labels[urgency]}
      </Text>
    </View>
  );
};

export const WeatherAdvisoryCard = ({ onOpenDrawer }: WeatherAdvisoryCardProps) => {
  const theme = useThemeColors();
  const styles = getStyles(theme);

  const topAdvisory = weatherAdvisories[0];
  const next2 = WEATHER_FORECAST.slice(0, 3); // Show next 3 days mini preview

  if (!topAdvisory) return null;
  const urgencyColor = ADVISORY_COLORS[topAdvisory.urgency];

  return (
    <View style={styles.card}>
      <BlurView intensity={theme.isDark ? 25 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />

      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="cloud" size={18} color={theme.soilBrown} />
          <Text style={styles.headerTitle}>Weather Advisory</Text>
        </View>
        <TouchableOpacity onPress={onOpenDrawer} style={styles.viewAllBtn}>
          <Text style={[styles.viewAllText, { color: theme.soilBrown }]}>
            {weatherAdvisories.length} alerts
          </Text>
          <MaterialIcons name="chevron-right" size={16} color={theme.soilBrown} />
        </TouchableOpacity>
      </View>

      {/* Priority Alert */}
      <View style={[styles.alertBox, { borderColor: urgencyColor + '40', backgroundColor: urgencyColor + '10' }]}>
        <View style={styles.alertIconBox}>
          <MaterialIcons name={topAdvisory.icon as any} size={26} color={urgencyColor} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.alertTitleRow}>
            <Text style={[styles.alertTitle, { color: theme.textMain }]} numberOfLines={2}>
              {topAdvisory.title}
            </Text>
          </View>
          <UrgencyBadge urgency={topAdvisory.urgency} />
          <Text style={styles.alertDetail} numberOfLines={2}>
            {topAdvisory.detail}
          </Text>
        </View>
      </View>

      {/* Next 3 days mini-strip */}
      <View style={styles.miniStrip}>
        {next2.map((day) => (
          <View key={day.day} style={styles.miniDay}>
            <MaterialIcons name={day.icon as any} size={18} color={day.iconColor} />
            <Text style={styles.miniDayName}>{day.day}</Text>
            <Text style={styles.miniTemp}>{day.tempHigh}°</Text>
            {day.rainMm > 0 ? (
              <View style={[styles.rainPill, { backgroundColor: '#38bdf820' }]}>
                <MaterialIcons name="water-drop" size={10} color="#38bdf8" />
                <Text style={[styles.rainPillText, { color: '#38bdf8' }]}>{day.rainMm}mm</Text>
              </View>
            ) : (
              <View style={[styles.rainPill, { backgroundColor: theme.glassBackground }]}>
                <Text style={[styles.rainPillText, { color: theme.textDim }]}>Dry</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Top recommended action */}
      {topAdvisory.actions[0] && (
        <TouchableOpacity style={styles.actionRow} onPress={onOpenDrawer} activeOpacity={0.8}>
          <MaterialIcons name="play-circle-filled" size={16} color={urgencyColor} />
          <Text style={[styles.actionText, { color: urgencyColor }]} numberOfLines={1}>
            {topAdvisory.actions[0]}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    padding: 20,
    marginBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
  },
  alertBox: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  alertTitle: {
    flex: 1,
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    lineHeight: 20,
  },
  alertDetail: {
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  miniStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
    paddingTop: 16,
  },
  miniDay: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  miniDayName: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textSub,
  },
  miniTemp: {
    fontSize: 15,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  rainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rainPillText: {
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.glassBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
  },
});
