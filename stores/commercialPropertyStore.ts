import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Document file interface
export interface DocumentFile {
  uri: string;
  name: string;
  size: number;
  type: string;
}

// Media file interface
export interface MediaFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

// Property details interface
export interface PropertyDetails {
  propertyTitle: string;
  market: string;
  otherMarket: string;
  pincode: string;
  fullAddress: string;
  zoningType: string;
  squareFootage: string;
  yearBuilt: string;
}

// Financial details interface
export interface FinancialDetails {
  estimatedPropertyValue: string;
  baseRentalRate: string;
  cleaningMaintenanceFee: string;
  weeksAvailablePerYear: string;
  minimumBookingDuration: string;
}

// Features and compliance interface
export interface FeaturesCompliance {
  buildingAmenities: string[];
  smartBuildingSystems: string;
  businessServicesProvided: string;
  accessType: string;
  propertyHighlights: string;
}

// Media uploads interface
declare type VirtualTourType = string | { uri: string; name: string; size: number; type: string; };
export interface MediaUploads {
  photos: MediaFile[];
  virtualTour: VirtualTourType;
}

// Documents interface
export interface Documents {
  // Mandatory Documents
  propertyDeed: DocumentFile | null;
  zoningCertificate: DocumentFile | null;
  titleReport: DocumentFile | null;
  governmentId: DocumentFile | null;
  certificateOfOccupancy: DocumentFile | null;
  rentRoll: DocumentFile | null;
  incomeExpenseStatements: DocumentFile | null;
  camAgreement: DocumentFile | null;
  environmentalReport: DocumentFile | null;
  propertyConditionAssessment: DocumentFile | null;
  proofOfInsurance: DocumentFile | null;
  utilityBill: DocumentFile | null;
  propertyAppraisal: DocumentFile | null;
  authorizationToTokenize: DocumentFile | null;
  
  // Conditional Documents
  mortgageStatement: DocumentFile | null;
  hoaDocuments: DocumentFile | null;
  franchiseAgreement: DocumentFile | null;
  businessLicenses: DocumentFile | null;
  adaComplianceReport: DocumentFile | null;
  fireSafetyInspection: DocumentFile | null;
}

// Legal consents interface
export interface LegalConsents {
  investmentRisks: boolean;
  platformTerms: boolean;
  variableIncome: boolean;
  tokenizationConsent: boolean;
  usageRights: boolean;
  liquidityLimitations: boolean;
  governanceRights: boolean;
}

// Listing type interface
export interface ListingType {
  selectedType: string | null;
}

// Complete commercial property data interface
export interface CommercialPropertyData {
  propertyId?: string; // Add property ID field
  propertyDetails: PropertyDetails;
  financialDetails: FinancialDetails;
  featuresCompliance: FeaturesCompliance;
  mediaUploads: MediaUploads;
  documents: Documents;
  legalConsents: LegalConsents;
  listingType: ListingType;
  isSubmitted: boolean;
  submittedAt?: Date;
}

// Store interface
interface CommercialPropertyStore {
  // Data
  data: CommercialPropertyData;
  
  // Actions
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  updateFinancialDetails: (details: Partial<FinancialDetails>) => void;
  updateFeaturesCompliance: (details: Partial<FeaturesCompliance>) => void;
  updateMediaUploads: (uploads: Partial<MediaUploads>) => void;
  updateDocuments: (documents: Partial<Documents>) => void;
  updateLegalConsents: (consents: Partial<LegalConsents>) => void;
  updateListingType: (listingType: Partial<ListingType>) => void;
  setPropertyId: (propertyId: string) => void; // Add method to set property ID
  submitProperty: () => void;
  resetStore: () => void;
  
  // Computed properties
  isPropertyDetailsComplete: () => boolean;
  isFinancialDetailsComplete: () => boolean;
  isFeaturesComplianceComplete: () => boolean;
  isMediaUploadsComplete: () => boolean;
  isDocumentsComplete: () => boolean;
  isLegalConsentsComplete: () => boolean;
  isListingTypeComplete: () => boolean;
  isAllSectionsComplete: () => boolean;
  getCompletionStatus: () => {
    propertyDetails: boolean;
    financialDetails: boolean;
    featuresCompliance: boolean;
    mediaUploads: boolean;
    documents: boolean;
    legalConsents: boolean;
    listingType: boolean;
  };
}

// Initial data
const initialData: CommercialPropertyData = {
  propertyDetails: {
    propertyTitle: '',
    market: '',
    otherMarket: '',
    pincode: '',
    fullAddress: '',
    zoningType: '',
    squareFootage: '',
    yearBuilt: '',
  },
  financialDetails: {
    estimatedPropertyValue: '',
    baseRentalRate: '',
    cleaningMaintenanceFee: '',
    weeksAvailablePerYear: '',
    minimumBookingDuration: '',
  },
  featuresCompliance: {
    buildingAmenities: [],
    smartBuildingSystems: '',
    businessServicesProvided: '',
    accessType: '',
    propertyHighlights: '',
  },
  mediaUploads: {
    photos: [],
    virtualTour: '',
  },
  documents: {
    propertyDeed: null,
    zoningCertificate: null,
    titleReport: null,
    governmentId: null,
    certificateOfOccupancy: null,
    rentRoll: null,
    incomeExpenseStatements: null,
    camAgreement: null,
    environmentalReport: null,
    propertyConditionAssessment: null,
    proofOfInsurance: null,
    utilityBill: null,
    propertyAppraisal: null,
    authorizationToTokenize: null,
    mortgageStatement: null,
    hoaDocuments: null,
    franchiseAgreement: null,
    businessLicenses: null,
    adaComplianceReport: null,
    fireSafetyInspection: null,
  },
  legalConsents: {
    investmentRisks: false,
    platformTerms: false,
    variableIncome: false,
    tokenizationConsent: false,
    usageRights: false,
    liquidityLimitations: false,
    governanceRights: false,
  },
  listingType: {
    selectedType: null,
  },
  isSubmitted: false,
};

export const useCommercialPropertyStore = create<CommercialPropertyStore>()(
  persist(
    (set, get) => ({
      data: initialData,

      // Update actions
      updatePropertyDetails: (details) =>
        set((state) => ({
          data: {
            ...state.data,
            propertyDetails: { ...state.data.propertyDetails, ...details },
          },
        })),

      updateFinancialDetails: (details) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: { ...state.data.financialDetails, ...details },
          },
        })),

      updateFeaturesCompliance: (details) =>
        set((state) => ({
          data: {
            ...state.data,
            featuresCompliance: { ...state.data.featuresCompliance, ...details },
          },
        })),

      updateMediaUploads: (uploads) =>
        set((state) => ({
          data: {
            ...state.data,
            mediaUploads: { ...state.data.mediaUploads, ...uploads },
          },
        })),

      updateDocuments: (documents) =>
        set((state) => ({
          data: {
            ...state.data,
            documents: { ...state.data.documents, ...documents },
          },
        })),

      updateLegalConsents: (consents) =>
        set((state) => ({
          data: {
            ...state.data,
            legalConsents: { ...state.data.legalConsents, ...consents },
          },
        })),

      updateListingType: (listingType) =>
        set((state) => ({
          data: {
            ...state.data,
            listingType: { ...state.data.listingType, ...listingType },
          },
        })),

      setPropertyId: (propertyId: string) => {
        set((state) => ({
          data: {
            ...state.data,
            propertyId,
          },
        }));
      },

      submitProperty: () =>
        set((state) => ({
          data: {
            ...state.data,
            isSubmitted: true,
            submittedAt: new Date(),
          },
        })),

      resetStore: () =>
        set(() => ({
          data: initialData,
        })),

      // Validation functions
      isPropertyDetailsComplete: () => {
        const { propertyDetails } = get().data;
        return !!(
          propertyDetails.propertyTitle.trim() &&
          propertyDetails.market &&
          (propertyDetails.market !== 'Other' || propertyDetails.otherMarket.trim()) &&
          propertyDetails.pincode.trim() &&
          propertyDetails.fullAddress.trim() &&
          propertyDetails.zoningType &&
          propertyDetails.squareFootage.trim() &&
          propertyDetails.yearBuilt.trim()
        );
      },

      isFinancialDetailsComplete: () => {
        const { financialDetails } = get().data;
        return !!(
          financialDetails.estimatedPropertyValue.trim() &&
          financialDetails.baseRentalRate.trim() &&
          financialDetails.cleaningMaintenanceFee.trim() &&
          financialDetails.weeksAvailablePerYear.trim() &&
          financialDetails.minimumBookingDuration
        );
      },

      isFeaturesComplianceComplete: () => {
        const { featuresCompliance } = get().data;
        return !!(
          featuresCompliance.buildingAmenities.length > 0 &&
          featuresCompliance.accessType &&
          featuresCompliance.propertyHighlights.trim()
        );
      },

      isMediaUploadsComplete: () => {
        const { mediaUploads } = get().data;
        return mediaUploads.photos.length >= 5;
      },

      isDocumentsComplete: () => {
        const { documents } = get().data;
        const mandatoryDocuments = [
          documents.propertyDeed,
          documents.zoningCertificate,
          documents.titleReport,
          documents.governmentId,
          documents.certificateOfOccupancy,
          documents.rentRoll,
          documents.incomeExpenseStatements,
          documents.camAgreement,
          documents.environmentalReport,
          documents.propertyConditionAssessment,
          documents.proofOfInsurance,
          documents.utilityBill,
          documents.propertyAppraisal,
          documents.authorizationToTokenize,
        ];
        return mandatoryDocuments.every(doc => doc !== null);
      },

      isLegalConsentsComplete: () => {
        const { legalConsents } = get().data;
        return Object.values(legalConsents).every(consent => consent === true);
      },

      isListingTypeComplete: () => {
        const { listingType } = get().data;
        return !!listingType.selectedType;
      },

      isAllSectionsComplete: () => {
        const store = get();
        return (
          store.isPropertyDetailsComplete() &&
          store.isFinancialDetailsComplete() &&
          store.isFeaturesComplianceComplete() &&
          store.isMediaUploadsComplete() &&
          store.isDocumentsComplete() &&
          store.isLegalConsentsComplete() &&
          store.isListingTypeComplete()
        );
      },

      getCompletionStatus: () => {
        const store = get();
        return {
          propertyDetails: store.isPropertyDetailsComplete(),
          financialDetails: store.isFinancialDetailsComplete(),
          featuresCompliance: store.isFeaturesComplianceComplete(),
          mediaUploads: store.isMediaUploadsComplete(),
          documents: store.isDocumentsComplete(),
          legalConsents: store.isLegalConsentsComplete(),
          listingType: store.isListingTypeComplete(),
        };
      },
    }),
    {
      name: 'commercial-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 