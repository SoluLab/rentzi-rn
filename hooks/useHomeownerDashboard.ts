import { useState, useEffect, useCallback } from "react";
import { useHomeownerGetAllProperties, useHomeownerDashboardStats } from "@/services/homeownerDashboard";
import { PaginatedPropertyListResponse } from "@/types/homeownerProperty";
import { DashboardStats, DashboardStatsResponse } from "@/types/homeownerDashboard";

export const useHomeownerDashboard = (options?: {
  onStatsSuccess?: (data: DashboardStats) => void;
  onStatsError?: (error: any) => void;
  onPropertiesSuccess?: (data: PaginatedPropertyListResponse) => void;
  onPropertiesError?: (error: any) => void;
}) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [allProperties, setAllProperties] = useState<any[]>([]);

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
    { page, limit: 10, status: 'draft' },
    {
      onSuccess: (data) => {
        options?.onPropertiesSuccess?.(data);
      },
      onError: (error) => {
        options?.onPropertiesError?.(error);
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

  // Load more function
  const loadMore = useCallback(() => {
    if (propertiesData?.pagination?.hasNext && !isPropertiesLoading) {
      setPage((prev) => prev + 1);
    }
  }, [propertiesData, isPropertiesLoading]);

  // Reset properties and page on refresh
  const refreshProperties = useCallback(() => {
    setPage(1);
    setAllProperties([]);
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
  };
}; 