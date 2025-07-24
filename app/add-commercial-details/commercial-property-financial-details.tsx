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
import { ChevronDown } from 'lucide-react-native';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';

// Booking duration options
const BOOKING_DURATION_OPTIONS = [
  'Hourly',
  'Daily',
  'Weekly',
];

interface FinancialFormData {
  estimatedPropertyValue: string;
  baseRentalRate: string;
  cleaningMaintenanceFee: string;
  weeksAvailablePerYear: string;
  minimumBookingDuration: string;
}

interface FinancialValidationErrors {
  estimatedPropertyValue?: string;
  baseRentalRate?: string;
  cleaningMaintenanceFee?: string;
  weeksAvailablePerYear?: string;
  minimumBookingDuration?: string;
}

export default function CommercialPropertyFinancialDetailsScreen() {
  const router = useRouter();
  const { data, updateFinancialDetails } = useCommercialPropertyStore();
  
  const [formData, setFormData] = useState<FinancialFormData>(data.financialDetails);
  const [errors, setErrors] = useState<FinancialValidationErrors>({});
  const [showBookingDurationModal, setShowBookingDurationModal] = useState(false);

  // Validation functions
  const validateEstimatedPropertyValue = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Estimated property value is required';
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ''));
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue < 1500000) {
      return 'Estimated property value must be at least $1.5M';
    }
    return undefined;
  };

  const validateBaseRentalRate = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Base rental rate is required';
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ''));
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue <= 10) {
      return 'Base rental rate must be greater than $10';
    }
    return undefined;
  };

  const validateCleaningMaintenanceFee = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Cleaning or maintenance fee is required';
    }
    const numValue = parseFloat(value.replace(/[$,]/g, ''));
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue <= 5) {
      return 'Cleaning or maintenance fee must be greater than $5';
    }
    return undefined;
  };

  const validateWeeksAvailablePerYear = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Weeks available per year is required';
    }
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue < 20) {
      return 'Weeks available per year must be at least 20';
    }
    if (numValue > 52) {
      return 'Weeks available per year cannot exceed 52';
    }
    return undefined;
  };

  const validateMinimumBookingDuration = (duration: string): string | undefined => {
    if (!duration) {
      return 'Minimum booking duration is required';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FinancialValidationErrors = {};

    newErrors.estimatedPropertyValue = validateEstimatedPropertyValue(formData.estimatedPropertyValue);
    newErrors.baseRentalRate = validateBaseRentalRate(formData.baseRentalRate);
    newErrors.cleaningMaintenanceFee = validateCleaningMaintenanceFee(formData.cleaningMaintenanceFee);
    newErrors.weeksAvailablePerYear = validateWeeksAvailablePerYear(formData.weeksAvailablePerYear);
    newErrors.minimumBookingDuration = validateMinimumBookingDuration(formData.minimumBookingDuration);

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateFormData = (field: keyof FinancialFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateFinancialDetails(newFormData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to features and compliance details step
      router.push('/add-commercial-details/commercial-property-features-compliance');
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: FinancialValidationErrors = {};

    newErrors.estimatedPropertyValue = validateEstimatedPropertyValue(formData.estimatedPropertyValue);
    newErrors.baseRentalRate = validateBaseRentalRate(formData.baseRentalRate);
    newErrors.cleaningMaintenanceFee = validateCleaningMaintenanceFee(formData.cleaningMaintenanceFee);
    newErrors.weeksAvailablePerYear = validateWeeksAvailablePerYear(formData.weeksAvailablePerYear);
    newErrors.minimumBookingDuration = validateMinimumBookingDuration(formData.minimumBookingDuration);

    // Check if all required fields are filled and no validation errors
    return (
      formData.estimatedPropertyValue.trim() &&
      formData.baseRentalRate.trim() &&
      formData.cleaningMaintenanceFee.trim() &&
      formData.weeksAvailablePerYear.trim() &&
      formData.minimumBookingDuration &&
      Object.values(newErrors).every(error => !error)
    );
  };

  const renderBookingDurationItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('minimumBookingDuration', item);
        setShowBookingDurationModal(false);
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (!numericValue) return '';
    
    const numValue = parseFloat(numericValue);
    if (isNaN(numValue)) return value;
    
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatNumber = (value: string) => {
    // Remove all non-numeric characters
    return value.replace(/[^0-9]/g, '');
  };

  return (
    <ScreenContainer>
      <Header title="Financial & Rental Details" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Financial & Rental Information
        </Typography>

        {/* Estimated Property Value */}
        <Input
          label="Estimated Property Value *"
          value={formData.estimatedPropertyValue}
          onChangeText={(value) => updateFormData('estimatedPropertyValue', formatCurrency(value))}
          placeholder="$1,500,000"
          error={errors.estimatedPropertyValue}
          keyboardType="numeric"
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Minimum $1.5M, supported by Appraisal Report
        </Typography>

        {/* Base Rental Rate */}
        <Input
          label="Base Rental Rate *"
          value={formData.baseRentalRate}
          onChangeText={(value) => updateFormData('baseRentalRate', formatCurrency(value))}
          placeholder="$50"
          error={errors.baseRentalRate}
          keyboardType="numeric"
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Must be greater than $10
        </Typography>

        {/* Cleaning or Maintenance Fee */}
        <Input
          label="Cleaning or Maintenance Fee *"
          value={formData.cleaningMaintenanceFee}
          onChangeText={(value) => updateFormData('cleaningMaintenanceFee', formatCurrency(value))}
          placeholder="$25"
          error={errors.cleaningMaintenanceFee}
          keyboardType="numeric"
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Must be greater than $5
        </Typography>

        {/* Weeks Available per Year */}
        <Input
          label="Weeks Available per Year *"
          value={formData.weeksAvailablePerYear}
          onChangeText={(value) => updateFormData('weeksAvailablePerYear', formatNumber(value))}
          placeholder="40"
          error={errors.weeksAvailablePerYear}
          keyboardType="numeric"
        />
        <Typography variant="caption" color="secondary" style={styles.helperText}>
          Minimum 20 weeks, maximum 52 weeks
        </Typography>

        {/* Minimum Booking Duration */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Minimum Booking Duration *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.minimumBookingDuration && styles.error]}
            onPress={() => setShowBookingDurationModal(true)}
          >
            <Typography variant="body" style={formData.minimumBookingDuration ? styles.selectedText : styles.placeholder}>
              {formData.minimumBookingDuration || 'Select minimum booking duration'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.minimumBookingDuration && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.minimumBookingDuration}
            </Typography>
          )}
        </View>

        {/* Next Button */}
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>

      {/* Booking Duration Modal */}
      <Modal
        visible={showBookingDurationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h5">Select Minimum Booking Duration</Typography>
            <TouchableOpacity onPress={() => setShowBookingDurationModal(false)}>
              <Typography variant="body" color="primary">Cancel</Typography>
            </TouchableOpacity>
          </View>
          <FlatList
            data={BOOKING_DURATION_OPTIONS}
            renderItem={renderBookingDurationItem}
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
  helperText: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
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