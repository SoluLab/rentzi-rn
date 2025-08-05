import React, { useState } from 'react';
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
import SuccessPopup from '@/components/ui/SuccessPopup';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  AlertTriangle, 
  FileText, 
  Image, 
  Home, 
  DollarSign, 
  Settings, 
  Upload, 
  Shield, 
  Users,
  MapPin,
  Calendar,
  Square,
  Award,
  Wifi,
  Lock,
  Star,
  Mail,
  Phone,
  Bell,
  Bed,
  Bath,
  Users as UsersIcon,
} from 'lucide-react-native';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';
import { useHomeownerPropertyStore } from '@/stores/homeownerPropertyStore';
import { useHomeownerSubmitPropertyForReview } from '@/services/homeownerAddProperty';

interface ReviewSection {
  id: string;
  title: string;
  icon: any;
  isComplete: boolean;
  route: string;
}

const REVIEW_SECTIONS: ReviewSection[] = [
  {
    id: 'propertyDetails',
    title: 'Property Details',
    icon: Home,
    isComplete: false,
    route: 'add-residential-property',
  },
  {
    id: 'pricingValuation',
    title: 'Pricing & Valuation',
    icon: DollarSign,
    isComplete: false,
    route: 'residential-property-pricing-valuation',
  },
  {
    id: 'mediaUpload',
    title: 'Media Uploads',
    icon: Upload,
    isComplete: false,
    route: 'residential-property-media-upload',
  },
  {
    id: 'documentsUpload',
    title: 'Required Documents',
    icon: FileText,
    isComplete: false,
    route: 'residential-property-documents-upload',
  },
  {
    id: 'legalConsents',
    title: 'Legal Consents & Terms',
    icon: Shield,
    isComplete: false,
    route: 'residential-property-legal-consents',
  },
  {
    id: 'listingPurpose',
    title: 'Listing Purpose',
    icon: Users,
    isComplete: false,
    route: 'residential-property-listing-purpose',
  },
];

export default function ResidentialPropertyReviewScreen() {
  const router = useRouter();
  const { 
    data, 
    submitProperty, 
    isAllSectionsComplete,
    getCompletionStatus 
  } = useResidentialPropertyStore();
  const { syncFromResidentialStore } = useHomeownerPropertyStore();
  const { getPropertyById } = useHomeownerPropertyStore();

  // API mutation hook for submitting property for review
  const submitForReviewMutation = useHomeownerSubmitPropertyForReview({
    onSuccess: (response) => {
      console.log('Property submitted for review successfully:', response);
      setShowSuccessPopup(true);
    },
    onError: (error) => {
      console.error('Error submitting property for review:', error);
      Alert.alert('Error', 'Failed to submit property for review. Please try again.');
    },
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const completionStatus = getCompletionStatus();

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToSection = (route: string) => {
    router.push(`/add-residential-details/${route}` as any);
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'Not provided';
    return value;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!isAllSectionsComplete()) {
      Alert.alert('Incomplete Sections', 'Please complete all required sections before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get property ID from store
      const propertyId = data.propertyId;
      if (!propertyId) {
        Alert.alert('Error', 'Property ID not found. Please go back and try again.');
        return;
      }
      
      console.log('Submitting property for review:', propertyId);
      
      // Call the API to submit property for review
      await submitForReviewMutation.mutateAsync({
        propertyId: propertyId
      });
      
      // Sync with homeowner property store
      await syncFromResidentialStore();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Submission Failed', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Navigate to homeowner dashboard
    router.push('/(homeowner-tabs)');
  };

  const renderPropertyDetails = () => {
    const { propertyDetails } = data;
    return (
      <View style={styles.sectionContent}>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Property Title:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.propertyTitle || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Market:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.market === 'Other' 
              ? propertyDetails.otherMarket 
              : propertyDetails.market || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Pincode:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.pincode || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Address:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.fullAddress || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Property Type:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.propertyType || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Year Built:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.yearBuilt || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Bedrooms:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.bedrooms || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Bathrooms:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.bathrooms || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Guest Capacity:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.guestCapacity || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Square Footage:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {propertyDetails.squareFootage ? `${propertyDetails.squareFootage} sqft` : 'Not provided'}
          </Typography>
        </View>
      </View>
    );
  };

  const renderPricingValuation = () => {
    const { pricingValuation } = data;
    return (
      <View style={styles.sectionContent}>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Furnishing Description:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.furnishingDescription || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Featured Amenities:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.featuredAmenities.length > 0 
              ? pricingValuation.featuredAmenities.join(', ')
              : 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Custom Amenities:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.customAmenities.length > 0 
              ? pricingValuation.customAmenities.join(', ')
              : 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Smart Home Features:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.smartHomeFeatures ? 'Yes' : 'No'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Concierge Services:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.conciergeServices || 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Check-in Time:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {`${pricingValuation.checkInTime.hour}:${pricingValuation.checkInTime.minute.toString().padStart(2, '0')} ${pricingValuation.checkInTime.period}`}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Check-out Time:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {`${pricingValuation.checkOutTime.hour}:${pricingValuation.checkOutTime.minute.toString().padStart(2, '0')} ${pricingValuation.checkOutTime.period}`}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">House Rules:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.houseRules.length > 0 
              ? pricingValuation.houseRules.join(', ')
              : 'Not provided'}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Local Highlights:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {pricingValuation.localHighlights || 'Not provided'}
          </Typography>
        </View>
      </View>
    );
  };

  const renderMediaUpload = () => {
    const { mediaUpload } = data;
    return (
      <View style={styles.sectionContent}>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Photos Uploaded:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {mediaUpload.photos.length} photos
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Virtual Tour:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {mediaUpload.virtualTour.value || 'Not provided'}
          </Typography>
        </View>
        {mediaUpload.photos.length > 0 && (
          <View style={styles.photoGrid}>
            {mediaUpload.photos.slice(0, 3).map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image size={20} color={colors.primary.gold} />
                <Typography variant="caption" style={styles.photoName}>
                  {photo.name}
                </Typography>
              </View>
            ))}
            {mediaUpload.photos.length > 3 && (
              <Typography variant="caption" color="secondary">
                +{mediaUpload.photos.length - 3} more
              </Typography>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderDocumentsUpload = () => {
    const { documentsUpload } = data;
    const mandatoryDocuments = [
      { key: 'propertyDeed', name: 'Property Deed', doc: documentsUpload.propertyDeed },
      { key: 'governmentId', name: 'Government ID', doc: documentsUpload.governmentId },
      { key: 'propertyTaxBill', name: 'Property Tax Bill', doc: documentsUpload.propertyTaxBill },
      { key: 'proofOfInsurance', name: 'Proof of Insurance', doc: documentsUpload.proofOfInsurance },
      { key: 'utilityBill', name: 'Utility Bill', doc: documentsUpload.utilityBill },
      { key: 'appraisalReport', name: 'Appraisal Report', doc: documentsUpload.appraisalReport },
      { key: 'authorizationToSell', name: 'Authorization to Sell', doc: documentsUpload.authorizationToSell },
    ];

    const conditionalDocuments = [];
    if (documentsUpload.hasMortgage) {
      conditionalDocuments.push({ key: 'mortgageStatement', name: 'Mortgage Statement', doc: documentsUpload.mortgageStatement });
    }
    if (documentsUpload.hasHOA) {
      conditionalDocuments.push({ key: 'hoaDocuments', name: 'HOA Documents', doc: documentsUpload.hoaDocuments });
    }

    return (
      <View style={styles.sectionContent}>
        <Typography variant="h6" style={styles.subsectionTitle}>Mandatory Documents</Typography>
        {mandatoryDocuments.map(({ key, name, doc }) => (
          <View key={key} style={styles.documentRow}>
            <View style={styles.documentInfo}>
              <FileText size={16} color={doc ? colors.status.success : colors.text.secondary} />
              <Typography variant="body" style={styles.documentName}>
                {name}
              </Typography>
            </View>
            <View style={styles.documentStatus}>
              {doc ? (
                <View style={styles.statusBadge}>
                  <Check size={12} color={colors.neutral.white} />
                  <Typography variant="caption" style={styles.statusText}>
                    Uploaded
                  </Typography>
                </View>
              ) : (
                <View style={styles.statusBadgeError}>
                  <X size={12} color={colors.neutral.white} />
                  <Typography variant="caption" style={styles.statusText}>
                    Missing
                  </Typography>
                </View>
              )}
            </View>
          </View>
        ))}

        {conditionalDocuments.length > 0 && (
          <>
            <Typography variant="h6" style={styles.subsectionTitle}>Conditional Documents</Typography>
            {conditionalDocuments.map(({ key, name, doc }) => (
              <View key={key} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <FileText size={16} color={doc ? colors.status.success : colors.text.secondary} />
                  <Typography variant="body" style={styles.documentName}>
                    {name}
                  </Typography>
                </View>
                <View style={styles.documentStatus}>
                  {doc ? (
                    <View style={styles.statusBadge}>
                      <Check size={12} color={colors.neutral.white} />
                      <Typography variant="caption" style={styles.statusText}>
                        Uploaded
                      </Typography>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeError}>
                      <X size={12} color={colors.neutral.white} />
                      <Typography variant="caption" style={styles.statusText}>
                        Missing
                      </Typography>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  const renderLegalConsents = () => {
    const { legalConsents } = data;
    const consentItems = [
      { key: 'investmentRisks', name: 'Investment Risks Understanding' },
      { key: 'platformTerms', name: 'Platform Terms Agreement' },
      { key: 'variableIncome', name: 'Variable Income Understanding' },
      { key: 'tokenizationConsent', name: 'Tokenization Consent' },
      { key: 'usageRights', name: 'Usage Rights Agreement' },
      { key: 'liquidityLimitations', name: 'Liquidity Limitations' },
      { key: 'governanceRights', name: 'Governance and Voting Rights' },
    ];

    return (
      <View style={styles.sectionContent}>
        {consentItems.map(({ key, name }) => (
          <View key={key} style={styles.consentRow}>
            <View style={styles.consentInfo}>
              <Shield size={16} color={legalConsents[key as keyof typeof legalConsents] ? colors.status.success : colors.text.secondary} />
              <Typography variant="body" style={styles.consentName}>
                {name}
              </Typography>
            </View>
            <View style={styles.consentStatus}>
              {legalConsents[key as keyof typeof legalConsents] ? (
                <Check size={16} color={colors.status.success} />
              ) : (
                <X size={16} color={colors.status.error} />
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderListingPurpose = () => {
    const { listingPurpose } = data;
    const listingPurposes = {
      'rental-only': 'Rental Only',
      'fractional-ownership-rental': 'Fractional Ownership + Rental',
      'fractional-ownership-only': 'Fractional Ownership Only',
    };

    return (
      <View style={styles.sectionContent}>
        <View style={styles.detailRow}>
          <Typography variant="body" color="secondary">Selected Listing Purpose:</Typography>
          <Typography variant="body" style={styles.detailValue}>
            {listingPurpose.selectedPurpose ? listingPurposes[listingPurpose.selectedPurpose as keyof typeof listingPurposes] : 'Not selected'}
          </Typography>
        </View>
      </View>
    );
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'propertyDetails':
        return renderPropertyDetails();
      case 'pricingValuation':
        return renderPricingValuation();
      case 'mediaUpload':
        return renderMediaUpload();
      case 'documentsUpload':
        return renderDocumentsUpload();
      case 'legalConsents':
        return renderLegalConsents();
      case 'listingPurpose':
        return renderListingPurpose();
      default:
        return null;
    }
  };

  const renderReviewSection = (section: ReviewSection) => {
    const isExpanded = expandedSections.has(section.id);
    const isComplete = completionStatus[section.id as keyof typeof completionStatus];
    const IconComponent = section.icon;

    return (
      <View key={section.id} style={styles.reviewSection}>
        <TouchableOpacity
          style={[styles.sectionHeader, !isComplete && styles.sectionHeaderIncomplete]}
          onPress={() => toggleSection(section.id)}
        >
          <View style={styles.sectionHeaderLeft}>
            <IconComponent size={24} color={isComplete ? colors.primary.gold : colors.text.secondary} />
            <View style={styles.sectionTitleContainer}>
              <Typography variant="h6" style={styles.sectionTitleText}>
                {section.title}
              </Typography>
              <View style={styles.sectionStatus}>
                {isComplete ? (
                  <View style={styles.statusBadge}>
                    <Check size={12} color={colors.neutral.white} />
                    <Typography variant="caption" style={styles.statusText}>
                      Complete
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.statusBadgeError}>
                    <AlertTriangle size={12} color={colors.neutral.white} />
                    <Typography variant="caption" style={styles.statusText}>
                      Incomplete
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.sectionHeaderRight}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigateToSection(section.route)}
            >
              <Typography variant="caption" color="primary">
                Edit
              </Typography>
            </TouchableOpacity>
            {isExpanded ? <ChevronUp size={20} color={colors.text.secondary} /> : <ChevronDown size={20} color={colors.text.secondary} />}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {renderSectionContent(section.id)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Header title="Review & Submit" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Review Your Property Details
        </Typography>

        <Typography variant="body" color="secondary" style={styles.sectionDescription}>
          Please review all the information below before submitting your residential property listing. 
          You can edit any section by clicking the "Edit" button.
        </Typography>

        {/* Completion Summary */}
        <View style={styles.completionSummary}>
          <Typography variant="h6" style={styles.summaryTitle}>
            Completion Status
          </Typography>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(Object.values(completionStatus).filter(Boolean).length / Object.keys(completionStatus).length) * 100}%` }
              ]} 
            />
          </View>
          <Typography variant="body" color="secondary" style={styles.summaryText}>
            {Object.values(completionStatus).filter(Boolean).length} of {Object.keys(completionStatus).length} sections complete
          </Typography>
        </View>

        {/* Review Sections */}
        <View style={styles.reviewSections}>
          {REVIEW_SECTIONS.map(renderReviewSection)}
        </View>

        {/* Submission Section */}
        <View style={styles.submissionSection}>
          <View style={styles.submissionInfo}>
            <Typography variant="h6" style={styles.submissionTitle}>
              Ready to Submit?
            </Typography>
            <Typography variant="body" color="secondary" style={styles.submissionDescription}>
              By submitting, you confirm that all information provided is accurate and complete. 
              Our verification team will review your documents and contact you within 2-3 business days.
            </Typography>
          </View>

          <Button
            title={isSubmitting ? "Submitting..." : "Submit Property"}
            onPress={handleSubmit}
            disabled={!isAllSectionsComplete() || isSubmitting}
            style={styles.submitButton}
          />

          {!isAllSectionsComplete() && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={16} color={colors.status.warning} />
              <Typography variant="caption" color="warning" style={styles.warningText}>
                Please complete all required sections before submitting
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        title="Property Submitted Successfully!"
        message="Thank you for submitting your residential property. Our verification team is reviewing your documents. You will receive email, SMS, and in-app notifications with updates."
        buttonText="Go to Dashboard"
      />
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
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  completionSummary: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.light,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.gold,
    borderRadius: 4,
  },
  summaryText: {
    textAlign: 'center',
  },
  reviewSections: {
    marginBottom: spacing.xl,
  },
  reviewSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  sectionHeaderIncomplete: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitleContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  sectionTitleText: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionStatus: {
    alignSelf: 'flex-start',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.gold + '20',
    borderRadius: 12,
  },
  sectionContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentName: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  documentStatus: {
    marginLeft: spacing.sm,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  consentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  consentName: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  consentStatus: {
    marginLeft: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: radius.input,
    gap: spacing.xs,
  },
  photoName: {
    maxWidth: 80,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusBadgeError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
  submissionSection: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
  },
  submissionInfo: {
    marginBottom: spacing.lg,
  },
  submissionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  submissionDescription: {
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warning + '20',
    padding: spacing.md,
    borderRadius: radius.input,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.status.warning,
  },
}); 