import { useState, useEffect, useCallback } from "react";
import { useHomeownerGetAllProperties, useHomeownerDashboardStats } from "@/services/homeownerDashboard";
import { PaginatedPropertyListResponse } from "@/types/homeownerProperty";
import { DashboardStats, DashboardStatsResponse } from "@/types/homeownerDashboard";

export const useHomeownerDashboard = (options?: {
  onStatsSuccess?: (data: DashboardStats) => void;
  onStatsError?: (error: any) => void;
  onPropertiesSuccess?: (data: PaginatedPropertyListResponse) => void;
  onPropertiesError?: (error: any) => void;
  status?: string | null;
}) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Dashboard stats
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useHomeownerDashboardStats({
    onSuccess: (data) => {
      options?.onStatsSuccess?.(data.data);
    },
    onError: (error) => {
      options?.onStatsError?.(error);
    },
  });

  // Properties
  const {
    data: propertiesData,
    isLoading: isPropertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useHomeownerGetAllProperties(
    { 
      page, 
      limit: 10, 
      ...(options?.status && { status: options.status })
    },
    {
      onSuccess: (data) => {
        options?.onPropertiesSuccess?.(data);
        setIsLoadingMore(false);
      },
      onError: (error) => {
        options?.onPropertiesError?.(error);
        setIsLoadingMore(false);
      },
    }
  );

  // Append or reset properties on data/page change
  useEffect(() => {
    if (propertiesData?.data) {
      if (page === 1) {
        setAllProperties(propertiesData.data);
      } else {
        setAllProperties((prev) => [...prev, ...propertiesData.data]);
      }
    }
  }, [propertiesData, page]);

  // Load more function - automatically called when user scrolls
  const loadMore = useCallback(() => {
    if (propertiesData?.pagination?.hasNext && !isPropertiesLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [propertiesData, isPropertiesLoading, isLoadingMore]);

  // Reset properties and page on refresh
  const refreshProperties = useCallback(() => {
    setPage(1);
    setAllProperties([]);
    setIsLoadingMore(false);
    refetchProperties();
  }, [refetchProperties]);

  return {
    dashboardStats: statsData?.data,
    isStatsLoading,
    statsError,
    refetchStats,
    properties: allProperties,
    isPropertiesLoading,
    propertiesError,
    refetchProperties: refreshProperties,
    pagination: propertiesData?.pagination,
    loadMore,
    setPage,
    page,
    isLoadingMore,
    hasMore: propertiesData?.pagination?.hasNext || false,
    totalProperties: propertiesData?.pagination?.total || 0,
    currentPage: page,
  };
}; 