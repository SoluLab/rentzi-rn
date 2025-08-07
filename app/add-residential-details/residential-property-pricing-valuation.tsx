import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { ChevronDown, Check, Plus, X } from "lucide-react-native";
import { useResidentialPropertyStore } from "@/stores/residentialPropertyStore";
import { useHomeownerSavePropertyDraft } from "@/services/homeownerAddProperty";

interface PricingValuationData {
  estimatedPropertyValue: string;
  nightlyRate: string;
  weekendRate: string;
  // peakSeasonRate: string;
  cleaningFee: string;
  rentalAvailability: string;
  minimumStay: string;
}

interface PricingValuationErrors {
  estimatedPropertyValue?: string;
  nightlyRate?: string;
  weekendRate?: string;
  // peakSeasonRate?: string;
  cleaningFee?: string;
  rentalAvailability?: string;
  minimumStay?: string;
}

export default function ResidentialPropertyPricingValuationScreen() {
  const router = useRouter();
  const { data, updatePricingValuation } = useResidentialPropertyStore();

  // API mutation hook for updating property
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Property draft saved successfully with pricing details:",
        response
      );
      // Navigate to features and compliance step
      router.push(
        "/add-residential-details/residential-property-features-compliance"
      );
    },
    onError: (error) => {
      console.error("Error saving property draft with pricing details:", error);
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  const [formData, setFormData] = useState<PricingValuationData>(
    data.pricingValuation || {
      estimatedPropertyValue: "",
      nightlyRate: "",
      weekendRate: "",
      // peakSeasonRate: "",
      cleaningFee: "",
      rentalAvailability: "",
      minimumStay: "",
    }
  );
  const [errors, setErrors] = useState<PricingValuationErrors>({});

  // Validation functions
  const validateEstimatedPropertyValue = (
    value: string
  ): string | undefined => {
    if (!value.trim()) {
      return "Estimated property value is required";
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ""));
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue <= 0) {
      return "Estimated property value must be greater than 0";
    }
    return undefined;
  };

  const validateNightlyRate = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Nightly rate is required";
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ""));
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 50) {
      return "Nightly rate must be at least $50";
    }
    return undefined;
  };

  const validateWeekendRate = (value: string): string | undefined => {
    if (value.trim()) {
      const numValue = parseFloat(value.replace(/[$,]/g, ""));
      if (isNaN(numValue)) {
        return "Please enter a valid number";
      }
      if (numValue < 50) {
        return "Weekend rate must be at least $50";
      }
    }
    return undefined;
  };

  // const validatePeakSeasonRate = (value: string): string | undefined => {
  //   if (value.trim()) {
  //     const numValue = parseFloat(value.replace(/[$,]/g, ""));
  //     if (isNaN(numValue)) {
  //       return "Please enter a valid number";
  //     }
  //     if (numValue < 50) {
  //       return "Peak season rate must be at least $50";
  //     }
  //   }
  //   return undefined;
  // };

  const validateCleaningFee = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Cleaning fee is required";
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ""));
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 50) {
      return "Cleaning fee must be at least $50";
    }
    return undefined;
  };

  const validateRentalAvailability = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Rental availability is required";
    }
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 0 || numValue > 52) {
      return "Rental availability must be between 0 and 52 weeks";
    }
    return undefined;
  };

  const validateMinimumStay = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Minimum stay is required";
    }
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 2 || numValue > 30) {
      return "Minimum stay must be between 2 and 30 nights";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: PricingValuationErrors = {};

    newErrors.estimatedPropertyValue = validateEstimatedPropertyValue(
      formData.estimatedPropertyValue
    );
    newErrors.nightlyRate = validateNightlyRate(formData.nightlyRate);
    newErrors.weekendRate = validateWeekendRate(formData.weekendRate);
    // newErrors.peakSeasonRate = validatePeakSeasonRate(formData.peakSeasonRate);
    newErrors.cleaningFee = validateCleaningFee(formData.cleaningFee);
    newErrors.rentalAvailability = validateRentalAvailability(
      formData.rentalAvailability
    );
    newErrors.minimumStay = validateMinimumStay(formData.minimumStay);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const updateFormData = (field: keyof PricingValuationData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updatePricingValuation(newFormData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: PricingValuationErrors = {};

    newErrors.estimatedPropertyValue = validateEstimatedPropertyValue(
      formData.estimatedPropertyValue
    );
    newErrors.nightlyRate = validateNightlyRate(formData.nightlyRate);
    newErrors.weekendRate = validateWeekendRate(formData.weekendRate);
    // newErrors.peakSeasonRate = validatePeakSeasonRate(formData.peakSeasonRate);
    newErrors.cleaningFee = validateCleaningFee(formData.cleaningFee);
    newErrors.rentalAvailability = validateRentalAvailability(
      formData.rentalAvailability
    );
    newErrors.minimumStay = validateMinimumStay(formData.minimumStay);

    // Check if all required fields are filled and no validation errors
    return (
      formData.estimatedPropertyValue.trim() &&
      formData.nightlyRate.trim() &&
      formData.cleaningFee.trim() &&
      formData.rentalAvailability.trim() &&
      formData.minimumStay.trim() &&
      Object.values(newErrors).every((error) => !error)
    );
  };

  const transformFormDataToApiFormat = () => ({
    title: data.propertyDetails?.propertyTitle || "",
    type: "residential",
    propertyValueEstimate: {
      value: parseFloat(formData.estimatedPropertyValue.replace(/[$,]/g, "")),
      currency: "USD",
    },
    rentAmount: {
      basePrice: parseFloat(formData.nightlyRate.replace(/[$,]/g, "")),
      currency: "USD",
      weekendPrice: formData.weekendRate
        ? parseFloat(formData.weekendRate.replace(/[$,]/g, ""))
        : 0,
      // peakSeasonPrice: formData.peakSeasonRate
      //   ? parseFloat(formData.peakSeasonRate.replace(/[$,]/g, ""))
      //   : 0,
      peakSeasonPrice: 0,
    },
    maintenanceFee: {
      amount: parseFloat(formData.cleaningFee.replace(/[$,]/g, "")),
      currency: "USD",
    },
    availableWeeksPerYear: parseInt(formData.rentalAvailability),
  });

  const handleNext = async () => {
    if (validateForm()) {
      try {
        updatePricingValuation(formData);
        const apiData = transformFormDataToApiFormat();
        const propertyId = data.propertyId;
        console.log("Property ID from store before draft API:", propertyId);
        if (!propertyId) {
          Alert.alert(
            "Error",
            "Property ID not found. Please go back and try again."
          );
          return;
        }
        console.log("Saving property draft with pricing data:", {
          propertyId,
          ...apiData,
        });
        await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
      } catch (error) {
        console.error("Error in handleNext:", error);
      }
    }
  };

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (!numericValue) return "";

    const numValue = parseFloat(numericValue);
    if (isNaN(numValue)) return value;

    return numValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatNumber = (value: string) => {
    // Remove all non-numeric characters
    return value.replace(/[^0-9]/g, "");
  };

  const generatePricingSummary = () => {
    const nightlyRate = formData.nightlyRate
      ? parseFloat(formData.nightlyRate.replace(/[$,]/g, ""))
      : 0;
    const cleaningFee = formData.cleaningFee
      ? parseFloat(formData.cleaningFee.replace(/[$,]/g, ""))
      : 0;

    if (nightlyRate > 0 && cleaningFee > 0) {
      return `Your property will be listed with a base nightly rate of $${nightlyRate.toLocaleString()}, with a $${cleaningFee.toLocaleString()} cleaning fee.`;
    }
    return "Complete the pricing information above to see your pricing summary.";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Rental Pricing & Valuation" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Rental Pricing & Valuation
        </Typography>

        {/* Estimated Property Value */}
        <Input
          label="Estimated Property Value *"
          value={formData.estimatedPropertyValue}
          onChangeText={(value) =>
            updateFormData("estimatedPropertyValue", formatCurrency(value))
          }
          placeholder="$500,000"
          error={errors.estimatedPropertyValue}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          Enter the estimated market value of your property
        </Typography>

        {/* Nightly Rate */}
        <Input
          label="Nightly Rate *"
          value={formData.nightlyRate}
          onChangeText={(value) =>
            updateFormData("nightlyRate", formatCurrency(value))
          }
          placeholder="$150"
          error={errors.nightlyRate}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          Base rate per night. Minimum: $50 suggested
        </Typography>

        {/* Weekend Rate */}
        <Input
          label="Weekend Rate"
          value={formData.weekendRate}
          onChangeText={(value) =>
            updateFormData("weekendRate", formatCurrency(value))
          }
          placeholder="$200"
          error={errors.weekendRate}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          Higher weekend rate. Minimum: $50 suggested
        </Typography>

        {/* Peak Season Rate */}
        {/* <Input
          label="Peak Season Rate"
          value={formData.peakSeasonRate}
          onChangeText={(value) =>
            updateFormData("peakSeasonRate", formatCurrency(value))
          }
          placeholder="$250"
          error={errors.peakSeasonRate}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          High-demand season rate. Minimum: $50 suggested
        </Typography> */}

        {/* Cleaning Fee */}
        <Input
          label="Cleaning Fee *"
          value={formData.cleaningFee}
          onChangeText={(value) =>
            updateFormData("cleaningFee", formatCurrency(value))
          }
          placeholder="$120"
          error={errors.cleaningFee}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          One-time cleaning fee. Minimum: $50 suggested
        </Typography>

        {/* Rental Availability */}
        <Input
          label="Rental Availability *"
          value={formData.rentalAvailability}
          onChangeText={(value) =>
            updateFormData("rentalAvailability", formatNumber(value))
          }
          placeholder="40"
          error={errors.rentalAvailability}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          Number of weeks your property is available for rental (0-52 weeks)
        </Typography>

        {/* Minimum Stay */}
        <Input
          label="Minimum Stay *"
          value={formData.minimumStay}
          onChangeText={(value) =>
            updateFormData("minimumStay", formatNumber(value))
          }
          placeholder="2"
          error={errors.minimumStay}
          keyboardType="numeric"
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          Minimum booking duration (2–30 nights)
        </Typography>

        {/* Pricing Summary Section */}
        <Typography variant="h6" style={styles.subsectionTitle}>
          Pricing Summary
        </Typography>

        <View style={styles.summaryContainer}>
          <Typography variant="body2" style={styles.summaryText}>
            {generatePricingSummary()}
          </Typography>
        </View>

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </ScrollView>
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
    marginBottom: spacing.lg,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityWrapper: {
    width: "48%",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    minHeight: 48,
  },
  amenityItemSelected: {
    borderColor: colors.primary.gold,
    backgroundColor: colors.primary.platinum,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  amenityText: {
    flex: 1,
    fontSize: 14,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  selectedText: {
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  error: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  nextButton: {
    marginTop: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  summaryContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryText: {
    color: colors.text.primary,
    lineHeight: 20,
  },
  subsectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  
});
