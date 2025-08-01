export interface User {
  id: string;
  name: string;
  email: string;
  role: 'renter' | 'investor' | 'homeowner';
  profileDetails: {
    avatar?: string;
    phone?: string;
    bio?: string;
  };
  investmentStatus: boolean;
  kycStatus: 'incomplete' | 'pending' | 'complete';
  paymentMethods: PaymentMethod[];
  notificationPreferences: {
    bookings: boolean;
    investments: boolean;
    listings: boolean;
    marketing: boolean;
  };
}
export interface Property {
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
  propertyType: 'villa' | 'penthouse' | 'mansion' | 'estate' | 'yacht';
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
  approvalStatus: 'pending' | 'approved' | 'rejected';
}
export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  bookingStatus: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  paymentMethod: string;
}
export interface Investment {
  id: string;
  propertyId: string;
  userId: string;
  amount: number;
  currency: 'USD' | 'BTC' | 'ETH';
  investmentDate: string;
  roiEstimate: number;
  investmentStatus: 'active' | 'completed' | 'pending';
  shares: number;
  currentValue: number;
  payoutDetails?: {
    claimableAmount: number;
    lastClaimDate?: string;
    payoutStatus: 'eligible' | 'pending_approval' | 'claimed' | 'insufficient_yield';
  };
  claimHistory?: {
    date: string;
    amount: number;
    txHash: string;
    status: 'Pending' | 'Completed';
    totalPassiveIncome?: number;
  }[];
}
export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'investment' | 'listing' | 'system';
  title: string;
  message: string;
  readStatus: boolean;
  timestamp: string;
  actionUrl?: string;
}
export interface PaymentMethod {
  id: string;
  type: 'card' | 'crypto' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}
export interface PaymentTransaction {
  id: string;
  userId: string;
  bookingId?: string;
  investmentId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionStatus: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

// Authentication API Types
export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
}

// Property Types and Enums
export type PropertyType = 'villa' | 'penthouse' | 'mansion' | 'estate' | 'yacht' | 'apartment' | 'farmhouse' | 'cabin' | 'treehouse' | 'loft' | 'office' | 'retail' | 'warehouse' | 'commercial';
export type PropertyCategory = 'residential' | 'commercial';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
export type BlockchainStatus = 'not_tokenized' | 'tokenized' | 'tokenizing' | 'failed';
export type RoomType = 'master' | 'guest' | 'kids' | 'study' | 'other';
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk';
export type OwnershipType = 'freehold' | 'leasehold' | 'cooperative' | 'condominium';

// IProperty Interface based on the provided schema
export interface IProperty {
  _id?: string;
  _propertyOwner: string; // mongoose.Schema.Types.ObjectId
  title: string;
  description?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  address?: {
    street?: string;
    _city?: string; // mongoose.Schema.Types.ObjectId
    _state?: string; // mongoose.Schema.Types.ObjectId
    _country?: string; // mongoose.Schema.Types.ObjectId
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rentAmount?: {
    basePrice?: number; // per night
    weekendPrice?: number;
    peakSeasonPrice?: number;
    currency?: string;
  };
  maintenanceFee?: {
    amount: number;
    currency: string;
  };
  bedrooms?: {
    roomType: RoomType;
    bedType: BedType;
    attachedBathroom: boolean;
    walkInCloset: boolean;
    roomSizeInSqft?: number;
    hasBalcony: boolean;
  }[];
  bathrooms?: number;
  area?: {
    value: number; // in sqft only
  };
  _amenities?: string[]; // mongoose.Schema.Types.ObjectId[]
  images?: {
    key: string;
    url: string;
  }[];
  status: PropertyStatus;
  blockchainStatus: BlockchainStatus;
  _rules?: string[]; // mongoose.Schema.Types.ObjectId[]
  propertyValueEstimate?: {
    value: number;
    currency: string;
  }; // min $1.5M recommended
  yearOfBuilt?: number;
  yearOfRenovated?: number;
  _zoningClassification?: string; // mongoose.Schema.Types.ObjectId
  availableWeeksPerYear?: number; // min 20 recommended
  isFurnished?: boolean;
  furnishingDescription?: string;
  ownershipType?: OwnershipType;
  allowsFractionalizationOrEquity?: boolean;
  _propertyFeatures?: string[]; // mongoose.Schema.Types.ObjectId[]
  conciergeServicesIncluded?: string;
  videos?: {
    key: string;
    url: string;
  }[];
  videos360?: {
    key: string;
    url: string;
  }[];
  documents?: {
    propertyDeed?: { key: string; url: string; }[];
    zoningCertificate?: { key: string; url: string; }[];
    occupancyCertificate?: { key: string; url: string; }[];
    governmentIssuedId?: { key: string; url: string; }[];
    propertyTaxBill?: { key: string; url: string; }[];
    titleReportOrInsurance?: { key: string; url: string; }[];
    rentRoll?: { key: string; url: string; }[];
    incomeandExpenseStatement?: { key: string; url: string; }[];
    camAgreement?: { key: string; url: string; }[];
    propertyConditionAssessment?: { key: string; url: string; }[];
    proofOfInsurance?: { key: string; url: string; }[];
    utilityBill?: { key: string; url: string; }[];
    propertyAppraisal?: { key: string; url: string; }[];
    authorizationToTokenize?: { key: string; url: string; }[];
    conditional?: { key: string; url: string; }[];
    mortgageStatement?: { key: string; url: string; }[];
    hoaDocument?: { key: string; url: string; }[];
    granchiseAgreement?: { key: string; url: string; }[];
    businessLicense?: { key: string; url: string; }[];
    adaComplianceReport?: { key: string; url: string; }[];
    safetyReport?: { key: string; url: string; }[];
    appraisalReport?: { key: string; url: string; }[];
  };
  checkInCheckOutTimes?: {
    checkIn: string; // e.g., "3:00 PM"
    checkOut: string; // e.g., "11:00 AM"
  };
  localHighlights?: string; // 1-2 sentences
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}