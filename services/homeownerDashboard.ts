import { UseQueryOptions } from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, queryKeys } from "./apiClient";
import type { DashboardStats } from "@/types/homeownerDashboard";

// 1. Get All Properties (with filters/pagination)
export const useHomeownerGetAllProperties = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    [...queryKeys.homeownerProperties(), params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.GET_ALL_PROPERTIES,
      params,
      auth: true,
    },
    {
      // Default options for better refetching
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      ...options,
    }
  );
};

// 2. Get Property by ID
export const useHomeownerGetPropertyById = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    queryKeys.homeownerProperty(id),
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.GET_PROPERTY_BY_ID(id.toString()),
      auth: true,
    },
    options
  );
};

// 3. Get Dashboard Stats
export const useHomeownerDashboardStats = (
  options?: Omit<UseQueryOptions<{ data: DashboardStats }, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    queryKeys.homeownerDashboardStats(),
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.STATS,
      auth: true,
    },
    {
      // Default options for better refetching
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      ...options,
    }
  );
};
