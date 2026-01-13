import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../../services/api.service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
  message_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_flagged: boolean;
  is_deleted: boolean;
  message_type: string;
}

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/${chatId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const response = await api.post(`/chat/${chatId}/message`, {
        content: input,
        messageType: 'text',
      });
      if (response.data.success) {
        setInput('');
        fetchMessages();
      } else if (response.data.isFlagged) {
        Alert.alert('Warning', 'Your message contains sensitive content and was flagged for review.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender_id === 'me' ? styles.myMessage : styles.otherMessage,
        item.is_flagged && styles.flaggedMessage,
        item.is_deleted && styles.deletedMessage,
      ]}
    >
      <Text style={styles.messageText}>
        {item.is_deleted ? '[Deleted]' : item.content}
      </Text>
      <Text style={styles.timeText}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
      {item.is_flagged && (
        <Icon name="alert-circle" size={14} color="#d32f2f" style={{ marginLeft: 4 }} />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUser}</Text>
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id}
          contentContainerStyle={{ padding: 12 }}
          inverted
          refreshing={refreshing}
          onRefresh={fetchMessages}
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          editable={!sending}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={sending}>
          <Icon name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginLeft: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  flaggedMessage: {
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
  deletedMessage: {
    opacity: 0.5,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#1976d2',
    borderRadius: 20,
    padding: 10,
  },
});

export default ChatDetailScreen;
