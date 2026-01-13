// Frontend/src/screens/marriage/admin/AdminReportsScreen.tsx
// Admin reports management

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { apiService } from '../../../services/api.service';

const AdminReportsScreen = ({ navigation }: any) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchReports();
  }, [selectedStatus]);

  const fetchReports = async () => {
    try {
      const url = selectedStatus
        ? `/api/admin/marriage/reports?status=${selectedStatus}&page=1&limit=50`
        : '/api/admin/marriage/reports?page=1&limit=50';

      const response = await apiService.get(url);
      setReports(response.data.reports);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    pending: '#FFC107',
    investigating: '#2196F3',
    resolved: '#4CAF50',
    false_report: '#9E9E9E',
  };

  const renderReportCard = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('AdminReportDetail', { reportId: item.id })
      }
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.title}>
              {item.report_type}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Chip
            label={item.status}
            style={{
              backgroundColor: statusColors[item.status],
            }}
            textColor="#fff"
          />
        </View>

        <Text variant="bodySmall" style={styles.details}>
          {item.details}
        </Text>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            size="small"
            onPress={() =>
              navigation.navigate('AdminReportDetail', { reportId: item.id })
            }
          >
            Review
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterSection}>
        <Chip
          selected={selectedStatus === ''}
          onPress={() => setSelectedStatus('')}
          label="All"
        />
        <Chip
          selected={selectedStatus === 'pending'}
          onPress={() => setSelectedStatus('pending')}
          label="Pending"
        />
        <Chip
          selected={selectedStatus === 'investigating'}
          onPress={() => setSelectedStatus('investigating')}
          label="Investigating"
        />
        <Chip
          selected={selectedStatus === 'resolved'}
          onPress={() => setSelectedStatus('resolved')}
          label="Resolved"
        />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No reports found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    color: '#999',
    marginTop: 4,
  },
  details: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
});

export default AdminReportsScreen;
