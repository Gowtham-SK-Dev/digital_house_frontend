/**
 * Home Screen - Feed
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';
import { useFeedStore } from '@store/index';
import { usePaginatedData } from '@hooks/index';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { data: posts, isLoading, hasMore, loadMore, refresh } = usePaginatedData(
    apiService.getFeed
  );

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.firstName?.charAt(0)}{item.user?.lastName?.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>
              {item.user?.firstName} {item.user?.lastName}
            </Text>
            <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        {/* More options menu */}
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.images && item.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {item.images.map((image: string, index: number) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.postImage}
            />
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Digital House</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePost}
      >
        <Ionicons name="create-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item.id || index.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={isLoading && posts.length === 0}
        onRefresh={refresh}
        scrollEventThrottle={16}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Follow members to see their posts</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && posts.length > 0 ? (
            <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
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
    color: '#007AFF',
  },
  createButton: {
    padding: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    padding: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  imagesContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  loader: {
    marginVertical: 20,
  },
});
