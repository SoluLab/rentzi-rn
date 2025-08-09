import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { ChevronDown, Check, Plus, X } from 'lucide-react-native';
import { useResidentialPropertyStore, FeaturesComplianceData } from '@/stores/residentialPropertyStore';
import { useHomeownerSavePropertyDraft } from '@/services/homeownerAddProperty';

// Furnishing options
const FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Partially Furnished',
  'Unfurnished',
];

// Featured amenities options
const FEATURED_AMENITIES = [
  'Pool',
  'Jacuzzi',
  'Chef Kitchen',
  'Gym',
  'Wi-Fi',
  'Workstation',
];

// House rules options
const HOUSE_RULES = [
  'No Parties',
  'No Pets',
  'No Smoking',
  'Quiet Hours',
];

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
      console.log('Property draft saved successfully with features and compliance details:', response);
      // Navigate to media upload step
      router.push('/add-residential-details/residential-property-media-upload');
    },
  
    onError: (error) => {
      console.error('Error saving property draft with features and compliance details:', error);
      Alert.alert('Error', 'Failed to save property draft. Please try again.');
    },
  });
  
  const [formData, setFormData] = useState<FeaturesComplianceData>(data.featuresCompliance || {
    furnishingDescription: '',
    featuredAmenities: [],
    customAmenities: [],
    smartHomeFeatures: false,
    conciergeServices: '',
    checkInTime: {
      hour: 3,
      minute: 0,
      period: 'PM',
    },
    checkOutTime: {
      hour: 11,
      minute: 0,
      period: 'AM',
    },
    houseRules: [],
    localHighlights: '',
  });
  const [errors, setErrors] = useState<FeaturesComplianceErrors>({});
  const [showFurnishingModal, setShowFurnishingModal] = useState(false);
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [showCheckInTimeModal, setShowCheckInTimeModal] = useState(false);
  const [showCheckOutTimeModal, setShowCheckOutTimeModal] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Validation functions
  const validateFurnishingDescription = (furnishing: string): string | undefined => {
    if (!furnishing) {
      return 'Furnishing description is required';
    }
    return undefined;
  };

  const validateFeaturedAmenities = (amenities: string[]): string | undefined => {
    if (amenities.length === 0) {
      return 'Please select at least one featured amenity';
    }
    return undefined;
  };

  const validateCheckInOutTimings = (): string | undefined => {
    // Both check-in and check-out times are always set with default values
    return undefined;
  };

  const validateHouseRules = (rules: string[]): string | undefined => {
    if (rules.length === 0) {
      return 'Please select at least one house rule';
    }
    return undefined;
  };

  const validateLocalHighlights = (highlights: string): string | undefined => {
    if (!highlights.trim()) {
      return 'Local highlights are required';
    }
    if (highlights.length < 10) {
      return 'Local highlights must be at least 10 characters long';
    }
    if (highlights.length > 200) {
      return 'Local highlights cannot exceed 200 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FeaturesComplianceErrors = {};

    newErrors.furnishingDescription = validateFurnishingDescription(formData.furnishingDescription);
    newErrors.featuredAmenities = validateFeaturedAmenities(formData.featuredAmenities);
    newErrors.checkInOutTimings = validateCheckInOutTimings();
    newErrors.houseRules = validateHouseRules(formData.houseRules);
    newErrors.localHighlights = validateLocalHighlights(formData.localHighlights);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const updateFormData = (field: keyof FeaturesComplianceData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateFeaturesCompliance(newFormData);
    
    // Clear error when user starts typing/selecting
    if (errors[field as keyof FeaturesComplianceErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FeaturesComplianceErrors]: undefined }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = [...formData.featuredAmenities];
    const index = currentAmenities.indexOf(amenity);
    
    if (index > -1) {
      currentAmenities.splice(index, 1);
    } else {
      currentAmenities.push(amenity);
    }
    
    updateFormData('featuredAmenities', currentAmenities);
  };

  const toggleHouseRule = (rule: string) => {
    const currentRules = [...formData.houseRules];
    const index = currentRules.indexOf(rule);
    
    if (index > -1) {
      currentRules.splice(index, 1);
    } else {
      currentRules.push(rule);
    }
    
    updateFormData('houseRules', currentRules);
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

  const formatTime = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.period}`;
  };

  const updateCheckInTime = (field: 'hour' | 'minute' | 'period', value: number | 'AM' | 'PM') => {
    const newCheckInTime = { ...formData.checkInTime, [field]: value };
    updateFormData('checkInTime', newCheckInTime);
  };

  const updateCheckOutTime = (field: 'hour' | 'minute' | 'period', value: number | 'AM' | 'PM') => {
    const newCheckOutTime = { ...formData.checkOutTime, [field]: value };
    updateFormData('checkOutTime', newCheckOutTime);
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: FeaturesComplianceErrors = {};

    newErrors.furnishingDescription = validateFurnishingDescription(formData.furnishingDescription);
    newErrors.featuredAmenities = validateFeaturedAmenities(formData.featuredAmenities);
    newErrors.checkInOutTimings = validateCheckInOutTimings();
    newErrors.houseRules = validateHouseRules(formData.houseRules);
    newErrors.localHighlights = validateLocalHighlights(formData.localHighlights);

    // Check if all required fields are filled and no validation errors
    return (
      formData.furnishingDescription &&
      formData.featuredAmenities.length > 0 &&
      formData.houseRules.length > 0 &&
      formData.localHighlights.trim() &&
      Object.values(newErrors).every(error => !error)
    );
  };

  const transformFormDataToApiFormat = () => ({
    title: data.propertyDetails?.propertyTitle || '',
    furnishingDescription: formData.furnishingDescription,
    checkInCheckOutTimes: {
      checkIn: `${formData.checkInTime.hour}:${formData.checkInTime.minute.toString().padStart(2, '0')} ${formData.checkInTime.period}`,
      checkOut: `${formData.checkOutTime.hour}:${formData.checkOutTime.minute.toString().padStart(2, '0')} ${formData.checkOutTime.period}`,
    },
    localHighlights: formData.localHighlights,
    isFurnished: formData.furnishingDescription === 'Fully Furnished' || formData.furnishingDescription === 'Partially Furnished',
    conciergeServicesIncluded: formData.conciergeServices,
  });

  const renderFurnishingItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('furnishingDescription', item);
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

  const renderHouseRuleItem = ({ item }: { item: string }) => {
    const isSelected = formData.houseRules.includes(item);
    
    return (
      <TouchableOpacity
        style={[styles.amenityItem, isSelected && styles.amenityItemSelected]}
        onPress={() => toggleHouseRule(item)}
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
        console.log('Property ID from store before draft API:', propertyId);
        if (!propertyId) {
          Alert.alert('Error', 'Property ID not found. Please go back and try again.');
          return;
        }
        console.log('Saving property draft with features and compliance data:', { propertyId, ...apiData });
        console.log('API data being sent:', apiData);
        await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
      } catch (error) {
        console.error('Error in handleNext:', error);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Features & Compliance" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
            style={[styles.dropdown, errors.furnishingDescription && styles.error]}
            onPress={() => setShowFurnishingModal(true)}
          >
            <Typography variant="body" style={formData.furnishingDescription ? styles.selectedText : styles.placeholder}>
              {formData.furnishingDescription || 'Select furnishing description'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.furnishingDescription && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.furnishingDescription}
            </Typography>
          )}
        </View>

        {/* Featured Amenities */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Featured Amenities *
          </Typography>
          <Typography variant="caption" color="secondary" style={styles.helperText}>
            Select at least one amenity
          </Typography>
          <View style={styles.amenitiesContainer}>
            {FEATURED_AMENITIES.map((amenity) => (
              <View key={amenity} style={styles.amenityWrapper}>
                {renderAmenityItem({ item: amenity })}
              </View>
            ))}
          </View>
          {errors.featuredAmenities && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.featuredAmenities}
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

        {/* Smart Home Features */}
        <View style={styles.fieldContainer}>
          <View style={styles.toggleContainer}>
            <Typography variant="body" style={styles.label}>
              Smart Home Features
            </Typography>
            <Switch
              value={formData.smartHomeFeatures}
              onValueChange={(value) => updateFormData('smartHomeFeatures', value)}
              trackColor={{ false: colors.border.light, true: colors.primary.gold }}
              thumbColor={formData.smartHomeFeatures ? colors.neutral.white : colors.text.secondary}
            />
          </View>
          <Typography variant="caption" color="secondary" style={styles.helperText}>
            Optional: Enable if your property has smart home features
          </Typography>
        </View>

        {/* Concierge Services */}
        <Input
          label="Concierge Services"
          value={formData.conciergeServices}
          onChangeText={(value) => updateFormData('conciergeServices', value)}
          placeholder="e.g., 24/7 concierge, valet parking, room service"
          multiline
          numberOfLines={3}
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Optional: Describe any concierge services available
        </Typography>

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
          <Typography variant="caption" color="secondary" style={styles.helperText}>
            Select applicable house rules
          </Typography>
          <View style={styles.amenitiesContainer}>
            {HOUSE_RULES.map((rule) => (
              <View key={rule} style={styles.amenityWrapper}>
                {renderHouseRuleItem({ item: rule })}
              </View>
            ))}
          </View>
          {errors.houseRules && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.houseRules}
            </Typography>
          )}
        </View>

        {/* Local Highlights */}
        <Input
          label="Local Highlights *"
          value={formData.localHighlights}
          onChangeText={(value) => updateFormData('localHighlights', value)}
          placeholder="Describe nearby attractions, restaurants, and activities (1-2 lines)"
          error={errors.localHighlights}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          {formData.localHighlights.length}/200 characters
        </Typography>

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </ScrollView>

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
              <Typography variant="body" style={styles.timePickerLabel}>Hour</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.hour}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckInTime('hour', (formData.checkInTime.hour % 12) + 1)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>+</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckInTime('hour', formData.checkInTime.hour === 1 ? 12 : formData.checkInTime.hour - 1)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>−</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Minutes */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>Minute</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.minute.toString().padStart(2, '0')}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckInTime('minute', (formData.checkInTime.minute + 15) % 60)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>+15</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckInTime('minute', formData.checkInTime.minute === 0 ? 45 : formData.checkInTime.minute - 15)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>−15</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>Period</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkInTime.period}
              </Typography>
              <TouchableOpacity
                style={styles.timePickerActionButton}
                onPress={() => updateCheckInTime('period', formData.checkInTime.period === 'AM' ? 'PM' : 'AM')}
              >
                <Typography variant="body" style={styles.timePickerButtonText}>Toggle</Typography>
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
              <Typography variant="body" style={styles.timePickerLabel}>Hour</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.hour}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckOutTime('hour', (formData.checkOutTime.hour % 12) + 1)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>+</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckOutTime('hour', formData.checkOutTime.hour === 1 ? 12 : formData.checkOutTime.hour - 1)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>−</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Minutes */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>Minute</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.minute.toString().padStart(2, '0')}
              </Typography>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckOutTime('minute', (formData.checkOutTime.minute + 15) % 60)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>+15</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerActionButton}
                  onPress={() => updateCheckOutTime('minute', formData.checkOutTime.minute === 0 ? 45 : formData.checkOutTime.minute - 15)}
                >
                  <Typography variant="body" style={styles.timePickerButtonText}>−15</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.timePickerColumn}>
              <Typography variant="body" style={styles.timePickerLabel}>Period</Typography>
              <Typography variant="h4" style={styles.timePickerValue}>
                {formData.checkOutTime.period}
              </Typography>
              <TouchableOpacity
                style={styles.timePickerActionButton}
                onPress={() => updateCheckOutTime('period', formData.checkOutTime.period === 'AM' ? 'PM' : 'AM')}
              >
                <Typography variant="body" style={styles.timePickerButtonText}>Toggle</Typography>
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
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityWrapper: {
    width: '48%',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
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
  nextButton: {
    marginTop: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  timePickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  timePickerValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timePickerButtons: {
    flexDirection: 'row',
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
    fontWeight: '500',
  },
}); 