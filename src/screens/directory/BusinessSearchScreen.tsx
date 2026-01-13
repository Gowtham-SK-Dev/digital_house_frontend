// Business Directory Search Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface BusinessItem {
  id: string;
  businessName: string;
  category: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  homeDelivery: boolean;
}

interface FilterState {
  searchQuery: string;
  categoryId: string;
  city: string;
  priceRange: string;
  homeDelivery: boolean;
  rating: number;
}

export const BusinessSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categoryId: '',
    city: '',
    priceRange: '',
    homeDelivery: false,
    rating: 0,
  });

  useEffect(() => {
    fetchCategories();
    searchBusinesses();
  }, []);

  const fetchCategories = async () => {
    try {
      // Call API to fetch categories
      const response = await fetch('/api/directory/categories');
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchBusinesses = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      // Call API to search businesses
      const response = await fetch('/api/directory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          page: pageNum,
          limit: 20,
        }),
      });

      const data = await response.json();
      if (pageNum === 1) {
        setBusinesses(data.data.businesses);
      } else {
        setBusinesses([...businesses, ...data.data.businesses]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    searchBusinesses(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const renderBusinessCard = (item: BusinessItem) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.businessName}>{item.businessName}</Text>
        <View style={styles.ratingBadge}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.averageRating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.totalReviews})</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="folder" size={16} color="#666" />
          <Text style={styles.detailText}>{item.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{item.city}</Text>
        </View>
        {item.homeDelivery && (
          <View style={styles.detailRow}>
            <Icon name="truck" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>Home Delivery Available</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
        <Icon name="chevron-right" size={18} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={filters.searchQuery}
            onChangeText={(text) => handleFilterChange('searchQuery', text)}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="tune" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <ScrollView style={styles.filtersPanel} showsVerticalScrollIndicator={false}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !filters.categoryId && styles.categoryChipActive,
              ]}
              onPress={() => handleFilterChange('categoryId', '')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !filters.categoryId && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  filters.categoryId === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => handleFilterChange('categoryId', cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    filters.categoryId === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.categoryName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterTitle}>Location</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="City"
            value={filters.city}
            onChangeText={(text) => handleFilterChange('city', text)}
          />

          <Text style={styles.filterTitle}>Price Range</Text>
          <View style={styles.priceOptions}>
            {['affordable', 'mid-range', 'premium', 'luxury'].map((price) => (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceOption,
                  filters.priceRange === price && styles.priceOptionActive,
                ]}
                onPress={() => handleFilterChange('priceRange', price)}
              >
                <Text style={styles.priceOptionText}>{price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                handleFilterChange('homeDelivery', !filters.homeDelivery)
              }
            >
              {filters.homeDelivery && <Icon name="check" size={16} color="#007AFF" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Home Delivery Available</Text>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Results */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : businesses.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="file-document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No businesses found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={businesses}
          renderItem={({ item }) => renderBusinessCard(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!loading) searchBusinesses(page + 1);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && page > 1 ? <ActivityIndicator /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    padding: 12,
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  priceOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  priceOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  priceOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priceOptionText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 12,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  cardDetails: {
    gap: 6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});

export default BusinessSearchScreen;
