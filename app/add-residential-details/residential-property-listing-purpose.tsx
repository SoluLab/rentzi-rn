import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { Check, Home, Users, DollarSign, Calendar } from 'lucide-react-native';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';

interface ListingPurposeData {
  selectedPurpose: string | null;
}

interface ListingPurposeValidationErrors {
  selectedPurpose?: string;
}

const LISTING_PURPOSES = [
  {
    id: 'rental-only',
    title: 'Rental Only',
    description: 'Traditional rental listing for your residential property',
    icon: Home,
    features: [
      'Standard rental agreements',
      'Full property control',
      'Direct tenant management',
      'Traditional revenue model',
      'No fractional ownership complexity'
    ],
    details: 'Choose this option if you want to list your residential property for traditional rental purposes only. You maintain full ownership and control over the property while generating rental income.',
  },
  {
    id: 'fractional-ownership-only',
    title: 'Fractional Ownership Only',
    description: 'Tokenize your property for fractional ownership sales',
    icon: Users,
    features: [
      'Digital tokenization',
      'Fractional ownership sales',
      'Shared property ownership',
      'Platform-managed operations',
      'Liquidity through token trading'
    ],
    details: 'Choose this option to tokenize your residential property, allowing multiple investors to purchase fractional ownership. This creates potential for property appreciation and shared ownership benefits.',
  },
  {
    id: 'both',
    title: 'Both',
    description: 'Combine rental income with fractional ownership opportunities',
    icon: DollarSign,
    features: [
      'Rental income generation',
      'Fractional ownership sales',
      'Dual revenue streams',
      'Flexible property management',
      'Maximum market exposure'
    ],
    details: 'Choose this option to maximize your property\'s potential by offering both rental income and fractional ownership opportunities. This provides the most comprehensive approach to property monetization.',
  },
];

export default function ResidentialPropertyListingPurposeScreen() {
  const router = useRouter();
  const { data, updateListingPurpose } = useResidentialPropertyStore();
  
  const [formData, setFormData] = useState<ListingPurposeData>(data.listingPurpose);
  const [errors, setErrors] = useState<ListingPurposeValidationErrors>({});
  const [expandedPurpose, setExpandedPurpose] = useState<string | null>(null);

  // Validation functions
  const validateListingPurpose = (selectedPurpose: string | null): string | undefined => {
    if (!selectedPurpose) {
      return 'Please select a listing purpose';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ListingPurposeValidationErrors = {};

    newErrors.selectedPurpose = validateListingPurpose(formData.selectedPurpose);

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateFormData = (field: keyof ListingPurposeData, value: string | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateListingPurpose(newFormData);
    
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectListingPurpose = (purposeId: string) => {
    updateFormData('selectedPurpose', purposeId);
  };

  const toggleExpanded = (purposeId: string) => {
    setExpandedPurpose(expandedPurpose === purposeId ? null : purposeId);
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to review details step
      router.push('/add-residential-details/residential-property-review');
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: ListingPurposeValidationErrors = {};

    newErrors.selectedPurpose = validateListingPurpose(formData.selectedPurpose);

    // Check if a listing purpose is selected and no validation errors
    return Object.values(newErrors).every(error => !error);
  };

  const renderListingPurposeOption = (purpose: typeof LISTING_PURPOSES[0]) => {
    const isSelected = formData.selectedPurpose === purpose.id;
    const error = errors.selectedPurpose;
    const isExpanded = expandedPurpose === purpose.id;
    const IconComponent = purpose.icon;

    return (
      <View key={purpose.id} style={styles.listingPurposeItem}>
        <TouchableOpacity
          style={[
            styles.listingPurposeCard,
            isSelected && styles.listingPurposeCardSelected,
            error && styles.listingPurposeCardError
          ]}
          onPress={() => selectListingPurpose(purpose.id)}
        >
          <View style={styles.listingPurposeHeader}>
            <View style={styles.radioContainer}>
              <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                {isSelected && <Check size={16} color={colors.neutral.white} />}
              </View>
            </View>
            
            <View style={styles.listingPurposeContent}>
              <View style={styles.listingPurposeTitleRow}>
                <IconComponent size={24} color={isSelected ? colors.primary.gold : colors.text.secondary} />
                <Typography 
                  variant="h5" 
                  style={{
                    ...styles.listingPurposeTitle,
                    ...(isSelected ? styles.selectedText : {})
                  }}
                >
                  {purpose.title}
                </Typography>
              </View>
              
              <Typography variant="body" color="secondary" style={styles.listingPurposeDescription}>
                {purpose.description}
              </Typography>
            </View>
          </View>

          <View style={styles.listingPurposeFeatures}>
            {purpose.features.map((feature, index) => (
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
            onPress={() => toggleExpanded(purpose.id)}
          >
            <Typography variant="body" color="primary" style={styles.expandText}>
              {isExpanded ? 'Show Less' : 'Learn More'}
            </Typography>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedDetails}>
            <Typography variant="body" color="secondary" style={styles.detailsText}>
              {purpose.details}
            </Typography>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Header title="Select Listing Purpose" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Choose Your Listing Purpose
        </Typography>

        <Typography variant="body" color="secondary" style={styles.sectionDescription}>
          Select how you want to list your residential property. This choice will determine the platform features and revenue model available to you.
        </Typography>

        {/* Listing Purpose Options */}
        <View style={styles.listingPurposesContainer}>
          {LISTING_PURPOSES.map(renderListingPurposeOption)}
        </View>

        {/* Error Message */}
        {errors.selectedPurpose && (
          <View style={styles.errorContainer}>
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.selectedPurpose}
            </Typography>
          </View>
        )}

        {/* Selection Summary */}
        {formData.selectedPurpose && (
          <View style={styles.summaryContainer}>
            <Typography variant="h6" style={styles.summaryTitle}>
              Selected Option
            </Typography>
            <Typography variant="body" style={styles.summaryText}>
              {LISTING_PURPOSES.find(purpose => purpose.id === formData.selectedPurpose)?.title}
            </Typography>
          </View>
        )}

        {/* Next Button */}
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>
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
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  listingPurposesContainer: {
    marginBottom: spacing.xl,
  },
  listingPurposeItem: {
    marginBottom: spacing.lg,
  },
  listingPurposeCard: {
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.input,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  listingPurposeCardSelected: {
    borderColor: colors.primary.gold,
    backgroundColor: colors.primary.gold + '10',
  },
  listingPurposeCardError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + '10',
  },
  listingPurposeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  listingPurposeContent: {
    flex: 1,
  },
  listingPurposeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  listingPurposeTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectedText: {
    color: colors.primary.gold,
  },
  listingPurposeDescription: {
    lineHeight: 18,
  },
  listingPurposeFeatures: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  expandButton: {
    alignSelf: 'flex-start',
  },
  expandText: {
    fontWeight: '500',
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
    backgroundColor: colors.status.error + '10',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.status.error,
  },
  summaryContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  summaryText: {
    fontWeight: '500',
    color: colors.primary.gold,
  },
  nextButton: {
    marginTop: spacing.xl,
  },
}); 