// Frontend/src/screens/jobboard/JobChatScreen.tsx
// Chat between employer and job seeker

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api.service';
import storageService from '../../services/storage.service';

interface Message {
  id: string;
  senderId: string;
  senderType: string;
  messageText: string;
  createdAt: string;
  isRead: boolean;
}

export const JobChatScreen: React.FC = () => {
  const route = useRoute();
  const { employerId, jobSeekerId, jobApplicationId } = route.params as any;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    
    // Set up polling for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    const user = await storageService.getUser();
    setCurrentUserId(user?.id || '');
  };

  const loadMessages = async () => {
    try {
      const response = await apiService.get(
        `/jobboard/chat/${employerId}/${jobSeekerId}`
      );
      setMessages(response.data);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await apiService.post('/jobboard/chat/send', {
        employerId,
        jobSeekerId,
        messageText: messageText.trim(),
        jobApplicationId,
      });

      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwn && styles.messageContainerOwn,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwn && styles.messageBubbleOwn,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwn && styles.messageTextOwn,
            ]}
          >
            {item.messageText}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isOwn && styles.messageTimeOwn,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chat-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubText}>Start a conversation</Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxHeight={100}
          editable={!sending}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending || !messageText.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size={18} />
          ) : (
            <Icon name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
    borderBottomLeftRadius: 0,
  },
  messageBubbleOwn: {
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  messageTextOwn: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  messageTimeOwn: {
    color: '#E0E0E0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
