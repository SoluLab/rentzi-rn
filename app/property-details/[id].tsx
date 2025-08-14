import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Star,
  Heart,
  Share2,
  Edit,
  Home,
  Sofa,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Download,
  ArrowUpDown,
  Dumbbell,
  Zap,
  Shield,
  TreePine,
  Wifi,
  Car,
  Coffee,
  Trash2,
  Calendar,
} from "lucide-react-native";
import { useMarketplaceGetProperty } from "@/services/renterMarketplace";
import { useHomeownerDeleteProperty } from "@/services/homeownerAddProperty";

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: "Available" | "Rented" | "Under Maintenance" | "Pending";
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  yearBuilt: number;
  yearRenovated?: number;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  category: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    documents: false,
    amenities: true,
  });
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [visibleImageIndex, setVisibleImageIndex] = useState(0);

  // Use the new API hook
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useMarketplaceGetProperty(id as string);
  useEffect(() => {
    if (apiResponse) {
      console.log("Property API Response:", apiResponse);
    }
    if (error) {
      console.log("Property API Error:", error);
    }
  }, [apiResponse, error]);

  useEffect(() => {
    if (apiResponse?.data) {
      const propertyData = apiResponse.data;
      // Extract image URLs from the API response
      const imageUrls = Array.isArray((propertyData as any).images)
        ? (propertyData as any).images.map((img: any) => img.url)
        : [];

      // Extract documents from API response
      const apiDocuments = (propertyData as any).documents || {};
      const allDocuments: Document[] = [];

      // Process each document category and add non-empty ones
      Object.entries(apiDocuments).forEach(
        ([category, docs]: [string, any]) => {
          if (Array.isArray(docs) && docs.length > 0) {
            docs.forEach((doc: any) => {
              if (doc.url && doc.key) {
                allDocuments.push({
                  id: doc._id || Math.random().toString(),
                  name: doc.key,
                  type: "PDF",
                  size: "Document",
                  url: doc.url,
                  category: category,
                });
              }
            });
          }
        }
      );

      setProperty({
        id: (propertyData as any)._id,
        title: (propertyData as any).title,
        description:
          (propertyData as any).description || "No description available.",
        price: (propertyData as any).rentAmount?.value || 0, // If available, else 0
        address:
          (propertyData as any).address?.street || "Address not available",
        bedrooms: Array.isArray((propertyData as any).bedrooms)
          ? (propertyData as any).bedrooms.length
          : 0,
        bathrooms: (propertyData as any).bathrooms || 0,
        area:
          (typeof (propertyData as any).area === "number"
            ? (propertyData as any).area
            : (propertyData as any).area?.value) || 0,
        type: (propertyData as any).category
          ? (propertyData as any).category.charAt(0).toUpperCase() +
            (propertyData as any).category.slice(1)
          : "Property",
        status:
          (propertyData as any).status === "active"
            ? "Available"
            : (propertyData as any).status === "inactive"
            ? "Under Maintenance"
            : (propertyData as any).status === "pending"
            ? "Pending"
            : "Available",
        furnishing: "Unfurnished", // Not available in API
        images: imageUrls,
        amenities: (propertyData as any)._amenities || [],
        rating: 4.8, // Placeholder, not available in API
        reviews: 127, // Placeholder, not available in API
        yearBuilt: (propertyData as any).yearOfBuilt || 0,
        yearRenovated: (propertyData as any).yearOfRenovated || undefined,
        documents: allDocuments,
      });
    } else if (error) {
      setProperty(null);
    }
  }, [apiResponse, error]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    Alert.alert("Share Property", "Share this property listing?", [
      { text: "Cancel", style: "cancel" },
      { text: "Share", onPress: () => console.log("Sharing property") },
    ]);
  };

  const handleEdit = () => {
    if (property) {
      router.push({
        pathname: "/add-residential-details/add-residential-property",
        params: { id: property.id },
      });
    }
  };

  const handleDelete = () => {
    setDeleteSheetVisible(true);
  };

  const deletePropertyMutation = useHomeownerDeleteProperty({
    onSuccess: () => {
      setDeleteSheetVisible(false);
      setDeleteConfirmChecked(false);
      Alert.alert("Success", "Property deleted successfully");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete property");
      setDeleteSheetVisible(false);
      setDeleteConfirmChecked(false);
    },
  });

  const handleConfirmDelete = () => {
    if (property?.id) {
      deletePropertyMutation.mutate(property.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteSheetVisible(false);
    setDeleteConfirmChecked(false);
  };

  const toggleSection = (section: "documents" | "amenities") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDownloadDocument = (document: Document) => {
    Alert.alert("Download Document", `Download ${document.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Download",
        onPress: () => {
          console.log(`Downloading ${document.name} from ${document.url}`);
          // Here you can implement actual download logic using the document.url
        },
      },
    ]);
  };

  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageUrl));
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    console.warn("Failed to load image:", imageUrl);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleImageIndex(viewableItems[0].index);
    }
  }, []);

  // Preload images when they become visible
  useEffect(() => {
    if (property?.images && property.images.length > 0) {
      const currentIndex = visibleImageIndex;
      const imagesToPreload = [];

      // Preload current, next, and previous images
      if (currentIndex > 0) {
        imagesToPreload.push(property.images[currentIndex - 1]);
      }
      imagesToPreload.push(property.images[currentIndex]);
      if (currentIndex < property.images.length - 1) {
        imagesToPreload.push(property.images[currentIndex + 1]);
      }

      // Preload images
      imagesToPreload.forEach((imageUrl) => {
        if (imageUrl && !loadedImages.has(imageUrl)) {
          Image.prefetch(imageUrl).catch(() => {
            // Silently handle prefetch errors
          });
        }
      });
    }
  }, [visibleImageIndex, property?.images, loadedImages]);

  // Memory optimization: clear old loaded images if too many
  useEffect(() => {
    if (loadedImages.size > 20) {
      setLoadedImages(new Set());
    }
  }, [loadedImages.size]);

  const renderImageItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const isImageLoaded = loadedImages.has(item);
    const isVisible = Math.abs(index - visibleImageIndex) <= 1; // Load current, previous, and next images

    return (
      <View style={styles.imageSlide}>
        {isVisible ? (
          <Image
            source={{
              uri: item,
              cache: "force-cache", // Enable aggressive caching
              headers: {
                "Cache-Control": "max-age=31536000", // Cache for 1 year
              },
            }}
            style={styles.carouselImage}
            resizeMode="cover"
            onLoad={() => handleImageLoad(item)}
            onError={() => handleImageError(item)}
            loadingIndicatorSource={require("@/assets/images/placeholder.png")}
            progressiveRenderingEnabled={true}
            fadeDuration={300}
          />
        ) : (
          <View style={[styles.carouselImage, styles.placeholderContainer]}>
            {isImageLoaded ? (
              <Image
                source={{
                  uri: item,
                  cache: "force-cache",
                }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContent}>
                <ActivityIndicator size="large" color={colors.primary.gold} />
                <Typography
                  variant="caption"
                  color="secondary"
                  style={styles.loadingText}
                >
                  Loading...
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderImageIndicator = () => (
    <View style={styles.imageIndicators}>
      {property?.images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === currentImageIndex && styles.activeIndicator,
          ]}
        />
      ))}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return colors.status.success;
      case "Rented":
        return colors.status.error;
      case "Under Maintenance":
        return colors.status.warning;
      case "Pending":
        return colors.status.info;
      default:
        return colors.status.success;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    if (!amenity || typeof amenity !== "string") {
      return <CheckCircle size={20} color={colors.text.secondary} />;
    }

    try {
      switch (amenity.toLowerCase()) {
        case "lift":
          return <ArrowUpDown size={20} color={colors.text.secondary} />;
        case "gym":
          return <Dumbbell size={20} color={colors.text.secondary} />;
        case "power backup":
          return <Zap size={20} color={colors.text.secondary} />;
        case "security":
          return <Shield size={20} color={colors.text.secondary} />;
        case "park":
          return <TreePine size={20} color={colors.text.secondary} />;
        case "wifi":
          return <Wifi size={20} color={colors.text.secondary} />;
        case "parking":
          return <Car size={20} color={colors.text.secondary} />;
        case "coffee":
          return <Coffee size={20} color={colors.text.secondary} />;
        case "pool":
          return <CheckCircle size={20} color={colors.text.secondary} />;
        case "kitchen":
          return <CheckCircle size={20} color={colors.text.secondary} />;
        case "oceanview":
          return <CheckCircle size={20} color={colors.text.secondary} />;
        case "balcony":
          return <CheckCircle size={20} color={colors.text.secondary} />;
        case "airconditioning":
          return <Zap size={20} color={colors.text.secondary} />;
        default:
          return <CheckCircle size={20} color={colors.text.secondary} />;
      }
    } catch (error) {
      console.warn("Error processing amenity:", amenity, error);
      return <CheckCircle size={20} color={colors.text.secondary} />;
    }
  };

  const formatDocumentCategory = (category: string) => {
    // Convert camelCase to Title Case with spaces
    return category
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  // Use API documents if available, otherwise show empty state
  const documents = property?.documents || [];

  const amenitiesList =
    property?.amenities && property.amenities.length > 0
      ? property.amenities.filter(
          (amenity) => amenity && typeof amenity === "string"
        )
      : [
          "Lift",
          "Gym",
          "Power Backup",
          "Security",
          "Park",
          "WiFi",
          "Parking",
          "Coffee Shop",
        ];

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="secondary">
            Loading property details...
          </Typography>
        </View>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.errorContainer}>
          <Typography variant="body" color="error">
            Property not found
          </Typography>
        </View>
      </View>
    );
  }

  // Prepare images array for carousel (use placeholder if empty)
  const imagesForCarousel =
    property.images && property.images.length > 0
      ? property.images
      : [require("@/assets/images/placeholder.png")];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {/* Header */}
      <Header
        title="Property Details"
        showBackButton={true}
        onBackPress={() => router.back()}
        rightComponent={
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <TouchableOpacity onPress={toggleFavorite}>
              <Heart
                size={24}
                color={isFavorite ? colors.status.error : colors.text.secondary}
                fill={isFavorite ? colors.status.error : "none"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            {/* Removed Edit and Delete buttons from toolbar */}
          </View>
        }
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Property Images Carousel (always show, with placeholder if needed) */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={imagesForCarousel}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentImageIndex(index);
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
              minimumViewTime: 100,
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={3}
            initialNumToRender={1}
          />
          {/* Show indicators only if more than one image */}
          {imagesForCarousel.length > 1 && renderImageIndicator()}
        </View>

        {/* Property Basic Info */}
        <View style={styles.content}>
          <Card style={styles.basicInfoCard}>
            <Typography variant="h3" color="primary" style={styles.title}>
              {property.title}
            </Typography>

            <View style={styles.addressContainer}>
              <MapPin size={16} color={colors.text.secondary} />
              <Typography
                variant="body"
                color="secondary"
                style={styles.addressText}
              >
                {property.address}
              </Typography>
            </View>

            <View style={styles.priceStatusContainer}>
              <View style={styles.priceContainer}>
                <DollarSign size={20} color={colors.primary.gold} />
                <Typography
                  variant="h4"
                  color="primary"
                  weight="bold"
                  style={styles.priceText}
                >
                  ${property.price.toLocaleString()}/month
                </Typography>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(property.status) },
                ]}
              >
                <CheckCircle size={12} color={colors.background.primary} />
                <Typography
                  variant="caption"
                  color="inverse"
                  style={styles.statusText}
                >
                  {property.status}
                </Typography>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <Star
                size={16}
                color={colors.primary.gold}
                fill={colors.primary.gold}
              />
              <Typography
                variant="body"
                color="primary"
                weight="semibold"
                style={styles.ratingText}
              >
                {property.rating}
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                style={styles.reviewsText}
              >
                ({property.reviews} reviews)
              </Typography>
            </View>
          </Card>

          {/* Property Features */}
          <Card style={styles.featuresCard}>
            <Typography
              variant="h4"
              color="primary"
              style={styles.sectionTitle}
            >
              Property Features
            </Typography>

            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Bed size={24} color={colors.text.secondary} />
                <View style={styles.featureContent}>
                  <Typography variant="h5" color="primary" weight="semibold">
                    {property.bedrooms}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Bedrooms
                  </Typography>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Bath size={24} color={colors.text.secondary} />
                <View style={styles.featureContent}>
                  <Typography variant="h5" color="primary" weight="semibold">
                    {property.bathrooms}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Bathrooms
                  </Typography>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Square size={24} color={colors.text.secondary} />
                <View style={styles.featureContent}>
                  <Typography variant="h5" color="primary" weight="semibold">
                    {property.area}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    sq ft
                  </Typography>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.propertyDetails}>
              <View style={styles.detailRow}>
                <Home size={18} color={colors.text.secondary} />
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.detailLabel}
                >
                  Property Type:
                </Typography>
                <Typography variant="body" color="primary" weight="semibold">
                  {property.type}
                </Typography>
              </View>

              <View style={styles.detailRow}>
                <Sofa size={18} color={colors.text.secondary} />
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.detailLabel}
                >
                  Furnishing:
                </Typography>
                <Typography variant="body" color="primary" weight="semibold">
                  {property.furnishing}
                </Typography>
              </View>
              <View style={styles.detailRow}>
                <Calendar size={18} color={colors.text.secondary} />
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.detailLabel}
                >
                  Year Built:
                </Typography>
                <Typography variant="body" color="primary" weight="semibold">
                  {property.yearBuilt}
                </Typography>
              </View>

              {property.yearRenovated && (
                <View style={styles.detailRow}>
                  <Calendar size={18} color={colors.text.secondary} />
                  <Typography
                    variant="body"
                    color="secondary"
                    style={styles.detailLabel}
                  >
                    Year Renovated:
                  </Typography>
                  <Typography variant="body" color="primary" weight="semibold">
                    {property.yearRenovated}
                  </Typography>
                </View>
              )}
            </View>
          </Card>

          {/* Property Description */}
          <Card style={styles.descriptionCard}>
            <Typography
              variant="h4"
              color="primary"
              style={styles.sectionTitle}
            >
              Description
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              style={styles.descriptionText}
            >
              {property.description}
            </Typography>
          </Card>

          {/* Documents Section (Optional) */}
          <Card style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection("documents")}
            >
              <View style={styles.accordionTitleContainer}>
                <FileText size={20} color={colors.text.secondary} />
                <Typography
                  variant="h4"
                  color="primary"
                  style={styles.accordionTitle}
                >
                  Documents
                </Typography>
              </View>
              {expandedSections.documents ? (
                <ChevronUp size={20} color={colors.text.secondary} />
              ) : (
                <ChevronDown size={20} color={colors.text.secondary} />
              )}
            </TouchableOpacity>

            {expandedSections.documents && (
              <View style={styles.accordionContent}>
                {documents.length > 0 ? (
                  <>
                    {/* Show first 5 documents or all if expanded */}
                    {(showAllDocuments ? documents : documents.slice(0, 5)).map(
                      (doc) => (
                        <View key={doc.id} style={styles.documentItem}>
                          <View style={styles.documentInfo}>
                            <FileText size={16} color={colors.text.secondary} />
                            <View style={styles.documentDetails}>
                              <Typography
                                variant="body"
                                color="primary"
                                weight="medium"
                              >
                                {formatDocumentCategory(doc.category)}
                              </Typography>
                              <Typography variant="caption" color="secondary">
                                {doc.name} • {doc.type}
                              </Typography>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => handleDownloadDocument(doc)}
                          >
                            <Download size={16} color={colors.primary.gold} />
                          </TouchableOpacity>
                        </View>
                      )
                    )}

                    {/* Show expand/collapse button if more than 5 documents */}
                    {documents.length > 5 && (
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => setShowAllDocuments(!showAllDocuments)}
                      >
                        <View style={styles.expandButtonContent}>
                          <Typography
                            variant="body"
                            color="primary"
                            weight="medium"
                          >
                            {showAllDocuments
                              ? "Show Less"
                              : `Show ${documents.length - 5} More`}
                          </Typography>
                          {showAllDocuments ? (
                            <ChevronUp size={16} color={colors.primary.gold} />
                          ) : (
                            <ChevronDown
                              size={16}
                              color={colors.primary.gold}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyDocuments}>
                    <Typography variant="body" color="secondary">
                      No documents available
                    </Typography>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Amenities Section (Optional) */}
          <Card style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection("amenities")}
            >
              <View style={styles.accordionTitleContainer}>
                <CheckCircle size={20} color={colors.text.secondary} />
                <Typography
                  variant="h4"
                  color="primary"
                  style={styles.accordionTitle}
                >
                  Amenities
                </Typography>
              </View>
              {expandedSections.amenities ? (
                <ChevronUp size={20} color={colors.text.secondary} />
              ) : (
                <ChevronDown size={20} color={colors.text.secondary} />
              )}
            </TouchableOpacity>

            {expandedSections.amenities && (
              <View style={styles.accordionContent}>
                <View style={styles.amenitiesGrid}>
                  {amenitiesList.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      {getAmenityIcon(amenity)}
                      <Typography
                        variant="body"
                        color="primary"
                        style={styles.amenityTagText}
                      >
                        {amenity}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
      {/* Bottom Action Buttons */}
      <View style={styles.bottomLayout}>
        <Button
          title="Edit"
          onPress={handleEdit}
          variant="primary"
          style={{ width: "100%" }}
        />
        {(property.status === "Available" || property.status === "Pending") && (
          <Button
            title="Delete"
            onPress={handleDelete}
            style={{ width: 120 }}
            variant="outline"
            textStyle={{ color: colors.status.error }}
          />
        )}
      </View>
      {/* Delete Bottom Sheet Modal */}
      <Modal
        visible={deleteSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCancelDelete}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={handleCancelDelete}
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <Typography
            variant="h4"
            color="error"
            style={{ marginBottom: spacing.md }}
          >
            Delete Property
          </Typography>
          <Typography
            variant="body"
            color="secondary"
            style={{ marginBottom: spacing.md }}
          >
            Are you sure you want to delete this property? This action cannot be
            undone.
          </Typography>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
            onPress={() => setDeleteConfirmChecked((v) => !v)}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: colors.status.error,
                alignItems: "center",
                justifyContent: "center",
                marginRight: spacing.sm,
                backgroundColor: deleteConfirmChecked
                  ? colors.status.error
                  : "transparent",
              }}
            >
              {deleteConfirmChecked && (
                <CheckCircle size={16} color={colors.neutral.white} />
              )}
            </View>
            <Typography variant="body" color="primary">
              I understand this action cannot be undone
            </Typography>
          </Pressable>
          <View style={styles.bottomActionButtons}>
            <Button
              title="Cancel"
              onPress={handleCancelDelete}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title={
                deletePropertyMutation.isPending ? "Deleting..." : "Delete"
              }
              onPress={handleConfirmDelete}
              variant="primary"
              style={{ flex: 1 }}
              disabled={
                !deleteConfirmChecked || deletePropertyMutation.isPending
              }
              textStyle={{ color: colors.neutral.white }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
    height: 300,
  },
  imageSlide: {
    width: screenWidth,
    height: 300,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicators: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.primary,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },
  content: {
    padding: spacing.md,
  },
  basicInfoCard: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  addressText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  priceStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  priceText: {
    marginLeft: spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  statusText: {
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: spacing.xs,
  },
  reviewsText: {
    marginLeft: spacing.xs,
  },
  featuresCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureContent: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  propertyDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailLabel: {
    flex: 1,
  },
  descriptionCard: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    lineHeight: 24,
  },
  accordionCard: {
    marginBottom: spacing.md,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  accordionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accordionTitle: {
    // Styles handled by Typography component
  },
  accordionContent: {
    paddingTop: spacing.sm,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  documentDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  downloadButton: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.secondary,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  uploadButtonText: {
    marginLeft: spacing.xs,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    gap: spacing.xs,
  },
  amenityTagText: {
    // Styles handled by Typography component
  },
  expandButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.sm,
  },
  expandButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyDocuments: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  placeholderContainer: {
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
  },

  bottomActionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  bottomLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    marginBottom: spacing.xl,
  },
});
