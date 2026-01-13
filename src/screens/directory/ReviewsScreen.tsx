// Reviews Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export const ReviewsScreen: React.FC = () => {
  const route = useRoute();
  const { businessId } = route.params as { businessId: string };

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/directory/business/${businessId}/reviews`);
      const data = await response.json();
      setReviews(data.data.reviews);
      setStats(data.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRow = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <View style={styles.starRow} key={`star-${stars}`}>
        <View style={styles.starLabel}>
          {[...Array(stars)].map((_, i) => (
            <Icon key={i} name="star" size={14} color="#FFD700" />
          ))}
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.countText}>{count}</Text>
      </View>
    );
  };

  const renderReviewItem = (item: Review) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.ratingStars}>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              name={i < item.rating ? 'star' : 'star-outline'}
              size={16}
              color={i < item.rating ? '#FFD700' : '#ddd'}
            />
          ))}
        </View>
      </View>

      {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Icon name="thumb-up-outline" size={16} color="#666" />
          <Text style={styles.helpfulText}>Helpful ({item.helpfulCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsSection}>
          <View style={styles.overallRating}>
            <Text style={styles.averageText}>{stats.averageRating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i < Math.floor(stats.averageRating) ? 'star' : 'star-outline'}
                  size={18}
                  color={i < Math.floor(stats.averageRating) ? '#FFD700' : '#ddd'}
                />
              ))}
            </View>
            <Text style={styles.reviewCountText}>
              {stats.totalReviews} reviews
            </Text>
          </View>

          <View style={styles.ratingDistribution}>
            {renderStarRow(5, stats.fiveStar, stats.totalReviews)}
            {renderStarRow(4, stats.fourStar, stats.totalReviews)}
            {renderStarRow(3, stats.threeStar, stats.totalReviews)}
            {renderStarRow(2, stats.twoStar, stats.totalReviews)}
            {renderStarRow(1, stats.oneStar, stats.totalReviews)}
          </View>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, !filterRating && styles.filterButtonActive]}
            onPress={() => setFilterRating(null)}
          >
            <Text
              style={[
                styles.filterButtonText,
                !filterRating && styles.filterButtonTextActive,
              ]}
            >
              All Reviews
            </Text>
          </TouchableOpacity>

          {[5, 4, 3, 2, 1].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.filterButton,
                filterRating === rating && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRating(rating)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterRating === rating && styles.filterButtonTextActive,
                ]}
              >
                {rating} ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No reviews yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Be the first to review this business
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={({ item }) => renderReviewItem(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            // Load more reviews
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFD700',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 4,
  },
  reviewCountText: {
    fontSize: 13,
    color: '#666',
  },
  ratingDistribution: {
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starLabel: {
    width: 60,
    flexDirection: 'row',
    gap: 2,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: '#FFD700',
    height: '100%',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  reviewsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  helpfulText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});

export default ReviewsScreen;
