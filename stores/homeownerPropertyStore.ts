import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCommercialPropertyStore } from './commercialPropertyStore';
import { useResidentialPropertyStore } from './residentialPropertyStore';

// Property interface for homeowner
export interface HomeownerProperty {
  id: string;
  type: 'residential' | 'commercial';
  title: string;
  location: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  image: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFootage?: string;
  createdAt: Date;
  rejectionReason?: string;
  monthlyEarnings?: number;
  occupancyRate?: number;
  bookings?: number;
  data?: any; // Store the actual property form data
}

// Dashboard metrics interface
export interface HomeownerDashboardMetrics {
  totalProperties: number;
  pendingApprovals: number;
  totalEarnings: number;
  activeBookings: number;
}

// Store interface
interface HomeownerPropertyStore {
  // Data
  properties: HomeownerProperty[];
  dashboardMetrics: HomeownerDashboardMetrics;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProperties: () => Promise<void>;
  fetchDashboardMetrics: () => Promise<void>;
  addProperty: (property: Omit<HomeownerProperty, 'id' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<HomeownerProperty>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  updatePropertyStatus: (id: string, status: HomeownerProperty['status'], rejectionReason?: string) => Promise<void>;
  resetStore: () => void;
  
  // Integration with property flows
  syncFromCommercialStore: () => Promise<void>;
  syncFromResidentialStore: () => Promise<void>;
  
  // Computed properties
  getPropertiesByStatus: (status: HomeownerProperty['status']) => HomeownerProperty[];
  getPropertyById: (id: string) => HomeownerProperty | undefined;
  getRecentProperties: (limit?: number) => HomeownerProperty[];
}

// Initial dummy data for homeowner
const initialHomeownerProperties: HomeownerProperty[] = [
  // Approved Properties
  {
    id: 'approved-1',
    type: 'residential',
    title: 'Luxury Oceanfront Villa',
    location: 'Malibu, California',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
    price: '2500000',
    bedrooms: '5',
    bathrooms: '4',
    squareFootage: '4500',
    createdAt: new Date('2024-01-15'),
    monthlyEarnings: 15000,
    occupancyRate: 85,
    bookings: 5,
  },
  {
    id: 'approved-2',
    type: 'commercial',
    title: 'Downtown Office Tower',
    location: 'Manhattan, New York',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '8500000',
    squareFootage: '25000',
    createdAt: new Date('2024-01-20'),
    monthlyEarnings: 45000,
    occupancyRate: 92,
    bookings: 12,
  },
  {
    id: 'approved-3',
    type: 'residential',
    title: 'Swiss Alpine Chalet',
    location: 'Zermatt, Switzerland',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&quality=40',
    price: '3200000',
    bedrooms: '6',
    bathrooms: '5',
    squareFootage: '3800',
    createdAt: new Date('2024-01-25'),
    monthlyEarnings: 22000,
    occupancyRate: 92,
    bookings: 3,
  },
  {
    id: 'approved-4',
    type: 'residential',
    title: 'Modern Downtown Penthouse',
    location: 'Miami, Florida',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=400&h=300&fit=crop&quality=40',
    price: '1800000',
    bedrooms: '3',
    bathrooms: '3',
    squareFootage: '2800',
    createdAt: new Date('2024-02-01'),
    monthlyEarnings: 12000,
    occupancyRate: 78,
    bookings: 8,
  },
  {
    id: 'approved-5',
    type: 'commercial',
    title: 'Tech Startup Hub',
    location: 'San Francisco, California',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '4200000',
    squareFootage: '15000',
    createdAt: new Date('2024-02-05'),
    monthlyEarnings: 28000,
    occupancyRate: 95,
    bookings: 15,
  },
  {
    id: 'approved-6',
    type: 'residential',
    title: 'Beachfront Condo Complex',
    location: 'Honolulu, Hawaii',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
    price: '2100000',
    bedrooms: '4',
    bathrooms: '3',
    squareFootage: '3200',
    createdAt: new Date('2024-02-10'),
    monthlyEarnings: 18000,
    occupancyRate: 88,
    bookings: 6,
  },
  {
    id: 'approved-7',
    type: 'residential',
    title: 'Manhattan Penthouse Suite',
    location: 'New York, USA',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '3500000',
    bedrooms: '3',
    bathrooms: '3',
    squareFootage: '3000',
    createdAt: new Date('2024-02-15'),
    monthlyEarnings: 25000,
    occupancyRate: 90,
    bookings: 4,
  },
  {
    id: 'approved-8',
    type: 'commercial',
    title: 'Luxury Retail Plaza',
    location: 'Beverly Hills, California',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '12000000',
    squareFootage: '35000',
    createdAt: new Date('2024-02-20'),
    monthlyEarnings: 75000,
    occupancyRate: 96,
    bookings: 20,
  },

  // Pending Properties
  {
    id: 'pending-1',
    type: 'residential',
    title: 'Santorini Cliffside Villa',
    location: 'Santorini, Greece',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=400&h=300&fit=crop&quality=40',
    price: '1900000',
    bedrooms: '3',
    bathrooms: '2',
    squareFootage: '2400',
    createdAt: new Date('2024-02-25'),
    monthlyEarnings: 0,
    occupancyRate: 0,
    bookings: 0,
  },
  {
    id: 'pending-2',
    type: 'commercial',
    title: 'Dubai Marina Office Space',
    location: 'Dubai, UAE',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '6800000',
    squareFootage: '18000',
    createdAt: new Date('2024-03-01'),
    monthlyEarnings: 0,
    occupancyRate: 0,
    bookings: 0,
  },
  {
    id: 'pending-3',
    type: 'residential',
    title: 'Alpine Ski Lodge',
    location: 'Aspen, Colorado',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&quality=40',
    price: '2800000',
    bedrooms: '5',
    bathrooms: '4',
    squareFootage: '4200',
    createdAt: new Date('2024-03-05'),
    monthlyEarnings: 0,
    occupancyRate: 0,
    bookings: 0,
  },

  // Rejected Properties
  {
    id: 'rejected-1',
    type: 'residential',
    title: 'Historic Downtown Loft',
    location: 'Boston, Massachusetts',
    status: 'rejected',
    image: 'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=400&h=300&fit=crop&quality=40',
    price: '1600000',
    bedrooms: '2',
    bathrooms: '2',
    squareFootage: '1800',
    createdAt: new Date('2024-03-10'),
    rejectionReason: 'Incomplete documentation and missing safety certificates',
    monthlyEarnings: 0,
    occupancyRate: 0,
    bookings: 0,
  },
  {
    id: 'rejected-2',
    type: 'commercial',
    title: 'Industrial Warehouse Complex',
    location: 'Houston, Texas',
    status: 'rejected',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: '3500000',
    squareFootage: '45000',
    createdAt: new Date('2024-03-15'),
    rejectionReason: 'Property does not meet luxury standards and zoning requirements',
    monthlyEarnings: 0,
    occupancyRate: 0,
    bookings: 0,
  },
];

const initialHomeownerDashboardMetrics: HomeownerDashboardMetrics = {
  totalProperties: 12,
  pendingApprovals: 3,
  totalEarnings: 125000,
  activeBookings: 8,
};

export const useHomeownerPropertyStore = create<HomeownerPropertyStore>()(
  persist(
    (set, get) => ({
      properties: initialHomeownerProperties,
      dashboardMetrics: initialHomeownerDashboardMetrics,
      isLoading: false,
      error: null,

      // Simulate API call to fetch properties
      fetchProperties: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Ensure all createdAt values are Date objects
          const currentState = get();
          const migratedProperties = currentState.properties.map(property => ({
            ...property,
            createdAt: property.createdAt instanceof Date ? property.createdAt : new Date(property.createdAt || Date.now())
          }));
          
          set({ 
            properties: migratedProperties,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to fetch properties' });
        }
      },

      // Simulate API call to fetch dashboard metrics
      fetchDashboardMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const { properties } = get();
          
          const approvedProperties = properties.filter(p => p.status === 'approved');
          const pendingProperties = properties.filter(p => p.status === 'pending');
          const totalEarnings = approvedProperties.reduce((sum, p) => sum + (p.monthlyEarnings || 0), 0);
          const activeBookings = approvedProperties.reduce((sum, p) => sum + (p.bookings || 0), 0);

          set({
            dashboardMetrics: {
              totalProperties: properties.length,
              pendingApprovals: pendingProperties.length,
              totalEarnings,
              activeBookings,
            },
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to fetch dashboard metrics' });
        }
      },

      // Add new property
      addProperty: async (propertyData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const newProperty: HomeownerProperty = {
            ...propertyData,
            id: `homeowner-property-${Date.now()}`,
            createdAt: new Date(),
          };

          set(state => ({
            properties: [...state.properties, newProperty],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: 'Failed to add property' });
        }
      },

      // Update property
      updateProperty: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            properties: state.properties.map(property =>
              property.id === id ? { ...property, ...updates } : property
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update property' });
        }
      },

      // Delete property
      deleteProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            properties: state.properties.filter(property => property.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: 'Failed to delete property' });
        }
      },

      // Update property status
      updatePropertyStatus: async (id, status, rejectionReason) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 700));
          
          set(state => ({
            properties: state.properties.map(property =>
              property.id === id 
                ? { 
                    ...property, 
                    status, 
                    ...(rejectionReason && { rejectionReason }),
                    ...(status === 'approved' && {
                      monthlyEarnings: Math.floor(Math.random() * 30000) + 10000,
                      occupancyRate: Math.floor(Math.random() * 20) + 80,
                      bookings: Math.floor(Math.random() * 10) + 1,
                    }),
                    ...(status === 'rejected' && {
                      monthlyEarnings: 0,
                      occupancyRate: 0,
                      bookings: 0,
                    })
                  }
                : property
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update property status' });
        }
      },

      // Sync from commercial property store
      syncFromCommercialStore: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const commercialStore = useCommercialPropertyStore.getState();
          const commercialData = commercialStore.data;
          
          if (commercialData.isSubmitted && commercialData.submittedAt) {
            // Check if property already exists
            const existingProperty = get().properties.find(p => 
              p.data?.type === 'commercial' && 
              p.data?.propertyDetails?.propertyTitle === commercialData.propertyDetails.propertyTitle
            );
            
            if (!existingProperty) {
              const newProperty: HomeownerProperty = {
                id: `commercial-${Date.now()}`,
                type: 'commercial',
                title: commercialData.propertyDetails.propertyTitle,
                location: commercialData.propertyDetails.fullAddress,
                status: 'pending',
                image: commercialData.mediaUploads.photos.length > 0 
                  ? commercialData.mediaUploads.photos[0].uri 
                  : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
                price: commercialData.financialDetails.estimatedPropertyValue,
                squareFootage: commercialData.propertyDetails.squareFootage,
                createdAt: commercialData.submittedAt instanceof Date ? commercialData.submittedAt : new Date(commercialData.submittedAt || Date.now()),
                monthlyEarnings: 0,
                occupancyRate: 0,
                bookings: 0,
                data: commercialData,
              };

              set(state => {
                // Migrate existing properties to ensure createdAt is Date
                const migratedProperties = state.properties.map(property => ({
                  ...property,
                  createdAt: property.createdAt instanceof Date ? property.createdAt : new Date(property.createdAt || Date.now())
                }));
                
                return {
                  properties: [...migratedProperties, newProperty],
                  isLoading: false,
                };
              });
            }
          }
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to sync commercial property' });
        }
      },

      // Sync from residential property store
      syncFromResidentialStore: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const residentialStore = useResidentialPropertyStore.getState();
          const residentialData = residentialStore.data;
          
          if (residentialData.isSubmitted && residentialData.submittedAt) {
            // Check if property already exists
            const existingProperty = get().properties.find(p => 
              p.data?.type === 'residential' && 
              p.data?.propertyDetails?.propertyTitle === residentialData.propertyDetails.propertyTitle
            );
            
            if (!existingProperty) {
              const newProperty: HomeownerProperty = {
                id: `residential-${Date.now()}`,
                type: 'residential',
                title: residentialData.propertyDetails.propertyTitle,
                location: residentialData.propertyDetails.fullAddress,
                status: 'pending',
                image: residentialData.mediaUpload.photos.length > 0 
                  ? residentialData.mediaUpload.photos[0].uri 
                  : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
                price: '0', // Will be set during pricing step
                bedrooms: residentialData.propertyDetails.bedrooms,
                bathrooms: residentialData.propertyDetails.bathrooms,
                squareFootage: residentialData.propertyDetails.squareFootage,
                createdAt: residentialData.submittedAt instanceof Date ? residentialData.submittedAt : new Date(residentialData.submittedAt || Date.now()),
                monthlyEarnings: 0,
                occupancyRate: 0,
                bookings: 0,
                data: residentialData,
              };

              set(state => {
                // Migrate existing properties to ensure createdAt is Date
                const migratedProperties = state.properties.map(property => ({
                  ...property,
                  createdAt: property.createdAt instanceof Date ? property.createdAt : new Date(property.createdAt || Date.now())
                }));
                
                return {
                  properties: [...migratedProperties, newProperty],
                  isLoading: false,
                };
              });
            }
          }
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to sync residential property' });
        }
      },

      // Reset store
      resetStore: () => {
        set({
          properties: initialHomeownerProperties,
          dashboardMetrics: initialHomeownerDashboardMetrics,
          isLoading: false,
          error: null,
        });
      },

      // Computed properties
      getPropertiesByStatus: (status) => {
        return get().properties.filter(property => property.status === status);
      },

      getPropertyById: (id) => {
        return get().properties.find(property => property.id === id);
      },

      getRecentProperties: (limit = 4) => {
        return get().properties
          .filter(property => property.status === 'approved')
          .sort((a, b) => {
            // Ensure createdAt is a Date object
            const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
            const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
            return bDate.getTime() - aDate.getTime();
          })
          .slice(0, limit);
      },
    }),
    {
      name: 'homeowner-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 