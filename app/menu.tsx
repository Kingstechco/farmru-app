import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { FarmruLogo } from '@/components/ui/FarmruLogo';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, toggleThemeOverride } from '@/hooks/useThemeColors';

export default function MenuModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;

  const navigateTo = (route: any) => {
    router.push(route);
  };

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <ImageBackground 
        source={require('../assets/images/farm_bg.png')} 
        style={StyleSheet.absoluteFill} 
        resizeMode="cover" 
      />
      <BlurView intensity={theme.isDark ? 80 : 30} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      
      <LinearGradient 
        colors={theme.isDark ? ['rgba(20,35,50,0.4)', 'rgba(20,35,50,0.95)'] : ['rgba(240,244,241,0.4)', 'rgba(240,244,241,0.95)']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 40 : 20) }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color={theme.textMain} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBox, { backgroundColor: SOIL_BROWN }]}>
              <Text style={styles.avatarInitial}>T</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Tsedzu</Text>
            <Text style={styles.profilePhone}>Admin • Farmru Central</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <MaterialIcons name="edit" size={18} color={TINT_GREEN} />
          </TouchableOpacity>
        </View>

        {/* Global Journeys Menu Map */}
        <View style={styles.menuList}>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)/analytics')}>
            <View style={[styles.menuIconBox, { backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)' }]}>
              <MaterialIcons name="query-stats" size={22} color={TINT_GREEN} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Yield Analytics</Text>
              <Text style={styles.menuItemSubtitle}>Crop projections & historical data</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textDim} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleThemeOverride}>
            <View style={[styles.menuIconBox, { backgroundColor: theme.cardIconBg }]}>
              <MaterialIcons name={theme.isDark ? "light-mode" : "dark-mode"} size={22} color={theme.textMain} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Appearance</Text>
              <Text style={styles.menuItemSubtitle}>Toggle {theme.isDark ? 'White' : 'Dark'} Mode</Text>
            </View>
            <MaterialIcons name={theme.isDark ? "toggle-off" : "toggle-on"} size={28} color={theme.isDark ? theme.textDim : theme.tintGreen} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={[styles.menuIconBox, { backgroundColor: theme.cardIconBg }]}>
              <MaterialIcons name="settings" size={22} color={theme.textMain} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Account Settings</Text>
              <Text style={styles.menuItemSubtitle}>Preferences & Security</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textDim} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={[styles.menuIconBox, { backgroundColor: theme.cardIconBg }]}>
              <MaterialIcons name="help-outline" size={22} color={theme.textMain} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Support & Documentation</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textDim} />
          </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={theme.dangerText} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <FarmruLogo width={30} height={30} shadow={theme.isDark} />
          <Text style={styles.versionText}>Farmru Mobile v2.0.0</Text>
        </View>
        
      </View>
    </View>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.isDark ? '#000' : '#EAF1EC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: theme.cardIconBg,
    borderRadius: 20,
    padding: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glassBackground,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 40,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.glassBorderStrong,
  },
  avatarInitial: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: '#FFF', // ALWAYS white as it sits on strong Soil Brown box
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: theme.textMain,
    fontSize: 22,
    fontFamily: 'Outfit_700Bold',
  },
  profilePhone: {
    color: theme.textSub,
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    marginTop: 4,
  },
  editProfileButton: {
    padding: 8,
    backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.1)' : 'rgba(98, 168, 85, 0.15)',
    borderRadius: 12,
  },
  menuList: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glassBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    color: theme.textMain,
    fontSize: 17,
    fontFamily: 'Outfit_600SemiBold',
  },
  menuItemSubtitle: {
    color: theme.textSub,
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 40,
    backgroundColor: theme.dangerBg,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(235, 127, 127, 0.3)' : 'rgba(220, 38, 38, 0.2)',
  },
  logoutText: {
    color: theme.dangerText,
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  versionText: {
    color: theme.textDim,
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    marginTop: 8,
  }
});
