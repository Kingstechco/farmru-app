import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

// ─── Help Topics ───────────────────────────────────────────────
const HELP_TOPICS = [
  {
    icon: 'eco',
    color: '#4ade80',
    title: 'Using Ask Farmru AI',
    content: 'Ask Farmru is your personal predictive assistant. Tap the glowing green leaf button at the bottom of the screen to start a chat. You can ask about weather risks, optimal watering times, soil pH amendments, or request a complete predictive yield report based on your live sensor data.',
  },
  {
    icon: 'memory',
    color: '#38bdf8',
    title: 'Connecting & Syncing Nodes',
    content: 'To connect a new soil or weather node, navigate to the Devices page and tap the (+). Ensure your node is powered on and within Bluetooth or LoRa range. Farmru automatically syncs data every 5 minutes when Auto Sync is enabled in Settings.',
  },
  {
    icon: 'water-drop',
    color: '#3b82f6',
    title: 'Understanding Soil Metrics',
    content: 'Your Dashboard shows N-P-K (Nitrogen, Phosphorus, Potassium) levels as percentages of optimal concentration. If a nutrient drops below 40%, the bar turns orange and Ask Farmru will generate an advisory for suggested fertilizer amendments.',
  },
  {
    icon: 'warning',
    color: '#ef4444',
    title: 'Weather & Pest Advisories',
    content: 'Farmru analyzes upcoming weather patterns against your crop types. If high humidity and temperatures align to create a fungal risk (e.g. blight), you will receive a Weather Advisory alert in your Action Center and via push notification.',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const router = useRouter();
  
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <LinearGradient colors={[theme.bgGradientStart, theme.bgGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16) }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textMain} />
          </Pressable>
          <View>
            <Text style={[styles.headerSub, { color: theme.textSub }]}>Support Center</Text>
            <Text style={[styles.headerTitle, { color: theme.textMain }]}>Help & Guides</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Support Card */}
        <LinearGradient colors={['#3D7A3A', '#6B9E3A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.contactCard}>
          <View style={styles.contactIconBg}>
            <MaterialIcons name="support-agent" size={28} color="#3D7A3A" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.contactTitle}>Need more help?</Text>
            <Text style={styles.contactSub}>Our agronomy and technical teams are ready to assist you.</Text>
          </View>
          <Pressable style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact Us</Text>
          </Pressable>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Frequently Asked Questions</Text>

        {/* FAQs Accordion */}
        <View style={{ gap: 12 }}>
          {HELP_TOPICS.map((topic, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <Pressable
                key={i}
                onPress={() => setExpandedIndex(isExpanded ? -1 : i)}
                style={[styles.topicCard, { borderColor: theme.glassBorder, backgroundColor: theme.glassBackground }]}
              >
                <BlurView intensity={theme.isDark ? 20 : 60} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                <View style={styles.topicHeader}>
                  <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                    <MaterialIcons name={topic.icon as any} size={20} color={topic.color} />
                  </View>
                  <Text style={[styles.topicTitle, { color: theme.textMain }]}>{topic.title}</Text>
                  <MaterialIcons name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={theme.textDim} />
                </View>
                {isExpanded && (
                  <View style={styles.topicBody}>
                    <Text style={[styles.topicContent, { color: theme.textSub }]}>{topic.content}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerSub: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginBottom: 2 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24 },
  scrollContent: { padding: 20, paddingBottom: 120, maxWidth: 700, alignSelf: 'center', width: '100%' },
  contactCard: {
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center',
    marginBottom: 32, shadowColor: '#3D7A3A', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  contactIconBg: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  contactTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#fff' },
  contactSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2, paddingRight: 10 },
  contactBtn: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
  },
  contactBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#3D7A3A' },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, marginBottom: 16 },
  topicCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  topicHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  topicIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  topicBody: { paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 64 },
  topicContent: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 22 },
});
