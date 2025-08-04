import { UseQueryOptions } from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, queryKeys } from "./apiClient";

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
