// Farmru Brand Colors

// Exact colors extracted from the Farmru logo
const TINT_GREEN = '#62A855'; // The leaf green from the sprout
const SOIL_BROWN = '#C19A5C'; // The earthy brown from the center
const NAVY_BLUE = '#203A5A'; // The blue from the border dots

export const Colors = {
  light: {
    // Core Backgrounds
    background: '#F9FAFB', // Modern off-white
    card: '#FFFFFF',
    
    // Text
    text: NAVY_BLUE,
    muted: '#6B7280',
    
    // Core Brand Colors (extracted from logo)
    primary: TINT_GREEN,
    primaryDark: '#4A8C3E',
    secondary: SOIL_BROWN,
    navy: NAVY_BLUE,
    
    // UI Elements
    tint: TINT_GREEN,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: TINT_GREEN,
    border: 'rgba(32, 58, 90, 0.1)',
    wash: '#F3F4F6',
    
    // Semantics
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  dark: {
    background: '#111827',
    card: '#1F2937',
    
    text: '#F9FAFB',
    muted: '#9CA3AF',
    
    primary: TINT_GREEN,
    primaryDark: '#4A8C3E',
    secondary: SOIL_BROWN,
    navy: '#374151', // Lighter navy for dark mode cards
    
    tint: TINT_GREEN,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: TINT_GREEN,
    border: 'rgba(255,255,255,0.1)',
    wash: '#111827',

    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};
