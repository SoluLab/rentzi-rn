export interface MarketplacePropertiesResponse {
  success: boolean;
  message: string;
  data: {
    items: MarketplaceProperty[];
    pagination: MarketplacePagination;
  } | null;
}

export interface MarketplaceProperty {
  _id: string;
  title: string;
  description: string;
  type: 'residential' | 'commercial';
  propertyCategory: string;
  address: {
    street: string;
    area: string;
    city: {
      _id: string;
      name: string;
    };
    state: {
      _id: string;
      name: string;
    };
    country: {
      _id: string;
      name: string;
    };
    zipCode: string;
  };
  rentAmount: {
    basePrice: number;
    currency: string;
    securityDeposit: number;
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    unit: string;
    furnishing: string;
  };
  media: {
    images: Array<{
      url: string;
      key: string;
    }>;
  };
  amenities: Amenity[];
  availability: {
    status: string;
    availableFrom: string;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  _id: string;
  name: string;
  icon: string;
}

export interface MarketplacePagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}