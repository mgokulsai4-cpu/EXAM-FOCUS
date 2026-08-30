import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAI, useStudy } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance, useFloatAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { AIQuickAction } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AIAssistantScreen() {
  const { subjectId, topicId } = useLocalSearchParams();
  const { messages, isListening, isSpeaking, isThinking, currentTopic, quickActions, sendMessage, sendVoiceMessage, setListening, setSpeaking, setThinking, setCurrentTopic, getQuickActionPrompt, clearChat } = useAI();
  const { subjects, getSubjectTopics } = useStudy();
  const { light, medium } = useHaptics();

  const [inputText, setInputText] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const subject = subjectId ? subjects.find(s => s.id === subjectId) : null;
  const topic = topicId && subjectId ? getSubjectTopics(subjectId).find(t => t.id === topicId) : null;
  const gradientColors = subject?.gradient || ['#0ea5e9', '#8b5cf6'];

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);

  const floatStyle = useFloatAnimation(8, 4000);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isThinking || isSpeaking) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 800 }, () => {
          pulseScale.value = withTiming(1, { duration: 800 });
        }),
        -1
      );
    } else {
      pulseScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [isThinking, isSpeaking]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (topicId) {
      setCurrentTopic(topic?.name || '');
    } else if (subjectId) {
      setCurrentTopic(subject?.name || '');
    }
  }, [subjectId, topicId]);

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    medium();
    sendMessage(inputText);
    setInputText('');
    setShowQuickActions(false);
  };

  const handleQuickAction = (action: AIQuickAction) => {
    medium();
    const prompt = getQuickActionPrompt(action.action);
    sendMessage(prompt, action.action);
    setShowQuickActions(false);
  };

  const handleVoicePress = () => {
    if (isListening) {
      setListening(false);
    } else {
      setListening(true);
      setTimeout(() => {
        sendVoiceMessage('voice-message');
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.aiAvatar, { borderColor: gradientColors[0] }, floatStyle, pulseStyle]}>
            <View style={styles.aiOrbInner}>
              {isListening && <Ionicons name="mic" size={24} color="#fff" />}
              {!isListening && isThinking && <Ionicons name="sparkles" size={24} color="#fff" />}
              {!isListening && !isThinking && <Ionicons name="chatbubbles" size={24} color="#fff" />}
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.aiName}>AI Study Companion</Text>
            <Text style={styles.aiStatus}>
              {isListening ? 'Listening...' : isThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Ready to help'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => { clearChat(); medium(); }} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        style={styles.messagesWrapper}
      >
        <Animated.View style={entrance1}>
          {messages.length === 0 && (
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeText}>Hey! What are we learning today?</Text>
              {subject && <Text style={styles.welcomeSubject}>I see you're studying <Text style={{ color: gradientColors[0] }}>{subject.name}</Text>. How can I help?</Text>}
            </View>
          )}
          {messages.map((message, i) => (
            <MessageBubble key={message.id} message={message} index={i} gradientColors={gradientColors} />
          ))}
          {isThinking && <ThinkingIndicator gradientColors={gradientColors} />}
        </Animated.View>
      </ScrollView>

      <Animated.View style={entrance2}>
        {showQuickActions && messages.length < 3 && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsLabel}>QUICK ACTIONS</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, i) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickAction, { borderColor: action.color }]}
                  onPress={() => handleQuickAction(action)}
                >
                  <Ionicons name={getActionIcon(action.action)} size={20} color={action.color} />
                  <Text style={[styles.quickActionText, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View style={entrance3}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              multiline
              maxLength={500}
              onFocus={() => setShowQuickActions(false)}
            />
            <TouchableOpacity onPress={handleVoicePress} style={[styles.voiceButton, isListening && styles.voiceActive]}>
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? '#ef4444' : gradientColors[0]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSend} disabled={!inputText.trim() || isThinking} style={[styles.sendButton, { backgroundColor: gradientColors[0] }]}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, index, gradientColors }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  const isUser = message.role === 'user';

  return (
    <Animated.View style={[entranceStyle, styles.messageWrapper, isUser ? styles.userMessage : styles.aiMessage]}>
      {!isUser && (
        <View style={styles.aiAvatarSmall}>
          <View style={[styles.aiOrbSmall, { borderColor: gradientColors[0] }]}>
            <Ionicons name="sparkles" size={14} color={gradientColors[0]} />
          </View>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{message.content}</Text>
        <Text style={[styles.messageTime, isUser ? styles.userTime : styles.aiTime]}>{formatTime(message.timestamp)}</Text>
      </View>
      {isUser && <View style={styles.spacer} />}
    </Animated.View>
  );
}

function ThinkingIndicator({ gradientColors }: any) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    dot1.value = withRepeat(withTiming(1, { duration: 400 }, () => { dot1.value = withTiming(0, { duration: 400 }); }), -1);
    dot2.value = withDelay(150, withRepeat(withTiming(1, { duration: 400 }, () => { dot2.value = withTiming(0, { duration: 400 }); }), -1));
    dot3.value = withDelay(300, withRepeat(withTiming(1, { duration: 400 }, () => { dot3.value = withTiming(0, { duration: 400 }); }), -1));
  }, []);

  const dotStyle1 = useAnimatedStyle(() => ({ opacity: interpolate(dot1.value, [0, 1], [0.3, 1]) }));
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: interpolate(dot2.value, [0, 1], [0.3, 1]) }));
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: interpolate(dot3.value, [0, 1], [0.3, 1]) }));

  return (
    <View style={styles.thinkingWrapper}>
      <View style={styles.aiAvatarSmall}>
        <View style={[styles.aiOrbSmall, { borderColor: gradientColors[0] }]}>
          <Ionicons name="sparkles" size={14} color={gradientColors[0]} />
        </View>
      </View>
      <View style={styles.thinkingBubble}>
        <View style={styles.thinkingDots}>
          <Animated.View style={[styles.thinkingDot, dotStyle1]} />
          <Animated.View style={[styles.thinkingDot, dotStyle2]} />
          <Animated.View style={[styles.thinkingDot, dotStyle3]} />
        </View>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    explain: 'school-outline',
    summarize: 'document-text-outline',
    example: 'code-outline',
    exam_important: 'trophy-outline',
    quiz_me: 'help-circle-outline',
    revise: 'refresh-outline',
  };
  return icons[action] || 'sparkles';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 },
  aiAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  aiOrbInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(14, 165, 233, 0.2)', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  aiName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  aiStatus: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  clearButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  messagesWrapper: { flex: 1 },
  messagesContainer: { paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  welcomeMessage: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  welcomeText: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold' },
  welcomeSubject: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'Inter_500Medium' },
  messageWrapper: { flexDirection: 'row', gap: 8 },
  userMessage: { flexDirection: 'row-reverse' },
  aiAvatarSmall: { width: 32, height: 32, marginTop: 4 },
  aiOrbSmall: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
  bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: '#0ea5e9', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  messageText: { fontSize: 15, lineHeight: 22, fontFamily: 'Inter_500Medium' },
  userText: { color: '#fff' },
  aiText: { color: 'rgba(255,255,255,0.9)' },
  messageTime: { fontSize: 10, marginTop: 6, fontFamily: 'Inter_500Medium' },
  userTime: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  aiTime: { color: 'rgba(255,255,255,0.3)' },
  thinkingWrapper: { flexDirection: 'row', gap: 8 },
  thinkingBubble: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  thinkingDots: { flexDirection: 'row', gap: 4 },
  thinkingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: gradientColors[0] },
  quickActionsContainer: { paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  quickActionsLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'SpaceGrotesk_700Bold' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 100 },
  quickActionText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  inputContainer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginRight: 12 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#fff', maxHeight: 120, fontFamily: 'Inter_500Medium' },
  voiceButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)', alignItems: 'center', justifyContent: 'center' },
  voiceActive: { backgroundColor: '#ef444430', borderColor: '#ef4444' },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
});