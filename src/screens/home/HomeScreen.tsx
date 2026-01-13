/**
 * Home Screen - Feed with Posts
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';

interface Post {
  id: string;
  userId: string;
  userProfile: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    verified: boolean;
  };
  content: {
    type: 'text' | 'image' | 'article' | 'video';
    text?: string;
    images?: string[];
  };
  category: string;
  title?: string;
  description?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = [
    { id: 'business', label: '💼 Business', icon: 'briefcase' },
    { id: 'job', label: '🎯 Jobs', icon: 'briefcase' },
    { id: 'marriage', label: '💍 Marriage', icon: 'heart' },
    { id: 'education', label: '📚 Education', icon: 'book' },
    { id: 'event', label: '🎉 Events', icon: 'calendar' },
    { id: 'story', label: '📖 Stories', icon: 'document' },
    { id: 'support', label: '🤝 Support', icon: 'help-circle' },
  ];

  useEffect(() => {
    fetchPosts();
    fetchLocations();
  }, [selectedCategory, selectedLocation]);

  const fetchLocations = async () => {
    try {
      const response = await apiService.get('/posts/location-circles');
      setLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchPosts = async (loadMore = false) => {
    try {
      setIsLoading(!loadMore);
      setLoadingMore(loadMore);
      const pageNum = loadMore ? page + 1 : 1;

      const response = await apiService.get('/posts/feed', {
        params: {
          page: pageNum,
          limit: 20,
          category: selectedCategory,
          locationCircleId: selectedLocation,
        },
      });

      if (loadMore) {
        setPosts([...posts, ...response.data.posts]);
        setPage(pageNum);
      } else {
        setPosts(response.data.posts);
        setPage(1);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      await apiService.post(`/posts/${postId}/like`);
      // Update local state
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(true);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Pressable
          style={styles.authorInfo}
          onPress={() => navigation.navigate('ViewProfile', { userId: item.userId })}
        >
          {item.userProfile.profilePicture ? (
            <Image
              source={{ uri: item.userProfile.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person-circle" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.authorDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>
                {item.userProfile.firstName} {item.userProfile.lastName}
              </Text>
              {item.userProfile.verified && (
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.postTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Pressable>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Category & Title */}
      {item.title && (
        <View style={styles.titleSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.postTitle}>{item.title}</Text>
        </View>
      )}

      {/* Post Content */}
      <View style={styles.contentSection}>
        {item.content.text && <Text style={styles.postText}>{item.content.text}</Text>}

        {item.content.images && item.content.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {item.content.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.postImage} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#f44336" />
          <Text style={styles.statText}>{item.likesCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.commentsCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="share-social-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.sharesCount}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={item.isLiked ? '#f44336' : '#666'}
          />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DigitalConnect</Text>
          <Text style={styles.headerSubtitle}>Community Feed</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryBtn,
                selectedCategory === cat.id && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.id ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === cat.id && styles.categoryBtnTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.filterIcon} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="funnel" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Location Filter (if expanded) */}
      {showFilters && locations.length > 0 && (
        <View style={styles.locationFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.locationBtn, !selectedLocation && styles.locationBtnActive]}
              onPress={() => setSelectedLocation(null)}
            >
              <Text style={styles.locationBtnText}>All Locations</Text>
            </TouchableOpacity>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.locationBtn,
                  selectedLocation === loc.id && styles.locationBtnActive,
                ]}
                onPress={() => setSelectedLocation(selectedLocation === loc.id ? null : loc.id)}
              >
                <Text style={styles.locationBtnText}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Posts Feed */}
      {isLoading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Be the first to share something!</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.emptyBtnText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#007AFF" style={styles.footer} /> : null
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.feedContainer}
        />
      )}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 4,
  },
  categoryBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryBtnText: {
    fontSize: 12,
    color: '#666',
  },
  categoryBtnTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  filterIcon: {
    padding: 8,
    marginLeft: 'auto',
  },
  locationFilter: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  locationBtnActive: {
    backgroundColor: '#007AFF',
  },
  locationBtnText: {
    fontSize: 12,
    color: '#666',
  },
  feedContainer: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  titleSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  contentSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  imagesScroll: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptyBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 16,
  },
});

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
