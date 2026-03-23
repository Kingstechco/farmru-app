import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '@/hooks/useThemeColors';
import { weatherAdvisories, WEATHER_FORECAST } from '@/utils/weatherEngine';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
};

// Topic categories with domain-specific suggestion pools
const TOPIC_CATEGORIES = [
  { id: 'weather', label: '🌧 Weather', color: '#38bdf8', suggestions: [
    "What should I do before Thursday's heavy rain?",
    "Will this week's rain affect my spray schedule?",
    "How much rain is expected and when?",
  ]},
  { id: 'soil', label: '🌱 Soil', color: '#c1a06a', suggestions: [
    "What is the current NPK status of my fields?",
    "How do I improve phosphorus levels quickly?",
    "When should I re-test soil pH?",
  ]},
  { id: 'crops', label: '🌾 Crops', color: '#4ade80', suggestions: [
    "When is the optimal harvest window for potatoes?",
    "How do I reduce moisture stress on tomatoes?",
    "What stage is my maize crop at?",
  ]},
  { id: 'pests', label: '🦟 Pests', color: '#f87171', suggestions: [
    "Any disease risk this week given humidity levels?",
    "How do I prevent fungal outbreaks before rain?",
    "When is the best window for pesticide application?",
  ]},
  { id: 'report', label: '📊 AI Report', color: '#a78bfa', suggestions: [
    "Generate a predictive yield forecast for this month",
    "Summarize all active farm advisories",
    "Recommend an irrigation schedule for the next 7 days",
  ]},
];

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};



// Build weather-aware initial suggestions from advisory engine
const buildWeatherSuggestions = (): string[] => {
  const weatherTips: string[] = [];
  const topAdvisory = weatherAdvisories[0];
  const heavyRainDay = WEATHER_FORECAST.find(d => d.rainMm >= 20);
  const fertWindow = WEATHER_FORECAST.find(d => d.rainMm >= 5 && d.rainMm < 20);
  
  if (heavyRainDay) {
    weatherTips.push(`Rain of ${heavyRainDay.rainMm}mm on ${heavyRainDay.day} — what should I do?`);
  }
  if (fertWindow && !heavyRainDay) {
    weatherTips.push(`Is ${fertWindow.day} a good day to apply fertiliser?`);
  }
  if (topAdvisory?.urgency === 'critical') {
    weatherTips.push(`Explain the critical weather advisory`);
  }
  return [
    ...weatherTips,
    "When should I water the maize?",
    "Any disease risks this week?",
    "Optimal fertilizer schedule?",
  ].slice(0, 4);
};

const SUGGESTIONS = buildWeatherSuggestions();

// Build weather-context greeting for AI
const buildWeatherGreeting = (): string => {
  const topAdvisory = weatherAdvisories[0];
  const heavyRainDay = WEATHER_FORECAST.find(d => d.rainMm >= 20);
  if (topAdvisory?.urgency === 'critical' && heavyRainDay) {
    return `Hello Tsedzu! ⚠️ I've detected a critical weather event — ${heavyRainDay.rainMm}mm of rain is expected on ${heavyRainDay.day}. I have ${weatherAdvisories.length} active advisories ready. How can I help you prepare?`;
  }
  if (topAdvisory?.urgency === 'positive') {
    return `Hello Tsedzu! 🌿 Good news — there's an optimal ${topAdvisory.title.split(' ')[0].toLowerCase()} window coming up this week. I have ${weatherAdvisories.length} farm advisories ready. What would you like to do first?`;
  }
  return `Hello Tsedzu! I am Farmru AI. I've analysed this week's weather forecast and have ${weatherAdvisories.length} predictive advisories. How can I assist with your farm today?`;
};

const LATEST_SUGGESTIONS = [
  "Analyze irrigation cycle vs temp",
  "Recommend harvest timeline",
  "Generate predictive yield report"
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: buildWeatherGreeting(), isUser: false, timestamp: nowTime() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(SUGGESTIONS);
  const [isSuggestionsCollapsed, setIsSuggestionsCollapsed] = useState<boolean>(false);
  
  // Animated value for typing dots
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  
  const SOIL_BROWN = theme.soilBrown;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isTyping]);

  const handleSend = (overrideText?: string) => {
    const query = (overrideText ?? inputText).trim();
    if (!query) return;
    const userMsg: Message = { id: Date.now().toString(), text: query, isUser: true, timestamp: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setIsSuggestionsCollapsed(true);
    setActiveCategory(null);

    // Generate context-aware AI response based on weather and query keywords
    setTimeout(() => {
      let aiText = "Based on your recent sensor logs, I advise triggering the smart valve briefly to lower the ambient soil temperature ahead of the upcoming heatwave.";
      
      const lowerQuery = query.toLowerCase();
      const heavyRainDay = WEATHER_FORECAST.find(d => d.rainMm >= 20);
      const fertWindow = WEATHER_FORECAST.find(d => d.rainMm >= 5 && d.rainMm < 20);
      const topAdvisory = weatherAdvisories[0];

      if (lowerQuery.includes('rain') || lowerQuery.includes('water') || lowerQuery.includes('irrigat')) {
        if (heavyRainDay) {
          aiText = `⚠️ Do not irrigate today! ${heavyRainDay.rainMm}mm of rain is expected on ${heavyRainDay.day} (${heavyRainDay.rainProbability}% probability). Suspend all irrigation systems until after the event to avoid waterlogging and waste.`;
        } else {
          aiText = `No significant rain is forecast this week. I recommend increasing your irrigation frequency by 25% starting today. Prioritise fields with moisture below 35%. Water before 8am or after 5pm to reduce evaporation.`;
        }
      } else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('fertiliser') || lowerQuery.includes('npk')) {
        if (fertWindow && !heavyRainDay) {
          aiText = `✅ Perfect timing! Apply your nitrogen-rich fertilizer today or tomorrow. Light rain of ${fertWindow.rainMm}mm is expected on ${fertWindow.day}, which will wash nutrients into the root zone efficiently without causing runoff.`;
        } else if (heavyRainDay) {
          aiText = `🚫 Do not apply fertilizer right now. Heavy rain of ${heavyRainDay.rainMm}mm on ${heavyRainDay.day} will cause runoff and waste. Wait until after ${heavyRainDay.day} — then apply within 24–48 hours of the next light rain.`;
        } else {
          aiText = `Your current NPK levels show Nitrogen at 45mg/kg (borderline). Apply a balanced 20-10-10 fertilizer this week. Avoid application on windy days over 20 kph.`;
        }
      } else if (lowerQuery.includes('advisory') || lowerQuery.includes('critical') || lowerQuery.includes('alert')) {
        aiText = topAdvisory 
          ? `Your top priority advisory: "${topAdvisory.title}". ${topAdvisory.detail} Recommended actions: ${topAdvisory.actions.slice(0, 2).join('; ')}.`
          : 'No critical advisories at this time. Check back for updates.';
      } else if (lowerQuery.includes('harvest') || lowerQuery.includes('spray')) {
        const sprayWindow = WEATHER_FORECAST.find(d => d.windKph < 15 && d.rainProbability < 20);
        aiText = sprayWindow
          ? `🌿 Ideal conditions for spraying/harvest are forecast for ${sprayWindow.day} — wind at ${sprayWindow.windKph}kph, only ${sprayWindow.rainProbability}% rain chance, temperature ${sprayWindow.tempHigh}°C. Schedule your operations for that morning.`
          : 'No optimal spray window found this week. Monitor conditions daily.';
      } else if (lowerQuery.includes('disease') || lowerQuery.includes('pest') || lowerQuery.includes('fungal')) {
        const highHumid = WEATHER_FORECAST.find(d => d.humidity >= 75);
        aiText = highHumid
          ? `⚠️ Disease risk on ${highHumid.day}! Humidity will reach ${highHumid.humidity}%, creating ideal conditions for fungal diseases. Apply a preventive fungicide before ${highHumid.day} and scout fields post-rain.`
          : 'No high-humidity events detected this week. Maintain regular pest scouting schedules.';
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: aiText, 
        isUser: false,
        timestamp: nowTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setCurrentSuggestions(LATEST_SUGGESTIONS);
      setIsSuggestionsCollapsed(false);
    }, 1500);
  };

  const handleSuggestion = (text: string) => {
    // Auto-send immediately — no extra tap required
    handleSend(text);
  };

  const handleCategoryPress = (catId: string) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      setCurrentSuggestions(SUGGESTIONS);
      return;
    }
    setActiveCategory(catId);
    const cat = TOPIC_CATEGORIES.find(c => c.id === catId);
    if (cat) setCurrentSuggestions(cat.suggestions);
    setIsSuggestionsCollapsed(false);
  };

  return (
    <LinearGradient 
      colors={[theme.bgGradientStart, theme.bgGradientEnd]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={Platform.OS !== 'web'}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Farmru Assistant</Text>
          <View style={styles.headerBadge}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <MaterialIcons name="auto-awesome" size={16} color={SOIL_BROWN} />
            </Animated.View>
            <Text style={styles.headerBadgeText}>AI Active</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.bubbleWrapper, 
                msg.isUser ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft
              ]}
            >
              {!msg.isUser && (
                <View style={[styles.avatarBox, { backgroundColor: SOIL_BROWN }]}>
                  <MaterialIcons name="eco" size={16} color="#FFF" />
                </View>
              )}
              
              <View style={{ flexShrink: 1 }}>
                <View style={[styles.glassBubble, msg.isUser ? styles.glassBubbleUser : styles.glassBubbleAI]}>
                  <BlurView intensity={theme.isDark ? 35 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                  <View style={styles.bubbleContent}>
                    <Text style={[styles.messageText, msg.isUser && styles.messageTextUser]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
                {msg.timestamp && (
                  <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 10, color: theme.textDim, marginTop: 3, alignSelf: msg.isUser ? 'flex-end' : 'flex-start', paddingHorizontal: 4 }}>
                    {msg.timestamp}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
             <View style={[styles.bubbleWrapper, styles.bubbleWrapperLeft]}>
               <View style={[styles.avatarBox, { backgroundColor: SOIL_BROWN }]}>
                 <MaterialIcons name="eco" size={16} color="#FFF" />
               </View>
               <Animated.View style={[styles.glassBubble, styles.glassBubbleAI, { paddingHorizontal: 20, paddingVertical: 16, opacity: pulseAnim }]}>
                  <BlurView intensity={theme.isDark ? 35 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                     <View style={[styles.typingDot, { backgroundColor: theme.textMain }]} />
                     <View style={[styles.typingDot, { backgroundColor: theme.textMain, opacity: 0.7 }]} />
                     <View style={[styles.typingDot, { backgroundColor: theme.textMain, opacity: 0.4 }]} />
                  </View>
               </Animated.View>
             </View>
          )}
        </ScrollView>

        {/* Floating Input Pill & Dynamic Suggestions */}
        <View style={styles.floatingInputWrapper}>
          <BlurView intensity={theme.isDark ? 80 : 90} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          
          {/* Topic category strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 7 }}>
              {TOPIC_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.id)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20,
                    backgroundColor: activeCategory === cat.id ? cat.color + '25' : theme.glassBackground,
                    borderWidth: 1.5,
                    borderColor: activeCategory === cat.id ? cat.color + '70' : theme.glassBorder,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: activeCategory === cat.id ? cat.color : theme.textSub }}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.suggestionsHeaderRow}>
            <Text style={styles.suggestionsTitle}>AI Prompts</Text>
            <TouchableOpacity onPress={() => setIsSuggestionsCollapsed(!isSuggestionsCollapsed)} style={styles.collapseButton}>
               <MaterialIcons name={isSuggestionsCollapsed ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color={theme.textSub} />
            </TouchableOpacity>
          </View>

          {!isSuggestionsCollapsed && (
            <View style={styles.suggestionsContainer}>
              {currentSuggestions.map((sug, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.suggestionChip, {
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    backgroundColor: pressed ? theme.soilBrown + '20' : theme.glassBackgroundStrong,
                  }]}
                  onPress={() => handleSuggestion(sug)}
                >
                  <Text style={styles.suggestionText}>{sug}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask your farm anything..."
                placeholderTextColor={theme.textDim}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={200}
                {...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {})}
              />
            </View>
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                !inputText.trim() && { backgroundColor: theme.cardIconBg }
              ]} 
              activeOpacity={0.7} 
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              {inputText.trim() ? (
                <LinearGradient colors={['#7BC36A', '#529642']} style={styles.sendButtonGradient}>
                   <MaterialIcons name="send" size={20} color="#FFF" />
                </LinearGradient>
              ) : (
                <View style={styles.sendButtonGradient}>
                  <MaterialIcons name="mic" size={20} color={theme.textDim} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStyles = (theme: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  root: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.isDark ? 'rgba(193, 154, 92, 0.15)' : 'rgba(193, 154, 92, 0.1)', // SOIL_BROWN tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(193, 154, 92, 0.4)' : 'rgba(193, 154, 92, 0.6)',
  },
  headerBadgeText: {
    color: theme.soilBrown,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 280, 
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },

  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-end',
    maxWidth: '92%',
  },
  bubbleWrapperLeft: { alignSelf: 'flex-start' },
  bubbleWrapperRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },

  glassBubble: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    flexShrink: 1, // Crucial for long text dialogues inside a flexDirection: 'row' wrapper to word wrap
  },
  glassBubbleAI: {
    backgroundColor: theme.glassBackground,
    borderColor: theme.glassBorder,
    borderBottomLeftRadius: 6,
  },
  glassBubbleUser: {
    borderColor: theme.isDark ? 'rgba(123, 195, 106, 0.4)' : 'rgba(98, 168, 85, 0.6)', // Vibrant green contour
    borderBottomRightRadius: 6,
  },

  bubbleContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: theme.textMain,
    lineHeight: 24,
    flexShrink: 1,
  },
  messageTextUser: {
    color: theme.textMain,
    fontFamily: 'Outfit_500Medium',
  },

  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.textMain
  },

  floatingInputWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 100 : 110,
    left: 20,
    right: 20,
    maxWidth: 700,
    alignSelf: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glassBorderStrong, // Brighter rim
    backgroundColor: theme.glassBackgroundDarker, // Solid deeper contrast
    shadowColor: '#000',
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  suggestionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    color: theme.textSub,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  collapseButton: {
    padding: 4,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: theme.glassBackgroundStrong, // Brighter
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
  },
  suggestionText: {
    color: theme.textMain, // Brighter explicit color
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
  },

  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 6,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: theme.inputBackground, // Lighter background for the text field
    borderRadius: 24,
    minHeight: 52,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: theme.glassBorderStrong,
    justifyContent: 'center',
  },
  textInput: {
    color: theme.textMain,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
