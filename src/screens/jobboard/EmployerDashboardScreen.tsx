// Frontend/src/screens/jobboard/EmployerDashboardScreen.tsx
// Employer dashboard to manage jobs and applications

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Card,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api.service';

interface DashboardStats {
  activeJobs: number;
  pendingJobs: number;
  totalJobs: number;
  totalViews: number;
  totalApplications: number;
  recentApplicationsLastWeek: number;
  totalHires: number;
  rating: number;
  companyName: string;
  verificationStatus: string;
}

export const EmployerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, [])
  );

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/jobboard/employer/dashboard');
      setStats(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{stats.companyName}</Text>
        <View style={styles.verificationBadge}>
          <Icon
            name={
              stats.verificationStatus === 'verified'
                ? 'check-circle'
                : 'clock-outline'
            }
            size={14}
            color={stats.verificationStatus === 'verified' ? '#34C759' : '#FF9500'}
          />
          <Text style={styles.verificationText}>{stats.verificationStatus}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Active Jobs */}
        <View style={styles.statCard}>
          <Icon name="briefcase" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{stats.activeJobs}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>

        {/* Total Applications */}
        <View style={styles.statCard}>
          <Icon name="file-document" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{stats.totalApplications}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </View>

        {/* Total Views */}
        <View style={styles.statCard}>
          <Icon name="eye" size={24} color="#FF9500" />
          <Text style={styles.statNumber}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
        </View>

        {/* Hires */}
        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color="#5AC8FA" />
          <Text style={styles.statNumber}>{stats.totalHires}</Text>
          <Text style={styles.statLabel}>Hires</Text>
        </View>
      </View>

      {/* Alerts */}
      {stats.pendingJobs > 0 && (
        <View style={styles.alertCard}>
          <Icon name="information" size={20} color="#FF9500" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{stats.pendingJobs} Pending Approvals</Text>
            <Text style={styles.alertText}>
              Your jobs are waiting for admin review
            </Text>
          </View>
        </View>
      )}

      {stats.recentApplicationsLastWeek > 0 && (
        <View style={styles.alertCard}>
          <Icon name="bell" size={20} color="#007AFF" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {stats.recentApplicationsLastWeek} New Applications
            </Text>
            <Text style={styles.alertText}>
              Last week
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('PostJob')}
      >
        <Icon name="plus-circle" size={20} color="#FFF" />
        <Text style={styles.actionButtonText}>Post New Job</Text>
        <Icon name="chevron-right" size={20} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.actionButtonSecondary]}
        onPress={() => navigation.navigate('EmployerJobs')}
      >
        <Icon name="briefcase-outline" size={20} color="#007AFF" />
        <Text style={styles.actionButtonTextSecondary}>Manage Jobs</Text>
        <Icon name="chevron-right" size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Rating Section */}
      {stats.rating > 0 && (
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingNumber}>{stats.rating.toFixed(1)}</Text>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i < Math.round(stats.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FF9500"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>Employer Rating</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 120,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#007AFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 0.47,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actionButtonTextSecondary: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  ratingCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF9500',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});
