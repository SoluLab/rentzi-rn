import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import {
  Bot,
  Send,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Search,
  Home,
} from 'lucide-react-native';
export default function AIAssistantScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your luxury real estate AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const quickActions = [
    {
      icon: Search,
      title: 'Find Properties',
      subtitle: 'Search luxury properties',
      action: () => handleQuickAction('Find me luxury properties in Manhattan'),
    },
    {
      icon: TrendingUp,
      title: 'Investment Advice',
      subtitle: 'Get market insights',
      action: () => handleQuickAction('What are the best investment opportunities?'),
    },
    {
      icon: Home,
      title: 'Property Analysis',
      subtitle: 'Analyze property value',
      action: () => handleQuickAction('Analyze this property for investment potential'),
    },
  ];
  const handleQuickAction = (text: string) => {
    setMessage(text);
    handleSendMessage(text);
  };
  const handleSendMessage = (text?: string) => {
    const messageText = text || message;
    if (!messageText.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "I understand you're looking for assistance. Our AI is currently being enhanced to provide you with the most accurate luxury real estate insights. Please check back soon!",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };
  return (
    <View style={styles.container}>
      <Header title="AI Assistant" showBackButton={false} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Quick Actions
          </Typography>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} onPress={action.action} style={styles.quickActionCard}>
                <action.icon size={24} color={colors.primary.gold} />
                <View style={styles.quickActionText}>
                  <Typography variant="body">{action.title}</Typography>
                  <Typography variant="caption" color="secondary">
                    {action.subtitle}
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Chat Messages */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Conversation
          </Typography>
          <View style={styles.messagesContainer}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageCard, msg.isBot ? styles.botMessage : styles.userMessage]}
              >
                {msg.isBot && <Bot size={20} color={colors.primary.gold} style={styles.botIcon} />}
                <Typography
                  variant="body"
                  color={msg.isBot ? 'primary' : 'inverse'}
                  style={styles.messageText}
                >
                  {msg.text}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me anything about luxury real estate..."
            placeholderTextColor={colors.text.secondary}
            multiline
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
            disabled={!message.trim()}
          >
            <Send size={20} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  quickActionsContainer: {
    gap: spacing.md,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  quickActionText: {
    flex: 1,
    gap: spacing.xs,
  },
  messagesContainer: {
    gap: spacing.md,
  },
  messageCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: colors.background.card,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  userMessage: {
    backgroundColor: colors.primary.gold,
    alignSelf: 'flex-end',
  },
  botIcon: {
    marginTop: spacing.xs,
  },
  messageText: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: colors.primary.gold,
    borderRadius: radius.full,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});