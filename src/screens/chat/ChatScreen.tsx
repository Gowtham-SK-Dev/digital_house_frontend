/**
 * Chat Screen - Conversations List
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';
import { usePaginatedData } from '@hooks/index';
import { formatDate, truncateText } from '@utils/helpers';

interface Props {
  navigation: any;
}

export default function ChatScreen({ navigation }: Props) {
  const { data: conversations, isLoading, refresh } = usePaginatedData(
    apiService.getConversations
  );

  const handleNewConversation = () => {
    navigation.navigate('SelectUser');
  };

  const renderConversation = ({ item }: any) => {
    const otherUser = item.participantDetails?.[0];

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUser?.firstName?.charAt(0)}{otherUser?.lastName?.charAt(0)}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.userName}>
            {otherUser?.firstName} {otherUser?.lastName}
          </Text>
          <Text style={styles.lastMessage}>
            {truncateText(item.lastMessage?.content || 'No messages yet', 50)}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text style={styles.timestamp}>
            {formatDate(item.lastMessage?.createdAt)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Messages</Text>
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={handleNewConversation}
      >
        <Ionicons name="create-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No conversations</Text>
              <Text style={styles.emptySubtext}>
                Start a new conversation with community members
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    padding: 8,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 12,
    color: '#999',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
