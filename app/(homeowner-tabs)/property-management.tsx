import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Modal } from "@/components/ui/Modal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useResidentialPropertyStore } from "@/stores/residentialPropertyStore";
import {
  useHomeownerPropertyStore,
  HomeownerProperty,
} from "@/stores/homeownerPropertyStore";
import {
  Plus,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AArrowUp,
  Eye,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  X,
  Home,
  Building,
  Edit3,
  Trash2,
  Coins,
  AlertTriangle,
} from "lucide-react-native";

export default function PropertyManagementScreen() {
  const router = useRouter();
  const { resetStore: resetCommercialStore } = useCommercialPropertyStore();
  const { resetStore: resetResidentialStore } = useResidentialPropertyStore();
  const {
    properties,
    isLoading,
    fetchProperties,
    deleteProperty,
    updateProperty,
    updatePropertyStatus,
    pauseFractionalization,
    syncFromCommercialStore,
    syncFromResidentialStore,
  } = useHomeownerPropertyStore();

  const [propertyListFilter, setPropertyListFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [tokenizedFilter, setTokenizedFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<HomeownerProperty | null>(null);
  const [activeTab, setActiveTab] = useState<"property-list" | "tokenized">(
    "property-list"
  );
  const [showPauseBottomSheet, setShowPauseBottomSheet] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [propertyToPause, setPropertyToPause] =
    useState<HomeownerProperty | null>(null);
  const [showEnableDisableBottomSheet, setShowEnableDisableBottomSheet] =
    useState(false);
  const [propertyToToggle, setPropertyToToggle] =
    useState<HomeownerProperty | null>(null);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
    // Sync with property stores
    syncFromCommercialStore();
    syncFromResidentialStore();
  }, []);

  // Reset filters when tab changes
  useEffect(() => {
    if (activeTab === "tokenized") {
      setTokenizedFilter("approved");
    } else if (activeTab === "property-list") {
      setPropertyListFilter("all");
    }
  }, [activeTab]);

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

  const handleViewProperty = (property: HomeownerProperty) => {
    setSelectedProperty(property);
    router.push(`/property-details/${property.id}`);
  };

  const handleEditProperty = (property: HomeownerProperty) => {
    if (property.type === "commercial") {
      router.push("/add-commercial-details/add-commercial-property");
    } else {
      router.push({
        pathname: "/add-residential-details/add-residential-property",
        params: { id: property.id },
      });
    }
  };

  const handleDeleteProperty = (property: HomeownerProperty) => {
    Alert.alert(
      "Delete Property",
      `Are you sure you want to delete "${property.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProperty(property.id);
          },
        },
      ]
    );
  };

  const handlePauseFractionalization = (property: HomeownerProperty) => {
    setPropertyToPause(property);
    setPauseReason("");
    setShowPauseBottomSheet(true);
  };

  const handleConfirmPause = async () => {
    if (!propertyToPause) return;

    try {
      await pauseFractionalization(propertyToPause.id, pauseReason);
      setShowPauseBottomSheet(false);
      setPropertyToPause(null);
      setPauseReason("");
    } catch (error) {
      console.error("Failed to pause fractionalization:", error);
    }
  };

  const handleCancelPause = () => {
    setShowPauseBottomSheet(false);
    setPropertyToPause(null);
    setPauseReason("");
  };

  const handleToggleProperty = (property: HomeownerProperty) => {
    setPropertyToToggle(property);
    setShowEnableDisableBottomSheet(true);
  };

  const handleEnableProperty = async () => {
    if (propertyToToggle) {
      await updateProperty(propertyToToggle.id, { enabled: true });
      setShowEnableDisableBottomSheet(false);
      setPropertyToToggle(null);
    }
  };

  const handleDisableProperty = async () => {
    if (propertyToToggle) {
      await updateProperty(propertyToToggle.id, { enabled: false });
      setShowEnableDisableBottomSheet(false);
      setPropertyToToggle(null);
    }
  };

  const handleCancelToggle = () => {
    setShowEnableDisableBottomSheet(false);
    setPropertyToToggle(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.status.success;
      case "pending":
        return colors.primary.gold;
      case "rejected":
        return colors.status.error;
      case "draft":
        return colors.text.secondary;
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
      case "draft":
        return AlertCircle;
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

  // Filter properties based on search query and selected filter
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const currentFilter =
      activeTab === "property-list" ? propertyListFilter : tokenizedFilter;
    const matchesFilter =
      currentFilter === "all" || property.status === currentFilter;
    return matchesSearch && matchesFilter;
  });

  const getFilterCount = (filter: string) => {
    if (filter === "all") return properties.length;
    return properties.filter((property) => property.status === filter).length;
  };

  const renderPropertyCard = ({
    item: property,
  }: {
    item: HomeownerProperty;
  }) => {
    const StatusIcon = getStatusIcon(property.status);

    return (
      <Card style={styles.propertyCard}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: property.image }}
            style={styles.propertyImage}
          />
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(property.status) },
              ]}
            >
              <StatusIcon size={12} color={colors.neutral.white} />
              <Typography
                variant="label"
                color="inverse"
                style={styles.statusText}
              >
                {getStatusLabel(property.status)}
              </Typography>
            </View>
            {property.rejectionReason && (
              <View style={styles.rejectionReasonContainer}>
                <AlertCircle size={12} color={colors.status.error} />
                <Typography variant="caption" color="error" numberOfLines={2}>
                  {property.rejectionReason}
                </Typography>
              </View>
            )}
          </View>
        </View>

        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography
              variant="h5"
              numberOfLines={1}
              style={styles.propertyTitle}
            >
              {property.title}
            </Typography>
            <View style={styles.propertyTypeBadge}>
              <Typography variant="caption" color="secondary">
                {property.type === "commercial" ? "Commercial" : "Residential"}
              </Typography>
            </View>
          </View>

          <Typography variant="caption" color="secondary" numberOfLines={1}>
            {property.location}
          </Typography>

          <View style={styles.propertyDetails}>
            {property.price && (
              <Typography variant="body" color="gold">
                ${parseInt(property.price).toLocaleString()}
              </Typography>
            )}
            <View style={styles.propertySpecs}>
              {property.bedrooms && (
                <Typography variant="caption" color="secondary">
                  {property.bedrooms} bed
                </Typography>
              )}
              {property.bathrooms && (
                <Typography variant="caption" color="secondary">
                  • {property.bathrooms} bath
                </Typography>
              )}
              {property.squareFootage && (
                <Typography variant="caption" color="secondary">
                  • {property.squareFootage} sq ft
                </Typography>
              )}
            </View>
          </View>

          <Typography variant="caption" color="secondary">
            {property.status === "draft" ? "Created" : "Submitted"} on{" "}
            {(property.createdAt instanceof Date
              ? property.createdAt
              : new Date(property.createdAt || Date.now())
            ).toLocaleDateString()}
          </Typography>

          <View style={styles.propertyActions}>
            <TouchableOpacity
              onPress={() => handleViewProperty(property)}
              style={styles.actionButton}
            >
              <Eye size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                View Details
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleEditProperty(property)}
              style={styles.actionButton}
            >
              <Edit3 size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                Edit
              </Typography>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => handleDeleteProperty(property)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Trash2 size={16} color={colors.status.error} />
              <Typography variant="caption" color="error">
                Delete
              </Typography>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => handleToggleProperty(property)}
              style={[
                styles.actionButton,
                property.enabled ? styles.enableButton : styles.disableButton,
              ]}
            >
              {property.enabled ? (
                <>
                  <CheckCircle size={16} color={colors.neutral.white} />
                  <Typography variant="caption" color="white">
                    Enable
                  </Typography>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} color={colors.neutral.white} />
                  <Typography variant="caption" color="white">
                    Disable
                  </Typography>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Pause Fractionalization Button - Only for approved tokenized properties in Tokenized tab */}
          {activeTab === "tokenized" && property.status === "approved" && (
            <View style={styles.pauseFractionalizationContainer}>
              <Button
                title="Pause Fractionalization"
                onPress={() => handlePauseFractionalization(property)}
                variant="primary"
                size="medium"
                style={styles.pauseFractionalizationButton}
              />
            </View>
          )}
        </View>
      </Card>
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

  return (
    <View style={styles.container}>
      <Header
        title="Property Management"
        subtitle="Manage your luxury properties"
        showBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Tab Navigation */}
        <View style={styles.section}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "property-list" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("property-list")}
            >
              <Building2
                size={20}
                color={
                  activeTab === "property-list"
                    ? colors.neutral.white
                    : colors.text.secondary
                }
              />
              <Typography
                variant="body"
                color={activeTab === "property-list" ? "white" : "secondary"}
                style={styles.tabText}
              >
                Property List
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "tokenized" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("tokenized")}
            >
              <Coins
                size={20}
                color={
                  activeTab === "tokenized"
                    ? colors.neutral.white
                    : colors.text.secondary
                }
              />
              <Typography
                variant="body"
                color={activeTab === "tokenized" ? "white" : "secondary"}
                style={styles.tabText}
              >
                Tokenized
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property List Tab Content */}
        {activeTab === "property-list" && (
          <>
            {/* Search and Filter Section */}
            <View style={styles.section}>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search
                    size={20}
                    color={colors.text.secondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search properties..."
                    placeholderTextColor={colors.text.secondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} color={colors.primary.navy} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.section}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContainer}>
                  {[
                    { key: "all", label: "All Properties" },
                    { key: "pending", label: "Awaiting Approval" },
                    { key: "approved", label: "Approved" },
                    { key: "rejected", label: "Reassigned with Reason" },
                  ].map((filter) => (
                    <TouchableOpacity
                      key={filter.key}
                      onPress={() => setPropertyListFilter(filter.key as any)}
                      style={[
                        styles.filterTab,
                        propertyListFilter === filter.key &&
                          styles.activeFilterTab,
                      ]}
                    >
                      <Typography
                        variant="body"
                        color={
                          propertyListFilter === filter.key
                            ? "inverse"
                            : "secondary"
                        }
                        style={styles.filterText}
                      >
                        {filter.label} ({getFilterCount(filter.key)})
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Properties List */}
            <View style={styles.section}>
              {filteredProperties.length > 0 ? (
                <FlatList
                  data={filteredProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              ) : (
                <Card style={styles.emptyState}>
                  <Building2 size={48} color={colors.text.secondary} />
                  <Typography variant="h4" color="secondary" align="center">
                    No properties found
                  </Typography>
                  <Typography variant="body" color="secondary" align="center">
                    {searchQuery
                      ? "No properties match your search criteria"
                      : propertyListFilter === "all"
                      ? "Start by adding your first property"
                      : `No ${propertyListFilter} properties at the moment`}
                  </Typography>
                  {propertyListFilter === "all" && !searchQuery && (
                    <Button
                      title="Add Property"
                      onPress={handleAddProperty}
                      style={styles.emptyStateButton}
                    />
                  )}
                </Card>
              )}
            </View>
          </>
        )}

        {/* Tokenized Tab Content */}
        {activeTab === "tokenized" && (
          <>
            {/* Search and Filter Section for Tokenized */}
            <View style={styles.section}>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search
                    size={20}
                    color={colors.text.secondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search tokenized properties..."
                    placeholderTextColor={colors.text.secondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} color={colors.primary.navy} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tokenized Properties List */}
            <View style={styles.section}>
              {filteredProperties.length > 0 ? (
                <FlatList
                  data={filteredProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              ) : (
                <Card style={styles.emptyState}>
                  <Coins size={48} color={colors.text.secondary} />
                  <Typography variant="h4" color="secondary" align="center">
                    No tokenized properties found
                  </Typography>
                  <Typography variant="body" color="secondary" align="center">
                    {searchQuery
                      ? "No tokenized properties match your search criteria"
                      : "Start by tokenizing your first property"}
                  </Typography>
                </Card>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <PropertyTypeModal />

      {/* Floating Add Property Button - Only show for Property List tab */}
      {activeTab === "property-list" && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddProperty}
        >
          <Plus size={24} color={colors.neutral.white} />
        </TouchableOpacity>
      )}

      {/* Pause Fractionalization Bottom Sheet */}
      <BottomSheet
        visible={showPauseBottomSheet}
        onClose={handleCancelPause}
        title="Pause Fractionalization?"
      >
        {propertyToPause && (
          <View style={styles.bottomSheetContent}>
            <Typography
              variant="body"
              color="secondary"
              style={styles.bottomSheetSubtitle}
            >
              This will temporarily stop new token investments.
            </Typography>

            {/* Property Details */}
            <View style={styles.propertyDetailsSection}>
              <View style={styles.propertyThumbnailContainer}>
                <Image
                  source={{ uri: propertyToPause.image }}
                  style={styles.propertyThumbnail}
                />
                <View style={styles.propertyInfo}>
                  <Typography variant="h5" numberOfLines={2}>
                    {propertyToPause.title}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {propertyToPause.location}
                  </Typography>
                </View>
              </View>

              {/* Token Details */}
              <View style={styles.tokenDetailsContainer}>
                <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Token Name/Symbol:
                  </Typography>
                  <Typography variant="body" style={styles.tokenValue}>
                    {propertyToPause.tokenSymbol || "N/A"}
                  </Typography>
                </View>

                {/*  <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Current Status:
                  </Typography>
                  <View style={[styles.tokenStatusBadge, { backgroundColor: propertyToPause.tokenStatus === 'active' ? colors.status.success : colors.status.error }]}>
                    <Typography variant="caption" color="inverse">
                      {propertyToPause.tokenStatus === 'active' ? 'Active' : 'Paused'}
                    </Typography>
                  </View>
                </View>*/}

                <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Total Tokens Issued:
                  </Typography>
                  <Typography variant="body" style={styles.tokenValue}>
                    {propertyToPause.totalTokensIssued?.toLocaleString() || "0"}
                  </Typography>
                </View>

                <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Investors Count:
                  </Typography>
                  <Typography variant="body" style={styles.tokenValue}>
                    {propertyToPause.investorsCount?.toLocaleString() || "0"}
                  </Typography>
                </View>

                <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Total Investment Raised:
                  </Typography>
                  <Typography variant="body" style={styles.tokenValue}>
                    ₹
                    {propertyToPause.totalInvestmentRaised?.toLocaleString() ||
                      "0"}
                  </Typography>
                </View>
              </View>

              {/* Warning Message */}
              <View style={styles.warningContainer}>
                <AlertTriangle size={16} color={colors.status.error} />
                <Typography
                  variant="caption"
                  color="error"
                  style={styles.warningText}
                >
                  Pausing fractionalization will prevent new investors from
                  purchasing tokens. Existing token holders will not be
                  affected.
                </Typography>
              </View>

              {/* Reason Input */}
              <View style={styles.reasonInputContainer}>
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.reasonLabel}
                >
                  Reason for Pausing
                </Typography>
                <Input
                  placeholder="Enter reason for pausing..."
                  value={pauseReason}
                  onChangeText={setPauseReason}
                  multiline
                  numberOfLines={3}
                  style={styles.reasonInput}
                />
              </View>

              {/* Action Buttons */}
              <Button
                title="Confirm Pause"
                onPress={handleConfirmPause}
                variant="primary"
                size="medium"
                style={styles.confirmButton}
              />
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Enable/Disable Property Bottom Sheet */}
      <BottomSheet
        visible={showEnableDisableBottomSheet}
        onClose={handleCancelToggle}
        title={
          propertyToToggle?.enabled ? "Disable Property?" : "Enable Property?"
        }
      >
        {propertyToToggle && (
          <View style={styles.bottomSheetContent}>
            <Typography
              variant="body"
              color="secondary"
              style={styles.bottomSheetSubtitle}
            >
              {propertyToToggle.enabled
                ? "This will disable the property and hide it from potential investors."
                : "This will enable the property and make it visible to potential investors."}
            </Typography>

            {/* Property Details */}
            <View style={styles.propertyDetailsSection}>
              <View style={styles.propertyThumbnailContainer}>
                <Image
                  source={{ uri: propertyToToggle.image }}
                  style={styles.propertyThumbnail}
                />
                <View style={styles.propertyInfo}>
                  <Typography variant="h5" numberOfLines={2}>
                    {propertyToToggle.title}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {propertyToToggle.location}
                  </Typography>
                </View>
              </View>

              {/* Current Status */}
              <View style={styles.tokenDetailsContainer}>
                <View style={styles.tokenDetailRow}>
                  <Typography variant="body" color="secondary">
                    Current Status:
                  </Typography>
                  <View
                    style={[
                      styles.tokenStatusBadge,
                      {
                        backgroundColor: propertyToToggle.enabled
                          ? colors.status.success
                          : colors.status.error,
                      },
                    ]}
                  >
                    <Typography variant="caption" color="inverse">
                      {propertyToToggle.enabled ? "Enabled" : "Disabled"}
                    </Typography>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.bottomSheetActions}>
                {propertyToToggle.enabled ? (
                  <Button
                    title="Disable Property"
                    onPress={handleDisableProperty}
                    variant="secondary"
                    size="medium"
                    style={styles.confirmButton}
                  />
                ) : (
                  <Button
                    title="Enable Property"
                    onPress={handleEnableProperty}
                    variant="primary"
                    size="medium"
                    style={styles.confirmButton}
                  />
                )}

                <Button
                  title="Cancel"
                  onPress={handleCancelToggle}
                  variant="outline"
                  size="medium"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  activeTabButton: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
  addPropertyButton: {
    marginHorizontal: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: "Montserrat-Regular",
  },
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  activeFilterTab: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  filterText: {
    fontWeight: "500",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    ...shadow.small,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  rejectionReasonContainer: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    maxWidth: 150,
    ...shadow.small,
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
  deleteButton: {
    backgroundColor: colors.background.tertiary,
  },
  enableButton: {
    backgroundColor: colors.status.success,
  },
  disableButton: {
    backgroundColor: colors.status.warning,
  },
  separator: {
    height: spacing.md,
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
  pauseFractionalizationContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  pauseFractionalizationButton: {
    width: "100%",
  },
  // Bottom Sheet Styles
  bottomSheetContent: {
    gap: spacing.lg,
  },
  bottomSheetSubtitle: {
    marginBottom: spacing.md,
  },
  propertyDetailsSection: {
    gap: spacing.lg,
  },
  propertyThumbnailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
  },
  propertyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  propertyInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  tokenDetailsContainer: {
    gap: spacing.md,
  },
  tokenDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  tokenValue: {
    fontWeight: "600",
  },
  tokenStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
  },
  warningText: {
    flex: 1,
    fontStyle: "italic",
    lineHeight: 18,
  },
  reasonInputContainer: {
    gap: spacing.sm,
  },
  reasonLabel: {
    fontWeight: "500",
  },
  reasonInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  bottomSheetActions: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  confirmButton: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    marginTop: spacing.sm,
  },
  floatingButton: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    width: 52,
    height: 52,
    borderRadius: 28,
    backgroundColor: colors.primary.gold,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.large,
    elevation: 8,
    zIndex: 1000,
  },
});
