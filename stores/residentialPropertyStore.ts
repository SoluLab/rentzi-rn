import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Property details interface
export interface PropertyDetails {
  propertyTitle: string;
  market: string;
  otherMarket: string;
  pincode: string;
  fullAddress: string;
  propertyType: string;
  yearBuilt: string;
  yearRenovated: string;
  bedrooms: string;
  bathrooms: string;
  guestCapacity: string;
  squareFootage: string;
}

// Pricing and valuation interface
export interface PricingValuationData {
  estimatedPropertyValue: string;
  nightlyRate: string;
  weekendRate: string;
  peakSeasonRate: string;
  cleaningFee: string;
  rentalAvailability: string;
  minimumStay: string;
}

// Features and compliance interface
export interface FeaturesComplianceData {
  furnishingDescription: string;
  featuredAmenities: string[];
  customAmenities: string[];
  smartHomeFeatures: string;
  conciergeServices: string;
  checkInTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
  checkOutTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
  houseRules: string[];
  localHighlights: string;
}

// Media upload interface
export interface MediaFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  expiresAt?: string;
}

export interface VideoFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  expiresAt?: string;
}

export interface MediaUploadData {
  photos: MediaFile[];
  virtualTour: VideoFile | string;
  video360: VideoFile | null; // Add 360° video field
}

// Documents upload interface
export interface DocumentData {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string; // Add uploaded URL field
  uploadedKey?: string; // Add uploaded key field
  apiDocumentId?: string; // Link to API document if it exists
}

export interface DocumentsUploadData {
  [key: string]: DocumentData | null; // Dynamic key-value pairs for documents
}

// Legal consents interface
export interface LegalConsentsData {
  investmentRisks: boolean;
  platformTerms: boolean;
  variableIncome: boolean;
  tokenizationConsent: boolean;
  usageRights: boolean;
  liquidityLimitations: boolean;
  governanceRights: boolean;
}

// Listing purpose interface
export interface ListingPurposeData {
  selectedPurpose: string | null;
}

// Complete residential property data interface
export interface ResidentialPropertyData {
  propertyId?: string; // Add property ID field
  propertyDetails: PropertyDetails;
  pricingValuation: PricingValuationData;
  featuresCompliance: FeaturesComplianceData;
  mediaUpload: MediaUploadData;
  documentsUpload: DocumentsUploadData;
  legalConsents: LegalConsentsData;
  listingPurpose: ListingPurposeData;
  isSubmitted: boolean;
  submittedAt?: Date;
}

// Store interface
interface ResidentialPropertyStore {
  data: ResidentialPropertyData;
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  updatePricingValuation: (pricingValuation: Partial<PricingValuationData>) => void;
  updateFeaturesCompliance: (featuresCompliance: Partial<FeaturesComplianceData>) => void;
  updateMediaUpload: (mediaUpload: Partial<MediaUploadData>) => void;
  updateDocumentsUpload: (documentsUpload: Partial<DocumentsUploadData>) => void;
  updateLegalConsents: (legalConsents: Partial<LegalConsentsData>) => void;
  updateListingPurpose: (listingPurpose: Partial<ListingPurposeData>) => void;
  setPropertyId: (propertyId: string) => void; // Add method to set property ID
  submitProperty: () => void;
  resetStore: () => void;
  isPropertyDetailsComplete: () => boolean;
  isPricingValuationComplete: () => boolean;
  isFeaturesComplianceComplete: () => boolean;
  isMediaUploadComplete: () => boolean;
  isDocumentsUploadComplete: () => boolean;
  isLegalConsentsComplete: () => boolean;
  isListingPurposeComplete: () => boolean;
  isAllSectionsComplete: () => boolean;
  getCompletionStatus: () => {
    propertyDetails: boolean;
    pricingValuation: boolean;
    featuresCompliance: boolean;
    mediaUpload: boolean;
    documentsUpload: boolean;
    legalConsents: boolean;
    listingPurpose: boolean;
  };
}

// Initial data
const initialData: ResidentialPropertyData = {
  propertyId: undefined, // Add property ID to initial data
  propertyDetails: {
    propertyTitle: '',
    market: '',
    otherMarket: '',
    pincode: '',
    fullAddress: '',
    propertyType: '',
    yearBuilt: '',
    yearRenovated: '',
    bedrooms: '',
    bathrooms: '',
    guestCapacity: '',
    squareFootage: '',
  },
  pricingValuation: {
    estimatedPropertyValue: '',
    nightlyRate: '',
    weekendRate: '',
    peakSeasonRate: '',
    cleaningFee: '',
    rentalAvailability: '',
    minimumStay: '',
  },
  featuresCompliance: {
    furnishingDescription: '',
    featuredAmenities: [],
    customAmenities: [],
    smartHomeFeatures: '',
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
  },
  mediaUpload: {
    photos: [],
    virtualTour: '',
    video360: null,
  },
  documentsUpload: {}, // Empty object for dynamic documents
  legalConsents: {
    investmentRisks: false,
    platformTerms: false,
    variableIncome: false,
    tokenizationConsent: false,
    usageRights: false,
    liquidityLimitations: false,
    governanceRights: false,
  },
  listingPurpose: {
    selectedPurpose: null,
  },
  isSubmitted: false,
};

export const useResidentialPropertyStore = create<ResidentialPropertyStore>()(
  persist(
    (set, get) => ({
      data: initialData,

      updatePropertyDetails: (details: Partial<PropertyDetails>) => {
        set((state) => ({
          data: {
            ...state.data,
            propertyDetails: {
              ...state.data.propertyDetails,
              ...details,
            },
          },
        }));
      },

      updatePricingValuation: (pricingValuation: Partial<PricingValuationData>) => {
        set((state) => ({
          data: {
            ...state.data,
            pricingValuation: {
              ...state.data.pricingValuation,
              ...pricingValuation,
            },
          },
        }));
      },

      updateFeaturesCompliance: (featuresCompliance: Partial<FeaturesComplianceData>) => {
        set((state) => ({
          data: {
            ...state.data,
            featuresCompliance: {
              ...state.data.featuresCompliance,
              ...featuresCompliance,
            },
          },
        }));
      },

      updateMediaUpload: (mediaUpload: Partial<MediaUploadData>) => {
        set((state) => ({
          data: {
            ...state.data,
            mediaUpload: {
              ...state.data.mediaUpload,
              ...mediaUpload,
            },
          },
        }));
      },

      updateDocumentsUpload: (documentsUpload: Partial<DocumentsUploadData>) => {
        set((state) => ({
          data: {
            ...state.data,
            documentsUpload: {
              ...state.data.documentsUpload,
              ...Object.fromEntries(
                Object.entries(documentsUpload).filter(([_, value]) => value !== undefined)
              )
            },
          },
        }));
      },

      updateLegalConsents: (legalConsents: Partial<LegalConsentsData>) => {
        set((state) => ({
          data: {
            ...state.data,
            legalConsents: {
              ...state.data.legalConsents,
              ...legalConsents,
            },
          },
        }));
      },

      updateListingPurpose: (listingPurpose: Partial<ListingPurposeData>) => {
        set((state) => ({
          data: {
            ...state.data,
            listingPurpose: {
              ...state.data.listingPurpose,
              ...listingPurpose,
            },
          },
        }));
      },

      setPropertyId: (propertyId: string) => {
        set((state) => ({
          data: {
            ...state.data,
            propertyId,
          },
        }));
      },

      submitProperty: () => {
        set((state) => ({
          data: {
            ...state.data,
            isSubmitted: true,
            submittedAt: new Date(),
          },
        }));
      },

      resetStore: () => {
        set({ data: initialData });
      },

      isPropertyDetailsComplete: () => {
        const { propertyDetails } = get().data;
        return (
          propertyDetails.propertyTitle.trim() !== '' &&
          propertyDetails.market !== '' &&
          (propertyDetails.market !== 'Other' || propertyDetails.otherMarket.trim() !== '') &&
          propertyDetails.pincode.trim() !== '' &&
          propertyDetails.fullAddress.trim() !== '' &&
          propertyDetails.propertyType !== '' &&
          propertyDetails.yearBuilt.trim() !== '' &&
          propertyDetails.bedrooms.trim() !== '' &&
          propertyDetails.bathrooms.trim() !== '' &&
          propertyDetails.guestCapacity.trim() !== '' &&
          propertyDetails.squareFootage.trim() !== ''
        );
      },

      isPricingValuationComplete: () => {
        const { pricingValuation } = get().data;
        return (
          pricingValuation.estimatedPropertyValue.trim() !== '' &&
          pricingValuation.nightlyRate.trim() !== '' &&
          pricingValuation.cleaningFee.trim() !== '' &&
          pricingValuation.rentalAvailability.trim() !== '' &&
          pricingValuation.minimumStay.trim() !== ''
        );
      },

      isFeaturesComplianceComplete: () => {
        const { featuresCompliance } = get().data;
        return (
          featuresCompliance.furnishingDescription !== '' &&
          featuresCompliance.featuredAmenities.length > 0 &&
          featuresCompliance.houseRules.length > 0 &&
          featuresCompliance.localHighlights.trim() !== ''
        );
      },

      isMediaUploadComplete: () => {
        const { mediaUpload } = get().data;
        return mediaUpload.photos.length >= 3;
      },

      isDocumentsUploadComplete: () => {
        const { documentsUpload } = get().data;
        const mandatoryDocuments = [
          documentsUpload.propertyDeed,
          documentsUpload.governmentId,
          documentsUpload.propertyTaxBill,
          documentsUpload.proofOfInsurance,
          documentsUpload.utilityBill,
          documentsUpload.appraisalReport,
          documentsUpload.authorizationToSell,
        ];
        
        const mandatoryComplete = mandatoryDocuments.every(doc => doc !== null);
        const conditionalComplete = 
          (!documentsUpload.hasMortgage || documentsUpload.mortgageStatement !== null) &&
          (!documentsUpload.hasHOA || documentsUpload.hoaDocuments !== null);
        
        return mandatoryComplete && conditionalComplete;
      },

      isLegalConsentsComplete: () => {
        const { legalConsents } = get().data;
        return Object.values(legalConsents).every(consent => consent === true);
      },

      isListingPurposeComplete: () => {
        const { listingPurpose } = get().data;
        return listingPurpose.selectedPurpose !== null;
      },

      isAllSectionsComplete: () => {
        return get().isPropertyDetailsComplete() && 
               get().isPricingValuationComplete() && 
               get().isFeaturesComplianceComplete() &&
               get().isMediaUploadComplete() &&
               get().isDocumentsUploadComplete() &&
               get().isLegalConsentsComplete() &&
               get().isListingPurposeComplete();
      },

      getCompletionStatus: () => {
        return {
          propertyDetails: get().isPropertyDetailsComplete(),
          pricingValuation: get().isPricingValuationComplete(),
          featuresCompliance: get().isFeaturesComplianceComplete(),
          mediaUpload: get().isMediaUploadComplete(),
          documentsUpload: get().isDocumentsUploadComplete(),
          legalConsents: get().isLegalConsentsComplete(),
          listingPurpose: get().isListingPurposeComplete(),
        };
      },
    }),
    {
      name: 'residential-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 