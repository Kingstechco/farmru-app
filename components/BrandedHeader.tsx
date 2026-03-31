import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';

export type HeaderImageVariant = 'leaf' | 'abstract' | 'soil' | 'harvest';

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  imageVariant: HeaderImageVariant;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: any;
}

const IMAGES = {
  leaf: require('../assets/images/farmru_leaf.webp'),
  abstract: require('../assets/images/farmru_abstract.webp'),
  soil: require('../assets/images/farmru_soil.webp'),
  harvest: require('../assets/images/farmru_harvest.webp'),
};

/**
 * A shared, responsive header component that embeds Farmru branded imagery.
 * Clips image to header zone and applies adaptive opacity + gradient fade.
 */
export const BrandedHeader = ({ 
  title, 
  subtitle, 
  imageVariant, 
  leftSlot, 
  rightSlot, 
  style 
}: BrandedHeaderProps) => {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  return (
    <View style={{ paddingTop: insets.top }}>
      <ImageBackground
        source={IMAGES[imageVariant]}
        style={[styles.header, {
          paddingTop: Platform.OS === 'web' ? 24 : 16,
          overflow: 'hidden',
        }, style]}
        imageStyle={{ 
          opacity: theme.isDark ? 0.28 : 0.18, 
          resizeMode: 'cover' 
        }}
      >
        {/* Soft gradient fade at the bottom to blend into screen background */}
        <LinearGradient
          colors={['transparent', theme.bgGradientStart]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          start={{ x: 0.5, y: 0.6 }}
          end={{ x: 0.5, y: 1 }}
        />

        <View style={styles.headerContent}>
          {leftSlot && (
            <View style={styles.leftContainer}>
              {leftSlot}
            </View>
          )}

          <View style={styles.centerContainer}>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            {title && <Text style={styles.headerTitle}>{title}</Text>}
          </View>

          {rightSlot && (
            <View style={styles.rightContainer}>
              {rightSlot}
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSubtitle: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)', // Base generic color, screens can override via theme
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#FFFFFF', // Base generic color
  },
});
