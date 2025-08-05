export interface HomeownerPropertyResponse {
  success: boolean;
  message: string;
  data: {
    property: IHomeownerProperty;
  } | null;
}

export interface IHomeownerProperty {
  _id?: string;
  _propertyOwner: string;
  title: string;
  description?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  address?: {
    street?: string;
    _city?: string;
    _state?: string;
    _country?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rentAmount?: {
    basePrice?: number;
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
    value: number;
  };
  _amenities?: string[];
  images?: {
    key: string;
    url: string;
  }[];
  status: PropertyStatus;
  blockchainStatus: BlockchainStatus;
  _rules?: string[];
  propertyValueEstimate?: {
    value: number;
    currency: string;
  };
  yearOfBuilt?: number;
  yearOfRenovated?: number;
  _zoningClassification?: string;
  availableWeeksPerYear?: number;
  isFurnished?: boolean;
  furnishingDescription?: string;
  ownershipType?: OwnershipType;
  allowsFractionalizationOrEquity?: boolean;
  _propertyFeatures?: string[];
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
    propertyDeed?: { key: string; url: string }[];
    zoningCertificate?: { key: string; url: string }[];
    occupancyCertificate?: { key: string; url: string }[];
    governmentIssuedId?: { key: string; url: string }[];
    propertyTaxBill?: { key: string; url: string }[];
    titleReportOrInsurance?: { key: string; url: string }[];
    rentRoll?: { key: string; url: string }[];
    incomeandExpenseStatement?: { key: string; url: string }[];
    camAgreement?: { key: string; url: string }[];
    propertyConditionAssessment?: { key: string; url: string }[];
    proofOfInsurance?: { key: string; url: string }[];
    utilityBill?: { key: string; url: string }[];
    propertyAppraisal?: { key: string; url: string }[];
    authorizationToTokenize?: { key: string; url: string }[];
    conditional?: { key: string; url: string }[];
    mortgageStatement?: { key: string; url: string }[];
    hoaDocument?: { key: string; url: string }[];
    granchiseAgreement?: { key: string; url: string }[];
    businessLicense?: { key: string; url: string }[];
    adaComplianceReport?: { key: string; url: string }[];
    safetyReport?: { key: string; url: string }[];
    appraisalReport?: { key: string; url: string }[];
  };
  checkInCheckOutTimes?: {
    checkIn: string;
    checkOut: string;
  };
  localHighlights?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType =
  | "villa"
  | "penthouse"
  | "mansion"
  | "estate"
  | "yacht"
  | "apartment"
  | "farmhouse"
  | "cabin"
  | "treehouse"
  | "loft"
  | "office"
  | "retail"
  | "warehouse"
  | "commercial";

export type PropertyCategory = "residential" | "commercial";

export type PropertyStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";

export type BlockchainStatus =
  | "not_tokenized"
  | "tokenized"
  | "tokenizing"
  | "failed";

export type RoomType = "master" | "guest" | "kids" | "study" | "other";
export type BedType = "single" | "double" | "queen" | "king" | "twin" | "bunk";
export type OwnershipType =
  | "freehold"
  | "leasehold"
  | "cooperative"
  | "condominium";
