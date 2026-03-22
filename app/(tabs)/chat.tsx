import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon as MaterialIcons } from '@/components/ui/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '@/hooks/useThemeColors';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const SUGGESTIONS = [
  "When should I water the maize?",
  "Show NPK chart",
  "Any pests detected?",
  "Optimal fertilizer?"
];

// Mock conversation history
const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: "Hi Tsedzu! Your fields look healthy today. How can I help you?", isUser: false },
  { id: '2', text: "When should I apply fertilizer to the maize?", isUser: true },
  { id: '3', text: "Based on your current soil NPK levels (N is slightly low at 12mg/kg), you should apply a nitrogen-rich fertilizer within the next 3 days, ideally before the expected rain on Friday.", isUser: false },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const SOIL_BROWN = theme.soilBrown;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), text: inputText.trim(), isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    Keyboard.dismiss();
    setIsTyping(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Mock AI Response after a delay
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "I'll analyze that for you shortly. Based on current node data, conditions remain optimal.", 
        isUser: false 
      };
      setMessages(prev => [...prev, aiMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2000);
  };

  const handleSuggestion = (text: string) => {
    setInputText(text);
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
              
              <View style={[styles.glassBubble, msg.isUser ? styles.glassBubbleUser : styles.glassBubbleAI]}>
                <BlurView intensity={theme.isDark ? 35 : 70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
                <View style={styles.bubbleContent}>
                  <Text style={[styles.messageText, msg.isUser && styles.messageTextUser]}>
                    {msg.text}
                  </Text>
                </View>
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

        {/* Floating Input Pill */}
        <View style={styles.floatingInputWrapper}>
          <BlurView intensity={theme.isDark ? 80 : 90} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          
          <View style={styles.suggestionsContainer}>
            {SUGGESTIONS.map((sug, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSuggestion(sug)}>
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              {inputText.trim() ? (
                <LinearGradient colors={['#7BC36A', '#529642']} style={styles.sendButtonGradient}>
                   <MaterialIcons name="send" size={20} color="#FFF" />
                </LinearGradient>
              ) : (
                <MaterialIcons name="send" size={20} color={theme.textDim} />
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
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
