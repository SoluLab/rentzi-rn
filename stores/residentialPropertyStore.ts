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
  bedrooms: string;
  bathrooms: string;
  guestCapacity: string;
  squareFootage: string;
}

// Pricing and valuation interface
export interface PricingValuationData {
  furnishingDescription: string;
  featuredAmenities: string[];
  customAmenities: string[];
  smartHomeFeatures: boolean;
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
export interface MediaUploadData {
  photos: Array<{
    uri: string;
    name: string;
    size: number;
    width: number;
    height: number;
    type: string;
  }>;
  virtualTour: {
    type: 'link' | 'file';
    value: string;
    name?: string;
    size?: number;
  };
}

// Documents upload interface
export interface DocumentData {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface DocumentsUploadData {
  // Mandatory documents
  propertyDeed: DocumentData | null;
  governmentId: DocumentData | null;
  propertyTaxBill: DocumentData | null;
  proofOfInsurance: DocumentData | null;
  utilityBill: DocumentData | null;
  appraisalReport: DocumentData | null;
  authorizationToSell: DocumentData | null;
  
  // Conditional documents
  mortgageStatement: DocumentData | null;
  hoaDocuments: DocumentData | null;
  
  // Conditional flags
  hasMortgage: boolean;
  hasHOA: boolean;
}

// Complete residential property data interface
export interface ResidentialPropertyData {
  propertyDetails: PropertyDetails;
  pricingValuation: PricingValuationData;
  mediaUpload: MediaUploadData;
  documentsUpload: DocumentsUploadData;
  isSubmitted: boolean;
  submittedAt?: Date;
}

// Store interface
interface ResidentialPropertyStore {
  data: ResidentialPropertyData;
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  updatePricingValuation: (pricingValuation: Partial<PricingValuationData>) => void;
  updateMediaUpload: (mediaUpload: Partial<MediaUploadData>) => void;
  updateDocumentsUpload: (documentsUpload: Partial<DocumentsUploadData>) => void;
  submitProperty: () => void;
  resetStore: () => void;
  isPropertyDetailsComplete: () => boolean;
  isPricingValuationComplete: () => boolean;
  isMediaUploadComplete: () => boolean;
  isDocumentsUploadComplete: () => boolean;
  isAllSectionsComplete: () => boolean;
  getCompletionStatus: () => {
    propertyDetails: boolean;
    pricingValuation: boolean;
    mediaUpload: boolean;
    documentsUpload: boolean;
  };
}

// Initial data
const initialData: ResidentialPropertyData = {
  propertyDetails: {
    propertyTitle: '',
    market: '',
    otherMarket: '',
    pincode: '',
    fullAddress: '',
    propertyType: '',
    yearBuilt: '',
    bedrooms: '',
    bathrooms: '',
    guestCapacity: '',
    squareFootage: '',
  },
  pricingValuation: {
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
  },
  mediaUpload: {
    photos: [],
    virtualTour: {
      type: 'link',
      value: '',
    },
  },
  documentsUpload: {
    propertyDeed: null,
    governmentId: null,
    propertyTaxBill: null,
    proofOfInsurance: null,
    utilityBill: null,
    appraisalReport: null,
    authorizationToSell: null,
    mortgageStatement: null,
    hoaDocuments: null,
    hasMortgage: false,
    hasHOA: false,
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
              ...documentsUpload,
            },
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
          pricingValuation.furnishingDescription !== '' &&
          pricingValuation.featuredAmenities.length > 0 &&
          pricingValuation.houseRules.length > 0 &&
          pricingValuation.localHighlights.trim() !== ''
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

      isAllSectionsComplete: () => {
        return get().isPropertyDetailsComplete() && 
               get().isPricingValuationComplete() && 
               get().isMediaUploadComplete() &&
               get().isDocumentsUploadComplete();
      },

      getCompletionStatus: () => {
        return {
          propertyDetails: get().isPropertyDetailsComplete(),
          pricingValuation: get().isPricingValuationComplete(),
          mediaUpload: get().isMediaUploadComplete(),
          documentsUpload: get().isDocumentsUploadComplete(),
        };
      },
    }),
    {
      name: 'residential-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 