import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
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
import { ChevronDown, MapPin, Search } from 'lucide-react-native';

// Pre-approved Rentzy locations
const APPROVED_LOCATIONS = [
  'Palm Springs, CA',
  'Aspen, CO',
  'Miami Beach, FL',
  'Beverly Hills, CA',
  'Manhattan, NY',
  'Las Vegas, NV',
  'Scottsdale, AZ',
  'Lake Tahoe, CA',
  'Vail, CO',
  'Newport Beach, CA',
  'Other',
];

// Zoning types
const ZONING_TYPES = [
  'Retail',
  'Office',
  'Mixed-Use',
  'Industrial',
  'Hospitality',
];

interface FormData {
  propertyTitle: string;
  market: string;
  otherMarket: string;
  pincode: string;
  fullAddress: string;
  zoningType: string;
  squareFootage: string;
  yearBuilt: string;
}

interface ValidationErrors {
  propertyTitle?: string;
  market?: string;
  otherMarket?: string;
  pincode?: string;
  fullAddress?: string;
  zoningType?: string;
  squareFootage?: string;
  yearBuilt?: string;
}

export default function AddCommercialPropertyScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    propertyTitle: '',
    market: '',
    otherMarket: '',
    pincode: '',
    fullAddress: '',
    zoningType: '',
    squareFootage: '',
    yearBuilt: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showZoningModal, setShowZoningModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentYear = new Date().getFullYear();

  // Validation functions
  const validatePropertyTitle = (title: string): string | undefined => {
    if (!title.trim()) {
      return 'Property title is required';
    }
    if (title.length < 2) {
      return 'Property title must be at least 2 characters long';
    }
    if (title.length > 100) {
      return 'Property title cannot exceed 100 characters';
    }
    // Allow only letters, numbers, spaces, hyphens, and slashes
    const titleRegex = /^[a-zA-Z0-9\s\-/]+$/;
    if (!titleRegex.test(title)) {
      return 'Property title can only contain letters, numbers, spaces, hyphens, and slashes';
    }
    return undefined;
  };

  const validateMarket = (market: string): string | undefined => {
    if (!market) {
      return 'Market is required';
    }
    if (market === 'Other' && !formData.otherMarket.trim()) {
      return 'Please specify the market location';
    }
    return undefined;
  };

  const validatePincode = (pincode: string): string | undefined => {
    if (!pincode) {
      return 'Pincode is required';
    }
    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length < 5 || cleanPincode.length > 6) {
      return 'Pincode must be 5-6 digits';
    }
    if (!/^\d+$/.test(cleanPincode)) {
      return 'Pincode must contain only digits';
    }
    return undefined;
  };

  const validateFullAddress = (address: string): string | undefined => {
    if (!address.trim()) {
      return 'Full address is required';
    }
    if (address.length < 10) {
      return 'Address must be at least 10 characters long';
    }
    return undefined;
  };

  const validateZoningType = (zoning: string): string | undefined => {
    if (!zoning) {
      return 'Zoning type is required';
    }
    return undefined;
  };

  const validateSquareFootage = (sqft: string): string | undefined => {
    if (!sqft) {
      return 'Square footage is required';
    }
    const cleanSqft = sqft.replace(/\D/g, '');
    const sqftNumber = parseInt(cleanSqft);
    if (isNaN(sqftNumber) || sqftNumber < 3000) {
      return 'Square footage must be at least 3,000 sqft';
    }
    return undefined;
  };

  const validateYearBuilt = (year: string): string | undefined => {
    if (!year) {
      return 'Year built is required';
    }
    const cleanYear = year.replace(/\D/g, '');
    const yearNumber = parseInt(cleanYear);
    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
      return `Year must be between 1900 and ${currentYear}`;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    newErrors.propertyTitle = validatePropertyTitle(formData.propertyTitle);
    newErrors.market = validateMarket(formData.market);
    if (formData.market === 'Other') {
      newErrors.otherMarket = validatePropertyTitle(formData.otherMarket);
    }
    newErrors.pincode = validatePincode(formData.pincode);
    newErrors.fullAddress = validateFullAddress(formData.fullAddress);
    newErrors.zoningType = validateZoningType(formData.zoningType);
    newErrors.squareFootage = validateSquareFootage(formData.squareFootage);
    newErrors.yearBuilt = validateYearBuilt(formData.yearBuilt);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  const filteredLocations = APPROVED_LOCATIONS.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: ValidationErrors = {};

    newErrors.propertyTitle = validatePropertyTitle(formData.propertyTitle);
    newErrors.market = validateMarket(formData.market);
    if (formData.market === 'Other') {
      newErrors.otherMarket = validatePropertyTitle(formData.otherMarket);
    }
    newErrors.pincode = validatePincode(formData.pincode);
    newErrors.fullAddress = validateFullAddress(formData.fullAddress);
    newErrors.zoningType = validateZoningType(formData.zoningType);
    newErrors.squareFootage = validateSquareFootage(formData.squareFootage);
    newErrors.yearBuilt = validateYearBuilt(formData.yearBuilt);

    // Check if all required fields are filled and no validation errors
    return (
      formData.propertyTitle.trim() &&
      formData.market &&
      (formData.market !== 'Other' || formData.otherMarket.trim()) &&
      formData.pincode.trim() &&
      formData.fullAddress.trim() &&
      formData.zoningType &&
      formData.squareFootage.trim() &&
      formData.yearBuilt.trim() &&
      Object.values(newErrors).every(error => !error)
    );
  };

  const renderMarketItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('market', item);
        setShowMarketModal(false);
        setSearchQuery('');
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const renderZoningItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('zoningType', item);
        setShowZoningModal(false);
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to financial details step
      router.push('/commercial-property-financial-details');
    }
  };

  return (
    <ScreenContainer>
      <Header title="Add Commercial Property" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Property Details
        </Typography>

        {/* Property Title */}
        <Input
          label="Property Title *"
          value={formData.propertyTitle}
          onChangeText={(value) => updateFormData('propertyTitle', value)}
          placeholder="Enter property title (2-100 characters)"
          error={errors.propertyTitle}
          maxLength={100}
        />

        {/* Market Selection */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Market *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.market && styles.error]}
            onPress={() => setShowMarketModal(true)}
          >
            <Typography variant="body" style={formData.market ? styles.selectedText : styles.placeholder}>
              {formData.market || 'Select market location'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.market && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.market}
            </Typography>
          )}
        </View>

        {/* Other Market Input */}
        {formData.market === 'Other' && (
          <Input
            label="Specify Market Location *"
            value={formData.otherMarket}
            onChangeText={(value) => updateFormData('otherMarket', value)}
            placeholder="Enter market location"
            error={errors.otherMarket}
            maxLength={100}
          />
        )}

        {/* Pincode */}
        <Input
          label="Pincode *"
          value={formData.pincode}
          onChangeText={(value) => updateFormData('pincode', value)}
          placeholder="Enter 5-6 digit pincode"
          error={errors.pincode}
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Google Map Placeholder */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Property Location *
          </Typography>
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <MapPin size={24} color={colors.primary.gold} />
              <Typography variant="body" color="secondary" style={styles.mapText}>
                Google Map with search and draggable pin
              </Typography>
              <Typography variant="caption" color="secondary">
                (Map integration required)
              </Typography>
            </View>
          </View>
        </View>

        {/* Full Address */}
        <Input
          label="Full Address *"
          value={formData.fullAddress}
          onChangeText={(value) => updateFormData('fullAddress', value)}
          placeholder="Enter complete property address"
          error={errors.fullAddress}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Zoning Type */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Zoning Type *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.zoningType && styles.error]}
            onPress={() => setShowZoningModal(true)}
          >
            <Typography variant="body" style={formData.zoningType ? styles.selectedText : styles.placeholder}>
              {formData.zoningType || 'Select zoning type'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.zoningType && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.zoningType}
            </Typography>
          )}
        </View>

        {/* Square Footage */}
        <Input
          label="Square Footage *"
          value={formData.squareFootage}
          onChangeText={(value) => updateFormData('squareFootage', value)}
          placeholder="Enter square footage (min 3,000 sqft)"
          error={errors.squareFootage}
          keyboardType="numeric"
        />

        {/* Year Built */}
        <Input
          label="Year Built or Renovated *"
          value={formData.yearBuilt}
          onChangeText={(value) => updateFormData('yearBuilt', value)}
          placeholder={`Enter year (1900-${currentYear})`}
          error={errors.yearBuilt}
          keyboardType="numeric"
          maxLength={4}
        />

        {/* Next Button */}
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>

      {/* Market Selection Modal */}
      <Modal
        visible={showMarketModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Select Market</Typography>
            <TouchableOpacity
              onPress={() => {
                setShowMarketModal(false);
                setSearchQuery('');
              }}
            >
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredLocations}
            renderItem={renderMarketItem}
            keyExtractor={(item) => item}
            style={styles.modalList}
          />
        </View>
      </Modal>

      {/* Zoning Type Modal */}
      <Modal
        visible={showZoningModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Select Zoning Type</Typography>
            <TouchableOpacity onPress={() => setShowZoningModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={ZONING_TYPES}
            renderItem={renderZoningItem}
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
  mapContainer: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  mapText: {
    marginTop: spacing.sm,
    textAlign: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
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