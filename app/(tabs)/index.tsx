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
  ActivityIndicator,
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
// import { usePropertyStore } from '@/stores/propertyStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useRenterInvestorProfile } from '@/hooks/useRenterInvestorProfile';
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
import { useMarketplaceProperties } from '@/hooks/useMarketplaceProperties';
import { MarketplaceFilters } from '@/services/renterMarketplace';

// Helper functions to convert between filter formats
const convertMarketplaceToModalFilters = (marketplaceFilters: MarketplaceFilters = {}) => {
  return {
    priceRange: [marketplaceFilters.minPrice || 0, marketplaceFilters.maxPrice || 200000],
    bedrooms: marketplaceFilters.bedrooms || 0,
    guests: marketplaceFilters.bathrooms || 1, // Map bathrooms to guests for now
    propertyTypes: [],
    amenities: marketplaceFilters.amenities || [],
    checkInDate: null,
    checkOutDate: null,
    location: "",
  };
};

const convertModalToMarketplaceFilters = (modalFilters: any = {}): MarketplaceFilters => {
  const filters: MarketplaceFilters = {};
  
  if (modalFilters?.priceRange && Array.isArray(modalFilters.priceRange)) {
    if (modalFilters.priceRange[0] > 0) {
      filters.minPrice = modalFilters.priceRange[0];
    }
    if (modalFilters.priceRange[1] < 200000) {
      filters.maxPrice = modalFilters.priceRange[1];
    }
  }
  if (modalFilters?.bedrooms && modalFilters.bedrooms > 0) {
    filters.bedrooms = modalFilters.bedrooms;
  }
  if (modalFilters?.guests && modalFilters.guests > 1) {
    filters.bathrooms = modalFilters.guests; // Map guests back to bathrooms
  }
  if (modalFilters?.amenities && Array.isArray(modalFilters.amenities) && modalFilters.amenities.length > 0) {
    filters.amenities = modalFilters.amenities;
  }
  
  return filters;
};

export default function ExploreScreen() {
  const router = useRouter();
  // const {
  //   filteredProperties,
  //   searchQuery,
  //   filters,
  //   isLoading,
  //   suggestions,
  //   fetchProperties,
  //   searchProperties,
  //   filterProperties,
  //   clearFilters,
  //   hasActiveFilters,
  // } = usePropertyStore();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { profile: profileData, isLoadingProfile: profileLoading, refetchProfile } = useRenterInvestorProfile();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Debug refreshing state changes
  useEffect(() => {
    console.log("[ExploreScreen] Refreshing state changed:", refreshing);
  }, [refreshing]);

  // Use the new marketplace properties hook
  const {
    properties,
    isPropertiesLoading,
    propertiesError,
    refetchProperties,
    pagination,
    loadMore,
    changeType,
    searchProperties,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    currentType,
    searchQuery,
    filters,
    page,
  } = useMarketplaceProperties({});

  useEffect(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = useCallback((query: string) => {
    console.log("[ExploreScreen] Search input changed:", query);
    setLocalSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce search API call by 500ms
    const timeout = setTimeout(() => {
      console.log("[ExploreScreen] Triggering API search:", query);
      searchProperties(query);
    }, 500);
    
    setSearchTimeout(timeout);
  }, [searchTimeout, searchProperties]);

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const handleTabChange = (tab: 'residential' | 'commercial') => {
    changeType(tab);
    // Clear search when changing tabs
    setLocalSearchQuery('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };

  const onRefresh = useCallback(async () => {
    console.log("[ExploreScreen] Pull to refresh triggered");
    setRefreshing(true);
    try {
      // Use Promise.allSettled to handle both promises regardless of individual failures
      const results = await Promise.allSettled([
        refetchProperties(),
        refetchProfile(),
      ]);
      
      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`[ExploreScreen] Refresh ${index === 0 ? 'properties' : 'profile'} failed:`, result.reason);
        }
      });
      
      console.log("[ExploreScreen] Pull to refresh completed");
    } catch (error) {
      console.log("[ExploreScreen] Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProperties, refetchProfile]);

  const handleLoadMore = () => {
    loadMore();
  };

  const handleWishlistToggle = (property: any) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    const isWishlisted = isInWishlist(user.id, property._id);
    if (isWishlisted) {
      removeFromWishlist(user.id, property._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(user.id, property);
      toast.success('Added to wishlist');
    }
  };
  const renderPropertyCard = ({ item: property }: { item: any }) => (
    <TouchableOpacity onPress={() => handlePropertyPress(property._id)} style={styles.propertyItem}>
      <Card style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: property.media?.images?.[0]?.url }} style={styles.propertyImage} />
          <TouchableOpacity
            onPress={() => handleWishlistToggle(property)}
            style={styles.wishlistButton}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={user && isInWishlist(user.id, property._id) ? colors.status.error : colors.neutral.white}
              fill={user && isInWishlist(user.id, property._id) ? colors.status.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography variant="h4" numberOfLines={1}>
              {property.title}
            </Typography>
            {/* Optionally add rating if available */}
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.text.secondary} />
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.address.city.name}, {property.address.country?.name || ''}
            </Typography>
          </View>
          <View style={styles.propertyDetails}>
            <Typography variant="caption" color="secondary">
              {property.specifications.bedrooms} bed • {property.specifications.bathrooms} bath
            </Typography>
          </View>
          <View style={styles.propertyFooter}>
            <View>
              <Typography variant="body" color="gold">
                ${property.rentAmount.basePrice}/month
              </Typography>
              {/* Optionally add investment info if available */}
            </View>
            <View style={styles.propertyType}>
              <Typography variant="caption" color="white">
                {property.type.toUpperCase()}
              </Typography>
            </View>
          </View>
          <View style={styles.amenitiesContainer}>
            {property.amenities.slice(0, 3).map((amenity: any, index: number) => (
              <View key={index} style={styles.amenityTag}>
                <Typography variant="label" color="secondary">
                  {amenity.name}
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

  const headerRightComponent = (
    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notificationButton}>
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
            placeholder="Search properties, locations..."
            value={localSearchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={[styles.filterButton, hasActiveFilters() && styles.activeFilterButton]}
        >
          <Filter
            size={20}
            color={hasActiveFilters() ? colors.neutral.white : colors.primary.gold}
          />
          {hasActiveFilters() && (
            <View style={styles.filterBadge}>
              <View style={styles.filterDot} />
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
          <TouchableOpacity onPress={() => {
            clearFilters();
          }}>
            <Typography variant="caption" color="gold">
              Clear all
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      {/* Property Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentType === 'residential' && styles.activeTab]}
          onPress={() => handleTabChange('residential')}
        >
          <Typography
            variant="body"
            color={currentType === 'residential' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Residential
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentType === 'commercial' && styles.activeTab]}
          onPress={() => handleTabChange('commercial')}
        >
          <Typography
            variant="body"
            color={currentType === 'commercial' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Commercial
          </Typography>
        </TouchableOpacity>
      </View>
      {/* Results */}
      <View style={styles.resultsContainer}>
        {isPropertiesLoading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <Typography variant="body" color="secondary" align="center">
              Loading luxury properties...
            </Typography>
          </View>
        ) : (
          <>
            {properties.length > 0 ? (
              <FlatList
                key={`${currentType}-${page}`}
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.propertiesList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      console.log("[ExploreScreen] RefreshControl triggered");
                      onRefresh();
                    }}
                    colors={[colors.primary.gold]}
                    tintColor={colors.primary.gold}
                    progressBackgroundColor={colors.background.primary}
                  />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  pagination && pagination.currentPage < pagination.totalPages ? (
                    <View style={styles.loadMoreContainer}>
                      {isPropertiesLoading ? (
                        <ActivityIndicator size="small" color={colors.primary.gold} />
                      ) : (
                        <TouchableOpacity
                          style={styles.loadMoreButton}
                          onPress={handleLoadMore}
                        >
                          <Typography variant="body" color="gold">
                            Load More Properties
                          </Typography>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null
                }
              />
            ) : ( 
              <View style={styles.suggestionsContainer}>
                <Typography variant="h4" color="secondary" align="center">
                  No properties found
                </Typography>
              </View>
            )}
          </>
        )}
      </View>
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={convertMarketplaceToModalFilters(filters)}
        onApplyFilters={(modalFilters) => {
          const marketplaceFilters = convertModalToMarketplaceFilters(modalFilters);
          console.log("[ExploreScreen] Applying filters:", marketplaceFilters);
          applyFilters(marketplaceFilters);
          setShowFilters(false);
        }}
        onClearFilters={() => {
          console.log("[ExploreScreen] Clearing filters");
          clearFilters();
          setShowFilters(false);
        }}
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
    backgroundColor: 'transparent',
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.status.error,
    borderRadius: 4,
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
  loadMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadMoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
  },
});