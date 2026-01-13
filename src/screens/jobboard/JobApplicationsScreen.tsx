// Frontend/src/screens/jobboard/JobApplicationsScreen.tsx
// View sent applications and track status

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api.service';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  applicationStatus: string;
  appliedAt: string;
  shortlistedAt?: string;
  ratingByEmployer?: number;
}

export const JobApplicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      loadApplications();
    }, [filter])
  );

  const loadApplications = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await apiService.get('/jobboard/seeker/applications', {
        params: { status, limit: 50 },
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.post(
                `/jobboard/applications/${applicationId}/withdraw`,
                {}
              );
              loadApplications();
              Alert.alert('Success', 'Application withdrawn');
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return '#007AFF';
      case 'shortlisted':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'offered':
        return '#FF9500';
      case 'hired':
        return '#5AC8FA';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return 'send-clock';
      case 'shortlisted':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      case 'offered':
        return 'briefcase-check';
      case 'hired':
        return 'party-popper';
      default:
        return 'clock-outline';
    }
  };

  const renderApplicationCard = ({ item }: { item: Application }) => (
    <View style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.jobTitle}
          </Text>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={styles.location}>
            <Icon name="map-marker" size={12} color="#666" /> {item.jobLocation}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.applicationStatus) }]}>
          <Icon
            name={getStatusIcon(item.applicationStatus)}
            size={16}
            color="#FFF"
          />
          <Text style={styles.statusText}>{item.applicationStatus}</Text>
        </View>
      </View>

      {item.shortlistedAt && (
        <View style={styles.shortlistedInfo}>
          <Icon name="star" size={14} color="#FF9500" />
          <Text style={styles.shortlistedDate}>
            Shortlisted on {new Date(item.shortlistedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {item.ratingByEmployer && (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Employer Rating:</Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name={i < item.ratingByEmployer! ? 'star' : 'star-outline'}
                size={14}
                color="#FF9500"
              />
            ))}
          </View>
        </View>
      )}

      <Text style={styles.appliedDate}>
        Applied {new Date(item.appliedAt).toLocaleDateString()}
      </Text>

      {item.applicationStatus === 'applied' && (
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => handleWithdraw(item.id)}
        >
          <Icon name="close" size={16} color="#FF3B30" />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
      >
        {['all', 'applied', 'shortlisted', 'rejected', 'offered', 'hired'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applications List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : applications.length > 0 ? (
        <FlatList
          data={applications}
          renderItem={renderApplicationCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.centerContent}>
          <Icon name="briefcase-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubText}>
            Apply to jobs to see them here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterTabs: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 12,
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  applicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  shortlistedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
    gap: 6,
  },
  shortlistedDate: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  appliedDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 8,
    gap: 6,
  },
  withdrawText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  centerContent: {
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
});
