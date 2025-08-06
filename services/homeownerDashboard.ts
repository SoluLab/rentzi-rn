import { UseQueryOptions } from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, queryKeys } from "./apiClient";
import type { DashboardStats } from "@/types/homeownerDashboard";
import type { IHomeownerProperty } from "@/types/homeownerProperty";

// Paginated property list response type
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

// 1. Get All Properties (with filters/pagination)
export const useHomeownerGetAllProperties = (
  params?: { page?: number; limit?: number; status?: string },
  options?: Omit<UseQueryOptions<PaginatedPropertyListResponse, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery<PaginatedPropertyListResponse>(
    [...queryKeys.homeownerProperties(), params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.GET_ALL_PROPERTIES,
      params,
      auth: true,
    },
    options
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
    options
  );
};
