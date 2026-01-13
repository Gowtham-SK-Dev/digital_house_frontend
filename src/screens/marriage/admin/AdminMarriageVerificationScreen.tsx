// Frontend/src/screens/marriage/admin/AdminMarriageVerificationScreen.tsx
// Admin verification dashboard

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Card, Button, Chip, Badge } from 'react-native-paper';
import { apiService } from '../../../services/api.service';

const AdminMarriageVerificationScreen = ({ navigation }: any) => {
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchPending();
    fetchStats();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await apiService.get('/api/admin/marriage/pending?page=1&limit=50');
      setPendingProfiles(response.data.profiles);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/api/admin/marriage/analytics');
      setStats(response.data);
    } catch (error) {
      // Silent fail
    }
  };

  const renderProfileCard = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('AdminProfileReview', { profileId: item.id })
      }
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.profileInfo}>
            <Text variant="titleMedium" style={styles.profileName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.profileDetails}>
              {item.age} | {item.gender} | {item.currentLocation}
            </Text>
          </View>
          <Badge>New</Badge>
        </View>

        <View style={styles.chipGroup}>
          <Chip label={`${item.profile_completeness}% Complete`} />
          <Chip label={new Date(item.created_at).toLocaleDateString()} />
        </View>

        <View style={styles.documentStatus}>
          <Text variant="labelSmall" style={styles.statusLabel}>
            Documents:
          </Text>
          <View style={styles.statusItems}>
            <Chip
              size="small"
              label={item.id_proof_file ? '✓ ID' : '✗ ID'}
              icon={item.id_proof_file ? 'check' : 'close'}
            />
            <Chip
              size="small"
              label={item.horoscope_file ? '✓ Horoscope' : '✗ Horoscope'}
              icon={item.horoscope_file ? 'check' : 'close'}
            />
            <Chip
              size="small"
              label={item.photos?.length > 0 ? '✓ Photos' : '✗ Photos'}
              icon={item.photos?.length > 0 ? 'check' : 'close'}
            />
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate('AdminProfileReview', { profileId: item.id })
          }
          style={styles.reviewButton}
        >
          Review Profile
        </Button>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text variant="bodyMedium">All profiles verified!</Text>
    </View>
  );

  if (loading && !stats) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      {stats && (
        <View style={styles.statsSection}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.profiles.pending}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Verified
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.profiles.verified}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.profiles.total}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <FlatList
        data={pendingProfiles}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    color: '#999',
    textTransform: 'uppercase',
  },
  statValue: {
    fontWeight: '700',
    marginTop: 4,
  },
  listContent: {
    padding: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: '600',
  },
  profileDetails: {
    color: '#666',
    marginTop: 4,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  documentStatus: {
    marginBottom: 12,
  },
  statusLabel: {
    color: '#999',
    marginBottom: 8,
  },
  statusItems: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  reviewButton: {
    marginTop: 12,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
});

export default AdminMarriageVerificationScreen;
