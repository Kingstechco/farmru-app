/**
 * AskFarmruSheet
 * A bottom-sheet modal for the Farmru AI Assistant.
 * - Slides up when opened
 * - Swipe-down to dismiss (PanResponder)
 * - Self-contained chat state
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Animated, PanResponder, Modal, KeyboardAvoidingView, Platform,
  Pressable, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { weatherAdvisories, WEATHER_FORECAST } from '@/utils/weatherEngine';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.92;

// ─── Types ─────────────────────────────────────────────────────
type Message = { id: string; text: string; isUser: boolean; timestamp: string };

// ─── Helpers ───────────────────────────────────────────────────
const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const TOPIC_CATEGORIES = [
  { id: 'weather', label: '🌧 Weather', color: '#38bdf8' },
  { id: 'soil',    label: '🌱 Soil',    color: '#c1a06a' },
  { id: 'crops',   label: '🌾 Crops',   color: '#4ade80' },
  { id: 'pests',   label: '🦟 Pests',   color: '#f87171' },
  { id: 'report',  label: '📊 Report',  color: '#a78bfa' },
];

const buildGreeting = () => {
  const topAdvisory = weatherAdvisories[0];
  const heavyRain = WEATHER_FORECAST.find(d => d.rainMm >= 20);
  if (topAdvisory?.urgency === 'critical' && heavyRain)
    return `Hello Tsedzu! ⚠️ Critical alert — ${heavyRain.rainMm}mm expected on ${heavyRain.day}. I have ${weatherAdvisories.length} advisories ready. How can I help?`;
  return `Hello Tsedzu! I am Ask Farmru. I've analysed this week's weather and have ${weatherAdvisories.length} predictive advisories ready.`;
};

const buildSuggestions = () => {
  const heavy = WEATHER_FORECAST.find(d => d.rainMm >= 20);
  return [
    heavy ? `Rain of ${heavy.rainMm}mm on ${heavy.day} — what should I do?` : 'Any weather risks this week?',
    'When should I water the maize?',
    'Any disease risks this week?',
    'Generate a predictive yield report',
  ];
};

// Simple AI responder
const respond = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('rain') || t.includes('water') || t.includes('irrigat'))
    return `Based on this week's forecast, heavy rain is expected Thursday (${WEATHER_FORECAST.find(d => d.rainMm >= 15)?.rainMm ?? 38}mm). I recommend pausing irrigation until Friday and checking drainage channels. Want a full irrigation plan?`;
  if (t.includes('soil') || t.includes('ph') || t.includes('npk'))
    return `Your Maize Plot soil shows nitrogen at 68% optimal. Phosphorus needs attention — I recommend applying 15kg/ha before the next rain event for maximum uptake. Shall I create a soil amendment schedule?`;
  if (t.includes('pest') || t.includes('disease') || t.includes('fungal'))
    return `With 88% humidity forecast Thursday, fungal risk is elevated. I recommend applying preventive fungicide within your spray window (Mon–Wed). Blight and powdery mildew are the primary risks. Want a treatment protocol?`;
  if (t.includes('harvest') || t.includes('yield') || t.includes('crop'))
    return `Your Maize Plot is 85 days from harvest in the Vegetative Stage. Based on current conditions, I project a yield of 1.4 t/ha — top 10% for your region. Shall I compile a full harvest readiness report?`;
  if (t.includes('report') || t.includes('summary') || t.includes('advisory'))
    return `I've compiled 3 active advisories for your farm: (1) High humidity disease risk Thu, (2) Optimal fertiliser window Mon–Wed, (3) Soil pH correction needed for Tomato Grid. Want me to walk through each one?`;
  return `That's a great question about your farm. Based on current sensor data and weather patterns, I recommend monitoring soil moisture levels and checking back after Thursday's rain event. Is there a specific field you'd like me to analyse in more detail?`;
};

// ─── Sheet component ───────────────────────────────────────────
interface AskFarmruSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AskFarmruSheet({ visible, onClose }: AskFarmruSheetProps) {
  const theme = useThemeColors();

  // Slide animation — 0 = visible at bottom, SHEET_HEIGHT = hidden below
  const slideY   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: buildGreeting(), isUser: false, timestamp: nowTime() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState(buildSuggestions);
  const scrollRef = useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState(visible);

  // ── Open / close animation ─────────────────────────────────
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 68, friction: 14 }),
          Animated.timing(bgOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  // ── PanResponder for swipe-down dismiss ────────────────────
  const panRef = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panRef.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.6) {
          // Dismiss gracefully: sync pan into slideY, reset pan, and let useEffect exit animation run
          slideY.setValue(g.dy);
          panRef.setValue(0);
          onClose();
        } else {
          // Snap back
          Animated.spring(panRef, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
        }
      },
    })
  ).current;

  // ── Send message ───────────────────────────────────────────
  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: text.trim(), isUser: true, timestamp: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: respond(text), isUser: false, timestamp: nowTime() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 1200 + Math.random() * 800);
  }, []);

  const combinedY = Animated.add(slideY, panRef);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView tint="dark" intensity={30} style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: combinedY }] }]}
      >
        <LinearGradient
          colors={theme.isDark
            ? ['rgba(10,18,14,0.98)', 'rgba(8,14,20,0.99)']
            : ['rgba(248,252,248,0.98)', 'rgba(245,250,246,0.99)']}
          style={StyleSheet.absoluteFill}
        />
        <BlurView
          tint={theme.isDark ? 'dark' : 'light'}
          intensity={90}
          style={StyleSheet.absoluteFill}
        />

        {/* Drag handle area */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#3D7A3A', '#6B9E3A']} style={styles.headerIcon}>
              <MaterialIcons name="eco" size={18} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textMain }]}>Ask Farmru</Text>
              <Text style={[styles.headerSub, { color: '#4ade80' }]}>● AI Active</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.textSub} />
          </TouchableOpacity>
        </View>

        {/* Topic chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}>
          {TOPIC_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => send(cat.label.replace(/^[\S\s]*?\s/, ''))}
              style={[styles.chip, { borderColor: cat.color + '60', backgroundColor: cat.color + '12' }]}
            >
              <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: cat.color }}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Messages */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.msgList}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 14 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => (
              <View key={msg.id} style={[styles.bubble, msg.isUser ? styles.bubbleUser : styles.bubbleAI]}>
                {!msg.isUser && (
                  <LinearGradient colors={['#3D7A3A', '#6B9E3A']} style={styles.aiBadge}>
                    <MaterialIcons name="eco" size={12} color="#fff" />
                  </LinearGradient>
                )}
                <View style={[
                  styles.bubbleBody,
                  msg.isUser
                    ? { backgroundColor: '#3D7A3A', borderBottomRightRadius: 4 }
                    : { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderBottomLeftRadius: 4 },
                ]}>
                  <Text style={[styles.bubbleText, { color: msg.isUser ? '#fff' : theme.textMain }]}>{msg.text}</Text>
                  <Text style={[styles.bubbleTime, { color: msg.isUser ? 'rgba(255,255,255,0.6)' : theme.textDim }]}>{msg.timestamp}</Text>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.bubble, styles.bubbleAI]}>
                <LinearGradient colors={['#3D7A3A', '#6B9E3A']} style={styles.aiBadge}>
                  <MaterialIcons name="eco" size={12} color="#fff" />
                </LinearGradient>
                <View style={[styles.bubbleBody, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderBottomLeftRadius: 4 }]}>
                  <Text style={[styles.bubbleText, { color: theme.textSub }]}>Ask Farmru is thinking…</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggestion chips */}
          {messages.length <= 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
              {suggestions.map((s, i) => (
                <Pressable key={i} onPress={() => send(s)} style={[styles.suggChip, { borderColor: theme.glassBorder, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: theme.textSub }}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Input bar */}
          <View style={[styles.inputRow, { borderTopColor: theme.glassBorder, backgroundColor: theme.isDark ? 'rgba(14,22,14,0.9)' : 'rgba(248,252,248,0.95)' }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask your farm anything…"
              placeholderTextColor={theme.textDim}
              style={[styles.input, { color: theme.textMain, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderColor: theme.glassBorder }]}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => send(input)}
            />
            <Pressable
              onPress={() => send(input)}
              style={({ pressed }) => [styles.sendBtn, { backgroundColor: '#3D7A3A', opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            >
              <MaterialIcons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleArea: {
    paddingTop: 12, paddingBottom: 4, alignItems: 'center',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3D7A3A', shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18 },
  headerSub: { fontFamily: 'Outfit_500Medium', fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  chips: { flexShrink: 0, maxHeight: 44 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
  },
  msgList: { flex: 1 },
  bubble: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  bubbleUser: { flexDirection: 'row-reverse' },
  bubbleAI: {},
  aiBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    marginBottom: 4,
  },
  bubbleBody: {
    maxWidth: '78%', borderRadius: 18, padding: 12,
    gap: 4,
  },
  bubbleText: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontFamily: 'Outfit_400Regular', fontSize: 10, alignSelf: 'flex-end' },
  suggestions: { flexShrink: 0, maxHeight: 52 },
  suggChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: 'Outfit_400Regular', fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3D7A3A', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
