import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Pressable, LayoutAnimation } from 'react-native';
import { LinearGradient as FadeGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { BrandedHeader } from '@/components/BrandedHeader';

type Notif = {
  id: string;
  category: 'alert' | 'ai' | 'device' | 'weather' | 'activity';
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
};

const INITIAL_NOTIFICATIONS: Notif[] = [
  { id: '1', category: 'alert',    title: 'Critical: Soil Moisture Low',       body: 'Field 2 moisture dropped to 22% — immediate irrigation recommended before 10am.',                    time: '5m ago',   read: false, icon: 'water-drop',    color: '#ef4444' },
  { id: '2', category: 'weather',  title: 'Heavy Rain Alert — Thursday',       body: '38mm of rainfall expected on Thu. Suspend irrigation and secure pest control equipment.',              time: '20m ago',  read: false, icon: 'grain',         color: '#38bdf8' },
  { id: '3', category: 'device',   title: 'Node PH3X Offline',                 body: 'Pump Controller in Field 3 has gone offline. Battery critically low at 12%. Inspect immediately.',    time: '4h ago',   read: false, icon: 'memory',        color: '#f87171' },
  { id: '4', category: 'ai',       title: 'AI Advisory: Fertiliser Window',    body: 'Optimal fertiliser application window opens Monday. Light rain forecast will improve nutrient uptake.', time: 'Yesterday', read: true,  icon: 'auto-awesome',  color: '#a78bfa' },
  { id: '5', category: 'activity', title: 'Irrigation Cycle Completed',        body: 'Smart Valve VL2X completed 42 irrigation cycles. Total water usage: 598L this week.',                time: 'Yesterday', read: true,  icon: 'check-circle',  color: '#4ade80' },
  { id: '6', category: 'weather',  title: 'Humidity Risk — Disease Warning',   body: '88% humidity on Thursday creates conditions for fungal outbreaks. Apply preventive fungicide by Wed.', time: '2 days ago', read: true, icon: 'wb-cloudy',    color: '#f59e0b' },
  { id: '7', category: 'ai',       title: 'Yield Forecast Updated',            body: 'AI projects a 14% above-average maize yield this season based on current sensor data.',              time: '3 days ago', read: true,  icon: 'trending-up',  color: '#4ade80' },
  { id: '8', category: 'activity', title: 'Pest Sighting Logged',              body: 'You reported a pest sighting in Field 2. AI recommends scouting at dawn and applying pyrethroid.', time: '3 days ago', read: true,  icon: 'bug-report',   color: '#ef4444' },
];

const CATEGORY_FILTERS = [
  { key: 'all',      label: 'All',     icon: 'notifications' },
  { key: 'alert',    label: 'Alerts',  icon: 'warning' },
  { key: 'ai',       label: 'AI',      icon: 'auto-awesome' },
  { key: 'weather',  label: 'Weather', icon: 'grain' },
  { key: 'device',   label: 'Devices', icon: 'memory' },
  { key: 'activity', label: 'Activity',icon: 'check-circle' },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notif[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  // Group by time period
  const today = filtered.filter(n => ['5m ago', '20m ago', '4h ago'].includes(n.time));
  const yesterday = filtered.filter(n => n.time === 'Yesterday');
  const older = filtered.filter(n => ['2 days ago', '3 days ago'].includes(n.time));

  const NotifItem = ({ notif }: { notif: Notif }) => {
    const isExpanded = expandedId === notif.id;

    return (
      <Pressable
        onPress={() => {
          markRead(notif.id);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpandedId(isExpanded ? null : notif.id);
        }}
        style={({ pressed }) => [styles.notifCard, {
          backgroundColor: pressed
            ? notif.color + '10'
            : notif.read ? theme.glassBackground : theme.glassBackgroundStrong,
          borderColor: notif.read ? theme.glassBorder : notif.color + '35',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        }]}
      >
        <BlurView intensity={theme.isDark ? 25 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        <View style={[styles.notifIconBox, { backgroundColor: notif.color + '18' }]}>
          <MaterialIcons name={notif.icon as any} size={20} color={notif.color} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.notifTitle, { color: theme.textMain }]} numberOfLines={1}>
              {notif.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {!notif.read && <View style={[styles.unreadDot, { backgroundColor: notif.color }]} />}
              <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={18} color={theme.textDim} />
            </View>
          </View>
          <Text style={[styles.notifBody, { color: theme.textSub }]} numberOfLines={isExpanded ? undefined : 2}>
            {notif.body}
          </Text>
          <Text style={[styles.notifTime, { color: theme.textDim, marginTop: isExpanded ? 6 : 0 }]}>{notif.time}</Text>
        </View>
      </Pressable>
    );
  };

  const GroupHeader = ({ label }: { label: string }) => (
    <Text style={[styles.groupLabel, { color: theme.textDim }]}>{label}</Text>
  );

  return (
    <LinearGradient colors={[theme.bgGradientStart, theme.bgGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <BrandedHeader
        imageVariant="leaf"
        title="Notifications"
        subtitle="Farm Alerts"
        leftSlot={
          <TouchableOpacity 
            style={styles.closeBtn} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={26} color={theme.textMain} />
          </TouchableOpacity>
        }
        rightSlot={
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            {unreadCount > 0 && (
              <View style={{ backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#fff' }}>{unreadCount}</Text>
              </View>
            )}
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
                <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: theme.tintGreen }}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter chips */}
      <View style={{ height: 44, marginBottom: 6 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 32, gap: 7, alignItems: 'center', height: 44 }}
        >
          {CATEGORY_FILTERS.map(f => (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20,
                backgroundColor: activeFilter === f.key ? theme.soilBrown + '25' : theme.glassBackground,
                borderWidth: 1.5, borderColor: activeFilter === f.key ? theme.soilBrown + '60' : theme.glassBorder,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <MaterialIcons name={f.icon as any} size={12} color={activeFilter === f.key ? theme.soilBrown : theme.textDim} />
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: activeFilter === f.key ? theme.soilBrown : theme.textSub }}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {/* Right-side fade to hint there are more chips */}
        <FadeGradient
          colors={['transparent', theme.bgGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, pointerEvents: 'none' }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {today.length > 0 && <>
          <GroupHeader label="TODAY" />
          {today.map(n => <NotifItem key={n.id} notif={n} />)}
        </>}
        {yesterday.length > 0 && <>
          <GroupHeader label="YESTERDAY" />
          {yesterday.map(n => <NotifItem key={n.id} notif={n} />)}
        </>}
        {older.length > 0 && <>
          <GroupHeader label="EARLIER" />
          {older.map(n => <NotifItem key={n.id} notif={n} />)}
        </>}
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <MaterialIcons name="notifications-none" size={48} color={theme.textDim} />
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: theme.textSub }}>No notifications</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({});
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerSub: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 2 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: { padding: 20, paddingBottom: 120, maxWidth: 700, alignSelf: 'center', width: '100%' },
  groupLabel: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 1, marginBottom: 10, marginTop: 6 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 10, overflow: 'hidden',
  },
  notifIconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, flex: 1 },
  notifBody: { fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 17 },
  notifTime: { fontFamily: 'Outfit_500Medium', fontSize: 11, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 3 },
});
