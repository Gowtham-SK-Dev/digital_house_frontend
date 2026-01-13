// Frontend/src/screens/jobboard/JobSearchScreen.tsx
// Job search with advanced filters

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api.service';

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  skillsRequired: string[];
}

interface SearchFilters {
  searchQuery?: string;
  jobType?: string[];
  workMode?: string[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export const JobSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/jobboard/search', {
        searchQuery,
        ...filters,
        limit: 20,
        offset: 0,
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleJobPress(item.id)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleSection}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.jobTitle}
          </Text>
          <Text style={styles.companyName}>{item.companyName}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="heart-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.jobDetailsRow}>
        <View style={styles.badge}>
          <Icon name="map-marker" size={14} color="#666" />
          <Text style={styles.badgeText}>{item.jobLocation}</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="briefcase" size={14} color="#666" />
          <Text style={styles.badgeText}>{item.jobType}</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="home-city" size={14} color="#666" />
          <Text style={styles.badgeText}>{item.workMode}</Text>
        </View>
      </View>

      {item.salaryMin && (
        <Text style={styles.salary}>
          ₹{(item.salaryMin / 100000).toFixed(1)}L - ₹{(item.salaryMax! / 100000).toFixed(1)}L
        </Text>
      )}

      <View style={styles.skillsContainer}>
        {item.skillsRequired.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skillsRequired.length > 3 && (
          <View style={styles.skillTag}>
            <Text style={styles.skillText}>+{item.skillsRequired.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="tune" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filterPanel} scrollEnabled={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Job Type</Text>
            <View style={styles.filterOptions}>
              {['full-time', 'part-time', 'internship', 'contract'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.jobType?.includes(type) && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    const updated = filters.jobType || [];
                    setFilters({
                      ...filters,
                      jobType: updated.includes(type)
                        ? updated.filter((t) => t !== type)
                        : [...updated, type],
                    });
                  }}
                >
                  <Text style={styles.filterOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Work Mode</Text>
            <View style={styles.filterOptions}>
              {['remote', 'hybrid', 'onsite'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.filterOption,
                    filters.workMode?.includes(mode) && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    const updated = filters.workMode || [];
                    setFilters({
                      ...filters,
                      workMode: updated.includes(mode)
                        ? updated.filter((m) => m !== mode)
                        : [...updated, mode],
                    });
                  }}
                >
                  <Text style={styles.filterOptionText}>{mode}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={handleSearch}
          >
            <Text style={styles.applyFilterText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Jobs List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="briefcase-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No jobs found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters</Text>
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
    backgroundColor: '#F5F5F5',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPanel: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    maxHeight: 300,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#666',
  },
  applyFilterButton: {
    margin: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFilterText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  jobsList: {
    padding: 16,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleSection: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 13,
    color: '#666',
  },
  jobDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#007AFF',
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
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
