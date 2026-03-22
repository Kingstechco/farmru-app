import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);

  const nodes = [
    { id: 'CF1B', type: 'Gateway Hub', location: 'Maize Plot A', status: 'Online', battery: 88, signal: 'Strong', lastSync: '2m ago' },
    { id: 'CF2A', type: 'Soil Sensor', location: 'Tomato Tunnel 1', status: 'Online', battery: 45, signal: 'Moderate', lastSync: '12m ago' },
    { id: 'PH1X', type: 'Water Valive', location: 'Central Pump', status: 'Offline', battery: 12, signal: 'Lost', lastSync: '4h ago' },
    { id: 'WT3R', type: 'Weather Station', location: 'Open Field', status: 'Online', battery: 98, signal: 'Strong', lastSync: '1m ago' },
  ];

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
            <Text style={styles.headerSubtitle}>Hardware Status</Text>
            <Text style={styles.headerTitle}>Device Center</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Network Status Banner */}
        <View style={styles.networkBanner}>
          <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.bannerContent}>
            <View style={[styles.pulseDot, {backgroundColor: theme.tintGreen}]} />
            <Text style={styles.bannerText}>Network: Operational (3/4 Nodes Online)</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.sectionTitle}>Registered Hardware</Text>
          <TouchableOpacity>
            <Text style={styles.actionText}>+ Add Node</Text>
          </TouchableOpacity>
        </View>

        {/* Device List */}
        {nodes.map((node, index) => (
          <View key={index} style={styles.deviceCard}>
            <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.deviceCardContent}>
              
              <View style={styles.deviceHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.iconBox, {backgroundColor: node.status === 'Online' ? theme.cardIconBg : theme.dangerBg}]}>
                    <MaterialIcons 
                      name={node.type.includes('Gateway') ? 'router' : node.type.includes('Sensor') ? 'sensors' : node.type.includes('Water') ? 'opacity' : 'wb-sunny'} 
                      size={20} 
                      color={node.status === 'Online' ? theme.textMain : theme.dangerText} 
                    />
                  </View>
                  <View>
                    <Text style={styles.deviceName}>Node {node.id}</Text>
                    <Text style={styles.deviceType}>{node.type} • {node.location}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: node.status === 'Online' ? (theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)') : theme.dangerBg}]}>
                  <Text style={[styles.statusText, {color: node.status === 'Online' ? theme.tintGreen : theme.dangerText}]}>
                    {node.status}
                  </Text>
                </View>
              </View>

              <View style={styles.deviceMetrics}>
                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>Battery</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <MaterialIcons name={node.battery > 20 ? "battery-full" : "battery-alert"} size={14} color={node.battery > 20 ? theme.tintGreen : theme.dangerText} />
                    <Text style={styles.metricValue}>{node.battery}%</Text>
                  </View>
                </View>

                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>Signal</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <MaterialIcons name="wifi" size={14} color={node.status === 'Online' ? theme.textMain : theme.textDim} />
                    <Text style={styles.metricValue}>{node.signal}</Text>
                  </View>
                </View>

                <View style={[styles.metricColumn, {alignItems: 'flex-end'}]}>
                  <Text style={styles.metricLabel}>Last Sync</Text>
                  <Text style={styles.metricValue}>{node.lastSync}</Text>
                </View>
              </View>

            </View>
          </View>
        ))}

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
  networkBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: theme.tintGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  bannerText: {
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
  },
  actionText: {
    color: theme.tintGreen,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  deviceCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 16,
  },
  deviceCardContent: {
    padding: 20,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  deviceType: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  statusText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
  },
  deviceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  metricColumn: {
    gap: 4,
  },
  metricLabel: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
  },
  metricValue: {
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  }
});
