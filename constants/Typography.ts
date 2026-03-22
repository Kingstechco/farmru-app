// Typography Constants for Farmru

// Since we don't have Source Sans Pro pre-installed right now, we can use system defaults 
// or common web safe fallbacks until the font is loaded via expo-font.

export const Typography = {
  family: {
    regular: 'System', // Will map to San Francisco on iOS, Roboto on Android
    bold: 'System',
    heading: 'System',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
};
