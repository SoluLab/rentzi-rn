export interface User {
  id: string;
  name: string;
  email: string;
  role: "renter" | "investor" | "homeowner";
  profileDetails: {
    avatar?: string;
    phone?: string;
    bio?: string;
  };
  investmentStatus: boolean;
  kycStatus: "incomplete" | "pending" | "complete";
  paymentMethods: PaymentMethod[];
  notificationPreferences: {
    bookings: boolean;
    investments: boolean;
    listings: boolean;
    marketing: boolean;
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  paymentStatus: "pending" | "confirmed" | "failed";
  bookingStatus: "upcoming" | "active" | "completed" | "cancelled";
  totalAmount: number;
  currency: string;
  paymentMethod: string;
}

export interface Investment {
  id: string;
  propertyId: string;
  userId: string;
  amount: number;
  currency: "USD" | "BTC" | "ETH";
  investmentDate: string;
  roiEstimate: number;
  investmentStatus: "active" | "completed" | "pending";
  shares: number;
  currentValue: number;
  payoutDetails?: {
    claimableAmount: number;
    lastClaimDate?: string;
    payoutStatus:
      | "eligible"
      | "pending_approval"
      | "claimed"
      | "insufficient_yield";
  };
  claimHistory?: {
    date: string;
    amount: number;
    txHash: string;
    status: "Pending" | "Completed";
    totalPassiveIncome?: number;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: "booking" | "investment" | "listing" | "system";
  title: string;
  message: string;
  readStatus: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "crypto" | "bank";
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
  transactionStatus: "pending" | "completed" | "failed";
  timestamp: string;
}

// Export all types
export * from "./auth";
export * from "./homeownerProperty";
export * from "./renterMarketplace";
export * from "./homeownerProfile";
export * from "./renterInvestorProfile";
export * from "./kyc";