import { useQuery } from '@tanstack/react-query';
import { fetchMarketplaceProperties, MarketplacePropertiesResponse } from '@/services/propertyApi';

export interface UseMarketplacePropertiesOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useMarketplaceProperties = (options: UseMarketplacePropertiesOptions = {}) => {
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery<MarketplacePropertiesResponse>({
    queryKey: ['marketplace-properties', page, limit],
    queryFn: () => fetchMarketplaceProperties(page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 