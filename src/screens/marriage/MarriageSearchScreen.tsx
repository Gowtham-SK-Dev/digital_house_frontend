// Frontend/src/screens/marriage/MarriageSearchScreen.tsx
// Search and discover marriage profiles

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Card, Chip, Icon } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const MarriageSearchScreen = ({ navigation }: any) => {
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: { min: 18, max: 40 },
    education: [],
    location: [],
    caste: '',
    raasi: [],
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);

      const response = await apiService.post('/api/marriage/search', filters);
      setResults(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileCard = ({ item }: any) => (
    <Card
      style={styles.profileCard}
      onPress={() =>
        navigation.navigate('ProfileDetail', { profileId: item.id })
      }
    >
      <Card.Cover
        source={{
          uri: item.photos?.[0]?.url || 'https://via.placeholder.com/300',
        }}
        style={styles.profileImage}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.profileHeader}>
          <Text variant="titleMedium" style={styles.profileName}>
            {item.name}, {item.age}
          </Text>
          {item.verificationStatus === 'verified' && (
            <Icon source="check-circle" size={20} color="#4CAF50" />
          )}
        </View>

        <Text variant="bodySmall" style={styles.profileDetail}>
          {item.profession} • {item.currentLocation}
        </Text>

        <Text variant="bodySmall" style={styles.profileDetail}>
          {item.education}
        </Text>

        <View style={styles.chipGroup}>
          {item.caste && <Chip label={item.caste} size="small" />}
          {item.raasi && <Chip label={item.raasi} size="small" />}
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            size="small"
            onPress={() =>
              navigation.navigate('HoroscopeMatch', {
                profileId: item.id,
              })
            }
            style={styles.actionButton}
          >
            Check Match
          </Button>
          <Button
            mode="contained"
            size="small"
            onPress={() => handleSendInterest(item.id)}
            style={styles.actionButton}
          >
            Send Interest
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const handleSendInterest = async (profileId: string) => {
    try {
      await apiService.post('/api/marriage/interest', {
        receiverProfileId: profileId,
      });
      Alert.alert('Success', 'Interest sent successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filterSection} horizontal>
        <View style={styles.filterRow}>
          <Chip
            selected={filters.gender === 'Female'}
            onPress={() =>
              setFilters({
                ...filters,
                gender: filters.gender === 'Female' ? '' : 'Female',
              })
            }
            label="Female"
            style={styles.filterChip}
          />
          <Chip
            selected={filters.gender === 'Male'}
            onPress={() =>
              setFilters({
                ...filters,
                gender: filters.gender === 'Male' ? '' : 'Male',
              })
            }
            label="Male"
            style={styles.filterChip}
          />

          <TextInput
            placeholder="Caste"
            value={filters.caste}
            onChangeText={(text) =>
              setFilters({ ...filters, caste: text })
            }
            style={styles.filterInput}
          />

          <TextInput
            placeholder="Location"
            value={filters.location[0] || ''}
            onChangeText={(text) =>
              setFilters({
                ...filters,
                location: text ? [text] : [],
              })
            }
            style={styles.filterInput}
          />

          <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
            Search
          </Button>
        </View>
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {searched && results.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium">No profiles found. Try adjusting your filters.</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterSection: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    marginHorizontal: 4,
  },
  filterInput: {
    width: 100,
    height: 40,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultsList: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  profileCard: {
    marginBottom: 12,
  },
  profileImage: {
    height: 250,
  },
  cardContent: {
    paddingTop: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontWeight: '600',
  },
  profileDetail: {
    color: '#666',
    marginVertical: 4,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default MarriageSearchScreen;
