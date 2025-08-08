import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterModal } from '@/components/ui/FilterModal';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { usePropertyStore } from '@/stores/propertyStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useGlobalProfile } from '@/hooks/useGlobalProfile';
import { toast } from '@/components/ui/Toast';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  TrendingUp,
  AlertCircle,
  Bell,
  Heart,
} from 'lucide-react-native';
export default function ExploreScreen() {
  const router = useRouter();
  const {
    filteredProperties,
    searchQuery,
    filters,
    isLoading,
    suggestions,
    fetchProperties,
    searchProperties,
    filterProperties,
    clearFilters,
    hasActiveFilters,
  } = usePropertyStore();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { profileData, isLoading: profileLoading, fetchProfile, refreshProfile } = useGlobalProfile();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTab, setSelectedTab] = useState<'Commercial' | 'Residential'>('Residential');
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchProperties();
    // Fetch profile data when dashboard loads
    fetchProfile();
  }, [fetchProperties, fetchProfile]);
  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        searchProperties(query);
      }, 300);
      setSearchTimeout(timeout);
    },
    [searchTimeout, searchProperties]
  );
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };
  const handleApplyFilters = (newFilters: any) => {
    filterProperties(newFilters);
  };
  const handleClearFilters = () => {
    clearFilters();
    setLocalSearchQuery('');
  };
  const handleTabChange = (tab: 'Commercial' | 'Residential') => {
    setSelectedTab(tab);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProperties(),
        refreshProfile(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };
  // Filter properties based on selected tab
  const getFilteredPropertiesByTab = () => {
    let tabFilteredProperties = filteredProperties;
    if (selectedTab === 'Commercial') {
      // Commercial properties: office, retail, warehouse, etc.
      tabFilteredProperties = filteredProperties.filter(
        (property) =>
          ['office', 'retail', 'warehouse', 'commercial'].includes(property.propertyType) ||
          property.title.toLowerCase().includes('commercial') ||
          property.title.toLowerCase().includes('office') ||
          property.title.toLowerCase().includes('retail')
      );
    } else {
      // Residential properties: villa, penthouse, mansion, apartment, etc.
      tabFilteredProperties = filteredProperties.filter(
        (property) =>
          [
            'villa',
            'penthouse',
            'mansion',
            'apartment',
            'house',
            'condo',
            'loft',
            'cabin',
            'treehouse',
            'farmhouse',
            'yacht',
          ].includes(property.propertyType) ||
          !['office', 'retail', 'warehouse', 'commercial'].includes(property.propertyType)
      );
    }
    return tabFilteredProperties;
  };
  const handleNotifications = () => {
    router.push('/notifications');
  };
  const handleWishlistToggle = (property: any) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    const isWishlisted = isInWishlist(user.id, property.id);
    if (isWishlisted) {
      removeFromWishlist(user.id, property.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(user.id, property);
      toast.success('Added to wishlist');
    }
  };
  const renderPropertyCard = ({ item: property }: { item: any }) => (
    <TouchableOpacity onPress={() => handlePropertyPress(property.id)} style={styles.propertyItem}>
      <Card style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: property.mediaGallery.images[0] }} style={styles.propertyImage} />
          <TouchableOpacity
            onPress={() => handleWishlistToggle(property)}
            style={styles.wishlistButton}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={
                user && isInWishlist(user.id, property.id)
                  ? colors.status.error
                  : colors.neutral.white
              }
              fill={
                user && isInWishlist(user.id, property.id) ? colors.status.error : 'transparent'
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography variant="h4" numberOfLines={1}>
              {property.title}
            </Typography>
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
              <Typography variant="caption" color="secondary">
                {property.rating}
              </Typography>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.text.secondary} />
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.location.city}, {property.location.country}
            </Typography>
          </View>
          <View style={styles.propertyDetails}>
            <Typography variant="caption" color="secondary">
              {property.bedrooms} bed • {property.bathrooms} bath
            </Typography>
          </View>
          <View style={styles.propertyFooter}>
            <View>
              <Typography variant="body" color="gold">
                ${property.price.rent}/night
              </Typography>
              <Typography variant="caption" color="secondary">
                Investment from ${property.price.investment.toLocaleString()}
              </Typography>
              <View style={styles.investmentInfo}>
                <TrendingUp size={12} color={colors.status.success} />
                <Typography variant="caption" color="success">
                  {property.investmentDetails.roiEstimate}% yield
                </Typography>
                <Typography variant="caption" color="secondary">
                  • {property.investmentDetails.fundedPercentage}% funded
                </Typography>
              </View>
            </View>
            <View style={styles.propertyType}>
              <Typography variant="caption" color="white">
                {property.propertyType.toUpperCase()}
              </Typography>
            </View>
          </View>
          <View style={styles.amenitiesContainer}>
            {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <View key={index} style={styles.amenityTag}>
                <Typography variant="label" color="secondary">
                  {amenity}
                </Typography>
              </View>
            ))}
            {property.amenities.length > 3 && (
              <Typography variant="label" color="secondary">
                +{property.amenities.length - 3} more
              </Typography>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
  const renderSuggestions = () => {
    if (filteredProperties.length > 0) return null;
    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView>
          <View style={styles.noResultsHeader}>
            <AlertCircle size={24} color={colors.text.secondary} />
            <Typography variant="h4" color="secondary" align="center">
              No properties found
            </Typography>
            <Typography variant="body" color="secondary" align="center">
              Try adjusting your search criteria or explore our suggestions
            </Typography>
          </View>
          {suggestions.nearestDates.length > 0 && (
            <View style={styles.suggestionSection}>
              <View style={styles.suggestionHeader}>
                <Calendar size={20} color={colors.primary.gold} />
                <Typography variant="h5">Nearest Available Dates</Typography>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateChips}>
                  {suggestions.nearestDates.map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dateChip}
                      onPress={() => {
                        filterProperties({ checkInDate: date, checkOutDate: date });
                        setShowFilters(false);
                      }}
                    >
                      <Typography variant="caption" color="gold">
                        {new Date(date).toLocaleDateString()}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          {suggestions.similarInvestments.length > 0 && (
            <View style={styles.suggestionSection}>
              <View style={styles.suggestionHeader}>
                <TrendingUp size={20} color={colors.primary.gold} />
                <Typography variant="h5">High-Yield Investments</Typography>
              </View>
              <FlatList
                data={suggestions.similarInvestments}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}
          <Button
            title="Clear All Filters"
            onPress={handleClearFilters}
            variant="outline"
            style={styles.clearButton}
          />
        </ScrollView>
      </View>
    );
  };
  const activeFiltersCount = hasActiveFilters() ? 1 : 0;
  const headerRightComponent = (
    <TouchableOpacity onPress={handleNotifications} style={styles.notificationButton}>
      <Bell size={24} color={colors.neutral.white} />
      {unreadCount > 0 && (
        <View style={styles.notificationBadge}>
          <Typography variant="label" color="inverse">
            {unreadCount}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <Header
        title=" Discover Luxury"
        subtitle="Find your perfect luxury property"
        showBackButton={false}
        rightComponent={headerRightComponent}
      />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties, locations, amenities..."
            value={localSearchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.text.secondary}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={[styles.filterButton, activeFiltersCount > 0 && styles.activeFilterButton]}
        >
          <Filter
            size={20}
            color={activeFiltersCount > 0 ? colors.neutral.white : colors.primary.gold}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Typography variant="label" color="inverse" style={styles.filterBadgeText}>
                {activeFiltersCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Active Filters Indicator */}
      {hasActiveFilters() && (
        <View style={styles.activeFiltersContainer}>
          <Typography variant="caption" color="secondary">
            Filters applied
          </Typography>
          <TouchableOpacity onPress={handleClearFilters}>
            <Typography variant="caption" color="gold">
              Clear all
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      {/* Property Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Commercial' && styles.activeTab]}
          onPress={() => handleTabChange('Commercial')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Commercial' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Commercial
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Residential' && styles.activeTab]}
          onPress={() => handleTabChange('Residential')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Residential' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Residential
          </Typography>
        </TouchableOpacity>
      </View>
      {/* Results */}
      <View style={styles.resultsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Typography variant="body" color="secondary" align="center">
              Loading luxury properties...
            </Typography>
          </View>
        ) : (
          <>
            {getFilteredPropertiesByTab().length > 0 ? (
              <FlatList
                data={getFilteredPropertiesByTab()}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.propertiesList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary.gold]}
                    tintColor={colors.primary.gold}
                  />
                }
              />
            ) : (
              renderSuggestions()
            )}
          </>
        )}
      </View>
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary.header,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.primary.header,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  filterButton: {
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: colors.primary.gold,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.status.error,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.lightGray,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  propertiesList: {
    padding: spacing.layout.screenPadding,
  },
  propertyItem: {
    marginBottom: spacing.lg,
  },
  propertyCard: {
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: radius.full,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  propertyContent: {
    gap: spacing.sm,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  propertyDetails: {
    marginVertical: spacing.xs,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  investmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  propertyType: {
    backgroundColor: colors.primary.lightGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  amenityTag: {
    backgroundColor: colors.neutral.lightGray,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionsContainer: {
    padding: spacing.layout.screenPadding,
    gap: spacing.lg,
  },
  noResultsHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionSection: {
    gap: spacing.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateChip: {
    backgroundColor: colors.primary.lightGold,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  horizontalList: {
    paddingRight: spacing.lg,
  },
  clearButton: {
    marginTop: spacing.lg,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.status.error,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.layout.screenPadding,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: '600',
  },
});