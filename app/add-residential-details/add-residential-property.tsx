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
import { useLocalSearchParams } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { ChevronDown, MapPin, Search, Home, Building, Users } from 'lucide-react-native';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';
import { useHomeownerPropertyStore } from '@/stores/homeownerPropertyStore';
import { useHomeownerSavePropertyDraft } from '@/services/apiClient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Pre-approved Rentzy locations
const APPROVED_LOCATIONS = [
  'Miami, FL',
  'Palm Springs, CA',
  'Aspen, CO',
  'Beverly Hills, CA',
  'Manhattan, NY',
  'Las Vegas, NV',
  'Scottsdale, AZ',
  'Lake Tahoe, CA',
  'Vail, CO',
  'Newport Beach, CA',
  'Other',
];

// Property types
const PROPERTY_TYPES = [
  'Apartment',
  'Condo',
  'Villa',
  'Townhouse',
];

interface FormData {
  propertyTitle: string;
  market: string;
  otherMarket: string;
  pincode: string;
  fullAddress: string;
  propertyType: string;
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  guestCapacity: string;
  squareFootage: string;
}

interface ValidationErrors {
  propertyTitle?: string;
  market?: string;
  otherMarket?: string;
  pincode?: string;
  fullAddress?: string;
  propertyType?: string;
  yearBuilt?: string;
  bedrooms?: string;
  bathrooms?: string;
  guestCapacity?: string;
  squareFootage?: string;
}

export default function AddResidentialPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getPropertyById } = useHomeownerPropertyStore();
  const { data, updatePropertyDetails, resetStore, setPropertyId } = useResidentialPropertyStore();
  
  // API mutation hook
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log('Property created successfully:', response);
      
      // Store the property ID in the store
      if (response.data?.id || response.id) {
        const propertyId = response.data?.id || response.id;
        setPropertyId(propertyId);
        console.log('Property ID stored:', propertyId);
      }
      
      // Navigate to pricing and valuation step
      router.push('/add-residential-details/residential-property-pricing-valuation');
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create property. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });
  
  // Reset store if property was already submitted
  React.useEffect(() => {
    if (data.isSubmitted) {
      resetStore();
    }
  }, []);

  // If editing, fetch property by id and pre-fill form
  const [formData, setFormData] = useState<FormData>(data.propertyDetails);
  useEffect(() => {
    if (id) {
      const property = getPropertyById(id as string);
      if (property) {
        setFormData({
          propertyTitle: property.title || '',
          market: property.location || '',
          otherMarket: '',
          pincode: '',
          fullAddress: property.location || '',
          propertyType: property.data?.propertyDetails?.propertyType || '',
          yearBuilt: property.data?.propertyDetails?.yearBuilt?.toString() || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          guestCapacity: property.data?.propertyDetails?.guestCapacity?.toString() || '',
          squareFootage: property.squareFootage?.toString() || '',
        });
      }
    }
  }, [id, getPropertyById]);
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false);
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

  const validatePropertyType = (type: string): string | undefined => {
    if (!type) {
      return 'Property type is required';
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

  const validateBedrooms = (bedrooms: string): string | undefined => {
    if (!bedrooms) {
      return 'Number of bedrooms is required';
    }
    const numBedrooms = parseInt(bedrooms);
    if (isNaN(numBedrooms) || numBedrooms < 0 || numBedrooms > 10) {
      return 'Bedrooms must be between 0 and 10';
    }
    return undefined;
  };

  const validateBathrooms = (bathrooms: string): string | undefined => {
    if (!bathrooms) {
      return 'Number of bathrooms is required';
    }
    const numBathrooms = parseFloat(bathrooms);
    if (isNaN(numBathrooms) || numBathrooms < 0 || numBathrooms > 10) {
      return 'Bathrooms must be between 0 and 10';
    }
    return undefined;
  };

  const validateGuestCapacity = (capacity: string): string | undefined => {
    if (!capacity) {
      return 'Guest capacity is required';
    }
    const numCapacity = parseInt(capacity);
    if (isNaN(numCapacity) || numCapacity < 1 || numCapacity > 20) {
      return 'Guest capacity must be between 1 and 20';
    }
    return undefined;
  };

  const validateSquareFootage = (sqft: string): string | undefined => {
    if (!sqft) {
      return 'Square footage is required';
    }
    const cleanSqft = sqft.replace(/\D/g, '');
    const sqftNumber = parseInt(cleanSqft);
    if (isNaN(sqftNumber) || sqftNumber <= 0) {
      return 'Square footage must be greater than 0';
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
    newErrors.propertyType = validatePropertyType(formData.propertyType);
    newErrors.yearBuilt = validateYearBuilt(formData.yearBuilt);
    newErrors.bedrooms = validateBedrooms(formData.bedrooms);
    newErrors.bathrooms = validateBathrooms(formData.bathrooms);
    newErrors.guestCapacity = validateGuestCapacity(formData.guestCapacity);
    newErrors.squareFootage = validateSquareFootage(formData.squareFootage);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updatePropertyDetails(newFormData);
    
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
    newErrors.propertyType = validatePropertyType(formData.propertyType);
    newErrors.yearBuilt = validateYearBuilt(formData.yearBuilt);
    newErrors.bedrooms = validateBedrooms(formData.bedrooms);
    newErrors.bathrooms = validateBathrooms(formData.bathrooms);
    newErrors.guestCapacity = validateGuestCapacity(formData.guestCapacity);
    newErrors.squareFootage = validateSquareFootage(formData.squareFootage);

    // Check if all required fields are filled and no validation errors
    return (
      formData.propertyTitle.trim() &&
      formData.market &&
      (formData.market !== 'Other' || formData.otherMarket.trim()) &&
      formData.pincode.trim() &&
      formData.fullAddress.trim() &&
      formData.propertyType &&
      formData.yearBuilt.trim() &&
      formData.bedrooms.trim() &&
      formData.bathrooms.trim() &&
      formData.guestCapacity.trim() &&
      formData.squareFootage.trim() &&
      Object.values(newErrors).every(error => !error)
    );
  };

  // Transform form data to API format
  const transformFormDataToApiFormat = () => {
    const marketLocation = formData.market === 'Other' ? formData.otherMarket : formData.market;
    const [city, state] = marketLocation.split(', ').map(s => s.trim());
    
    // Dummy coordinates based on market location
    const getDummyCoordinates = () => {
      const locationCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
        'Miami, FL': { latitude: 25.7617, longitude: -80.1918 },
        'Palm Springs, CA': { latitude: 33.8303, longitude: -116.5453 },
        'Aspen, CO': { latitude: 39.1911, longitude: -106.8175 },
        'Beverly Hills, CA': { latitude: 34.0736, longitude: -118.4004 },
        'Manhattan, NY': { latitude: 40.7589, longitude: -73.9851 },
        'Las Vegas, NV': { latitude: 36.1699, longitude: -115.1398 },
        'Scottsdale, AZ': { latitude: 33.4942, longitude: -111.9261 },
        'Lake Tahoe, CA': { latitude: 39.0968, longitude: -120.0324 },
        'Vail, CO': { latitude: 39.6433, longitude: -106.3781 },
        'Newport Beach, CA': { latitude: 33.6189, longitude: -117.9289 },
      };
      
      return locationCoordinates[marketLocation] || { latitude: 25.7617, longitude: -80.1918 }; // Default to Miami
    };
    
    const coordinates = getDummyCoordinates();
    
    return {
      title: formData.propertyTitle,
      description: `${formData.propertyTitle} - ${formData.propertyType} with ${formData.bedrooms} bedrooms and ${formData.bathrooms} bathrooms`,
      category: formData.propertyType.toLowerCase(),
      type: "residential",
      location: {
        address: formData.fullAddress,
        city: city || marketLocation,
        state: state || '',
        country: "USA",
        zipCode: formData.pincode,
        coordinates: coordinates
      },
      pricing: {
        basePrice: 0, // Will be set in pricing step
        currency: "USD",
        cleaningFee: 0,
        securityDeposit: 0
      },
      capacity: {
        maxGuests: parseInt(formData.guestCapacity),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        beds: parseInt(formData.bedrooms) // Assuming 1 bed per bedroom
      },
      amenities: ["wifi", "kitchen"], // Default amenities
      features: ["airConditioning"], // Default features
      rules: ["noSmoking", "noPets"] // Default rules
    };
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

  const renderPropertyTypeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        updateFormData('propertyType', item);
        setShowPropertyTypeModal(false);
      }}
    >
      <Typography variant="body">{item}</Typography>
    </TouchableOpacity>
  );

  const handleNext = async () => {
    if (validateForm()) {
      try {
        const apiData = transformFormDataToApiFormat();
        console.log('Submitting property data:', apiData);
        
        // Call the API
        await saveDraftPropertyMutation.mutateAsync(apiData);
      } catch (error) {
        console.error('Error in handleNext:', error);
        // Error is already handled by the mutation's onError callback
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title={id ? "Edit Residential Property" : "Add Residential Property"} />
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Property Details
        </Typography>

        {/* Property Title */}
        <Input
          label="Property Title *"
          value={formData.propertyTitle}
          onChangeText={(value) => updateFormData('propertyTitle', value)}
          placeholder="e.g., Sunny Beachfront Condo"
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

        {/* Property Type */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Property Type *
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, errors.propertyType && styles.error]}
            onPress={() => setShowPropertyTypeModal(true)}
          >
            <Typography variant="body" style={formData.propertyType ? styles.selectedText : styles.placeholder}>
              {formData.propertyType || 'Select property type'}
            </Typography>
            <ChevronDown size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.propertyType && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.propertyType}
            </Typography>
          )}
        </View>

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

        {/* Bedrooms */}
        <Input
          label="Bedrooms *"
          value={formData.bedrooms}
          onChangeText={(value) => updateFormData('bedrooms', value)}
          placeholder="Enter number of bedrooms (0-10)"
          error={errors.bedrooms}
          keyboardType="numeric"
          maxLength={2}
        />

        {/* Bathrooms */}
        <Input
          label="Bathrooms *"
          value={formData.bathrooms}
          onChangeText={(value) => updateFormData('bathrooms', value)}
          placeholder="Enter number of bathrooms (0-10)"
          error={errors.bathrooms}
          keyboardType="numeric"
          maxLength={3}
        />

        {/* Guest Capacity */}
        <Input
          label="Guest Capacity *"
          value={formData.guestCapacity}
          onChangeText={(value) => updateFormData('guestCapacity', value)}
          placeholder="Enter guest capacity (1-20)"
          error={errors.guestCapacity}
          keyboardType="numeric"
          maxLength={2}
        />

        {/* Square Footage */}
        <Input
          label="Square Footage *"
          value={formData.squareFootage}
          onChangeText={(value) => updateFormData('squareFootage', value)}
          placeholder="Enter square footage"
          error={errors.squareFootage}
          keyboardType="numeric"
        />

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Creating..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </KeyboardAwareScrollView>

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

      {/* Property Type Modal */}
      <Modal
        visible={showPropertyTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Select Property Type</Typography>
            <TouchableOpacity onPress={() => setShowPropertyTypeModal(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={PROPERTY_TYPES}
            renderItem={renderPropertyTypeItem}
            keyExtractor={(item) => item}
            style={styles.modalList}
          />
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