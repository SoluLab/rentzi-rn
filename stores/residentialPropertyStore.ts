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

// Complete residential property data interface
export interface ResidentialPropertyData {
  propertyDetails: PropertyDetails;
  pricingValuation: PricingValuationData;
  isSubmitted: boolean;
  submittedAt?: Date;
}

// Store interface
interface ResidentialPropertyStore {
  data: ResidentialPropertyData;
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  updatePricingValuation: (pricingValuation: Partial<PricingValuationData>) => void;
  submitProperty: () => void;
  resetStore: () => void;
  isPropertyDetailsComplete: () => boolean;
  isPricingValuationComplete: () => boolean;
  isAllSectionsComplete: () => boolean;
  getCompletionStatus: () => {
    propertyDetails: boolean;
    pricingValuation: boolean;
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

      isAllSectionsComplete: () => {
        return get().isPropertyDetailsComplete() && get().isPricingValuationComplete();
      },

      getCompletionStatus: () => {
        return {
          propertyDetails: get().isPropertyDetailsComplete(),
          pricingValuation: get().isPricingValuationComplete(),
        };
      },
    }),
    {
      name: 'residential-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 