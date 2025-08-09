import { UseQueryOptions } from "@tanstack/react-query";
import { ENDPOINTS, getHomeownerAuthBaseURL } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, queryKeys } from "./apiClient";
import type { DashboardStats, DashboardStatsResponse } from "@/types/homeownerDashboard";
import type { IHomeownerProperty, PaginatedPropertyListResponse } from "@/types/homeownerProperty";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

// 1. Get All Properties (with filters/pagination)
export const useHomeownerGetAllProperties = (
  params?: { page?: number; limit?: number; status?: string },
  options?: Omit<UseQueryOptions<PaginatedPropertyListResponse, ApiError>, "queryKey" | "queryFn"> & {
    onSuccess?: (data: PaginatedPropertyListResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const baseURL = getHomeownerAuthBaseURL();
  return useApiQuery<PaginatedPropertyListResponse>(
    [...queryKeys.homeownerProperties(), params],
    {
      baseURL,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.GET_ALL_PROPERTIES,
      params,
      auth: true,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: true,
      onSuccess: (data: PaginatedPropertyListResponse) => {
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

// 2. Get Property by ID
export const useHomeownerGetPropertyById = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  const baseURL = getHomeownerAuthBaseURL();
  return useApiQuery(
    queryKeys.homeownerProperty(id),
    {
      baseURL,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.GET_PROPERTY_BY_ID(id.toString()),
      auth: true,
    },
    options
  );
};

// 3. Get Dashboard Stats
export const useHomeownerDashboardStats = (
  options?: Omit<UseQueryOptions<DashboardStatsResponse, ApiError>, "queryKey" | "queryFn"> & {
    onSuccess?: (data: DashboardStatsResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const baseURL = getHomeownerAuthBaseURL();
  return useApiQuery<DashboardStatsResponse>(
    queryKeys.homeownerDashboardStats(),
    {
      baseURL,
      endpoint: ENDPOINTS.HOMEOWNER_DASHBOARD.STATS,
      auth: true,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: true,
      onSuccess: (data: DashboardStatsResponse) => {
        if (data.success === true) {
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
