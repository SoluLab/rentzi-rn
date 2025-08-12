import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useHomeownerSavePropertyDraft } from "@/services/homeownerAddProperty";
import { AccessType } from "@/types/homeownerProperty";

// Building amenities options
const BUILDING_AMENITIES = [
  "Parking",
  "Elevator",
  "HVAC",
  "Security System",
  "Wi-Fi",
  "ADA Compliant",
];

// Smart building systems options
const SMART_BUILDING_SYSTEMS = [
  "Automated Lighting",
  "Smart HVAC Controls",
  "Building Management System",
  "Energy Management",
  "Security Automation",
  "IoT Sensors",
  "Climate Control",
  "Smart Access Control",
];

// Business services provided options
const BUSINESS_SERVICES = [
  "Reception Services",
  "Mail Handling",
  "Conference Rooms",
  "Cleaning Services",
  "Maintenance Support",
  "IT Support",
  "Catering Services",
  "Parking Management",
];

// Access type options
const ACCESS_TYPES: AccessType[] = ["Keycard", "QR Scan", "Manual Entry"];

interface FeaturesFormData {
  buildingAmenities: string[];
  smartBuildingSystems: string[];
  businessServicesProvided: string[];
  customAmenities: string[];
  accessType: AccessType;
  propertyHighlights: string;
}

interface FeaturesValidationErrors {
  buildingAmenities?: string;
  accessType?: string;
  propertyHighlights?: string;
}

export default function CommercialPropertyFeaturesComplianceScreen() {
  const router = useRouter();
  const { data, updateFeaturesCompliance } = useCommercialPropertyStore();

  // API mutation hook for updating property
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Commercial property draft saved successfully with features and compliance details:",
        response
      );
      // Navigate to media upload step
      router.push("/add-commercial-details/commercial-property-media-upload");
    },
    onError: (error) => {
      console.error(
        "Error saving commercial property draft with features and compliance details:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  const [formData, setFormData] = useState<FeaturesFormData>(() => {
    const defaultData = {
      buildingAmenities: [],
      smartBuildingSystems: [],
      businessServicesProvided: [],
      customAmenities: [],
      accessType: ACCESS_TYPES[0],
      propertyHighlights: '',
    };
    return data.featuresCompliance ? {
      ...defaultData,
      ...data.featuresCompliance,
      customAmenities: (data.featuresCompliance as any)?.customAmenities || [],
    } : defaultData;
  });
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [smartSystemInput, setSmartSystemInput] = useState('');
  const [businessServiceInput, setBusinessServiceInput] = useState('');
  const [errors, setErrors] = useState<FeaturesValidationErrors>({});
  const [showAccessTypeModal, setShowAccessTypeModal] = useState(false);

  // Validation functions
  const validateBuildingAmenities = (
    amenities: string[]
  ): string | undefined => {
    if (amenities.length === 0) {
      return "Please select at least one building amenity";
    }
    return undefined;
  };

  const validateAccessType = (accessType: AccessType): string | undefined => {
    if (!accessType) {
      return "Access type is required";
    }
    return undefined;
  };

  const validatePropertyHighlights = (
    highlights: string
  ): string | undefined => {
    if (!highlights.trim()) {
      return "Property highlights are required";
    }
    if (highlights.length < 10) {
      return "Property highlights must be at least 10 characters long";
    }
    if (highlights.length > 200) {
      return "Property highlights cannot exceed 200 characters";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FeaturesValidationErrors = {};

    newErrors.buildingAmenities = validateBuildingAmenities(
      formData.buildingAmenities
    );
    newErrors.accessType = validateAccessType(formData.accessType);
    newErrors.propertyHighlights = validatePropertyHighlights(
      formData.propertyHighlights
    );

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const updateFormData = (
    field: keyof FeaturesFormData,
    value: string | string[]
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateFeaturesCompliance(newFormData);

    // Clear error when user starts typing/selecting
    if (errors[field as keyof FeaturesValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = [...formData.buildingAmenities];
    const index = currentAmenities.indexOf(amenity);

    if (index > -1) {
      currentAmenities.splice(index, 1);
    } else {
      currentAmenities.push(amenity);
    }

    updateFormData("buildingAmenities", currentAmenities);
  };

  const toggleSmartSystem = (system: string) => {
    const currentSystems = [...formData.smartBuildingSystems];
    const index = currentSystems.indexOf(system);

    if (index > -1) {
      currentSystems.splice(index, 1);
    } else {
      currentSystems.push(system);
    }

    updateFormData("smartBuildingSystems", currentSystems);
  };

  const toggleBusinessService = (service: string) => {
    const currentServices = [...formData.businessServicesProvided];
    const index = currentServices.indexOf(service);

    if (index > -1) {
      currentServices.splice(index, 1);
    } else {
      currentServices.push(service);
    }

    updateFormData("businessServicesProvided", currentServices);
  };

  const addCustomAmenity = () => {
    if (customAmenityInput.trim()) {
      const newCustomAmenities = [...formData.customAmenities, customAmenityInput.trim()];
      updateFormData('customAmenities', newCustomAmenities);
      setCustomAmenityInput('');
      setShowCustomAmenityModal(false);
    }
  };

  const removeCustomAmenity = (index: number) => {
    const newCustomAmenities = formData.customAmenities.filter((_, i) => i !== index);
    updateFormData('customAmenities', newCustomAmenities);
  };

  const addSmartSystem = () => {
    if (smartSystemInput.trim()) {
      const newSystems = [...formData.smartBuildingSystems, smartSystemInput.trim()];
      updateFormData("smartBuildingSystems", newSystems);
      setSmartSystemInput("");
    }
  };

  const removeSmartSystem = (index: number) => {
    const newSystems = formData.smartBuildingSystems.filter((_, i) => i !== index);
    updateFormData("smartBuildingSystems", newSystems);
  };

  const addBusinessService = () => {
    if (businessServiceInput.trim()) {
      const newServices = [...formData.businessServicesProvided, businessServiceInput.trim()];
      updateFormData("businessServicesProvided", newServices);
      setBusinessServiceInput("");
    }
  };

  const removeBusinessService = (index: number) => {
    const newServices = formData.businessServicesProvided.filter((_, i) => i !== index);
    updateFormData("businessServicesProvided", newServices);
  };

  const transformFormDataToApiFormat = () => {
    // Combine building amenities and custom amenities
    const allBuildingAmenities = [
      ...formData.buildingAmenities,
      ...formData.customAmenities
    ];

    return {
      title: data.propertyDetails?.propertyTitle || "",
      type: "commercial",
      _amenities: allBuildingAmenities,
      smartBuildingSystem: formData.smartBuildingSystems,
      businessServiceProvided: formData.businessServicesProvided,
      accessType: formData.accessType,
      propertyHighlights: formData.propertyHighlights,
    };
  };

  const handleNext = async () => {
    if (validateForm()) {
      try {
        updateFeaturesCompliance(formData);
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
        console.log(
          "Saving commercial property draft with features and compliance data:",
          { propertyId, ...apiData }
        );
        await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
      } catch (error) {
        console.error("Error in handleNext:", error);
      }
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: FeaturesValidationErrors = {};

    newErrors.buildingAmenities = validateBuildingAmenities(
      formData.buildingAmenities
    );
    newErrors.accessType = validateAccessType(formData.accessType);
    newErrors.propertyHighlights = validatePropertyHighlights(
      formData.propertyHighlights
    );

    // Check if all required fields are filled and no validation errors
    return (
      formData.buildingAmenities.length > 0 &&
      formData.accessType &&
      formData.propertyHighlights.trim() &&
      Object.values(newErrors).every((error) => !error)
    );
  };

  const renderAccessTypeItem = ({ item }: { item: AccessType }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData("accessType", item);
        setShowAccessTypeModal(false);
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const renderAmenityItem = ({ item }: { item: string }) => {
    const isSelected = formData.buildingAmenities.includes(item);

    return (
      <TouchableOpacity
        style={[styles.amenityItem, isSelected && styles.amenityItemSelected]}
        onPress={() => toggleAmenity(item)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color={colors.neutral.white} />}
        </View>
        <Typography variant="body" style={styles.amenityText}>
          {item}
        </Typography>
      </TouchableOpacity>
    );
  };

  const renderSmartSystemItem = ({ item }: { item: string }) => {
    const isSelected = formData.smartBuildingSystems.includes(item);

    return (
      <TouchableOpacity
        style={[styles.amenityItem, isSelected && styles.amenityItemSelected]}
        onPress={() => toggleSmartSystem(item)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color={colors.neutral.white} />}
        </View>
        <Typography variant="body" style={styles.amenityText}>
          {item}
        </Typography>
      </TouchableOpacity>
    );
  };

  const renderBusinessServiceItem = ({ item }: { item: string }) => {
    const isSelected = formData.businessServicesProvided.includes(item);

    return (
      <TouchableOpacity
        style={[styles.amenityItem, isSelected && styles.amenityItemSelected]}
        onPress={() => toggleBusinessService(item)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color={colors.neutral.white} />}
        </View>
        <Typography variant="body" style={styles.amenityText}>
          {item}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Features & Compliance" />
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Building Features & Compliance
        </Typography>

        {/* Building Amenities */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Building Amenities *
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Select at least one amenity
          </Typography>
          <View style={styles.amenitiesContainer}>
            {BUILDING_AMENITIES.map((amenity) => (
              <View key={amenity} style={styles.amenityWrapper}>
                {renderAmenityItem({ item: amenity })}
              </View>
            ))}
          </View>
          {errors.buildingAmenities && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.buildingAmenities}
            </Typography>
          )}
        </View>

        {/* Custom Amenities */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Custom Amenities
          </Typography>
          <Typography variant="caption" color="secondary" style={styles.helperText}>
            Add any additional amenities not listed above
          </Typography>
          
          {formData.customAmenities.map((amenity, index) => (
            <View key={index} style={styles.customAmenityItem}>
              <Typography variant="body" style={styles.customAmenityText}>
                {amenity}
              </Typography>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeCustomAmenity(index)}
              >
                <X size={16} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          ))}
          
          <Button
            title="Add Custom Amenity"
            onPress={() => setShowCustomAmenityModal(true)}
            variant="outline"
            style={styles.addButton}
          />
        </View>

        {/* Smart Building Systems */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Smart Building Systems
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Optional: Add smart building systems (press Enter after each system)
          </Typography>
          
          {/* Smart Systems Tags */}
          <View style={styles.tagsContainer}>
            {formData.smartBuildingSystems.map((system, index) => (
              <View key={index} style={styles.tagItem}>
                <Typography variant="body" style={styles.tagText}>
                  {system}
                </Typography>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => removeSmartSystem(index)}
                >
                  <X size={14} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add New System Input */}
          <View style={styles.addFeatureContainer}>
            <TextInput
              style={styles.featureInput}
              placeholder="e.g., Automated Lighting"
              value={smartSystemInput}
              onChangeText={setSmartSystemInput}
              onSubmitEditing={addSmartSystem}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addFeatureButton}
              onPress={addSmartSystem}
            >
              <Plus size={20} color={colors.primary.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Services Provided */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Business Services Provided
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Optional: Add business services (press Enter after each service)
          </Typography>
          
          {/* Business Services Tags */}
          <View style={styles.tagsContainer}>
            {formData.businessServicesProvided.map((service, index) => (
              <View key={index} style={styles.tagItem}>
                <Typography variant="body" style={styles.tagText}>
                  {service}
                </Typography>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => removeBusinessService(index)}
                >
                  <X size={14} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add New Service Input */}
          <View style={styles.addFeatureContainer}>
            <TextInput
              style={styles.featureInput}
              placeholder="e.g., Reception Services"
              value={businessServiceInput}
              onChangeText={setBusinessServiceInput}
              onSubmitEditing={addBusinessService}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addFeatureButton}
              onPress={addBusinessService}
            >
              <Plus size={20} color={colors.primary.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Access Type */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Access Type *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.accessType && styles.error]}
            onPress={() => setShowAccessTypeModal(true)}
          >
            <Typography
              variant="body"
              style={
                formData.accessType ? styles.selectedText : styles.placeholder
              }
            >
              {formData.accessType || "Select access type"}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.accessType && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.accessType}
            </Typography>
          )}
        </View>

        {/* Property Highlights */}
        <Input
          label="Property Highlights *"
          value={formData.propertyHighlights}
          onChangeText={(value) => updateFormData("propertyHighlights", value)}
          placeholder="Describe key features and benefits of your property (1-2 lines)"
          multiline
          numberOfLines={3}
          error={errors.propertyHighlights}
          maxLength={200}
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          {formData.propertyHighlights.length}/200 characters
        </Typography>

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </KeyboardAwareScrollView>

      {/* Access Type Modal */}
      <Modal
        visible={showAccessTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h5">Select Access Type</Typography>
            <TouchableOpacity onPress={() => setShowAccessTypeModal(false)}>
              <Typography variant="body" color="primary">
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ACCESS_TYPES}
            renderItem={renderAccessTypeItem}
            keyExtractor={(item) => item}
            style={styles.modalList}
          />
        </View>
      </Modal>

      {/* Custom Amenity Modal */}
      <Modal
        visible={showCustomAmenityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Add Custom Amenity</Typography>
            <TouchableOpacity onPress={() => setShowCustomAmenityModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Input
              label="Custom Amenity"
              value={customAmenityInput}
              onChangeText={setCustomAmenityInput}
              placeholder="Enter custom amenity"
              maxLength={50}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowCustomAmenityModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add"
                onPress={addCustomAmenity}
                disabled={!customAmenityInput.trim()}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  customAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    marginBottom: spacing.sm,
  },
  customAmenityText: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.platinum,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    borderRadius: radius.input,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: 14,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  removeTagButton: {
    padding: 2,
  },
  addFeatureContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureInput: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
    fontSize: 16,
  },
  addFeatureButton: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
  },
});
