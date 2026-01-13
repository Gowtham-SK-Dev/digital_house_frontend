// Owner Dashboard Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface DashboardStats {
  activeListings: number;
  totalInquiries: number;
  completedInquiries: number;
  averageRating: number;
  totalReviews: number;
}

interface Inquiry {
  id: string;
  inquirerName: string;
  serviceType: string;
  status: string;
  date: string;
}

export const OwnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [selectedBusiness])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch businesses
      const businessesResponse = await fetch('/api/directory/my-businesses');
      const businessesData = await businessesResponse.json();
      setBusinesses(businessesData.data);

      if (businessesData.data.length > 0 && !selectedBusiness) {
        setSelectedBusiness(businessesData.data[0].id);
      }

      // Fetch analytics
      if (selectedBusiness) {
        const analyticsResponse = await fetch(
          `/api/directory/business/${selectedBusiness}/analytics`
        );
        const analyticsData = await analyticsResponse.json();
        setStats(analyticsData.data.stats);

        const inquiriesResponse = await fetch(
          `/api/directory/business/${selectedBusiness}/inquiries`
        );
        const inquiriesData = await inquiriesResponse.json();
        setRecentInquiries(inquiriesData.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (icon: string, label: string, value: number | string) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={28} color="#007AFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderInquiryItem = (item: Inquiry) => (
    <TouchableOpacity
      style={styles.inquiryCard}
      onPress={() => navigation.navigate('InquiryDetail', { inquiryId: item.id })}
    >
      <View style={styles.inquiryHeader}>
        <Text style={styles.inquiryName}>{item.inquirerName}</Text>
        <View style={[styles.statusBadge, styles[`status${item.status}` as keyof typeof styles]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.inquiryService}>{item.serviceType}</Text>
      <Text style={styles.inquiryDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subheaderText}>Manage your business listings</Text>
      </View>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <View style={styles.businessSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.businessScroll}
          >
            {businesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={[
                  styles.businessOption,
                  selectedBusiness === business.id && styles.businessOptionActive,
                ]}
                onPress={() => setSelectedBusiness(business.id)}
              >
                <Text
                  style={[
                    styles.businessOptionText,
                    selectedBusiness === business.id && styles.businessOptionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {business.businessName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {renderStatCard('briefcase', 'Active Listings', stats.activeListings)}
            {renderStatCard('message-multiple', 'Inquiries', stats.totalInquiries)}
            {renderStatCard('check-circle', 'Completed', stats.completedInquiries)}
            {renderStatCard('star', 'Rating', stats.averageRating.toFixed(1))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Icon name="plus-circle" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Create New Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditListing')}
        >
          <Icon name="pencil" size={24} color="#FF9800" />
          <Text style={styles.actionButtonText}>Edit Current Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Verification')}
        >
          <Icon name="checkbox-marked-circle" size={24} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Verification Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AllInquiries')}
        >
          <Icon name="inbox" size={24} color="#9C27B0" />
          <Text style={styles.actionButtonText}>View All Inquiries</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Inquiries */}
      {recentInquiries.length > 0 && (
        <View style={styles.inquiriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Inquiries</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentInquiries}
            renderItem={({ item }) => renderInquiryItem(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Analytics Section */}
      <View style={styles.analyticsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance</Text>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsItem}>
            <View style={styles.analyticsLeft}>
              <Icon name="eye" size={24} color="#2196F3" />
              <Text style={styles.analyticsLabel}>Views This Month</Text>
            </View>
            <Text style={styles.analyticsValue}>124</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.analyticsItem}>
            <View style={styles.analyticsLeft}>
              <Icon name="heart" size={24} color="#E91E63" />
              <Text style={styles.analyticsLabel}>Saves</Text>
            </View>
            <Text style={styles.analyticsValue}>28</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.analyticsItem}>
            <View style={styles.analyticsLeft}>
              <Icon name="share-variant" size={24} color="#FF9800" />
              <Text style={styles.analyticsLabel}>Shares</Text>
            </View>
            <Text style={styles.analyticsValue}>15</Text>
          </View>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.alertsSection}>
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Icon name="alert-circle" size={24} color="#FF9800" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Incomplete Verification</Text>
            <Text style={styles.alertText}>You need 1 more document to get verified</Text>
          </View>
          <TouchableOpacity>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Icon name="star" size={24} color="#FFD700" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>New Review</Text>
            <Text style={styles.alertText}>You have 1 pending review to moderate</Text>
          </View>
          <TouchableOpacity>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

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
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subheaderText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  businessSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  businessScroll: {
    paddingHorizontal: 16,
  },
  businessOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  businessOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  businessOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  businessOptionTextActive: {
    color: '#fff',
  },
  statsSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (width - 36) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  actionSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  inquiriesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  inquiryCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inquiryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusResponded: {
    backgroundColor: '#e3f2fd',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  inquiryService: {
    fontSize: 12,
    color: '#666',
  },
  inquiryDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  analyticsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  analyticsCard: {
    paddingHorizontal: 16,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  analyticsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyticsLabel: {
    fontSize: 13,
    color: '#666',
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  alertsSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  alertText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  bottomPadding: {
    height: 20,
  },
});

export default OwnerDashboardScreen;
