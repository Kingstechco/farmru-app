import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, Stack } from 'expo-router';

const ACTIVITY_DATA = [
  { id: 1, title: 'Irrigation System Activated', subtitle: 'Plot 2 Matrix', time: '10 mins ago', icon: 'water-drop', color: '#38bdf8' },
  { id: 2, title: 'Phosphorus Applied', subtitle: 'Applied to Maize Plot B', time: '2 hours ago', icon: 'local-florist', color: '#f59e0b' },
  { id: 3, title: 'Soil Sensor Node Offline', subtitle: 'Check power supply on Node 4', time: 'Yesterday', icon: 'warning', color: '#ef4444' },
  { id: 4, title: 'Yield Projection Updated', subtitle: 'Crop yield expected to increase by 4%', time: 'Monday', icon: 'trending-up', color: '#22c55e' },
  { id: 5, title: 'Battery Replaced', subtitle: 'Main pump station', time: 'Sunday', icon: 'battery-full', color: '#f59e0b' },
];

export default function ActivityLogScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  const styles = getStyles(theme);
  
  const [query, setQuery] = useState('');

  const navigateToChat = () => {
    if (!query.trim()) return;
    router.push('/chat'); // In production, we would pass query params: ?initialQuery=query
  };

  return (
    <LinearGradient 
      colors={[theme.bgGradientStart, theme.bgGradientEnd]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="close" size={24} color={theme.textMain} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>System Record</Text>
          <Text style={styles.headerTitle}>Activity Log</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/chat')} style={styles.aiButton}>
          <MaterialIcons name="auto-awesome" size={20} color={theme.tintGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.glassCard}>
          <BlurView intensity={theme.isDark ? 40 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          <View style={styles.glassContent}>
            {ACTIVITY_DATA.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.activityRow, 
                  index === ACTIVITY_DATA.length - 1 && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }
                ]}
              >
                <View style={[styles.activityIconBg, { backgroundColor: `${item.color}22` }]}>
                  {/* @ts-ignore */}
                  <MaterialIcons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.aiHelperText}>
          Need help? Ask Farmru AI to review your past activities and give you simple advice.
        </Text>

      </ScrollView>

      {/* AI Query Bar */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.floatingInputWrapper}
      >
        <BlurView intensity={theme.isDark ? 80 : 90} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        
        <View style={styles.suggestionsHeaderRow}>
          <Text style={styles.suggestionsTitle}>Pre-configured AI Analysis</Text>
        </View>

        <View style={styles.suggestionsContainer}>
          <TouchableOpacity style={styles.suggestionChip} onPress={() => { setQuery("Analyze last week's water usage impact"); }}>
            <Text style={styles.suggestionText}>Analyze water usage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionChip} onPress={() => { setQuery("Why did Node 4 go offline?"); }}>
            <Text style={styles.suggestionText}>Diagnose Node 4</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask AI about these activities..."
              placeholderTextColor={theme.textDim}
              value={query}
              onChangeText={setQuery}
              multiline
              maxLength={200}
              {...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {})}
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, !query.trim() && { backgroundColor: theme.cardIconBg }]} 
            activeOpacity={0.8}
            onPress={navigateToChat}
            disabled={!query.trim()}
          >
            <MaterialIcons name="send" size={20} color={query.trim() ? '#FFF' : theme.textDim} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.isDark ? 'rgba(98, 168, 85, 0.15)' : 'rgba(98, 168, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 240, // padding for query
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  glassContent: {
    padding: 24,
  },
  activityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.glassBorder, 
    paddingBottom: 20,
    marginBottom: 20,
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextContainer: { flex: 1, gap: 4 },
  activityTitle: { 
    fontSize: 16, 
    color: theme.textMain, 
    fontFamily: 'Outfit_600SemiBold' 
  },
  activitySubtitle: { 
    fontSize: 13, 
    color: theme.textSub, 
    fontFamily: 'Outfit_400Regular' 
  },
  activityTime: { 
    fontSize: 13, 
    color: theme.textDim, 
    fontFamily: 'Outfit_500Medium' 
  },
  aiHelperText: {
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  floatingInputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  suggestionsHeaderRow: {
    marginBottom: 10,
  },
  suggestionsTitle: {
    color: theme.tintGreen,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: theme.glassBackgroundStrong,
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionText: {
    color: theme.textMain,
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  textInput: {
    color: theme.textMain,
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.tintGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.tintGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
