import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Switch,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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
import {
  useResidentialPropertyStore,
  FeaturesComplianceData,
} from "@/stores/residentialPropertyStore";
import { useHomeownerSavePropertyDraft } from "@/services/homeownerAddProperty";
import { useHomeownerDropdown } from "@/hooks/useHomeownerDropdown";

// Furnishing options
const FURNISHING_OPTIONS = [
  "Fully Furnished",
  "Partially Furnished",
  "Unfurnished",
];

// Featured amenities options - will be populated from API
let FEATURED_AMENITIES: string[] = [];
let AMENITIES_MAP: { [key: string]: string } = {}; // name -> id mapping
let AMENITIES_REVERSE_MAP: { [key: string]: string } = {}; // id -> name mapping

// Property rules options - will be populated from API
let PROPERTY_RULES: string[] = [];
let RULES_MAP: { [key: string]: string } = {}; // title -> id mapping
let RULES_REVERSE_MAP: { [key: string]: string } = {}; // id -> title mapping

interface FeaturesComplianceErrors {
  furnishingDescription?: string;
  featuredAmenities?: string;
  checkInOutTimings?: string;
  houseRules?: string;
  localHighlights?: string;
}

export default function ResidentialPropertyFeaturesComplianceScreen() {
  const router = useRouter();
  const { data, updateFeaturesCompliance } = useResidentialPropertyStore();

  // API mutation hook for updating property
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Property draft saved successfully with features and compliance details:",
        response
      );
      // Navigate to media upload step
      router.push("/add-residential-details/residential-property-media-upload");
    },

    onError: (error) => {
      console.error(
        "Error saving property draft with features and compliance details:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  // Amenities dropdown hook
  const { amenities, amenitiesLoading, propertyRules, propertyRulesLoading } = useHomeownerDropdown();

  const [formData, setFormData] = useState<FeaturesComplianceData>(
    data.featuresCompliance || {
      furnishingDescription: "",
      featuredAmenities: [],
      customAmenities: [],
      smartHomeFeatures: "",
      conciergeServices: "",
      checkInTime: {
        hour: 3,
        minute: 0,
        period: "PM",
      },
      checkOutTime: {
        hour: 11,
        minute: 0,
        period: "AM",
      },
      houseRules: [],
      localHighlights: "",
    }
  );
  const [errors, setErrors] = useState<FeaturesComplianceErrors>({});
  const [showFurnishingModal, setShowFurnishingModal] = useState(false);
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [showCheckInTimeModal, setShowCheckInTimeModal] = useState(false);
  const [showCheckOutTimeModal, setShowCheckOutTimeModal] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [smartFeatureInput, setSmartFeatureInput] = useState("");
  const [businessServiceInput, setBusinessServiceInput] = useState("");
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);
  const [showHouseRulesDropdown, setShowHouseRulesDropdown] = useState(false);

  // Populate amenities from API when data loads
  useEffect(() => {
    if (amenities && amenities.length > 0) {
      FEATURED_AMENITIES = amenities.map(amenity => amenity.name);
      // Create mapping from name to id and id to name
      amenities.forEach(amenity => {
        AMENITIES_MAP[amenity.name] = amenity._id;
        AMENITIES_REVERSE_MAP[amenity._id] = amenity.name;
      });
    }
  }, [amenities]);

  // Populate property rules from API when data loads
  useEffect(() => {
    if (propertyRules && propertyRules.length > 0) {
      PROPERTY_RULES = propertyRules.map(rule => rule.title);
      // Create mapping from title to id and id to title
      propertyRules.forEach(rule => {
        RULES_MAP[rule.title] = rule._id;
        RULES_REVERSE_MAP[rule._id] = rule.title;
      });
    }
  }, [propertyRules]);

  // Validation functions
  const validateFurnishingDescription = (
    furnishing: string
  ): string | undefined => {
    if (!furnishing) {
      return "Furnishing description is required";
    }
    return undefined;
  };

  const validateFeaturedAmenities = (
    amenities: string[]
  ): string | undefined => {
    if (amenities.length === 0) {
      return "Please select at least one featured amenity";
    }
    return undefined;
  };

  const validateCheckInOutTimings = (): string | undefined => {
    // Both check-in and check-out times are always set with default values
    return undefined;
  };

  const validateHouseRules = (rules: string[]): string | undefined => {
    if (rules.length === 0) {
      return "Please select at least one house rule";
    }
    return undefined;
  };

  const validateLocalHighlights = (highlights: string): string | undefined => {
    if (!highlights.trim()) {
      return "Local highlights are required";
    }
    if (highlights.length < 10) {
      return "Local highlights must be at least 10 characters long";
    }
    if (highlights.length > 200) {
      return "Local highlights cannot exceed 200 characters";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FeaturesComplianceErrors = {};

    newErrors.furnishingDescription = validateFurnishingDescription(
      formData.furnishingDescription
    );
    newErrors.featuredAmenities = validateFeaturedAmenities(
      formData.featuredAmenities
    );
    newErrors.checkInOutTimings = validateCheckInOutTimings();
    newErrors.houseRules = validateHouseRules(formData.houseRules);
    newErrors.localHighlights = validateLocalHighlights(
      formData.localHighlights
    );

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const updateFormData = (field: keyof FeaturesComplianceData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateFeaturesCompliance(newFormData);

    // Clear error when user starts typing/selecting
    if (errors[field as keyof FeaturesComplianceErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof FeaturesComplianceErrors]: undefined,
      }));
    }
  };

  const toggleAmenity = (amenityName: string) => {
    const amenityId = AMENITIES_MAP[amenityName];
    if (!amenityId) return;
    
    const currentAmenities = [...formData.featuredAmenities];
    const index = currentAmenities.indexOf(amenityId);

    if (index > -1) {
      currentAmenities.splice(index, 1);
    } else {
      currentAmenities.push(amenityId);
    }

    updateFormData("featuredAmenities", currentAmenities);
  };

  const toggleHouseRule = (ruleId: string) => {
    const currentRules = [...formData.houseRules];
    const index = currentRules.indexOf(ruleId);

    if (index > -1) {
      currentRules.splice(index, 1);
    } else {
      currentRules.push(ruleId);
    }

    updateFormData("houseRules", currentRules);
  };

  const addCustomAmenity = () => {
    if (customAmenityInput.trim()) {
      const newCustomAmenities = [
        ...formData.customAmenities,
        customAmenityInput.trim(),
      ];
      updateFormData("customAmenities", newCustomAmenities);
      setCustomAmenityInput("");
      setShowCustomAmenityModal(false);
    }
  };

  const removeCustomAmenity = (index: number) => {
    const newCustomAmenities = formData.customAmenities.filter(
      (_, i) => i !== index
    );
    updateFormData("customAmenities", newCustomAmenities);
  };

  const addSmartFeature = () => {
    if (smartFeatureInput.trim()) {
      const currentFeatures = formData.smartHomeFeatures ? formData.smartHomeFeatures.split(',').filter(f => f.trim()) : [];
      const newFeatures = [...currentFeatures, smartFeatureInput.trim()];
      updateFormData("smartHomeFeatures", newFeatures.join(', '));
      setSmartFeatureInput("");
    }
  };

  const removeSmartFeature = (index: number) => {
    const currentFeatures = formData.smartHomeFeatures ? formData.smartHomeFeatures.split(',').filter(f => f.trim()) : [];
    const newFeatures = currentFeatures.filter((_, i) => i !== index);
    updateFormData("smartHomeFeatures", newFeatures.join(', '));
  };

  const addBusinessService = () => {
    if (businessServiceInput.trim()) {
      const currentServices = formData.conciergeServices ? formData.conciergeServices.split(',').filter(s => s.trim()) : [];
      const newServices = [...currentServices, businessServiceInput.trim()];
      updateFormData("conciergeServices", newServices.join(', '));
      setBusinessServiceInput("");
    }
  };

  const removeBusinessService = (index: number) => {
    const currentServices = formData.conciergeServices ? formData.conciergeServices.split(',').filter(s => s.trim()) : [];
    const newServices = currentServices.filter((_, i) => i !== index);
    updateFormData("conciergeServices", newServices.join(', '));
  };

  const formatTime = (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
      time.period
    }`;
  };

  const updateCheckInTime = (
    field: "hour" | "minute" | "period",
    value: number | "AM" | "PM"
  ) => {
    const newCheckInTime = { ...formData.checkInTime, [field]: value };
    updateFormData("checkInTime", newCheckInTime);
  };

  const updateCheckOutTime = (
    field: "hour" | "minute" | "period",
    value: number | "AM" | "PM"
  ) => {
    const newCheckOutTime = { ...formData.checkOutTime, [field]: value };
    updateFormData("checkOutTime", newCheckOutTime);
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: FeaturesComplianceErrors = {};

    newErrors.furnishingDescription = validateFurnishingDescription(
      formData.furnishingDescription
    );
    newErrors.featuredAmenities = validateFeaturedAmenities(
      formData.featuredAmenities
    );
    newErrors.checkInOutTimings = validateCheckInOutTimings();
    newErrors.houseRules = validateHouseRules(formData.houseRules);
    newErrors.localHighlights = validateLocalHighlights(
      formData.localHighlights
    );

    // Check if all required fields are filled and no validation errors
    return (
      formData.furnishingDescription &&
      formData.featuredAmenities.length > 0 &&
      formData.houseRules.length > 0 &&
      formData.localHighlights.trim() &&
      Object.values(newErrors).every((error) => !error)
    );
  };

  const transformFormDataToApiFormat = () => ({
    title: data.propertyDetails?.propertyTitle || "",
    furnishingDescription: formData.furnishingDescription,
    checkInCheckOutTimes: {
      checkIn: `${formData.checkInTime.hour}:${formData.checkInTime.minute
        .toString()
        .padStart(2, "0")} ${formData.checkOutTime.period}`,
      checkOut: `${formData.checkOutTime.hour}:${formData.checkOutTime.minute
        .toString()
        .padStart(2, "0")} ${formData.checkOutTime.period}`,
    },
    localHighlights: formData.localHighlights,
    isFurnished:
      formData.furnishingDescription === "Fully Furnished" ||
      formData.furnishingDescription === "Partially Furnished",
    businessServiceProvided: formData.conciergeServices
      ? formData.conciergeServices.split(',').filter(s => s.trim()).map(s => s.trim())
      : [],
    smartBuildingSystem: formData.smartHomeFeatures
      ? formData.smartHomeFeatures.split(',').filter(f => f.trim()).map(f => f.trim())
      : [],
    _amenities: formData.featuredAmenities,
    _rules: formData.houseRules,
  });

  const renderFurnishingItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData("furnishingDescription", item);
        setShowFurnishingModal(false);
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const renderAmenityItem = ({ item }: { item: string }) => {
    const isSelected = formData.featuredAmenities.includes(item);

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

  const handleNext = async () => {
    if (validateForm()) {
      try {
        updateFeaturesCompliance(formData);
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
        console.log(
          "Saving property draft with features and compliance data:",
          { propertyId, ...apiData }
        );
        console.log("API data being sent:", apiData);
        await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
      } catch (error) {
        console.error("Error in handleNext:", error);
      }
    }
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
          Features & Compliance
        </Typography>

        {/* Furnishing Description */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Furnishing Description *
          </Typography>
          <TouchableOpacity
            style={[
              styles.dropdown,
              errors.furnishingDescription && styles.error,
            ]}
            onPress={() => setShowFurnishingModal(true)}
          >
            <Typography
              variant="body"
              style={
                formData.furnishingDescription
                  ? styles.selectedText
                  : styles.placeholder
              }
            >
              {formData.furnishingDescription ||
                "Select furnishing description"}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.furnishingDescription && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.furnishingDescription}
            </Typography>
          )}
        </View>

        {/* Featured Amenities */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Featured Amenities *
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Select at least one amenity
          </Typography>
          
          {/* Selected Amenities Chips */}
          {formData.featuredAmenities.length > 0 && (
            <View style={styles.selectedChipsContainer}>
              {formData.featuredAmenities.map((amenityId) => (
                <View key={amenityId} style={styles.selectedChip}>
                  <Typography variant="body" style={styles.chipText}>
                    {AMENITIES_REVERSE_MAP[amenityId] || amenityId}
                  </Typography>
                  <TouchableOpacity
                    onPress={() => toggleAmenity(AMENITIES_REVERSE_MAP[amenityId] || '')}
                    style={styles.removeChipButton}
                  >
                    <X size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* Dropdown Toggle */}
          <TouchableOpacity
            style={[
              styles.amenitiesDropdownToggle,
              showAmenitiesDropdown && styles.amenitiesDropdownToggleOpen
            ]}
            onPress={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
          >
            <Typography variant="body" style={styles.dropdownToggleText}>
              {formData.featuredAmenities.length > 0 
                ? `${formData.featuredAmenities.length} amenity selected`
                : "Select amenities"
              }
            </Typography>
            <ChevronDown 
              size={20} 
              color={colors.text.secondary}
              style={[
                styles.dropdownArrow,
                showAmenitiesDropdown && styles.dropdownArrowUp
              ]}
            />
          </TouchableOpacity>
          

          

          

          

          
          {/* Amenities Modal */}
          <Modal
            visible={showAmenitiesDropdown}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Typography variant="h4">Select Amenities</Typography>
                <TouchableOpacity onPress={() => setShowAmenitiesDropdown(false)}>
                  <Typography variant="h4">✕</Typography>
                </TouchableOpacity>
              </View>



              {/* Selected Count */}
              <View style={styles.selectedCountContainer}>
                <Typography variant="caption" color="secondary">
                  {formData.featuredAmenities.length} of {FEATURED_AMENITIES.length} amenities selected
                </Typography>
              </View>

              {/* Amenities List */}
              <FlatList
                data={FEATURED_AMENITIES}
                renderItem={({ item }) => {
                  const amenityId = AMENITIES_MAP[item];
                  const isSelected = amenityId ? formData.featuredAmenities.includes(amenityId) : false;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        isSelected && styles.modalItemSelected
                      ]}
                      onPress={() => toggleAmenity(item)}
                    >
                      <View style={[
                        styles.amenityCheckbox,
                        isSelected && styles.amenityCheckboxSelected
                      ]}>
                        {isSelected && (
                          <Check size={16} color={colors.neutral.white} />
                        )}
                      </View>
                      <Typography variant="body" style={{
                        ...styles.amenityText,
                        ...(isSelected && styles.amenityTextSelected)
                      }}>
                        {item}
                      </Typography>

                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
              />

              {/* Footer Actions */}
              <View style={styles.modalFooter}>
                <Button
                  title="Clear All"
                  onPress={() => {
                    updateFormData('featuredAmenities', []);
                  }}
                  variant="outline"
                  style={styles.clearButton}
                />
                <Button
                  title="Done"
                  onPress={() => setShowAmenitiesDropdown(false)}
                  variant="primary"
                  style={styles.doneButton}
                />
              </View>
            </View>
          </Modal>
          
          {errors.featuredAmenities && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.featuredAmenities}
            </Typography>
          )}
        </View>
 
        {/* Smart Home Features */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Smart Building System
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Optional: Add smart building features (press Enter after each feature)
          </Typography>
          
          {/* Smart Features Tags */}
          <View style={styles.tagsContainer}>
            {formData.smartHomeFeatures.split(',').filter(tag => tag.trim()).map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Typography variant="body" style={styles.tagText}>
                  {tag.trim()}
                </Typography>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => removeSmartFeature(index)}
                >
                  <X size={14} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add New Feature Input */}
          <View style={styles.addFeatureContainer}>
            <TextInput
              style={styles.featureInput}
              placeholder="e.g., Smart lighting"
              value={smartFeatureInput}
              onChangeText={setSmartFeatureInput}
              onSubmitEditing={addSmartFeature}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addFeatureButton}
              onPress={addSmartFeature}
            >
              <Plus size={20} color={colors.primary.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Concierge Services */}
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
            {formData.conciergeServices.split(',').filter(tag => tag.trim()).map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Typography variant="body" style={styles.tagText}>
                  {tag.trim()}
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
              placeholder="e.g., 24/7 concierge"
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

        {/* Check-in Time */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Check-in Time *
          </Typography>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowCheckInTimeModal(true)}
          >
            <Typography variant="body" style={styles.timeText}>
              {formatTime(formData.checkInTime)}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Check-out Time */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Check-out Time *
          </Typography>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowCheckOutTimeModal(true)}
          >
            <Typography variant="body" style={styles.timeText}>
              {formatTime(formData.checkOutTime)}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* House Rules */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            House Rules *
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            style={styles.helperText}
          >
            Select applicable house rules
          </Typography>
          
          {/* Selected Rules Chips */}
          {formData.houseRules.length > 0 && (
            <View style={styles.selectedChipsContainer}>
              {formData.houseRules.map((ruleId, index) => (
                <View key={index} style={styles.selectedChip}>
                  <Typography variant="body" style={styles.chipText}>
                    {RULES_REVERSE_MAP[ruleId] || ruleId}
                  </Typography>
                  <TouchableOpacity
                    onPress={() => toggleHouseRule(ruleId)}
                    style={styles.removeChipButton}
                  >
                    <X size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* Dropdown Toggle */}
          <TouchableOpacity
            style={[
              styles.amenitiesDropdownToggle,
              showHouseRulesDropdown && styles.amenitiesDropdownToggleOpen
            ]}
            onPress={() => setShowHouseRulesDropdown(!showHouseRulesDropdown)}
            disabled={propertyRulesLoading}
          >
            <Typography variant="body" style={styles.dropdownToggleText}>
              {propertyRulesLoading 
                ? "Loading rules..." 
                : formData.houseRules.length > 0 
                  ? `${formData.houseRules.length} rule selected`
                  : "Select house rules"
              }
            </Typography>
            <ChevronDown 
              size={20} 
              color={colors.text.secondary}
              style={[
                styles.dropdownArrow,
                showHouseRulesDropdown && styles.dropdownArrowUp
              ]}
            />
          </TouchableOpacity>
          
          {/* House Rules Modal */}
          <Modal
            visible={showHouseRulesDropdown}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Typography variant="h4">Select House Rules</Typography>
                <TouchableOpacity onPress={() => setShowHouseRulesDropdown(false)}>
                  <Typography variant="h4">✕</Typography>
                </TouchableOpacity>
              </View>

              {/* Selected Count */}
              <View style={styles.selectedCountContainer}>
                <Typography variant="caption" color="secondary">
                  {propertyRulesLoading 
                    ? "Loading rules..." 
                    : `${formData.houseRules.length} of ${PROPERTY_RULES.length} rules selected`
                  }
                </Typography>
              </View>

              {/* House Rules List */}
              {propertyRulesLoading ? (
                <View style={styles.loadingContainer}>
                  <Typography variant="body" color="secondary">
                    Loading house rules...
                  </Typography>
                </View>
              ) : (
                <FlatList
                  data={PROPERTY_RULES}
                  renderItem={({ item }) => {
                    const isSelected = formData.houseRules.includes(RULES_MAP[item] || '');
                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalItem,
                          isSelected && styles.modalItemSelected
                        ]}
                        onPress={() => toggleHouseRule(RULES_MAP[item] || '')}
                      >
                        <View style={[
                          styles.amenityCheckbox,
                          isSelected && styles.amenityCheckboxSelected
                        ]}>
                          {isSelected && (
                            <Check size={16} color={colors.neutral.white} />
                          )}
                        </View>
                        <Typography variant="body" style={{
                          ...styles.amenityText,
                          ...(isSelected && styles.amenityTextSelected)
                        }}>
                          {item}
                        </Typography>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item) => item}
                  style={styles.modalList}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {/* Footer Actions */}
              <View style={styles.modalFooter}>
                <Button
                  title="Clear All"
                  onPress={() => {
                    updateFormData('houseRules', []);
                  }}
                  variant="outline"
                  style={styles.clearButton}
                />
                <Button
                  title="Done"
                  onPress={() => setShowHouseRulesDropdown(false)}
                  variant="primary"
                  style={styles.doneButton}
                />
              </View>
            </View>
          </Modal>
          
          {errors.houseRules && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {errors.houseRules}
            </Typography>
          )}
        </View>

        {/* Local Highlights */}
        <Input
          label="Local Highlights *"
          value={formData.localHighlights}
          onChangeText={(value) => updateFormData("localHighlights", value)}
          placeholder="Describe nearby attractions, restaurants, and activities (1-2 lines)"
          error={errors.localHighlights}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        <Typography
          variant="caption"
          color="secondary"
          style={styles.helperText}
        >
          {formData.localHighlights.length}/200 characters
        </Typography>

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </KeyboardAwareScrollView>

      {/* Furnishing Description Modal */}
      <Modal
        visible={showFurnishingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Select Furnishing Description</Typography>
            <TouchableOpacity onPress={() => setShowFurnishingModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>

          <FlatList
            data={FURNISHING_OPTIONS}
            renderItem={renderFurnishingItem}
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

      {/* Check-in Time Picker Modal */}
      <Modal
        visible={showCheckInTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Set Check-in Time</Typography>
            <TouchableOpacity onPress={() => setShowCheckInTimeModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerContainer}>
            {/* Hours */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Hour
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.hour}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckInTime(
                      "hour",
                      (formData.checkInTime.hour % 12) + 1
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    +
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckInTime(
                      "hour",
                      formData.checkInTime.hour === 1
                        ? 12
                        : formData.checkInTime.hour - 1
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    −
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Minutes */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Minute
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.minute.toString().padStart(2, "0")}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckInTime(
                      "minute",
                      (formData.checkInTime.minute + 15) % 60
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    +15
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckInTime(
                      "minute",
                      formData.checkInTime.minute === 0
                        ? 45
                        : formData.checkInTime.minute - 15
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    −15
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Period
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.period}
              </Typography>
              <TouchableOpacity
                style={styles.timePickerActionButton}
                onPress={() =>
                  updateCheckInTime(
                    "period",
                    formData.checkInTime.period === "AM" ? "PM" : "AM"
                  )
                }
              >
                <Typography variant="body" style={styles.timePickerButtonText}>
                  Toggle
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Check-out Time Picker Modal */}
      <Modal
        visible={showCheckOutTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Set Check-out Time</Typography>
            <TouchableOpacity onPress={() => setShowCheckOutTimeModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerContainer}>
            {/* Hours */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Hour
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.hour}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckOutTime(
                      "hour",
                      (formData.checkOutTime.hour % 12) + 1
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    +
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckOutTime(
                      "hour",
                      formData.checkOutTime.hour === 1
                        ? 12
                        : formData.checkOutTime.hour - 1
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    −
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Minutes */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Minute
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.minute.toString().padStart(2, "0")}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckOutTime(
                      "minute",
                      (formData.checkOutTime.minute + 15) % 60
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    +15
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() =>
                    updateCheckOutTime(
                      "minute",
                      formData.checkOutTime.minute === 0
                        ? 45
                        : formData.checkOutTime.minute - 15
                    )
                  }
                >
                  <Typography
                    variant="body"
                    style={styles.timePickerButtonText}
                  >
                    −15
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>
                Period
              </Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.period}
              </Typography>
              <TouchableOpacity
                style={styles.timePickerActionButton}
                onPress={() =>
                  updateCheckOutTime(
                    "period",
                    formData.checkOutTime.period === "AM" ? "PM" : "AM"
                  )
                }
              >
                <Typography variant="body" style={styles.timePickerButtonText}>
                  Toggle
                </Typography>
              </TouchableOpacity>
            </View>
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  customAmenityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  modalContent: {
    padding: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemSelected: {
    backgroundColor: colors.background.secondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.gold,
  },
  // Search and Selection Styles
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  searchIcon: {
    padding: spacing.sm,
  },
  searchIconText: {
    fontSize: 18,
  },
  selectedCountContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  clearButton: {
    flex: 1,
  },
  doneButton: {
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 'auto',
    backgroundColor: colors.primary.gold,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  amenityTextSelected: {
    color: colors.primary.gold,
    fontWeight: '600',
  },
  timePickerButton: {
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
  timeText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  timePickerColumn: {
    alignItems: "center",
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  timePickerValue: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timePickerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timePickerActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.gold,
    borderRadius: radius.input,
  },
  timePickerButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "500",
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
  selectedChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
     selectedChip: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: colors.neutral.white,
     borderWidth: 2,
     borderColor: colors.primary.gold,
     borderRadius: radius.input,
     paddingHorizontal: spacing.sm,
     paddingVertical: spacing.xs,
     shadowColor: colors.neutral.black,
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
     elevation: 2,
   },
  chipText: {
    fontSize: 14,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  removeChipButton: {
    padding: spacing.xs,
  },
     amenitiesDropdownToggle: {
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
     shadowColor: colors.neutral.black,
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
     elevation: 1,
   },
   amenitiesDropdownToggleOpen: {
     borderColor: colors.primary.gold,
     borderWidth: 2,
   },
  dropdownToggleText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  dropdownArrow: {
    transform: [{ rotate: "0deg" }],
  },
  dropdownArrowUp: {
    transform: [{ rotate: "180deg" }],
  },
     amenitiesDropdown: {
     backgroundColor: colors.neutral.white,
     borderWidth: 1,
     borderColor: colors.border.light,
     borderRadius: radius.input,
     marginTop: spacing.sm,
     maxHeight: 280, // Increased height to show more items
     shadowColor: colors.neutral.black,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   amenitiesDropdownList: {
     flex: 1,
   },
   amenitiesDropdownScroll: {
     flex: 1,
   },
   amenitiesDropdownContent: {
     paddingBottom: spacing.sm,
   },
      amenityDropdownItem: {
     flexDirection: "row",
     alignItems: "center",
     padding: spacing.md,
     borderBottomWidth: 1,
     borderBottomColor: colors.border.light,
     minHeight: 48, // Ensure consistent item height
   },
   amenityDropdownItemHover: {
     backgroundColor: colors.background.secondary,
   },
   amenityDropdownItemLast: {
     borderBottomWidth: 0,
     borderBottomLeftRadius: radius.input,
     borderBottomRightRadius: radius.input,
   },
     amenityCheckbox: {
     width: 20,
     height: 20,
     borderRadius: 4,
     borderWidth: 2,
     borderColor: colors.border.light,
     alignItems: "center",
     justifyContent: "center",
     marginRight: spacing.sm,
   },
   amenityCheckboxSelected: {
     backgroundColor: colors.primary.gold,
     borderColor: colors.primary.gold,
   },
  amenityDropdownText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

});
