import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
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
import { ChevronDown, Check } from 'lucide-react-native';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';

// Building amenities options
const BUILDING_AMENITIES = [
  'Parking',
  'Elevator',
  'HVAC',
  'Security System',
  'Wi-Fi',
  'ADA Compliant',
];

// Access type options
const ACCESS_TYPES = [
  'Keycard',
  'Manual Entry',
  'QR Scan',
];

interface FeaturesFormData {
  buildingAmenities: string[];
  smartBuildingSystems: string;
  businessServicesProvided: string;
  accessType: string;
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
  
  const [formData, setFormData] = useState<FeaturesFormData>(data.featuresCompliance);
  const [errors, setErrors] = useState<FeaturesValidationErrors>({});
  const [showAccessTypeModal, setShowAccessTypeModal] = useState(false);

  // Validation functions
  const validateBuildingAmenities = (amenities: string[]): string | undefined => {
    if (amenities.length === 0) {
      return 'Please select at least one building amenity';
    }
    return undefined;
  };

  const validateAccessType = (accessType: string): string | undefined => {
    if (!accessType) {
      return 'Access type is required';
    }
    return undefined;
  };

  const validatePropertyHighlights = (highlights: string): string | undefined => {
    if (!highlights.trim()) {
      return 'Property highlights are required';
    }
    if (highlights.length < 10) {
      return 'Property highlights must be at least 10 characters long';
    }
    if (highlights.length > 200) {
      return 'Property highlights cannot exceed 200 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FeaturesValidationErrors = {};

    newErrors.buildingAmenities = validateBuildingAmenities(formData.buildingAmenities);
    newErrors.accessType = validateAccessType(formData.accessType);
    newErrors.propertyHighlights = validatePropertyHighlights(formData.propertyHighlights);

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateFormData = (field: keyof FeaturesFormData, value: string | string[]) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateFeaturesCompliance(newFormData);
    
    // Clear error when user starts typing/selecting
    if (errors[field as keyof FeaturesValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
    
    updateFormData('buildingAmenities', currentAmenities);
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to media upload step
      router.push('/add-commercial-details/commercial-property-media-upload');
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: FeaturesValidationErrors = {};

    newErrors.buildingAmenities = validateBuildingAmenities(formData.buildingAmenities);
    newErrors.accessType = validateAccessType(formData.accessType);
    newErrors.propertyHighlights = validatePropertyHighlights(formData.propertyHighlights);

    // Check if all required fields are filled and no validation errors
    return (
      formData.buildingAmenities.length > 0 &&
      formData.accessType &&
      formData.propertyHighlights.trim() &&
      Object.values(newErrors).every(error => !error)
    );
  };

  const renderAccessTypeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('accessType', item);
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

  return (
    <ScreenContainer>
      <Header title="Features & Compliance" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Building Features & Compliance
        </Typography>

        {/* Building Amenities */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Building Amenities *
          </Typography>
          <Typography variant="caption" color="secondary" style={styles.helperText}>
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
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.buildingAmenities}
            </Typography>
          )}
        </View>

        {/* Smart Building Systems */}
        <Input
          label="Smart Building Systems"
          value={formData.smartBuildingSystems}
          onChangeText={(value) => updateFormData('smartBuildingSystems', value)}
          placeholder="e.g., Automated lighting, Smart HVAC controls"
          multiline
          numberOfLines={3}
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Optional: Describe any smart building systems or technology features
        </Typography>

        {/* Business Services Provided */}
        <Input
          label="Business Services Provided"
          value={formData.businessServicesProvided}
          onChangeText={(value) => updateFormData('businessServicesProvided', value)}
          placeholder="e.g., Reception services, Mail handling, Conference rooms"
          multiline
          numberOfLines={3}
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Optional: List any business services included with the property
        </Typography>

        {/* Access Type */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Access Type *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.accessType && styles.error]}
            onPress={() => setShowAccessTypeModal(true)}
          >
            <Typography variant="body" style={formData.accessType ? styles.selectedText : styles.placeholder}>
              {formData.accessType || 'Select access type'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.accessType && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.accessType}
            </Typography>
          )}
        </View>

        {/* Property Highlights */}
        <Input
          label="Property Highlights *"
          value={formData.propertyHighlights}
          onChangeText={(value) => updateFormData('propertyHighlights', value)}
          placeholder="Describe key features and benefits of your property (1-2 lines)"
          multiline
          numberOfLines={3}
          error={errors.propertyHighlights}
          maxLength={200}
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          {formData.propertyHighlights.length}/200 characters
        </Typography>

        {/* Next Button */}
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>

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
              <Typography variant="body" color="primary">Cancel</Typography>
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
    </ScreenContainer>
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
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
}); 