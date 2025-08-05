import { PropertyType } from './homeownerProperty';

export interface MarketplacePropertyResponse {
  success: boolean;
  message: string;
  data: {
    property: IMarketplaceProperty;
  } | null;
}

export interface IMarketplaceProperty {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  price: {
    rent: number;
    investment: number;
    currency: string;
  };
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  mediaGallery: {
    images: string[];
    videos?: string[];
    tour3D?: string;
  };
  amenities: string[];
  smartHomeEntry?: string;
  conciergeServices?: string;
  availabilityCalendar: {
    available: boolean;
    bookedDates: string[];
    availableDates?: string[];
  };
  investmentDetails: {
    totalShares: number;
    availableShares: number;
    roiEstimate: number;
    minimumInvestment: number;
    fundedPercentage: number;
  };
  rating: number;
  reviews: number;
  approvalStatus: "pending" | "approved" | "rejected";
}