/**
 * Post Detail Screen - Like, Comment, Share
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Pressable,
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
    type: string;
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

interface Comment {
  id: string;
  userId: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface Props {
  navigation: any;
  route: {
    params: {
      postId: string;
    };
  };
}

export default function PostDetailScreen({ navigation, route }: Props) {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setLoadingMoreComments(true);
      }

      const response = await apiService.get(`/posts/${postId}/comments`, {
        params: { page: pageNum, limit: 20 },
      });

      if (pageNum === 1) {
        setComments(response.data.comments);
      } else {
        setComments([...comments, ...response.data.comments]);
      }

      setPage(pageNum);
      setHasMoreComments(
        response.data.pagination.page < response.data.pagination.totalPages
      );
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
      setLoadingMoreComments(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      await apiService.post(`/posts/${postId}/like`);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setIsSavingComment(true);
      const response = await apiService.post(`/posts/${postId}/comments`, {
        content: commentText,
      });

      const newComment = response.data;
      setComments([newComment, ...comments]);
      setCommentText('');

      if (post) {
        setPost({
          ...post,
          commentsCount: post.commentsCount + 1,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      await apiService.post(`/posts/comments/${commentId}/like`);
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleShare = async () => {
    try {
      await apiService.post(`/posts/${postId}/share`, {
        caption: `Check this out: ${post?.title || 'A great post'}`,
      });

      if (post) {
        setPost({
          ...post,
          sharesCount: post.sharesCount + 1,
        });
      }

      Alert.alert('Success', 'Post shared!');
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleLoadMoreComments = () => {
    if (hasMoreComments && !loadingMoreComments) {
      fetchComments(page + 1);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.comment}>
      <View style={styles.commentAuthor}>
        <View style={styles.commentAvatar}>
          {item.user?.profilePicture ? (
            <Image source={{ uri: item.user.profilePicture }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={32} color="#ccc" />
          )}
        </View>
        <View style={styles.commentContent}>
          <Text style={styles.commentAuthorName}>
            {item.user?.firstName} {item.user?.lastName}
          </Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <Text style={styles.commentTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.likeCommentBtn}
          onPress={() => handleLikeComment(item.id, item.isLiked)}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={14}
            color={item.isLiked ? '#f44336' : '#999'}
          />
          <Text style={styles.likeCommentText}>{item.likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !post) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Post Details */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post Card */}
        <View style={styles.postCard}>
          {/* Author Info */}
          <View style={styles.postHeader}>
            <Pressable
              style={styles.authorInfo}
              onPress={() => navigation.navigate('ViewProfile', { userId: post.userId })}
            >
              {post.userProfile.profilePicture ? (
                <Image
                  source={{ uri: post.userProfile.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person-circle" size={40} color="#ccc" />
                </View>
              )}
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.authorName}>
                    {post.userProfile.firstName} {post.userProfile.lastName}
                  </Text>
                  {post.userProfile.verified && (
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Title & Content */}
          {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
          {post.content.text && <Text style={styles.postContent}>{post.content.text}</Text>}

          {/* Images */}
          {post.content.images && post.content.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
            >
              {post.content.images.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.postImage} />
              ))}
            </ScrollView>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#f44336" />
              <Text style={styles.statText}>{post.likesCount} Likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.statText}>{post.commentsCount} Comments</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="share-social-outline" size={16} color="#666" />
              <Text style={styles.statText}>{post.sharesCount} Shares</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={post.isLiked ? '#f44336' : '#666'}
              />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Comment Section */}
        <View style={styles.addCommentSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, isSavingComment && styles.sendBtnDisabled]}
              onPress={handleAddComment}
              disabled={isSavingComment}
            >
              {isSavingComment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments List */}
        {comments.length > 0 ? (
          <View style={styles.commentsContainer}>
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              onEndReached={handleLoadMoreComments}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMoreComments ? (
                  <ActivityIndicator color="#007AFF" style={styles.loadMoreComments} />
                ) : null
              }
            />
          </View>
        ) : (
          <View style={styles.noComments}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  postHeader: {
    paddingVertical: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
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
  addCommentSection: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    padding: 12,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  commentsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  comment: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentAuthor: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  commentText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginVertical: 4,
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
  },
  commentActions: {
    flexDirection: 'row',
  },
  likeCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCommentText: {
    fontSize: 11,
    color: '#999',
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCommentsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginTop: 8,
  },
  noCommentsSubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  loadMoreComments: {
    paddingVertical: 16,
  },
});
