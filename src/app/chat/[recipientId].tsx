import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { initialChatMessages } from '../../services/trainerService';
import { ChatMessage } from '../../types/trainer';
import {
  ArrowLeft,
  Send,
  Image,
  Mic,
  CheckCheck,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react-native';

export default function ChatScreen() {
  const { theme } = useTheme();
  const { user, role } = useAuthStore();
  const params = useLocalSearchParams<{ recipientId: string }>();

  const recipientId = params.recipientId || 'usr_member_101';
  const initialList = initialChatMessages[recipientId] || initialChatMessages.usr_member_101;

  const [messages, setMessages] = useState<ChatMessage[]>(initialList);
  const [inputText, setInputText] = useState('');

  const isTrainer = role === 'trainer';
  const otherPartyName = isTrainer ? 'Rajesh Kumar (Member)' : 'Coach Vikram Sharma (Trainer)';

  const quickTemplates = isTrainer
    ? [
        'Great form on bench today! Keep shoulders packed.',
        'Remember to drink 3.5L water & hit 140g protein today.',
        'Check out the new Pull routine I assigned to your account.',
      ]
    : [
        'Hey Coach, what should my target weight be for squats today?',
        'Bench session felt amazing, no shoulder discomfort!',
        'Can I swap Lat Pulldowns for Pull-ups today?',
      ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_sender',
      senderName: user?.fullName || 'User',
      senderRole: isTrainer ? 'trainer' : 'member',
      text: text.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate auto-reply from coach if member sends
    if (!isTrainer) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderId: 'usr_trainer_201',
          senderName: 'Coach Vikram Sharma',
          senderRole: 'trainer',
          text: 'Got it, Rajesh! Keep that intensity up. I reviewed your log — great work hitting your reps today 💪',
          timestamp: 'Just now',
          isRead: true,
        };
        setMessages((prev) => [...prev, reply]);
      }, 1400);
    }
  };

  const handleAttachImage = () => {
    Alert.alert('Attach Media', 'Photo / Workout form video selected from gallery.');
  };

  const handleVoiceNote = () => {
    Alert.alert('Voice Note', 'Voice note recorded (0:12s). Ready to send.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Chat Header Bar */}
        <View style={[styles.chatHeader, { backgroundColor: theme.colors.cardElevated, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => safeGoBack('/(tabs)/profile')} style={styles.backBtn}>
            <ArrowLeft size={18} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.recipientTitle, { color: theme.colors.text }]}>
              {otherPartyName}
            </Text>
            <View style={styles.onlineStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { color: theme.colors.success }]}>
                Active in Gym • Online
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Dialing Coach', 'Connecting voice call with Coach Vikram...')}
            style={[styles.phoneBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <PhoneCall size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Message Bubble List */}
        <ScrollView
          contentContainerStyle={styles.messageScroll}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isMe = isTrainer ? msg.senderRole === 'trainer' : msg.senderRole === 'member';

            return (
              <View
                key={msg.id}
                style={[
                  styles.bubbleWrapper,
                  isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderBottomRightRadius: 2,
                        }
                      : {
                          backgroundColor: theme.colors.cardElevated,
                          borderColor: theme.colors.border,
                          borderWidth: 1,
                          borderBottomLeftRadius: 2,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: isMe ? theme.colors.primaryContrast : theme.colors.text,
                        fontWeight: isMe ? '600' : '400',
                      },
                    ]}
                  >
                    {msg.text}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.timestampText,
                        { color: isMe ? 'rgba(0,0,0,0.6)' : theme.colors.textMuted },
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                    {isMe && <CheckCheck size={14} color="rgba(0,0,0,0.6)" />}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Message Suggestions */}
        <View style={[styles.templatesContainer, { borderTopColor: theme.colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
            {quickTemplates.map((tmpl, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSendMessage(tmpl)}
                style={[styles.templateChip, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.templateText, { color: theme.colors.textSecondary }]}>
                  "{tmpl}"
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Field */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleAttachImage} style={styles.attachBtn}>
            <Image size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleVoiceNote} style={styles.attachBtn}>
            <Mic size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message or workout question..."
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.cardElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
          />

          <TouchableOpacity
            onPress={() => handleSendMessage()}
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Send size={18} color={theme.colors.primaryContrast} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  recipientTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  phoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrapper: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  templatesContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  templatesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  templateText: {
    fontSize: 11,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  attachBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
