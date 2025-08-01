import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
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
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useResidentialPropertyStore } from "@/stores/residentialPropertyStore";
import { useHomeownerPropertyStore } from "@/stores/homeownerPropertyStore";
import { useHomeownerGetAllProperties } from "@/services/apiClient";
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
} from "lucide-react-native";

export default function HomeownerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { resetStore: resetCommercialStore } = useCommercialPropertyStore();
  const { resetStore: resetResidentialStore } = useResidentialPropertyStore();
  const {
    dashboardMetrics,
    fetchDashboardMetrics,
    syncFromCommercialStore,
    syncFromResidentialStore,
  } = useHomeownerPropertyStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [allProperties, setAllProperties] = useState<any[]>([]);

  // Use the API hook to fetch properties with pagination
  const { data: propertiesData, isLoading: propertiesLoading } = useHomeownerGetAllProperties(
    {
      page: currentPage,
      limit: 10, // Items per page
    }
  );

  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Handle pagination data
  useEffect(() => {
    if (propertiesData?.data) {
      if (currentPage === 1) {
        // First page - replace all data
        setAllProperties(propertiesData.data);
      } else {
        // Subsequent pages - append data
        setAllProperties(prev => [...prev, ...propertiesData.data]);
      }
      
      // Check if there's more data
      const pagination = propertiesData.pagination;
      setHasMoreData(pagination?.currentPage < pagination?.totalPages);
    }
  }, [propertiesData, currentPage]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardMetrics();
    // Sync with property stores
    syncFromCommercialStore();
    syncFromResidentialStore();
  }, []);

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
    if (hasMoreData && !propertiesLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setAllProperties([]);
    setHasMoreData(true);
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
          <Image
            source={{ uri: property.image || "https://via.placeholder.com/300x200" }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyContent}>
            <View style={styles.propertyHeader}>
              <Typography
                variant="h5"
                numberOfLines={1}
                style={styles.propertyTitle}
              >
                {property.name}
              </Typography>
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
                  {(property.status || "active").toUpperCase()}
                </Typography>
              </View>
            </View>
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.location?.address}, {property.location?.city}
            </Typography>
            <View style={styles.propertyStats}>
              <View style={styles.statItem}>
                <DollarSign size={14} color={colors.primary.gold} />
                <Typography variant="caption" color="secondary">
                  ${property.pricing?.basePrice?.toLocaleString() || 0} {property.pricing?.currency || "USD"}
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Building2 size={14} color={colors.primary.navy} />
                <Typography variant="caption" color="secondary">
                  {property.capacity?.bedrooms || 0} beds
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Users size={14} color={colors.primary.blue} />
                <Typography variant="caption" color="secondary">
                  {property.capacity?.maxGuests || 0} guests
                </Typography>
              </View>
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

  const recentProperties = allProperties;

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Owner"}`}
        subtitle="Manage your luxury properties"
        showBackButton={false}
        rightComponent={headerRightComponent}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Metrics */}
        <View style={styles.section}>
          <View style={styles.metricsContainer}>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Building2 size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardMetrics.totalProperties}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Properties
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Clock size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardMetrics.pendingApprovals}
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
                    $12000 
                    {/* dashboardMetrics.totalEarnings.toLocaleString() */}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Earnings
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Calendar size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {dashboardMetrics.activeBookings}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Active Bookings
                  </Typography>
                </View>
              </View>
            </Card>
          </View>
        </View>
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
          ) : recentProperties.length > 0 ? (
            <>
              <FlatList
                data={recentProperties}
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
              {propertiesData?.pagination && (
                <View style={styles.paginationInfo}>
                  <Typography variant="caption" color="secondary">
                    Page {propertiesData.pagination.currentPage} of {propertiesData.pagination.totalPages} 
                    ({propertiesData.pagination.totalItems} total properties)
                  </Typography>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Typography variant="body" color="secondary">
                No properties found. Add your first property to get started.
              </Typography>
            </View>
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
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  propertyImage: {
    width: "100%",
    height: 120,
  },
  propertyContent: {
    padding: spacing.md,
    gap: spacing.sm,
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
});
