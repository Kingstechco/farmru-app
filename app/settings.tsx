import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

type SettingRow = {
  icon: string;
  color: string;
  label: string;
  sublabel?: string;
  type: 'nav' | 'toggle' | 'info';
  value?: boolean;
  route?: string;
  onToggle?: (v: boolean) => void;
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();

  const [notifAlerts, setNotifAlerts]   = useState(true);
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifAI, setNotifAI]           = useState(true);
  const [notifDevice, setNotifDevice]   = useState(true);
  const [autoSync, setAutoSync]         = useState(true);

  const SECTIONS: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Tools & Data',
      rows: [
        { icon: 'query-stats', color: '#a78bfa', label: 'Analytics', sublabel: 'Charts, trends & insights', type: 'nav', route: '/analytics' },
        { icon: 'memory',      color: '#38bdf8', label: 'Device Center', sublabel: 'Manage sensors & nodes', type: 'nav', route: '/devices' },
      ],
    },
    {
      title: 'Notifications',
      rows: [
        { icon: 'warning',       color: '#ef4444', label: 'Farm Alerts',      sublabel: 'Critical readings & urgent actions', type: 'toggle', value: notifAlerts,  onToggle: setNotifAlerts },
        { icon: 'grain',         color: '#38bdf8', label: 'Weather Events',   sublabel: 'Rain, wind & temperature alerts',    type: 'toggle', value: notifWeather, onToggle: setNotifWeather },
        { icon: 'auto-awesome',  color: '#a78bfa', label: 'AI Advisories',    sublabel: 'Recommendations from Farmru AI',     type: 'toggle', value: notifAI,      onToggle: setNotifAI },
        { icon: 'memory',        color: '#4ade80', label: 'Device Alerts',    sublabel: 'Offline, low battery, signal loss',  type: 'toggle', value: notifDevice,  onToggle: setNotifDevice },
      ],
    },
    {
      title: 'Connectivity',
      rows: [
        { icon: 'sync', color: '#4ade80', label: 'Auto Sync', sublabel: 'Sync sensor data every 5 minutes', type: 'toggle', value: autoSync, onToggle: setAutoSync },
      ],
    },
    {
      title: 'Account',
      rows: [
        { icon: 'person',     color: theme.soilBrown, label: 'Profile',          sublabel: 'Tsedzu — Farm Owner', type: 'nav' },
        { icon: 'farm',       color: '#4ade80',        label: 'Farm Details',     sublabel: '3 active fields · 6 nodes', type: 'nav' },
        { icon: 'logout',     color: '#ef4444',        label: 'Sign Out',         type: 'nav' },
      ],
    },
    {
      title: 'About',
      rows: [
        { icon: 'info',    color: theme.textDim, label: 'App Version',  sublabel: 'Farmru v2.4.1 (build 441)', type: 'info' },
        { icon: 'shield',  color: '#4ade80',     label: 'Privacy Policy', type: 'nav' },
        { icon: 'support', color: '#38bdf8',     label: 'Support & Help', type: 'nav', route: '/help' },
      ],
    },
  ];

  const SettingCard = ({ row }: { row: SettingRow }) => (
    <Pressable
      onPress={() => { if (row.type === 'nav' && row.route) router.push(row.route as any); }}
      style={({ pressed }) => [styles.row, {
        backgroundColor: pressed && row.type === 'nav' ? theme.glassBackgroundStrong : theme.glassBackground,
        borderColor: theme.glassBorder,
        transform: [{ scale: pressed && row.type === 'nav' ? 0.985 : 1 }],
      }]}
    >
      <BlurView intensity={theme.isDark ? 20 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[styles.iconBox, { backgroundColor: row.color + '18' }]}>
        <MaterialIcons name={row.icon as any} size={20} color={row.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.textMain }]}>{row.label}</Text>
        {row.sublabel && <Text style={[styles.rowSub, { color: theme.textSub }]}>{row.sublabel}</Text>}
      </View>
      {row.type === 'toggle' && (
        <Switch
          value={row.value}
          onValueChange={row.onToggle}
          trackColor={{ false: theme.glassBorder, true: theme.soilBrown + '70' }}
          thumbColor={row.value ? theme.soilBrown : theme.textDim}
        />
      )}
      {row.type === 'nav' && row.route && (
        <MaterialIcons name="chevron-right" size={18} color={theme.textDim} />
      )}
    </Pressable>
  );

  return (
    <LinearGradient colors={[theme.bgGradientStart, theme.bgGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16) }]}>
        <View>
          <Text style={[styles.headerSub, { color: theme.textSub }]}>Preferences</Text>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={[styles.profileCard, { borderColor: theme.glassBorder }]}>
          <BlurView intensity={theme.isDark ? 30 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={[theme.soilBrown, '#7A4520']} style={styles.avatar}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#fff' }}>T</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: theme.textMain }]}>Tsedzu</Text>
            <Text style={[styles.profileRole, { color: theme.textSub }]}>Farm Owner · Farmru Pro</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              {[{ v: '3', l: 'Fields' }, { v: '6', l: 'Nodes' }, { v: '99.1%', l: 'Uptime' }].map(s => (
                <View key={s.l}>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: theme.textMain }}>{s.v}</Text>
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 10, color: theme.textDim }}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {SECTIONS.map(section => (
          <View key={section.title} style={{ marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionGroup}>
              {section.rows.map((row, i) => (
                <View key={row.label}>
                  <SettingCard row={row} />
                  {i < section.rows.length - 1 && <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerSub: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 2 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24 },
  scrollContent: { padding: 20, paddingBottom: 120, maxWidth: 700, alignSelf: 'center', width: '100%' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 22, borderWidth: 1, padding: 20,
    overflow: 'hidden', marginBottom: 24,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  profileRole: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  sectionGroup: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, overflow: 'hidden' },
  iconBox: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  rowSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginLeft: 68 },
});
