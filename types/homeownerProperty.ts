export interface HomeownerPropertyResponse {
  success: boolean;
  message: string;
  data: {
    property: IHomeownerProperty;
  } | null;
}

export interface IHomeownerProperty {
  _id: string;
  _propertyOwner: {
    name: {
      firstName: string;
      lastName: string;
      fullName: string;
    };
    _id: string;
    email: string;
  };
  title: string;
  description: string;
  type: string;
  category: string;
  address: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    street: string;
    zipCode: string;
  };
  rentAmount: {
    currency: string;
  };
  maintenanceFee: {
    currency: string;
  };
  area: {
    value: number;
  };
  propertyValueEstimate: {
    currency: string;
  };
  documents: {
    propertyDeed: any[];
    zoningCertificate: any[];
    occupancyCertificate: any[];
    governmentIssuedId: any[];
    propertyTaxBill: any[];
    titleReportOrInsurance: any[];
    rentRoll: any[];
    incomeandExpenseStatement: any[];
    camAgreement: any[];
    propertyConditionAssessment: any[];
    proofOfInsurance: any[];
    utilityBill: any[];
    propertyAppraisal: any[];
    authorizationToTokenize: any[];
    conditional: any[];
    mortgageStatement: any[];
    hoaDocument: any[];
    granchiseAgreement: any[];
    businessLicense: any[];
    adaComplianceReport: any[];
    safetyReport: any[];
    appraisalReport: any[];
  };
  bedrooms: Array<{
    roomType: string;
    bedType: string;
    attachedBathroom: boolean;
    walkInCloset: boolean;
    roomSizeInSqft: number;
    hasBalcony: boolean;
    _id: string;
  }>;
  bathrooms: number;
  _amenities: any[];
  status: string;
  blockchainStatus: string;
  _rules: any[];
  yearOfBuilt: number;
  _propertyFeatures: any[];
  images: any[];
  videos: any[];
  videos360: any[];
  createdAt: string;
  updatedAt: string;
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

export type AccessType = "Keycard" | "QR Scan" | "Manual Entry";

// Paginated property list response type (for homeownerDashboard)
export interface PaginatedPropertyListResponse {
  success: boolean;
  message: string;
  data: IHomeownerProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
