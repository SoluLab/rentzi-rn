import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router"; 
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FilterModal } from "@/components/ui/FilterModal";
import { Header } from "@/components/ui/Header";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { usePropertyStore } from "@/stores/propertyStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { useMarketplaceProperties } from "@/hooks/useMarketplaceProperties";
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
} from "lucide-react-native";
export default function ExploreScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"Commercial" | "Residential">(
    "Residential"
  );
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  
  // Use TanStack Query for marketplace properties
  const {
    data: marketplaceData,
    isLoading,
    error,
    refetch,
  } = useMarketplaceProperties({
    page: currentPage,
    limit: 10,
  });

  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();
  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        // For now, we'll just update the local search query
        // In a real implementation, you might want to refetch with search params
        console.log('Search query:', query);
      }, 300);
      setSearchTimeout(timeout);
    },
    [searchTimeout]
  );
  
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };
  
  const handleApplyFilters = (newFilters: any) => {
    // For now, we'll just log the filters
    // In a real implementation, you might want to refetch with filter params
    console.log('Applied filters:', newFilters);
  };
  
  const handleClearFilters = () => {
    setLocalSearchQuery("");
    // Reset to first page when clearing filters
    setCurrentPage(1);
  };
  
  const handleTabChange = (tab: "Commercial" | "Residential") => {
    setSelectedTab(tab);
  };
  
  const handleLoadMore = () => {
    if (marketplaceData?.data?.pagination) {
      const { currentPage, totalPages } = marketplaceData.data.pagination;
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };
  
  // Filter properties based on selected tab
  const getFilteredPropertiesByTab = () => {
    if (!marketplaceData?.data?.items) return [];
    
    let tabFilteredProperties = marketplaceData.data.items;
    if (selectedTab === "Commercial") {
      // Commercial properties: office, retail, warehouse, etc.
      tabFilteredProperties = marketplaceData.data.items.filter(
        (property: any) =>
          ["office", "retail", "warehouse", "commercial"].includes(
            property.type
          ) ||
          property.title.toLowerCase().includes("commercial") ||
          property.title.toLowerCase().includes("office") ||
          property.title.toLowerCase().includes("retail")
      );
    } else {
      // Residential properties: villa, penthouse, mansion, apartment, etc.
      tabFilteredProperties = marketplaceData.data.items.filter(
        (property: any) =>
          [
            "villa",
            "penthouse",
            "mansion",
            "apartment",
            "house",
            "condo",
            "loft",
            "cabin",
            "treehouse",
            "farmhouse",
            "yacht",
          ].includes(property.type) ||
          !["office", "retail", "warehouse", "commercial"].includes(
            property.type
          )
      );
    }
    return tabFilteredProperties;
  };
  const handleNotifications = () => {
    router.push("/notifications");
  };
  const handleWishlistToggle = (property: any) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    const isWishlisted = isInWishlist(user.id, property._id);
    if (isWishlisted) {
      removeFromWishlist(user.id, property._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(user.id, property);
      toast.success("Added to wishlist");
    }
  };
  const renderPropertyCard = ({ item: property }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handlePropertyPress(property._id)}
      style={styles.propertyItem}
    >
      <Card style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&quality=40' }}
            style={styles.propertyImage}
          />
          <TouchableOpacity
            onPress={() => handleWishlistToggle(property)}
            style={styles.wishlistButton}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={
                user && isInWishlist(user.id, property._id)
                  ? colors.status.error
                  : colors.neutral.white
              }
              fill={
                user && isInWishlist(user.id, property._id)
                  ? colors.status.error
                  : "transparent"
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
              <Star
                size={16}
                color={colors.primary.gold}
                fill={colors.primary.gold}
              />
              <Typography variant="caption" color="secondary">
                4.8
              </Typography>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.text.secondary} />
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.propertyCategory}
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
                ${property.rentAmount.basePrice}/night
              </Typography>
              <Typography variant="caption" color="secondary">
                {property.specifications.area} {property.specifications.unit}
              </Typography>
            </View>
            <View style={styles.propertyType}>
              <Typography variant="caption" color="white">
                {property.type.toUpperCase()}
              </Typography>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
  const renderSuggestions = () => {
    if (getFilteredPropertiesByTab().length > 0) return null;
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
  
  const activeFiltersCount = localSearchQuery.trim() ? 1 : 0;
  const headerRightComponent = (
    <TouchableOpacity
      onPress={handleNotifications}
      style={styles.notificationButton}
    >
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
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.activeFilterButton,
          ]}
        >
          <Filter
            size={20}
            color={
              activeFiltersCount > 0
                ? colors.neutral.white
                : colors.primary.gold
            }
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Typography
                variant="label"
                color="inverse"
                style={styles.filterBadgeText}
              >
                {activeFiltersCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Active Filters Indicator */}
      {activeFiltersCount > 0 && (
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
          style={[styles.tab, selectedTab === "Commercial" && styles.activeTab]}
          onPress={() => handleTabChange("Commercial")}
        >
          <Typography
            variant="body"
            color={selectedTab === "Commercial" ? "white" : "secondary"}
            style={styles.tabText}
          >
            Commercial
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === "Residential" && styles.activeTab,
          ]}
          onPress={() => handleTabChange("Residential")}
        >
          <Typography
            variant="body"
            color={selectedTab === "Residential" ? "white" : "secondary"}
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
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Typography variant="body" color="secondary" align="center">
              Error loading properties. Please try again.
            </Typography>
            <Button
              title="Retry"
              onPress={() => refetch()}
              variant="outline"
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <>
            {getFilteredPropertiesByTab().length > 0 ? (
              <FlatList
                data={getFilteredPropertiesByTab()}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.propertiesList}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
              />
            ) : (
              renderSuggestions()
            )}
            {marketplaceData?.data?.pagination && (
              <View style={styles.paginationContainer}>
                <Typography variant="caption" color="secondary" align="center">
                  Page {marketplaceData.data.pagination.currentPage} of {marketplaceData.data.pagination.totalPages}
                </Typography>
              </View>
            )}
          </>
        )}
      </View>
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{}}
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
    flexDirection: "row",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.primary.header,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeFilterButton: {
    backgroundColor: colors.primary.gold,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.status.error,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.lightGray,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  propertiesList: {
    padding: spacing.layout.screenPadding,
  },
  propertyItem: {
    marginBottom: spacing.lg,
  },
  propertyCard: {
    overflow: "hidden",
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 200,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  wishlistButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: radius.full,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  propertyContent: {
    gap: spacing.sm,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  propertyDetails: {
    marginVertical: spacing.xs,
  },
  propertyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  investmentInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
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
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionSection: {
    gap: spacing.md,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateChips: {
    flexDirection: "row",
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
    position: "relative",
    padding: spacing.sm,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.status.error,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
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
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
  paginationContainer: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
});
