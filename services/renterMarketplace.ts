import { UseQueryOptions } from "@tanstack/react-query";
import { ENDPOINTS, getRenterAuthBaseURL } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, queryKeys } from "./apiClient";
import type { MarketplacePropertiesResponse } from "@/types/renterMarketplace";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

// Get All Marketplace Properties (with filters/pagination)
export interface MarketplaceFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

export const useRenterMarketplaceGetProperties = (
  params?: { 
    page?: number; 
    limit?: number; 
    type?: 'residential' | 'commercial'; 
    search?: string;
    filters?: MarketplaceFilters;
  },
  options?: Omit<UseQueryOptions<MarketplacePropertiesResponse, ApiError>, "queryKey" | "queryFn"> & {
    onSuccess?: (data: MarketplacePropertiesResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const baseURL = getRenterAuthBaseURL();
  // Filter out empty search parameter and flatten filters
  const cleanParams: Record<string, any> = params ? {
    page: params.page,
    limit: params.limit,
    type: params.type,
    ...(params.search && params.search.trim() ? { search: params.search.trim() } : {}),
    // Flatten filter object into individual query params
    ...(params.filters?.minPrice ? { minPrice: params.filters.minPrice } : {}),
    ...(params.filters?.maxPrice ? { maxPrice: params.filters.maxPrice } : {}),
    ...(params.filters?.bedrooms ? { bedrooms: params.filters.bedrooms } : {}),
    ...(params.filters?.bathrooms ? { bathrooms: params.filters.bathrooms } : {}),
    ...(params.filters?.amenities && params.filters.amenities.length > 0 ? { amenities: params.filters.amenities } : {}),
  } : {};

  return useApiQuery<MarketplacePropertiesResponse>(
    ["marketplace", "properties", cleanParams.page || 1, cleanParams.limit || 10, cleanParams.type || 'residential', cleanParams.search || '', JSON.stringify(cleanParams)],
    {
      baseURL,
      endpoint: ENDPOINTS.MARKETPLACE.GET_ALL_PROPERTIES,
      params: cleanParams,
      auth: true,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Allow initial mount fetch
      refetchOnReconnect: false,
      enabled: true,
      retry: false, // Disable retries to prevent duplicate calls
      retryDelay: 1000,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      onSuccess: (data: MarketplacePropertiesResponse) => {
        if (data?.success === true) {
          options?.onSuccess?.(data);
        } else {
          const errorMessage = data?.message || TOAST_MESSAGES.AUTH.GENERAL.UNEXPECTED_ERROR;
          toast.error(errorMessage);
          options?.onError?.({ message: errorMessage } as ApiError);
        }
      },
      onError: (error: ApiError) => {
        const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.AUTH.GENERAL.UNEXPECTED_ERROR;
        toast.error(errorMessage);
        options?.onError?.(error);
      },
      ...options,
    }
  );
};
