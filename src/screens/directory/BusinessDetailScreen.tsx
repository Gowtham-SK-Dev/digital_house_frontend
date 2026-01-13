// Business Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface BusinessDetail {
  id: string;
  businessName: string;
  category: string;
  description: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  phone: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  homeDelivery: boolean;
  priceRange: string;
  workingHours: any;
}

interface Service {
  id: string;
  serviceName: string;
  price?: number;
  description?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
}

export const BusinessDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { businessId } = route.params as { businessId: string };

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`/api/directory/business/${businessId}`);
      const data = await response.json();
      setBusiness(data.data.business);
      setServices(data.data.services);
      setReviews(data.data.reviews);
    } catch (error) {
      console.error('Error fetching business details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (type: 'call' | 'chat' | 'email' | 'whatsapp') => {
    navigation.navigate('InquiryForm', {
      businessId,
      contactType: type,
      businessName: business?.businessName,
    });
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    // Call API to save/unsave
  };

  const renderReviewItem = (item: Review) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewerName}>{item.reviewer}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              name={i < item.rating ? 'star' : 'star-outline'}
              size={14}
              color={i < item.rating ? '#FFD700' : '#ddd'}
            />
          ))}
        </View>
      </View>
      {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
    </View>
  );

  const renderServiceItem = (item: Service) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        {item.description && (
          <Text style={styles.serviceDescription}>{item.description}</Text>
        )}
      </View>
      {item.price && <Text style={styles.servicePrice}>₹{item.price}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Business not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={styles.businessName}>{business.businessName}</Text>
            <View style={styles.ratingSection}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{business.averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>
                ({business.totalReviews} reviews)
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={handleSaveToggle}
          >
            <Icon
              name={isSaved ? 'heart' : 'heart-outline'}
              size={24}
              color={isSaved ? '#E91E63' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{business.category}</Text>
        </View>

        <View style={styles.locationInfo}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.locationText}>{business.city}</Text>
        </View>

        {business.description && (
          <Text style={styles.description}>{business.description}</Text>
        )}
      </View>

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        {business.priceRange && (
          <View style={styles.infoItem}>
            <Icon name="cash-multiple" size={20} color="#4CAF50" />
            <Text style={styles.infoLabel}>{business.priceRange}</Text>
          </View>
        )}
        {business.homeDelivery && (
          <View style={styles.infoItem}>
            <Icon name="truck" size={20} color="#FF9800" />
            <Text style={styles.infoLabel}>Home Delivery</Text>
          </View>
        )}
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Seller</Text>
        <View style={styles.contactGrid}>
          {business.phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('call')}
            >
              <Icon name="phone" size={20} color="#007AFF" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          {business.whatsapp && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('whatsapp')}
            >
              <Icon name="whatsapp" size={20} color="#25D366" />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContact('chat')}
          >
            <Icon name="message" size={20} color="#FF9800" />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>
          {business.email && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('email')}
            >
              <Icon name="email" size={20} color="#9C27B0" />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Services Section */}
      {services.length > 0 && (
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <FlatList
            data={services}
            renderItem={({ item }) => renderServiceItem(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Working Hours */}
      <View style={styles.hoursSection}>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        <View style={styles.hoursContent}>
          {Object.entries(business.workingHours || {}).map(([day, hours]: any) => (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.timeText}>
                {hours.open} - {hours.close}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reviews', { businessId })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={reviews.slice(0, 3)}
            renderItem={({ item }) => renderReviewItem(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#fce4ec',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    justifyContent: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  contactSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  contactButton: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  contactButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  servicesSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  hoursSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  hoursContent: {
    paddingHorizontal: 16,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  reviewItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  bottomPadding: {
    height: 20,
  },
});

export default BusinessDetailScreen;
