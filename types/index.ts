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