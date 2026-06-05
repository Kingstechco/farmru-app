import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';

// Note: Expo Router 'transparentModal' relies on standard styles
export default function FilterModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;

  const [filterMaize, setFilterMaize] = useState(true);
  const [filterTomatoes, setFilterTomatoes] = useState(true);
  const [filterCritical, setFilterCritical] = useState(false);

  return (
    <View style={styles.root}>
      {/* Dimmed backdrop area (clickable to close) */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={() => router.back()} 
      />

      {/* Bottom Sheet Modal */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
        <BlurView intensity={theme.isDark ? 70 : 40} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        <LinearGradient 
          colors={theme.isDark ? ['rgba(20,35,50,0.6)', 'rgba(27,53,38,0.8)'] : ['rgba(245,247,246,0.8)', 'rgba(240,244,241,0.95)']} 
          style={StyleSheet.absoluteFill} 
        />
        
        <View style={styles.sheetContent}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Nodes</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.textSub} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Crop Type</Text>
          <TouchableOpacity 
            style={[styles.filterRow, filterMaize && styles.filterRowActive]}
            activeOpacity={0.7}
            onPress={() => setFilterMaize(!filterMaize)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={[styles.iconBox, filterMaize ? {backgroundColor: SOIL_BROWN} : {}]}>
                <MaterialIcons name="grass" size={18} color={filterMaize ? '#FFF' : theme.textDim} />
              </View>
              <Text style={styles.filterText} numberOfLines={2}>Maize Plots</Text>
            </View>
            {filterMaize && <MaterialIcons name="check" size={20} color={SOIL_BROWN} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterRow, filterTomatoes && styles.filterRowActive]}
            activeOpacity={0.7}
            onPress={() => setFilterTomatoes(!filterTomatoes)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={[styles.iconBox, filterTomatoes ? {backgroundColor: TINT_GREEN} : {}]}>
                <MaterialIcons name="local-florist" size={18} color={filterTomatoes ? '#FFF' : theme.textDim} />
              </View>
              <Text style={styles.filterText} numberOfLines={2}>Tomato Tunnels</Text>
            </View>
            {filterTomatoes && <MaterialIcons name="check" size={20} color={TINT_GREEN} />}
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Node Health Status</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.filterText}>Show Only Critical Nodes</Text>
              <Text style={styles.filterSubtitle}>Filters out healthy & offline nodes</Text>
            </View>
            <Switch 
              value={filterCritical} 
              onValueChange={setFilterCritical}
              trackColor={{ false: theme.glassBorderStrong, true: theme.isDark ? 'rgba(235, 127, 127, 0.5)' : 'rgba(220, 38, 38, 0.3)' }}
              thumbColor={filterCritical ? theme.dangerText : '#FFF'}
            />
          </View>

          <TouchableOpacity style={[styles.applyButton, { backgroundColor: TINT_GREEN }]} onPress={() => router.back()}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
    borderBottomWidth: 0,
  },
  sheetContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: theme.textMain,
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardIconBg,
    borderRadius: 16,
  },
  sectionTitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterRowActive: {
    backgroundColor: theme.glassBackgroundStrong,
    borderColor: theme.glassBorderStrong,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.cardIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    color: theme.textMain,
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
  },
  filterSubtitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  applyButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  }
});
