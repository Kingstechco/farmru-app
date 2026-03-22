// Farmru Brand Colors

const tintColorLight = '#007BFF';
const tintColorDark = '#4CAF50';

export const Colors = {
  light: {
    text: '#1A237E', // Dark Navy / Ink
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Core Brand Identity
    primary: '#007BFF',
    primaryDark: '#0056b3',
    secondary: '#17A2B8',
    
    // Agriculture Natural Tones
    leafGreen: '#4CAF50',
    successGreen: '#28A745',
    soilBrown: '#B08B4E',
    
    // Semantic
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    
    // Grays / Borders
    card: '#FFFFFF',
    border: 'rgba(26, 35, 126, 0.1)',
    muted: '#737373',
    wash: '#F8F9FA'
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212', // Pure dark for mobile OLED, or very dark navy
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    primary: '#4CAF50', // Use green for primary active states in dark mode to reduce glare
    primaryDark: '#388E3C',
    secondary: '#17A2B8',
    
    leafGreen: '#4CAF50',
    successGreen: '#28A745',
    soilBrown: '#B08B4E',
    
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    
    card: '#1E1E1E',
    border: 'rgba(255,255,255,0.1)',
    muted: '#A3A3A3',
    wash: '#1A1A1A'
  },
};
