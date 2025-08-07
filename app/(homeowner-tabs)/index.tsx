import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Modal } from "@/components/ui/Modal";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useResidentialPropertyStore } from "@/stores/residentialPropertyStore";
import { useHomeownerPropertyStore } from "@/stores/homeownerPropertyStore";
import { useHomeownerDashboard } from "@/hooks/useHomeownerDashboard";
import {
  Bell,
  Plus,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
  AArrowDown,
  AArrowUp,
  TrendingUp,
  Users,
  Home,
  Building,
  X,
  Eye,
} from "lucide-react-native";

export default function HomeownerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { resetStore: resetCommercialStore } = useCommercialPropertyStore();
  const { resetStore: resetResidentialStore } = useResidentialPropertyStore();
  
  // Use custom dashboard hook
  const {
    dashboardStats,
    isStatsLoading,
    refetchStats,
    properties: allProperties,
    isPropertiesLoading: propertiesLoading,
    refetchProperties,
    currentPage,
    hasMoreData,
    loadMoreProperties,
    refreshData,
  } = useHomeownerDashboard();

  const [showPropertyModal, setShowPropertyModal] = useState(false);

  const handleNotifications = () => {
    router.push("/notifications");
  };

  const handleAddProperty = () => {
    setShowPropertyModal(true);
  };

  const handleCloseModal = () => {
    setShowPropertyModal(false);
  };

  const handleAddCommercialProperty = () => {
    setShowPropertyModal(false);
    resetCommercialStore();
    router.push("/add-commercial-details/add-commercial-property");
  };

  const handleAddResidentialProperty = () => {
    setShowPropertyModal(false);
    resetResidentialStore();
    router.push("/add-residential-details/add-residential-property");
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property-details/${propertyId}`);
  };

  const handleLoadMore = () => {
    loadMoreProperties();
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handlePullToRefresh = () => {
    refetchStats();
    refetchProperties();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.status.success;
      case "pending":
        return colors.primary.gold;
      case "rejected":
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Awaiting Approval";
      case "rejected":
        return "Reassigned with Reason";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

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

  const renderPropertyCard = ({ item: property }: { item: any }) => {
    const StatusIcon = getStatusIcon(property.status || "active");
    return (
      <TouchableOpacity
        onPress={() => handlePropertyPress(property._id)}
        style={styles.propertyItem}
      >
        <Card style={styles.propertyCard}>
          <View style={styles.cardHeader}>
            <Image
              source={{ uri: property.image || "https://via.placeholder.com/300x200" }}
              style={styles.propertyImage}
            />
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(property.status || "active") },
                ]}
              >
                <StatusIcon size={12} color={colors.neutral.white} />
                <Typography
                  variant="label"
                  color="inverse"
                  style={styles.statusText}
                >
                  {getStatusLabel(property.status || "active")}
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.propertyContent}>
            <View style={styles.propertyHeader}>
              <Typography
                variant="h5"
                numberOfLines={1}
                style={styles.propertyTitle}
              >
                {property.name}
              </Typography>
              <View style={styles.propertyTypeBadge}>
                <Typography variant="caption" color="secondary">
                  {property.category === "villa" ? "Residential" : "Commercial"}
                </Typography>
              </View>
            </View>

            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.location?.address}, {property.location?.city}
            </Typography>

            <View style={styles.propertyDetails}>
              {property.pricing?.basePrice && (
                <Typography variant="body" color="gold">
                  ${property.pricing.basePrice.toLocaleString()}
                </Typography>
              )}
              <View style={styles.propertySpecs}>
                {property.capacity?.bedrooms && (
                  <Typography variant="caption" color="secondary">
                    {property.capacity.bedrooms} bed
                  </Typography>
                )}
                {property.capacity?.bathrooms && (
                  <Typography variant="caption" color="secondary">
                    • {property.capacity.bathrooms} bath
                  </Typography>
                )}
                {property.capacity?.maxGuests && (
                  <Typography variant="caption" color="secondary">
                    • {property.capacity.maxGuests} guests
                  </Typography>
                )}
              </View>
            </View>

            <Typography variant="caption" color="secondary">
              {property.status === "draft" ? "Created" : "Submitted"} on{" "}
              {new Date(property.createdAt || Date.now()).toLocaleDateString()}
            </Typography>

            <View style={styles.propertyActions}>
              <TouchableOpacity
                onPress={() => handlePropertyPress(property._id)}
                style={styles.actionButton}
              >
                <Eye size={16} color={colors.primary.navy} />
                <Typography variant="caption" color="primary">
                  View Details
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const PropertyTypeModal = () => (
    <Modal visible={showPropertyModal} onClose={handleCloseModal}>
      <View style={styles.modalHeader}>
        <Typography variant="h4" style={styles.modalTitle}>
          Add New Property
        </Typography>
        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
          <X size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
        Choose the type of property you want to add to your portfolio
      </Typography>

      <View style={styles.propertyTypeContainer}>
        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddResidentialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Home size={32} color={colors.primary.gold} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Residential Property
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              style={styles.propertyTypeDescription}
            >
              Houses, apartments, villas, and other residential units for
              personal or rental use
            </Typography>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddCommercialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Building size={32} color={colors.primary.blue} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Commercial Property
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              style={styles.propertyTypeDescription}
            >
              Office buildings, retail spaces, warehouses, and other commercial
              real estate
            </Typography>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );



  // Show loading state when both stats and properties are loading for the first time
  const isInitialLoading = isStatsLoading && propertiesLoading && allProperties.length === 0;

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Owner"}`}
        subtitle="Manage your luxury properties"
        showBackButton={false}
        rightComponent={headerRightComponent}
      />
            {/* Loading indicator for refresh */}
      {(isStatsLoading || propertiesLoading) && allProperties.length > 0 && (
        <View style={styles.refreshLoading}>
          <ActivityIndicator size="small" color={colors.primary.gold} />
          <Typography variant="caption" color="secondary" style={styles.refreshLoadingText}>
            Refreshing...
          </Typography>
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isStatsLoading || propertiesLoading}
            onRefresh={handlePullToRefresh}
            colors={[colors.primary.gold]}
            tintColor={colors.primary.gold}
          />
        }
      >
        {/* Dashboard Metrics */}
        <View style={styles.section}>
          <View style={styles.metricsContainer}>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Building2 size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.totalProperties || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Properties
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <CheckCircle size={24} color={colors.status.success} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.activeProperties || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Active Properties
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Clock size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.pendingApproval || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Pending Approvals
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <DollarSign size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    ${dashboardStats?.data?.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Revenue
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <TrendingUp size={24} color={colors.primary.blue} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    ${dashboardStats?.data?.monthlyRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Monthly Revenue
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Calendar size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.activeBookings || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Active Bookings
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <CheckCircle2 size={24} color={colors.status.success} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.completedBookings || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Completed Bookings
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Users size={24} color={colors.primary.blue} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardStats?.data?.totalBookings || 0}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Bookings
                  </Typography>
                </View>
              </View>
            </Card>
          </View>
        </View>
        
        {/* Additional Metrics */}
        {dashboardStats?.data && (
          <View style={styles.section}>
            <View style={styles.additionalMetricsContainer}>
              <Card style={styles.additionalMetricCard}>
                <View style={styles.additionalMetricContent}>
                  <View style={styles.additionalMetricHeader}>
                    <Typography variant="h5" style={styles.additionalMetricTitle}>
                      Performance Overview
                    </Typography>
                  </View>
                  <View style={styles.additionalMetricRow}>
                    <View style={styles.additionalMetricItem}>
                      <Typography variant="caption" color="secondary">
                        Average Rating
                      </Typography>
                      <View style={styles.ratingContainer}>
                        <Typography variant="h4" color="primary">
                          {dashboardStats.data.averageRating?.toFixed(1) || '0.0'}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          / 5.0
                        </Typography>
                      </View>
                    </View>
                    <View style={styles.additionalMetricItem}>
                      <Typography variant="caption" color="secondary">
                        Total Reviews
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {dashboardStats.data.totalReviews || 0}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.additionalMetricRow}>
                    <View style={styles.additionalMetricItem}>
                      <Typography variant="caption" color="secondary">
                        Occupancy Rate
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {dashboardStats.data.occupancyRate?.toFixed(1) || '0.0'}%
                      </Typography>
                    </View>
                    <View style={styles.additionalMetricItem}>
                      <Typography variant="caption" color="secondary">
                        Draft Properties
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {dashboardStats.data.draftProperties || 0}
                      </Typography>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        )}
        
        {/* Recent Bookings */}
        {dashboardStats?.data?.recentBookings && dashboardStats.data.recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="h4" style={styles.sectionTitle}>
                Recent Bookings
              </Typography>
            </View>
            <View style={styles.recentBookingsContainer}>
              {dashboardStats.data.recentBookings.slice(0, 3).map((booking: any, index: number) => (
                <Card key={booking._id} style={styles.recentBookingCard}>
                  <View style={styles.recentBookingContent}>
                    <View style={styles.recentBookingHeader}>
                      <Typography variant="h6" style={styles.recentBookingPropertyName}>
                        {booking.propertyName}
                      </Typography>
                      <View style={[
                        styles.bookingStatusBadge,
                        { backgroundColor: booking.status === 'confirmed' ? colors.status.success : colors.primary.gold }
                      ]}>
                        <Typography variant="label" color="inverse" style={styles.bookingStatusText}>
                          {booking.status.toUpperCase()}
                        </Typography>
                      </View>
                    </View>
                    <Typography variant="caption" color="secondary">
                      Guest: {booking.guestName}
                    </Typography>
                    <View style={styles.recentBookingDates}>
                      <Typography variant="caption" color="secondary">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </Typography>
                    </View>
                    <View style={styles.recentBookingAmount}>
                      <Typography variant="h6" color="primary">
                        ${booking.totalAmount.toLocaleString()}
                      </Typography>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}
        
        {/* Add Property Button */}
        <View style={styles.section}>
          <Button
            title="Add New Property"
            onPress={handleAddProperty}
            style={styles.addPropertyButton}
          />
        </View>
        {/* Listed Properties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Your Properties
            </Typography>
            <TouchableOpacity
              onPress={() =>
                router.push("/(homeowner-tabs)/property-management")
              }
            >
              <Typography variant="body" color="gold">
                View All
              </Typography>
            </TouchableOpacity>
          </View>
          {propertiesLoading && currentPage === 1 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.gold} />
              <Typography variant="body" color="secondary" style={styles.loadingText}>
                Loading properties...
              </Typography>
            </View>
          ) : allProperties.length > 0 ? (
            <>
              <FlatList
                data={allProperties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  hasMoreData ? (
                    <View style={styles.loadMoreContainer}>
                      {propertiesLoading ? (
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
            </>
                      ) : (
              <Card style={styles.emptyState}>
                <Building2 size={48} color={colors.text.secondary} />
                <Typography variant="h4" color="secondary" align="center">
                  No properties found
                </Typography>
                <Typography variant="body" color="secondary" align="center">
                  Start by adding your first property to get started
                </Typography>
                <Button
                  title="Add Property"
                  onPress={handleAddProperty}
                  style={styles.emptyStateButton}
                />
              </Card>
            )}
        </View>
      </ScrollView>

      <PropertyTypeModal />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  metricContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  metricText: {
    flex: 1,
  },
  addPropertyButton: {
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  propertyItem: {
    marginBottom: spacing.md,
  },
  propertyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.medium,
  },
  cardHeader: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 140,
  },
  statusContainer: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  propertyContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  propertyTypeBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  propertyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertySpecs: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  propertyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  propertyTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  propertyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontWeight: "600",
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  propertyTypeContainer: {
    gap: spacing.md,
  },
  propertyTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  propertyTypeContent: {
    flex: 1,
  },
  propertyTypeTitle: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyTypeDescription: {
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  loadMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  loadMoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
  },
  paginationInfo: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  additionalMetricsContainer: {
    marginTop: spacing.sm,
  },
  additionalMetricCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  additionalMetricContent: {
    gap: spacing.md,
  },
  additionalMetricHeader: {
    marginBottom: spacing.sm,
  },
  additionalMetricTitle: {
    fontWeight: "600",
  },
  additionalMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  additionalMetricItem: {
    flex: 1,
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  recentBookingsContainer: {
    gap: spacing.md,
  },
  recentBookingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentBookingContent: {
    gap: spacing.sm,
  },
  recentBookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recentBookingPropertyName: {
    flex: 1,
    marginRight: spacing.sm,
    fontWeight: "600",
  },
  bookingStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  bookingStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  recentBookingDates: {
    marginTop: spacing.xs,
  },
  recentBookingAmount: {
    alignItems: "flex-end",
    marginTop: spacing.xs,
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  refreshLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    gap: spacing.sm,
  },
  refreshLoadingText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...shadow.medium,
  },
  emptyStateButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});
