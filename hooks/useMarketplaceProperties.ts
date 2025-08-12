import { useState, useEffect, useCallback, useMemo } from "react";
import { useRenterMarketplaceGetProperties, MarketplaceFilters } from "@/services/renterMarketplace";
import { MarketplacePropertiesResponse, MarketplaceProperty } from "@/types/renterMarketplace";

export const useMarketplaceProperties = (options?: {
  onSuccess?: (data: MarketplacePropertiesResponse) => void;
  onError?: (error: any) => void;
}) => {
  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [type, setType] = useState<'residential' | 'commercial'>('residential');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [allProperties, setAllProperties] = useState<MarketplaceProperty[]>([]);

  console.log("[useMarketplaceProperties] Hook render - page:", page, "type:", type, "search:", searchQuery, "filters:", filters, "properties count:", allProperties.length);

  // Only include search if it has a value
  const queryParams = {
    page,
    limit: 10,
    type,
    ...(searchQuery && searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    filters
  };

  // Properties
  console.log("[useMarketplaceProperties] Query params:", queryParams);
  
  // Memoize the options to prevent unnecessary re-renders
  const queryOptions = useMemo(() => ({
    onSuccess: (data: MarketplacePropertiesResponse) => {
      console.log("[useMarketplaceProperties] API Success");
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.log("[useMarketplaceProperties] API Error:", error);
      options?.onError?.(error);
    },
  }), [options]);

  const {
    data: propertiesData,
    isLoading: isPropertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useRenterMarketplaceGetProperties(
    queryParams,
    queryOptions
  );

  // Append or reset properties on data/page change
  useEffect(() => {
    if (propertiesData?.data && propertiesData.data.items) {
      if (page === 1) {
        setAllProperties(propertiesData.data.items);
      } else {
        setAllProperties((prev) => [...prev, ...(propertiesData.data?.items || [])]);
      }
    }
  }, [propertiesData, page]);

  // Reset properties when type, search, or filters change
  useEffect(() => {
    setPage(1);
    setAllProperties([]);
  }, [type, searchQuery, filters]);

  // Load more function
  const loadMore = useCallback(() => {
    if (propertiesData?.data?.pagination?.currentPage && 
        propertiesData.data.pagination.currentPage < propertiesData.data.pagination.totalPages && 
        !isPropertiesLoading) {
      setPage((prev) => prev + 1);
    }
  }, [propertiesData, isPropertiesLoading]);

  // Reset properties and page on refresh
  const refreshProperties = useCallback(async () => {
    console.log("[useMarketplaceProperties] Refresh triggered");
    setPage(1);
    setAllProperties([]);
    try {
      const result = await refetchProperties();
      console.log("[useMarketplaceProperties] Refresh completed successfully");
      return result;
    } catch (error) {
      console.log("[useMarketplaceProperties] Refresh failed:", error);
      throw error;
    }
  }, [refetchProperties]);

  // Change property type (residential/commercial)
  const changeType = useCallback((newType: 'residential' | 'commercial') => {
    setType(newType);
    setPage(1);
    setAllProperties([]);
  }, []);

  // Search function
  const searchProperties = useCallback((query: string) => {
    console.log("[useMarketplaceProperties] Search triggered:", query);
    setSearchQuery(query);
    setPage(1);
    setAllProperties([]);
  }, []);

  // Filter functions
  const applyFilters = useCallback((newFilters: MarketplaceFilters) => {
    console.log("[useMarketplaceProperties] Filters applied:", newFilters);
    setFilters(newFilters);
    setPage(1);
    setAllProperties([]);
  }, []);

  const clearFilters = useCallback(() => {
    console.log("[useMarketplaceProperties] Filters cleared");
    setFilters({});
    setPage(1);
    setAllProperties([]);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.minPrice ||
      filters.maxPrice ||
      filters.bedrooms ||
      filters.bathrooms ||
      (filters.amenities && filters.amenities.length > 0)
    );
  }, [filters]);

  return {
    properties: allProperties,
    isPropertiesLoading,
    propertiesError,
    refetchProperties: refreshProperties,
    pagination: propertiesData?.data?.pagination,
    loadMore,
    changeType,
    searchProperties,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    currentType: type,
    searchQuery,
    filters,
    setPage,
    page,
  };
};
