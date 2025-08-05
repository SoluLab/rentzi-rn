import React, { useState, useMemo } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { Header } from "@/components/ui/Header";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { useAuthStore } from "@/stores/authStore";
import { ShoppingCart, ChevronDown } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
const { width } = Dimensions.get("window");
export default function MarketplaceScreen() {
  const { user } = useAuthStore();
  const [selectedSortOption, setSelectedSortOption] =
    useState<string>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [buyForm, setBuyForm] = useState({ quantity: "" });
  const [activeTab, setActiveTab] = useState<
    "main" | "my" | "requests" | "purchases"
  >("main");

  // Make myListings and secondaryMarketListings stateful for removal
  const [myListings, setMyListings] = useState([
    {
      id: "my-listing-1",
      propertyName: "My Beach House",
      tokenSymbol: "MBH",
      quantityListed: 50,
      pricePerToken: 100.0,
      totalValue: 5000,
      roiPercent: 10.0,
      sellerName: "You",
      listingDate: "2024-12-11",
      location: "Goa, India",
      propertyImage:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
      status: "Active",
    },
  ]);
  const [secondaryMarketListings, setSecondaryMarketListings] = useState([
    {
      id: "listing-1",
      propertyName: "Luxury Villa Santorini",
      tokenSymbol: "LVS",
      quantityListed: 150,
      pricePerToken: 125.5,
      totalValue: 18825,
      roiPercent: 12.5,
      sellerName: "John D.",
      listingDate: "2024-12-10",
      location: "Santorini, Greece",
      propertyImage:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
      listingExpiry: "2024-12-31",
    },
    {
      id: "listing-2",
      propertyName: "Manhattan Penthouse",
      tokenSymbol: "MNP",
      quantityListed: 75,
      pricePerToken: 280.0,
      totalValue: 21000,
      roiPercent: 15.8,
      sellerName: "Sarah M.",
      listingDate: "2024-12-08",
      location: "New York, USA",
      propertyImage:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      listingExpiry: undefined,
    },
    {
      id: "listing-3",
      propertyName: "Dubai Marina Tower",
      tokenSymbol: "DMT",
      quantityListed: 200,
      pricePerToken: 95.75,
      totalValue: 19150,
      roiPercent: 9.2,
      sellerName: "Ahmed K.",
      listingDate: "2024-12-05",
      location: "Dubai, UAE",
      propertyImage:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      listingExpiry: "2025-01-10",
    },
    {
      id: "listing-4",
      propertyName: "London Luxury Flat",
      tokenSymbol: "LLF",
      quantityListed: 100,
      pricePerToken: 165.25,
      totalValue: 16525,
      roiPercent: 11.3,
      sellerName: "Emma W.",
      listingDate: "2024-12-03",
      location: "London, UK",
      propertyImage:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      listingExpiry: undefined,
    },
    {
      id: "listing-5",
      propertyName: "Tokyo Sky Residence",
      tokenSymbol: "TSR",
      quantityListed: 120,
      pricePerToken: 210.0,
      totalValue: 25200,
      roiPercent: 18.7,
      sellerName: "Hiroshi T.",
      listingDate: "2024-12-01",
      location: "Tokyo, Japan",
      propertyImage:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      listingExpiry: "2025-02-01",
    },
  ]);

  // Cancel listing modal state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [listingToCancel, setListingToCancel] = useState<any>(null);

  const handleCancelListing = (listing: any) => {
    setListingToCancel(listing);
    setCancelModalVisible(true);
  };
  const handleConfirmCancel = () => {
    if (!listingToCancel) return;
    // Remove from myListings
    setMyListings((prev) => prev.filter((l) => l.id !== listingToCancel.id));
    // Remove from secondaryMarketListings if present
    setSecondaryMarketListings((prev) =>
      prev.filter((l) => l.id !== listingToCancel.id)
    );
    setCancelModalVisible(false);
    setListingToCancel(null);
  };
  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
    setListingToCancel(null);
  };
  const sortOptions = [
    { label: "Highest ROI", value: "highest_roi" },
    { label: "Lowest Price", value: "lowest_price" },
    { label: "Newest First", value: "newest" },
  ];
  const sortedSecondaryMarketListings = useMemo(() => {
    let sorted = [...secondaryMarketListings];
    switch (selectedSortOption) {
      case "highest_roi":
        sorted.sort((a, b) => b.roiPercent - a.roiPercent);
        break;
      case "lowest_price":
        sorted.sort((a, b) => a.pricePerToken - b.pricePerToken);
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.listingDate).getTime() -
            new Date(a.listingDate).getTime()
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [selectedSortOption]);
  const handleBuyTokensPress = (listing: any) => {
    setSelectedListing(listing);
    setBuyForm({ quantity: "" });
    setShowBuyTokensModal(true);
  };
  const handleCloseBuyModal = () => {
    setShowBuyTokensModal(false);
    setSelectedListing(null);
    setBuyForm({ quantity: "" });
  };
  const handleBuyFormChange = (field: string, value: string) => {
    setBuyForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const calculateBuyTotal = () => {
    const quantity = parseInt(buyForm.quantity) || 0;
    const price = selectedListing?.pricePerToken || 0;
    return quantity * price;
  };
  const handleConfirmPurchase = () => {
    if (!buyForm.quantity || parseInt(buyForm.quantity) <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    const quantity = parseInt(buyForm.quantity);
    const maxTokens = selectedListing?.quantityListed || 0;
    if (quantity > maxTokens) {
      Alert.alert("Error", `Only ${maxTokens} tokens are available`);
      return;
    }
    const totalCost = calculateBuyTotal();
    Alert.alert(
      "Purchase Confirmation",
      `You are about to purchase ${quantity} tokens of ${
        selectedListing?.propertyName
      } for $${totalCost.toLocaleString()}. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Purchase",
          onPress: () => {
            handleCloseBuyModal();
            Alert.alert("Success", "Token purchase completed successfully!");
          },
        },
      ]
    );
  };
  // Dummy data for My Listings and Purchases Done (replace with real data as needed)
  const purchasesDone = [
    // Example purchase for Purchases Done
    {
      id: "purchase-1",
      propertyName: "Luxury Villa Santorini",
      tokenSymbol: "LVS",
      quantityBought: 10,
      pricePerToken: 125.5,
      totalValue: 1255,
      roiPercent: 12.5,
      sellerName: "John D.",
      purchaseDate: "2024-12-10",
      location: "Santorini, Greece",
      propertyImage:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
      ownershipPercent: 0.5, // Example ownership percentage
    },
  ];
  // Dummy data for Purchase Requests (replace with real data as needed)
  const purchaseRequests = [
    {
      id: "request-1",
      propertyName: "Dubai Marina Tower",
      tokenSymbol: "DMT",
      quantityRequested: 5,
      pricePerToken: 95.75,
      totalValue: 478.75,
      roiPercent: 9.2,
      sellerName: "Ahmed K.",
      requestDate: "2024-12-12",
      location: "Dubai, UAE",
      propertyImage:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
    },
  ];
  // Purchases Done CSV Export
  const handleExportPurchasesCSV = async () => {
    if (!purchasesDone.length) return;
    // Prepare CSV header and rows
    const header = [
      "Token Name",
      "Property Name",
      "Quantity Purchased",
      "Ownership % Gained",
      "Purchase Date",
    ];
    const rows = purchasesDone.map((purchase) => [
      purchase.tokenSymbol,
      purchase.propertyName,
      purchase.quantityBought,
      purchase.ownershipPercent ? purchase.ownershipPercent + "%" : "",
      purchase.purchaseDate
        ? new Date(purchase.purchaseDate).toLocaleDateString()
        : "",
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    // Save to a file and share
    const fileUri = FileSystem.cacheDirectory + "purchases.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Export Purchases CSV",
    });
  };
  return (
    <View style={styles.container}>
      {/* Header 
      <Header
        title="Secondary Marketplace"
        subtitle="Track luxury real estate investments."
        showBackButton={false}
      />
      */}
      {/* Tab Section - replaced with notification-style horizontal tab bar */}
      <ScrollView
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {[
          { label: "Main Listings", value: "main" },
          { label: "My Listings", value: "my" },
          { label: "Purchase Requests", value: "requests" },
          { label: "Purchases Done", value: "purchases" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value as any)}
            activeOpacity={0.8}
          >
            <Typography
              variant="body2"
              color={activeTab === tab.value ? "inverse" : "secondary"}
              weight={activeTab === tab.value ? "bold" : "normal"}
            >
              {tab.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Tab Content */}
      {activeTab === "main" && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Typography variant="h5" style={styles.sectionTitle}>
                  Available Token Listings
                </Typography>
                <Typography variant="caption" color="secondary">
                  {secondaryMarketListings.length} listings available
                </Typography>
              </View>
              {/* Sort By Dropdown */}
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                  activeOpacity={0.7}
                >
                  <Typography
                    variant="body"
                    color="primary"
                    style={styles.sortButtonText}
                  >
                    {sortOptions.find(
                      (option) => option.value === selectedSortOption
                    )?.label || "Newest First"}
                  </Typography>
                  <ChevronDown
                    size={16}
                    color={colors.text.secondary}
                    style={{
                      transform: [
                        { rotate: showSortDropdown ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </TouchableOpacity>
                {showSortDropdown && (
                  <View style={styles.sortDropdown}>
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sortOption,
                          selectedSortOption === option.value &&
                            styles.sortOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedSortOption(option.value);
                          setShowSortDropdown(false);
                        }}
                      >
                        <Typography
                          variant="body"
                          color={
                            selectedSortOption === option.value
                              ? "gold"
                              : "primary"
                          }
                        >
                          {option.label}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {sortedSecondaryMarketListings.map((listing) => (
              <Card key={listing.id} style={styles.tokenListingCard}>
                {/* Property Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        listing.propertyImage ||
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
                    }}
                    style={styles.tokenListingImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log("Image loading error, using fallback");
                    }}
                  />
                  {/* ROI Badge Overlay */}
                  {listing.roiPercent && (
                    <View
                      style={[
                        styles.roiBadgeOverlay,
                        {
                          backgroundColor:
                            listing.roiPercent >= 15
                              ? colors.status.success
                              : listing.roiPercent >= 10
                              ? colors.primary.gold
                              : colors.text.secondary,
                        },
                      ]}
                    >
                      <Typography
                        variant="label"
                        color="inverse"
                        style={styles.roiBadgeText}
                      >
                        +{listing.roiPercent}% ROI
                      </Typography>
                    </View>
                  )}
                </View>
                {/* Card Content */}
                <View style={styles.tokenListingContent}>
                  {/* Property Title and Token Name */}
                  <View style={styles.propertyTitleSection}>
                    <Typography
                      variant="h4"
                      numberOfLines={2}
                      style={styles.propertyTitle}
                    >
                      {listing.propertyName}
                    </Typography>
                    <View style={styles.locationContainer}>
                      <Typography
                        variant="body"
                        color="secondary"
                        style={styles.locationText}
                      >
                        📍 {listing.location}
                      </Typography>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="secondary"
                        style={{ marginRight: 4 }}
                      >
                        Token Name:
                      </Typography>
                      <Typography variant="body" color="gold">
                        {listing.tokenSymbol}
                      </Typography>
                    </View>
                  </View>
                  {/* Token Information Grid */}
                  <View style={styles.tokenInfoGrid}>
                    <View style={styles.tokenInfoItem}>
                      <Typography
                        variant="caption"
                        color="secondary"
                        style={styles.infoLabel}
                      >
                        Quantity Available
                      </Typography>
                      <Typography variant="h4" style={styles.tokenQuantity}>
                        {listing.quantityListed.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        tokens left
                      </Typography>
                    </View>
                    <View style={styles.tokenInfoItem}>
                      <Typography
                        variant="caption"
                        color="secondary"
                        style={styles.infoLabel}
                      >
                        Unit Price
                      </Typography>
                      <Typography
                        variant="h4"
                        color="gold"
                        style={styles.tokenPrice}
                      >
                        ${listing.pricePerToken.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        per token
                      </Typography>
                    </View>
                  </View>
                  {/* ROI Estimate and Listing Expiry */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    {listing.roiPercent && (
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" color="secondary">
                          ROI Estimate:
                        </Typography>
                        <Typography variant="body" color="gold">
                          +{listing.roiPercent}%
                        </Typography>
                      </View>
                    )}
                    {listing.listingExpiry && (
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" color="secondary">
                          Listing Expiry:
                        </Typography>
                        <Typography variant="body">
                          {new Date(listing.listingExpiry).toLocaleDateString()}
                        </Typography>
                      </View>
                    )}
                  </View>
                  {/* Buy Now Button */}
                  <TouchableOpacity
                    style={[styles.buyTokenButton, { marginTop: 16 }]}
                    onPress={() => handleBuyTokensPress(listing)}
                    activeOpacity={0.8}
                  >
                    <ShoppingCart size={20} color={colors.text.inverse} />
                    <Typography
                      variant="body"
                      color="inverse"
                      style={styles.buyTokenButtonText}
                    >
                      Buy Now
                    </Typography>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
      {activeTab === "my" && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            {myListings.length === 0 ? (
              <Typography
                variant="body"
                color="secondary"
                style={{ textAlign: "center", marginTop: 40 }}
              >
                You have no listings yet.
              </Typography>
            ) : (
              myListings.map((listing) => (
                <Card key={listing.id} style={styles.tokenListingCard}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: listing.propertyImage }}
                      style={styles.tokenListingImage}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        styles.roiBadgeOverlay,
                        {
                          backgroundColor:
                            listing.roiPercent >= 15
                              ? colors.status.success
                              : listing.roiPercent >= 10
                              ? colors.primary.gold
                              : colors.text.secondary,
                        },
                      ]}
                    >
                      <Typography
                        variant="label"
                        color="inverse"
                        style={styles.roiBadgeText}
                      >
                        +{listing.roiPercent}% ROI
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.tokenListingContent}>
                    {/* Property Name and Token Name */}
                    <View style={styles.propertyTitleSection}>
                      <Typography
                        variant="h4"
                        numberOfLines={2}
                        style={styles.propertyTitle}
                      >
                        {listing.propertyName}
                      </Typography>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={{ marginRight: 4 }}
                        >
                          Token Name:
                        </Typography>
                        <Typography variant="body" color="gold">
                          {listing.tokenSymbol}
                        </Typography>
                      </View>
                    </View>
                    {/* Listing Info Grid */}
                    <View style={styles.tokenInfoGrid}>
                      <View style={styles.tokenInfoItem}>
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={styles.infoLabel}
                        >
                          Quantity Listed
                        </Typography>
                        <Typography variant="h4" style={styles.tokenQuantity}>
                          {listing.quantityListed.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={styles.tokenInfoItem}>
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={styles.infoLabel}
                        >
                          Unit Price
                        </Typography>
                        <Typography
                          variant="h4"
                          color="gold"
                          style={styles.tokenPrice}
                        >
                          ${listing.pricePerToken.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={styles.tokenInfoItem}>
                        <Typography
                          variant="caption"
                          color="secondary"
                          style={styles.infoLabel}
                        >
                          Total Value
                        </Typography>
                        <Typography
                          variant="h4"
                          color="gold"
                          style={styles.tokenPrice}
                        >
                          ${listing.totalValue.toLocaleString()}
                        </Typography>
                      </View>
                    </View>
                    {/* Status and Cancel Button */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                      }}
                    >
                      <View>
                        <Typography variant="caption" color="secondary">
                          Status:
                        </Typography>
                        <Typography
                          variant="body"
                          color={
                            listing.status === "Active" ? "gold" : "secondary"
                          }
                        >
                          {listing.status}
                        </Typography>
                      </View>
                      {listing.status === "Active" && (
                        <TouchableOpacity
                          style={[
                            styles.buyTokenButton,
                            {
                              backgroundColor: colors.status.warning,
                              paddingHorizontal: 20,
                              paddingVertical: 10,
                            },
                          ]}
                          onPress={() => handleCancelListing(listing)}
                          activeOpacity={0.8}
                        >
                          <Typography
                            variant="body"
                            color="inverse"
                            style={styles.buyTokenButtonText}
                          >
                            Cancel Listing
                          </Typography>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
          {/* Cancel Listing Modal */}
          <Modal visible={cancelModalVisible} onClose={handleCloseCancelModal}>
            <View style={{ padding: 24 }}>
              <Typography
                variant="h4"
                color="primary"
                style={{ marginBottom: 16 }}
              >
                Cancel Listing
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                style={{ marginBottom: 24 }}
              >
                Are you sure you want to cancel this listing? This action cannot
                be undone.
              </Typography>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={handleCloseCancelModal}
                  style={[
                    styles.buyTokenButton,
                    {
                      backgroundColor: colors.background.secondary,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      marginRight: 8,
                    },
                  ]}
                >
                  <Typography
                    variant="body"
                    color="primary"
                    style={styles.buyTokenButtonText}
                  >
                    No
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmCancel}
                  style={[
                    styles.buyTokenButton,
                    {
                      backgroundColor: colors.status.warning,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    },
                  ]}
                >
                  <Typography
                    variant="body"
                    color="inverse"
                    style={styles.buyTokenButtonText}
                  >
                    Yes, Cancel
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
      {activeTab === "requests" && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            {purchaseRequests.length === 0 ? (
              <Typography
                variant="body"
                color="secondary"
                style={{ textAlign: "center", marginTop: 40 }}
              >
                You have no purchase requests yet.
              </Typography>
            ) : (
              purchaseRequests.map((request) => {
                // Example platform fee: 2%
                const platformFee = 0.02;
                const totalPrice =
                  request.quantityRequested * request.pricePerToken;
                const totalWithFee = totalPrice + totalPrice * platformFee;
                // Anonymized buyer (e.g., 'Buyer 1234')
                const anonymizedBuyer = "Buyer " + request.id.slice(-4);
                return (
                  <Card
                    key={request.id}
                    style={[
                      styles.tokenListingCard,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                      },
                    ]}
                  >
                    {/* Property Image/Thumbnail */}
                    <Image
                      source={{ uri: request.propertyImage }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        marginRight: 16,
                        backgroundColor: "#eee",
                      }}
                      resizeMode="cover"
                    />
                    {/* Info Section */}
                    <View style={{ flex: 1 }}>
                      {/* Token Name and Property Name */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Typography variant="h4" style={{ marginRight: 8 }}>
                          {request.tokenSymbol}
                        </Typography>
                        <Typography variant="body" color="secondary">
                          {request.propertyName}
                        </Typography>
                      </View>
                      {/* Buyer, Quantity, Total Price */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <View style={{ marginRight: 16 }}>
                          <Typography variant="caption" color="secondary">
                            Buyer
                          </Typography>
                          <Typography variant="body">
                            {anonymizedBuyer}
                          </Typography>
                        </View>
                        <View style={{ marginRight: 16 }}>
                          <Typography variant="caption" color="secondary">
                            Quantity
                          </Typography>
                          <Typography variant="body">
                            {request.quantityRequested}
                          </Typography>
                        </View>
                        <View>
                          <Typography variant="caption" color="secondary">
                            Total Price (incl. fee)
                          </Typography>
                          <Typography variant="body" color="gold">
                            $
                            {totalWithFee.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
      {activeTab === "purchases" && (
        <View style={{ flex: 1 }}>
          {/* Export CSV Button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              margin: 12,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary.gold,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              onPress={handleExportPurchasesCSV}
              activeOpacity={0.8}
            >
              <Typography
                variant="body"
                color="inverse"
                style={{ fontWeight: "bold" }}
              >
                Export CSV
              </Typography>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.section}>
              {purchasesDone.length === 0 ? (
                <Typography
                  variant="body"
                  color="secondary"
                  style={{ textAlign: "center", marginTop: 40 }}
                >
                  You have not made any purchases yet.
                </Typography>
              ) : (
                purchasesDone.map((purchase) => {
                  // Example: Ownership % Gained = (quantityBought / 1000) * 100 (assuming 1000 total tokens per property)
                  const ownershipPercent =
                    purchase.ownershipPercent ??
                    ((purchase.quantityBought / 1000) * 100).toFixed(2);
                  return (
                    <Card
                      key={purchase.id}
                      style={[
                        styles.tokenListingCard,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 12,
                        },
                      ]}
                    >
                      {/* Property Image/Thumbnail */}
                      <Image
                        source={{ uri: purchase.propertyImage }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          marginRight: 16,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="cover"
                      />
                      {/* Info Section */}
                      <View style={{ flex: 1 }}>
                        {/* Token Name and Property Name */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Typography variant="h4" style={{ marginRight: 8 }}>
                            {purchase.tokenSymbol}
                          </Typography>
                          <Typography variant="body" color="secondary">
                            {purchase.propertyName}
                          </Typography>
                        </View>
                        {/* Quantity, Ownership %, Purchase Date */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <View style={{ marginRight: 16 }}>
                            <Typography variant="caption" color="secondary">
                              Quantity
                            </Typography>
                            <Typography variant="body">
                              {purchase.quantityBought}
                            </Typography>
                          </View>
                          <View style={{ marginRight: 16 }}>
                            <Typography variant="caption" color="secondary">
                              Ownership % Gained
                            </Typography>
                            <Typography variant="body" color="gold">
                              {ownershipPercent}%
                            </Typography>
                          </View>
                          <View>
                            <Typography variant="caption" color="secondary">
                              Purchase Date
                            </Typography>
                            <Typography variant="body">
                              {purchase.purchaseDate
                                ? new Date(
                                    purchase.purchaseDate
                                  ).toLocaleDateString()
                                : ""}
                            </Typography>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      )}
      {/* Buy Tokens Modal */}
      <Modal visible={showBuyTokensModal} onClose={handleCloseBuyModal}>
        {selectedListing && (
          <View
            style={[
              styles.buyModalContent,
              {
                height: "100%",
                width: "100%",
                position: "relative",
                paddingBottom: 0,
                marginTop: 0,
              },
            ]}
          >
            {" "}
            {/* Add margin from top */}
            {/* Modal Header always visible */}
            <View style={styles.modalHeader}>
              <Typography variant="h3" color="primary">
                Buy Tokens
              </Typography>
              <TouchableOpacity
                onPress={handleCloseBuyModal}
                style={styles.closeButton}
              >
                <Typography variant="h4" color="secondary">
                  ×
                </Typography>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 90 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Property Info */}
              <View style={styles.modalSection}>
                <View style={styles.buyPropertyCard}>
                  <Image
                    source={{
                      uri:
                        selectedListing.propertyImage ||
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
                    }}
                    style={styles.buyPropertyImage}
                    resizeMode="cover"
                  />
                  <View style={styles.buyPropertyDetails}>
                    <Typography variant="h4" numberOfLines={2}>
                      {selectedListing.propertyName}
                    </Typography>
                    <Typography variant="body" color="secondary">
                      {selectedListing.location}
                    </Typography>
                    <View style={styles.buyPropertyMetrics}>
                      <View style={styles.buyMetricItem}>
                        <Typography variant="caption" color="secondary">
                          Token Symbol
                        </Typography>
                        <Typography variant="body" color="gold">
                          {selectedListing.tokenSymbol}
                        </Typography>
                      </View>
                      <View style={styles.buyMetricItem}>
                        <Typography variant="caption" color="secondary">
                          ROI
                        </Typography>
                        <Typography variant="body" color="gold">
                          +{selectedListing.roiPercent}%
                        </Typography>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* Token Details */}
              <View style={styles.modalSection}>
                <Typography variant="h5" style={styles.modalSectionTitle}>
                  Token Information
                </Typography>
                <View style={styles.buyTokenDetailsCard}>
                  <View style={styles.buyTokenDetailRow}>
                    <Typography variant="body" color="secondary">
                      Price per Token:
                    </Typography>
                    <Typography variant="h4" color="gold">
                      ${selectedListing.pricePerToken.toLocaleString()}
                    </Typography>
                  </View>
                  <View style={styles.buyTokenDetailRow}>
                    <Typography variant="body" color="secondary">
                      Available Tokens:
                    </Typography>
                    <Typography variant="h4">
                      {selectedListing.quantityListed.toLocaleString()}
                    </Typography>
                  </View>
                </View>
              </View>
              {/* Purchase Form */}
              <View style={styles.modalSection}>
                <Typography variant="h5" style={styles.modalSectionTitle}>
                  Purchase Details
                </Typography>
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Typography variant="body">Quantity to Buy</Typography>
                  </View>
                  <Input
                    value={buyForm.quantity}
                    onChangeText={(value) =>
                      handleBuyFormChange("quantity", value)
                    }
                    placeholder={`Max: ${selectedListing.quantityListed} tokens`}
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                  />
                  <Typography variant="caption" color="secondary">
                    Enter the number of tokens you want to purchase
                  </Typography>
                </View>
                {/* Total Calculation */}
                {buyForm.quantity && parseInt(buyForm.quantity) > 0 && (
                  <View style={styles.buyTotalCard}>
                    <View style={styles.buyTotalHeader}>
                      <Typography variant="h5">Purchase Summary</Typography>
                    </View>
                    <View style={styles.buyTotalDetails}>
                      <View style={styles.buyTotalRow}>
                        <Typography variant="body" color="secondary">
                          Quantity:
                        </Typography>
                        <Typography variant="body">
                          {buyForm.quantity} tokens
                        </Typography>
                      </View>
                      <View style={styles.buyTotalRow}>
                        <Typography variant="body" color="secondary">
                          Price per Token:
                        </Typography>
                        <Typography variant="body">
                          ${selectedListing.pricePerToken.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={[styles.buyTotalRow, styles.buyTotalFinal]}>
                        <Typography variant="h4">Total Cost:</Typography>
                        <Typography variant="h3" color="gold">
                          ${calculateBuyTotal().toLocaleString()}
                        </Typography>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            {/* Sticky Action Buttons */}
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#fff",
                paddingHorizontal: 24,
                paddingTop: 12,
                // paddingBottom: 8,
                borderTopWidth: 1,
                borderTopColor: "#eee",
                zIndex: 10,
              }}
            >
              <Button
                title="Confirm Purchase"
                onPress={handleConfirmPurchase}
                disabled={!buyForm.quantity || parseInt(buyForm.quantity) <= 0}
                style={styles.confirmPurchaseButton}
              />
              <Button
                title="Cancel"
                onPress={handleCloseBuyModal}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  sortContainer: {
    position: "relative",
    minWidth: 140,
  },
  sortButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: "center",
  },
  sortButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  sortDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginTop: spacing.xs,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sortOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sortOptionSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  filterContainer: {
    position: "relative",
    minWidth: 160,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginTop: spacing.xs,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  filterOptionSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statText: {
    flex: 1,
  },
  chartCard: {
    paddingVertical: spacing.xl,
  },
  chartPlaceholder: {
    alignItems: "center",
    gap: spacing.md,
  },
  investmentCard: {
    marginBottom: spacing.md,
  },
  investmentContent: {
    flexDirection: "row",
    gap: spacing.md,
  },
  investmentImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  investmentDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  investmentMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tokenDetailsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  tokenDetailsTitle: {
    marginBottom: spacing.sm,
    color: colors.primary.gold,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  investmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  activeStatusBadge: {
    backgroundColor: colors.status.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.layout.screenPadding,
    gap: spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind the fixed button
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  downloadPDFButton: {
    backgroundColor: colors.primary.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  downloadButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  payoutSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  payoutInfo: {
    flex: 1,
  },
  claimPayoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
  claimPayoutButtonDisabled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  claimButtonText: {
    fontWeight: "600",
    fontSize: 12,
  },
  modalContent: {
    maxHeight: "85%",
  },
  modalScrollContent: {
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
  },
  propertyInfo: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  modalPropertyImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  propertyDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  modalMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  modalMetric: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  payoutCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  payoutHeader: {
    alignItems: "center",
    gap: spacing.sm,
  },
  modalClaimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalClaimButtonDisabled: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  modalClaimButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryMarketplaceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.navy,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  listForSaleContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  listForSaleDescription: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  listForSaleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.navy,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  listForSaleButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  listingModalContent: {
    maxHeight: "90%",
    width: "100%",
  },
  ownershipCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  ownershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: 0,
  },
  totalSection: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  totalLabel: {
    color: colors.primary.gold,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  durationOption: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  durationOptionSelected: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  listingModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  propertyHeaderCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  tokenSymbolContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tokenSymbol: {
    fontWeight: "600",
    fontFamily: "monospace",
  },
  warningNote: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  percentageNote: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  marketPriceWarning: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  readOnlyField: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: "center",
    gap: spacing.xs,
  },
  previewButton: {
    borderColor: colors.primary.gold,
  },
  submitListingButton: {
    backgroundColor: colors.primary.gold,
  },
  previewModalContent: {
    maxHeight: "80%",
    width: "100%",
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
  },
  previewPropertyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  previewDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  previewDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  successModalContent: {
    maxHeight: "70%",
    width: "100%",
    alignItems: "center",
  },
  successHeader: {
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  successDetails: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  successSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
    textAlign: "center",
  },
  successDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: "center",
    gap: spacing.sm,
  },
  successModalActions: {
    width: "100%",
    gap: spacing.md,
  },
  primarySuccessButton: {
    backgroundColor: colors.primary.gold,
  },
  passiveIncomeCard: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  claimHistoryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  claimHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  claimHistoryDetails: {
    gap: spacing.sm,
  },
  completedStatusBadge: {
    backgroundColor: colors.status.success,
  },
  pendingStatusBadge: {
    backgroundColor: colors.status.warning,
  },
  txHash: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.primary.gold,
  },
  claimHistoryList: {
    gap: spacing.sm,
    maxHeight: 200,
  },
  claimHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  claimHistoryDate: {
    flex: 1.2,
    fontSize: 11,
  },
  claimHistoryAmount: {
    flex: 1,
    fontWeight: "600",
    textAlign: "center",
  },
  claimHistoryProperty: {
    flex: 1.5,
    fontSize: 11,
    textAlign: "center",
  },
  claimHistoryTxId: {
    flex: 1.2,
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "center",
  },
  claimHistoryStatus: {
    fontSize: 9,
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
  // Secondary Market Token Card Styles
  tokenListingCard: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  tokenListingImage: {
    width: "100%",
    height: "100%",
  },
  roiBadgeOverlay: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  roiBadgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  tokenListingContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  propertyTitleSection: {
    gap: spacing.sm,
  },
  propertyTitle: {
    fontWeight: "700",
    lineHeight: 24,
    color: colors.text.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tokenInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  tokenInfoItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tokenPrice: {
    fontWeight: "700",
    fontSize: 18,
  },
  tokenQuantity: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.text.primary,
  },
  totalValueSection: {
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    gap: spacing.xs,
  },
  totalValueLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 20,
  },
  sellerInfoSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    alignItems: "center",
  },
  buyTokenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyTokenButtonText: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  buyModalContent: {
    // maxHeight: "100%",
    width: "100%",
    // borderWidth: 1,
    // borderColor:'red',
  },
  buyPropertyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  buyPropertyImage: {
    width: "100%",
    height: 120,
    borderRadius: radius.md,
  },
  buyPropertyDetails: {
    gap: spacing.sm,
  },
  buyPropertyMetrics: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  buyMetricItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  buyTokenDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  buyTokenDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buyTotalCard: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    marginTop: spacing.md,
  },
  buyTotalHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  buyTotalDetails: {
    gap: spacing.sm,
  },
  buyTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  buyTotalFinal: {
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primary.gold,
  },
  buyModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  confirmPurchaseButton: {
    backgroundColor: colors.primary.gold,
  },
  // Add custom tab styles
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.lightGray,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary.gold,
    shadowColor: colors.primary.gold,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabsScrollView: {
    maxHeight: 44,
    marginBottom: 0,
    backgroundColor: colors.background.primary,
  },
});
