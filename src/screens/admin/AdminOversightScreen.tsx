import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import api from '../../services/api.service';

const AdminOversightScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
    fetchReports();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/chat/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/chat/reports/pending?limit=10');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    }
  };

  const renderReport = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate('AdminReportDetail', { reportId: item.report_id })}
    >
      <Text style={styles.reportType}>{item.report_type.replace('_', ' ').toUpperCase()}</Text>
      <Text style={styles.reportUser}>{item.offender_name}</Text>
      <Text style={styles.reportStatus}>{item.status}</Text>
      <Text style={styles.reportDate}>{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Moderation Dashboard</Text>
      {stats && (
        <View style={styles.statsBox}>
          <Text>Total Chats: {stats.totalChats}</Text>
          <Text>Active Chats: {stats.activeChats}</Text>
          <Text>Reported Chats: {stats.reportedChats}</Text>
          <Text>Total Messages: {stats.totalMessages}</Text>
          <Text>Flagged Messages: {stats.flaggedMessages}</Text>
          <Text>Total Reports: {stats.totalReports}</Text>
          <Text>Pending Reports: {stats.pendingReports}</Text>
          <Text>Resolved Reports: {stats.resolvedReports}</Text>
        </View>
      )}
      <Text style={styles.subtitle}>Pending Reports</Text>
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.report_id}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending reports</Text>}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  statsBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#d32f2f',
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 1,
  },
  reportType: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  reportUser: {
    color: '#1976d2',
  },
  reportStatus: {
    color: '#666',
    fontSize: 13,
  },
  reportDate: {
    color: '#999',
    fontSize: 11,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminOversightScreen;
