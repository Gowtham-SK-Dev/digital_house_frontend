import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api.service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Chat {
  chat_id: string;
  user_id_a: string;
  user_id_b: string;
  other_user_name: string;
  context_type: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
  status: string;
  is_blocked: boolean;
}

const ChatListScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/inbox');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const getContextIcon = (contextType: string) => {
    const icons: any = {
      marriage: 'heart',
      job: 'briefcase',
      business: 'store',
      help: 'help-circle',
      general: 'chat'
    };
    return icons[contextType] || 'chat';
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, item.is_blocked && styles.blockedChat]}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.chat_id, otherUser: item.other_user_name })}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.other_user_name[0].toUpperCase()}</Text>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.other_user_name}
            {item.is_blocked && ' (Blocked)'}
          </Text>
          <View style={styles.contextBadge}>
            <Icon name={getContextIcon(item.context_type)} size={12} color="#666" />
            <Text style={styles.contextText}>{item.context_type}</Text>
          </View>
        </View>

        <Text style={styles.messageText} numberOfLines={1}>
          {item.last_message || 'No messages yet'}
        </Text>

        <Text style={styles.timeText}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </View>

      {item.status === 'reported' && (
        <View style={styles.reportedBadge}>
          <Icon name="alert-circle" size={16} color="#d32f2f" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.chat_id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chat-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No chats yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
  },
  blockedChat: {
    opacity: 0.6,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  contextBadge: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  contextText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  reportedBadge: {
    marginLeft: 8,
  },
});

export default ChatListScreen;
