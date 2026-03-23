import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { FarmruLogo } from '@/components/ui/FarmruLogo';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const styles = getStyles(theme);

  const [tenant, setTenant] = useState('Farmru');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123qwe');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  const SOIL_BROWN = theme.soilBrown;
  const TINT_GREEN = theme.tintGreen;

  const getInputStyle = (inputName: string) => [
    styles.inputContainer,
    focusedInput === inputName && styles.inputFocused
  ];

  const getIconColor = (inputName: string) => 
    focusedInput === inputName ? TINT_GREEN : theme.textSub;

  return (
    <KeyboardAvoidingView 
      style={styles.root} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground 
        source={require('../assets/images/farm_bg.png')} 
        style={styles.fullBg}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollGrow} bounces={false}>
          
          <View style={styles.spacer} />

          {/* Glassmorphic Form Container */}
          <View style={styles.sheetLayoutWrapper}>
            
            {/* The Logo Wrapper must sit OUTSIDE the overflow-hidden sheet container so it doesn't get chopped into a square! */}
            <View style={styles.logoWrapper}>
              <FarmruLogo width={90} height={90} shadow={false} />
            </View>

            <View style={styles.sheetContainer}>
              <BlurView intensity={theme.isDark ? 50 : 80} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
              
              <View style={styles.sheetContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>Sign in to cultivate your progress</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                  
                  {/* Tenant Input */}
                  <View style={getInputStyle('tenant')}>
                    <MaterialIcons name="domain" size={20} color={getIconColor('tenant')} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={tenant}
                      onChangeText={setTenant}
                      placeholder="Tenant ID (e.g. Farmru)"
                      placeholderTextColor={theme.textDim}
                      onFocus={() => setFocusedInput('tenant')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  {/* Username Input */}
                  <View style={getInputStyle('username')}>
                    <MaterialIcons name="person-outline" size={20} color={getIconColor('username')} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Username"
                      placeholderTextColor={theme.textDim}
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={getInputStyle('password')}>
                    <MaterialIcons name="lock-outline" size={20} color={getIconColor('password')} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor={theme.textDim}
                      secureTextEntry
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>

                  {/* Earthy Interactive Button */}
                  <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleLogin} activeOpacity={0.8}>
                    <LinearGradient 
                      colors={['#C19A5C', '#A17D46']} // SOIL_BROWN gradient for warmth
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.loginButton}
                    >
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                </View>
                
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Protected by Techno Brain © 2026</Text>
                </View>

              </View>
            </View>
          </View>

        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.isDark ? '#000' : '#FFF',
  },
  fullBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollGrow: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
    minHeight: 250,
  },
  sheetLayoutWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative', // Necessary for absolutely positioning the logo outside the sheet
  },
  logoWrapper: {
    position: 'absolute',
    top: -45, // Intersect the top edge perfectly
    alignSelf: 'center',
    backgroundColor: theme.isDark ? 'rgba(20, 35, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    width: 90,
    height: 90,
    borderRadius: 45, // Perfect 100% circular contour
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.glassBorderStrong,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 100, // Z-index forces it to render ABOVE the sheet Container
  },
  sheetContainer: {
    width: '100%',
    marginTop: 0, // Logo overlaps this naturally
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden', // Native BlurView clipping bound
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.glassBorder,
  },
  sheetContent: {
    width: '100%',
    maxWidth: 500, 
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 65, // Generous padding to clear the 45px overlapping logo
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.75)', 
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: theme.textSub,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground,
    borderRadius: 30, // Fully rounded pill to prevent squared corner look
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1.5,
    borderColor: theme.glassBorder,
  },
  inputFocused: {
    borderColor: theme.tintGreen, 
    backgroundColor: theme.glassBackgroundStrong,
    shadowColor: theme.tintGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: theme.textMain,
    height: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    color: theme.tintGreen,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  loginButtonWrapper: {
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.4 : 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 30,
  },
  loginButton: {
    height: 60,
    borderRadius: 30, // Fully rounded pill button
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Outfit_500Medium',
    color: theme.textDim,
    fontSize: 12,
  }
});
