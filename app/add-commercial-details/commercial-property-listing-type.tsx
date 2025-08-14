import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import {
  Check,
  Building,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react-native";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useHomeownerSavePropertyDraft } from "@/services/homeownerAddProperty";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface ListingTypeData {
  selectedType: string | null;
}

interface ListingTypeValidationErrors {
  selectedType?: string;
}

const LISTING_TYPES = [
  {
    id: "rental-only",
    title: "Rental Only",
    description: "Traditional rental listing for your commercial property",
    icon: Building,
    features: [
      "Standard rental agreements",
      "Full property control",
      "Direct tenant management",
      "Traditional revenue model",
      "No fractional ownership complexity",
    ],
    details:
      "Choose this option if you want to list your commercial property for traditional rental purposes only. You maintain full ownership and control over the property while generating rental income.",
  },
  {
    id: "fractional-ownership-rental",
    title: "Fractional Ownership + Rental",
    description:
      "Tokenize your property for fractional ownership with rental income",
    icon: Users,
    features: [
      "Digital tokenization",
      "Fractional ownership sales",
      "Shared rental income",
      "Platform-managed operations",
      "Liquidity through token trading",
    ],
    details:
      "Choose this option to tokenize your commercial property, allowing multiple investors to purchase fractional ownership while you share in the rental income. This creates additional revenue streams and potential for property appreciation.",
  },
];

export default function CommercialPropertyListingTypeScreen() {
  const router = useRouter();
  const { data, updateListingType } = useCommercialPropertyStore();

  // API mutation hook for updating property draft
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Commercial property draft saved successfully with listing type:",
        response
      );
      // Navigate to review screen with title and property ID
      const propertyTitle = data.propertyDetails?.propertyTitle || "";
      const propertyId = data.propertyId;

      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }

      router.push({
        pathname: "/add-commercial-details/commercial-property-review",
        params: {
          propertyTitle,
          propertyId: propertyId.toString(),
        },
      });
    },
    onError: (error) => {
      console.error(
        "Error saving commercial property draft with listing type:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  const [formData, setFormData] = useState<ListingTypeData>(data.listingType);
  const [errors, setErrors] = useState<ListingTypeValidationErrors>({});
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Validation functions
  const validateListingType = (
    selectedType: string | null
  ): string | undefined => {
    if (!selectedType) {
      return "Please select a listing type";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ListingTypeValidationErrors = {};

    newErrors.selectedType = validateListingType(formData.selectedType);

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const updateFormData = (
    field: keyof ListingTypeData,
    value: string | null
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateListingType(newFormData);

    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectListingType = (typeId: string) => {
    updateFormData("selectedType", typeId);
  };

  const toggleExpanded = (typeId: string) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "commercial",
    };

    // Add listing type based on schema requirements
    // Use allowsFractionalization instead of listingType
    if (formData.selectedType === "rental-only") {
      apiData.allowsFractionalization = false;
    } else if (formData.selectedType === "fractional-ownership-rental") {
      apiData.allowsFractionalization = true;
    }

    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      await proceedWithDraft();
    }
  };

  const proceedWithDraft = async () => {
    try {
      updateListingType(formData);
      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      console.log(
        "Commercial Property ID from store before draft API:",
        propertyId
      );
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      console.log("Saving commercial property draft with listing type data:", {
        propertyId,
        ...apiData,
      });
      await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
    } catch (error) {
      console.error("Error in proceedWithDraft:", error);
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: ListingTypeValidationErrors = {};

    newErrors.selectedType = validateListingType(formData.selectedType);

    // Check if a listing type is selected and no validation errors
    return Object.values(newErrors).every((error) => !error);
  };

  const renderListingTypeOption = (type: (typeof LISTING_TYPES)[0]) => {
    const isSelected = formData.selectedType === type.id;
    const error = errors.selectedType;
    const isExpanded = expandedType === type.id;
    const IconComponent = type.icon;

    return (
      <View key={type.id} style={styles.listingTypeItem}>
        <TouchableOpacity
          style={[
            styles.listingTypeCard,
            isSelected && styles.listingTypeCardSelected,
            error && styles.listingTypeCardError,
          ]}
          onPress={() => selectListingType(type.id)}
        >
          <View style={styles.listingTypeHeader}>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected,
                ]}
              >
                {isSelected && <Check size={16} color={colors.neutral.white} />}
              </View>
            </View>

            <View style={styles.listingTypeContent}>
              <View style={styles.listingTypeTitleRow}>
                <IconComponent
                  size={24}
                  color={
                    isSelected ? colors.primary.gold : colors.text.secondary
                  }
                />
                <Typography
                  variant="h5"
                  style={{
                    ...styles.listingTypeTitle,
                    ...(isSelected ? styles.selectedText : {}),
                  }}
                >
                  {type.title}
                </Typography>
              </View>

              <Typography
                variant="body"
                color="secondary"
                style={styles.listingTypeDescription}
              >
                {type.description}
              </Typography>
            </View>
          </View>

          <View style={styles.listingTypeFeatures}>
            {type.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={16} color={colors.status.success} />
                <Typography variant="body" style={styles.featureText}>
                  {feature}
                </Typography>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpanded(type.id)}
          >
            <Typography
              variant="body"
              color="primary"
              style={styles.expandText}
            >
              {isExpanded ? "Show Less" : "Learn More"}
            </Typography>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedDetails}>
            <Typography
              variant="body"
              color="secondary"
              style={styles.detailsText}
            >
              {type.details}
            </Typography>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Select Listing Type" />
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Choose Your Listing Type
        </Typography>

        <Typography
          variant="body"
          color="secondary"
          style={styles.sectionDescription}
        >
          Select how you want to list your commercial property. This choice will
          determine the platform features and revenue model available to you.
        </Typography>

        {/* Listing Type Options */}
        <View style={styles.listingTypesContainer}>
          {LISTING_TYPES.map(renderListingTypeOption)}
        </View>

        {/* Error Message */}
        {errors.selectedType && (
          <View style={styles.errorContainer}>
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.selectedType}
            </Typography>
          </View>
        )}

        {/* Selection Summary */}
        {formData.selectedType && (
          <View style={styles.summaryContainer}>
            <Typography variant="h6" style={styles.summaryTitle}>
              Selected Option
            </Typography>
            <Typography variant="body" style={styles.summaryText}>
              {
                LISTING_TYPES.find((type) => type.id === formData.selectedType)
                  ?.title
              }
            </Typography>
          </View>
        )}

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
     </KeyboardAwareScrollView>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  listingTypesContainer: {
    marginBottom: spacing.xl,
  },
  listingTypeItem: {
    marginBottom: spacing.lg,
  },
  listingTypeCard: {
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.input,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  listingTypeCardSelected: {
    borderColor: colors.primary.gold,
    backgroundColor: colors.primary.gold + "10",
  },
  listingTypeCardError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + "10",
  },
  listingTypeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  radioContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  listingTypeContent: {
    flex: 1,
  },
  listingTypeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  listingTypeTitle: {
    fontWeight: "600",
    color: colors.text.primary,
  },
  selectedText: {
    color: colors.primary.gold,
  },
  listingTypeDescription: {
    lineHeight: 18,
  },
  listingTypeFeatures: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  expandButton: {
    alignSelf: "flex-start",
  },
  expandText: {
    fontWeight: "500",
  },
  expandedDetails: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailsText: {
    lineHeight: 20,
  },
  errorContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.status.error + "10",
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.status.error,
  },
  summaryContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  summaryTitle: {
    fontWeight: "600",
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  summaryText: {
    fontWeight: "500",
    color: colors.primary.gold,
  },
  nextButton: {
    marginTop: spacing.xl,  
    marginBottom: spacing.xxl,
  },
});
