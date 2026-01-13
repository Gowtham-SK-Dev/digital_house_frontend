// Frontend/src/screens/marriage/InterestsReceivedScreen.tsx
// Display all received interests

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Chip, Icon } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const InterestsReceivedScreen = ({ navigation }: any) => {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await apiService.get('/api/marriage/interests/received?page=1&limit=50');
      setInterests(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInterests();
    setRefreshing(false);
  };

  const handleAcceptInterest = async (interestId: string) => {
    try {
      await apiService.put(`/api/marriage/interest/${interestId}`, {
        status: 'accepted',
      });
      Alert.alert('Success', 'Interest accepted!');
      fetchInterests();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRejectInterest = async (interestId: string) => {
    try {
      await apiService.put(`/api/marriage/interest/${interestId}`, {
        status: 'rejected',
      });
      Alert.alert('Success', 'Interest rejected');
      fetchInterests();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderInterestCard = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('ProfileDetail', {
          profileId: item.senderProfileId,
        })
      }
    >
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium" style={styles.title}>
              New Interest Received
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Chip label={item.status} />
        </View>

        {item.message && (
          <>
            <Text variant="bodyMedium" style={styles.message}>
              Message:
            </Text>
            <Text variant="bodySmall" style={styles.messageText}>
              {item.message}
            </Text>
          </>
        )}

        <View style={styles.actionButtons}>
          {item.status === 'sent' && (
            <>
              <Button
                mode="contained"
                onPress={() => handleAcceptInterest(item.id)}
                style={styles.acceptButton}
              >
                Accept
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleRejectInterest(item.id)}
                style={styles.rejectButton}
              >
                Decline
              </Button>
            </>
          )}
          {item.status === 'accepted' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Chat', { userId: item.senderUserId })}
              style={styles.chatButton}
            >
              Send Message
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon source="inbox-outline" size={64} color="#ccc" />
      <Text variant="bodyMedium" style={styles.emptyText}>
        No interests received yet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={interests}
      renderItem={renderInterestCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
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
  title: {
    fontWeight: '600',
  },
  timestamp: {
    color: '#999',
    marginTop: 4,
  },
  message: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  messageText: {
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  chatButton: {
    flex: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
  },
});

export default InterestsReceivedScreen;
