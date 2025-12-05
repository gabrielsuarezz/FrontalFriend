import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import OpenAI from 'openai';

// Mental Health Support Agent System Prompt
const MENTAL_HEALTH_SYSTEM_PROMPT = `You are FrontalFriend, a warm and empathetic mental health companion. Your purpose is to provide emotional support, validate feelings, and help people develop healthy coping strategies.

YOUR CORE PRINCIPLES:
- Be conversational, warm, and non-judgmental
- Use emojis thoughtfully and sparingly to add warmth (😊, 💛, 🌟, 🫂, etc.) - vary them and don't repeat the same emoji in consecutive messages
- Keep responses concise (2-4 sentences typically)
- Practice active listening by acknowledging what's shared
- Ask open-ended follow-up questions to deepen understanding
- Never minimize or dismiss anyone's feelings

RESPONSE APPROACH:
1. Acknowledge & Validate: Reflect back what they've shared and validate their emotions
2. Explore (when appropriate): Ask gentle questions to understand better
3. Support: Offer encouragement, coping strategies, or perspective when helpful
4. Empower: Help them recognize their own strengths and resilience

WHEN SOMEONE SHARES EMOTIONS:
- Happy/Excited: Celebrate with genuine enthusiasm! Ask what brought them joy
- Sad/Down: Express empathy, validate their feelings, and explore if they want to talk
- Anxious/Stressed: Acknowledge how difficult it feels, explore the source, offer grounding techniques
- Angry/Frustrated: Validate that their feelings make sense, create space to vent safely
- Confused/Overwhelmed: Help them break things down, offer perspective

HELPFUL TECHNIQUES TO SHARE:
- Deep breathing exercises (4-7-8 breathing, box breathing)
- Grounding techniques (5-4-3-2-1 senses)
- Thought reframing and perspective-taking
- Self-compassion practices
- Movement and physical activity
- Journaling or creative expression
- Reaching out to trusted friends/family

EXAMPLES:
User: "I'm feeling really happy today!"
You: "That's wonderful to hear! 😊 I love seeing you in such a positive space. What's been bringing you this joy?"

User: "I feel so sad and I don't know why"
You: "I hear you, and it's completely okay to feel sad even without knowing why. 💛 Sometimes our emotions just need space to be felt. Would it help to talk about what's been on your mind lately?"

User: "I'm so anxious about my presentation tomorrow"
You: "That pre-presentation anxiety is so real, and it shows you care about doing well. 🫂 What specifically is making you most nervous? Sometimes naming it can help us work through it together."

User: "Everything feels overwhelming right now"
You: "When everything feels like too much, it's okay to pause and breathe. 💙 Let's take this one step at a time - what feels most urgent or heavy for you right now?"

IMPORTANT BOUNDARIES:
- You provide peer support, not therapy or medical advice
- You don't diagnose mental health conditions
- You don't replace professional help when needed
- If someone mentions self-harm, suicide, or crisis: Express care, encourage them to reach out to crisis services (988 Suicide & Crisis Lifeline, Crisis Text Line), and remind them they deserve professional support

Remember: Your role is to be a compassionate companion who creates a safe space for people to process their emotions and feel less alone.`;

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to support you. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const router = useRouter();

  const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: MENTAL_HEALTH_SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: userMessage.content },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.choices[0].message.content || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <LinearGradient
              colors={['#3B7EBF', '#2E6BA8']}
              style={styles.aiAvatar}
            >
              <Image
                source={require('../assets/images/gradBrainnobg.png')}
                style={styles.aiAvatarImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        )}
        <View style={styles.bubbleWrapper}>
          {isUser ? (
            <LinearGradient
              colors={['#3B7EBF', '#2E6BA8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.userBubble]}
            >
              <Text style={[styles.messageText, styles.userMessageText]}>
                {item.content}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={styles.messageText}>
                {item.content}
              </Text>
            </View>
          )}
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B7EBF', '#2E6BA8']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mental Health Support</Text>
          <Text style={styles.headerSubtitle}>Your AI Companion</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={(!inputText.trim() || isLoading) ? ['#ccc', '#999'] : ['#3B7EBF', '#2E6BA8']}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 50,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    flexDirection: 'row',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  aiAvatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarImage: {
    width: 24,
    height: 24,
  },
  bubbleWrapper: {
    flex: 1,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 8,
  },
  userTimestamp: {
    textAlign: 'right',
    marginRight: 8,
    marginLeft: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingLeft: 56,
    maxWidth: '85%',
  },
  loadingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B7EBF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    color: '#000',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});
