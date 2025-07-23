import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { usePropertyStore } from '@/stores/propertyStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useInvestmentStore } from '@/stores/investmentStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  Bell,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Search,
  AlertCircle,
  MapPin,
} from 'lucide-react-native';
export default function MyStaysScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    properties,
    fetchProperties,
    getApprovedProperties,
    isLoading,
    searchProperties,
    filteredProperties,
    searchQuery,
    suggestions,
  } = usePropertyStore();
  const { getUserBookings } = useBookingStore();
  const { getUserInvestments, getTotalPortfolioValue } = useInvestmentStore();
  const { unreadCount } = useNotificationStore();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const userBookings = user ? getUserBookings(user.id) : [];
  const userInvestments = user ? getUserInvestments(user.id) : [];
  const portfolioValue = user ? getTotalPortfolioValue(user.id) : 0;
  const approvedProperties = getApprovedProperties();
  const displayProperties = localSearchQuery.trim() ? filteredProperties : approvedProperties;
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);
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
  const handleNotifications = () => {
    router.push('/notifications');
  };
  const handlePropertyAction = () => {
    if (user?.role === 'homeowner') {
      router.push('/property-management');
    } else {
      router.push('/(tabs)/index');
    }
  };
  const renderBookingSection = (title: string, bookings: typeof userBookings) => {
    if (bookings.length === 0) return null;
    return (
      <View style={styles.section}>
        <Typography variant="h4" style={styles.sectionTitle}>
          {title}
        </Typography>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {bookings.slice(0, 3).map((booking) => {
            const property = properties.find((p) => p.id === booking.propertyId);
            return (
              <TouchableOpacity
                key={booking.id}
                onPress={() => router.push(`/booking/detail/${booking.id}`)}
              >
                <Card style={styles.bookingCard}>
                  {property && (
                    <Image
                      source={{ uri: property.mediaGallery.images[0] }}
                      style={styles.bookingImage}
                    />
                  )}
                  <View style={styles.bookingContent}>
                    <Typography variant="h4" numberOfLines={1}>
                      {property?.title || 'Property'}
                    </Typography>
                     {/* Location display */}
                     {property?.location && (
                      <Typography variant="caption" color="secondary">
                        {property.location.city}, {property.location.country}
                      </Typography>
                    )}
                    <Typography variant="caption" color="secondary">
                      {booking.startDate} - {booking.endDate}
                    </Typography>
                    <View style={[styles.statusBadge, styles[`${booking.bookingStatus}Badge`]]}>
                      <Typography variant="label" color="inverse">
                        {booking.bookingStatus?.toUpperCase()}
                      </Typography>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  const renderRenterDashboard = () => {
    const upcomingBookings = userBookings.filter((booking) => booking.bookingStatus === 'upcoming');
    const pastBookings = userBookings.filter((booking) => booking.bookingStatus === 'completed');
    const cancelledBookings = userBookings.filter(
      (booking) => booking.bookingStatus === 'cancelled'
    );
    if (userBookings.length === 0) {
      return (
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Your Bookings
          </Typography>
          <Card style={styles.emptyCard}>
            <Calendar size={48} color={colors.text.secondary} />
            <Typography variant="body" color="secondary" align="center">
              No bookings yet. Discover luxury properties to get started.
            </Typography>
            <Button
              title="Explore Properties"
              onPress={() => router.push('/(tabs)/index')}
              style={styles.actionButton}
            />
          </Card>
        </View>
      );
    }
    return (
      <>
        {renderBookingSection('Upcoming Bookings', upcomingBookings)}
        {renderBookingSection('Past Bookings', pastBookings)}
        {renderBookingSection('Cancelled Bookings', cancelledBookings)}
      </>
    );
  };
  const renderInvestorDashboard = () => (
    <View style={styles.section}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Investment Portfolio
      </Typography>
      <Card style={styles.portfolioCard}>
        <View style={styles.portfolioHeader}>
          <TrendingUp size={32} color={colors.primary.gold} />
          <View style={styles.portfolioStats}>
            <Typography variant="h4" color="gold">
              ${portfolioValue.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="secondary">
              Total Portfolio Value
            </Typography>
          </View>
        </View>
        <View style={styles.portfolioMetrics}>
          <View style={styles.metric}>
            <Typography variant="h4">{userInvestments.length}</Typography>
            <Typography variant="caption" color="secondary">
              Properties
            </Typography>
          </View>
          <View style={styles.metric}>
            <Typography variant="h4" color="gold">
              +12.5%
            </Typography>
            <Typography variant="caption" color="secondary">
              ROI
            </Typography>
          </View>
        </View>
      </Card>
    </View>
  );
  const renderHomeownerDashboard = () => (
    <View style={styles.section}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Your Properties
      </Typography>
      <Card style={styles.emptyCard}>
        <CheckCircle2 size={48} color={colors.text.secondary} />
        <Typography variant="body" color="secondary" align="center">
          Start listing your luxury properties to attract premium renters and investors.
        </Typography>
        <Button
          title="Add Property"
          onPress={() => router.push('/property-create')}
          style={styles.actionButton}
        />
      </Card>
    </View>
  );
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
      <Header title="My Stays" showBackButton={false} rightComponent={headerRightComponent} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.welcomeSection}>
          <Typography variant="h4">Welcome back,</Typography>
          <Typography variant="h5" color={colors.primary.gold}>
            Mr. Rikin
          </Typography>
        </View>
        {/* Quick Actions  
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Quick Actions
          </Typography>
          <View style={styles.quickActions}>
            <TouchableOpacity onPress={handlePropertyAction} style={styles.quickAction}>
              <Card style={styles.quickActionCard}>
                <Plus size={32} color={colors.primary.gold} />
                <Typography variant="body" align="center">
                  {user?.role === 'homeowner' ? 'Manage Properties' : 'Discover Properties'}
                </Typography>
              </Card>
            </TouchableOpacity>
            {user?.investmentStatus && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/portfolio')}
                style={styles.quickAction}
              >
                <Card style={styles.quickActionCard}>
                  <TrendingUp size={32} color={colors.primary.gold} />
                  <Typography variant="body" align="center">
                    View Portfolio
                  </Typography>
                </Card>
              </TouchableOpacity>
            )}
          </View>
        </View>
        */}
        {/* Role-specific content */}
        {user?.role === 'renter' && renderRenterDashboard()}
        {user?.investmentStatus && renderInvestorDashboard()}
        {user?.role === 'homeowner' && renderHomeownerDashboard()}
        {/* Mixed Listings Feed */}
        <View style={styles.section}>
          <View style={styles.feedHeader}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Luxury Properties
            </Typography>
            <Typography variant="body" color="secondary">
              Rent or invest in premium properties
            </Typography>
          </View>
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
              />
            </View>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Typography variant="body" color="secondary" align="center">
                Loading luxury properties...
              </Typography>
            </View>
          ) : (
            <>
              {displayProperties.length > 0 ? (
                <FlatList
                  data={displayProperties}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePropertyPress(item.id)}>
                      <PropertyCard property={item} showType="both" />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  scrollEnabled={false}
                />
              ) : localSearchQuery.trim() ? (
                <View style={styles.noResultsContainer}>
                  <View style={styles.noResultsHeader}>
                    <AlertCircle size={24} color={colors.text.secondary} />
                    <Typography variant="h4" color="secondary" align="center">
                      No properties found
                    </Typography>
                    <Typography variant="body" color="secondary" align="center">
                      Try adjusting your search or explore our suggestions
                    </Typography>
                  </View>
                  {suggestions.nearestDates.length > 0 && (
                    <View style={styles.suggestionSection}>
                      <View style={styles.suggestionHeader}>
                        <Calendar size={20} color={colors.primary.gold} />
                        <Typography variant="h4">Nearest Available Dates</Typography>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.dateChips}>
                          {suggestions.nearestDates.map((date, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.dateChip}
                              onPress={() => {
                                setLocalSearchQuery('');
                                searchProperties('');
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
                        <Typography variant="h4">High-Yield Investments</Typography>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.horizontalSuggestions}>
                          {suggestions.similarInvestments.map((property) => (
                            <TouchableOpacity
                              key={property.id}
                              onPress={() => handlePropertyPress(property.id)}
                              style={styles.suggestionCard}
                            >
                              <Card style={styles.suggestionPropertyCard}>
                                <Image
                                  source={{ uri: property.mediaGallery.images[0] }}
                                  style={styles.suggestionImage}
                                />
                                <View style={styles.suggestionContent}>
                                  <Typography variant="body" numberOfLines={1}>
                                    {property.title}
                                  </Typography>
                                  <View style={styles.suggestionLocation}>
                                    <MapPin size={12} color={colors.text.secondary} />
                                    <Typography
                                      variant="caption"
                                      color="secondary"
                                      numberOfLines={1}
                                    >
                                      {property.location.city}
                                    </Typography>
                                  </View>
                                  <Typography variant="caption" color="gold">
                                    {property.investmentDetails.roiEstimate}% yield
                                  </Typography>
                                </View>
                              </Card>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  )}
                  <Button
                    title="Clear Search"
                    onPress={() => {
                      setLocalSearchQuery('');
                      searchProperties('');
                    }}
                    variant="outline"
                    style={styles.clearButton}
                  />
                </View>
              ) : null}
            </>
          )}
          {!localSearchQuery.trim() && approvedProperties.length > 0 && (
            <Button
              title="View All Properties"
              onPress={() => router.push('/(tabs)/index')}
              variant="outline"
              style={styles.viewAllButton}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
  },
  quickActionCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  horizontalScroll: {
    marginHorizontal: -spacing.layout.screenPadding,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  bookingCard: {
    width: 280,
    marginRight: spacing.md,
  },
  bookingImage: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  bookingContent: {
    gap: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  upcomingBadge: {
    backgroundColor: colors.status.info,
  },
  activeBadge: {
    backgroundColor: colors.status.success,
  },
  completedBadge: {
    backgroundColor: colors.text.secondary,
  },
  portfolioCard: {
    gap: spacing.lg,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  portfolioStats: {
    flex: 1,
  },
  portfolioMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  metric: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedHeader: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  propertiesList: {
    gap: spacing.lg,
  },
  viewAllButton: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  actionButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  noResultsContainer: {
    paddingVertical: spacing.lg,
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
  horizontalSuggestions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  suggestionCard: {
    width: 200,
  },
  suggestionPropertyCard: {
    overflow: 'hidden',
  },
  suggestionImage: {
    width: '100%',
    height: 120,
    marginBottom: spacing.sm,
  },
  suggestionContent: {
    gap: spacing.xs,
  },
  suggestionLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearButton: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
});