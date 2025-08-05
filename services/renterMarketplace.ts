import {
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "@/types/auth";
import type {
  MarketplacePropertyResponse,
  IMarketplaceProperty,
} from "@/types/renterMarketplace";
import { apiPut, apiDelete, useApiQuery, useApiMutation } from "./apiClient";

// 1. Get all properties (with filters/pagination)
export const useMarketplaceGetProperties = (
  params?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<MarketplacePropertyResponse, ApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useApiQuery(
    ["marketplace", "properties", params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.MARKETPLACE.GET_ALL_PROPERTIES,
      params,
      auth: true,
    },
    options
  );
};

// 2. Get property by ID
export const useMarketplaceGetProperty = (
  id: string | number,
  options?: Omit<
    UseQueryOptions<MarketplacePropertyResponse, ApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useApiQuery(
    ["marketplace", "property", id],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.MARKETPLACE.GET_PROPERTY_BY_ID(id.toString()),
      auth: true,
    },
    options
  );
};

// 3. Create property
export const useMarketplaceCreateProperty = (
  options?: Omit<
    UseMutationOptions<
      MarketplacePropertyResponse,
      ApiError,
      IMarketplaceProperty
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.MARKETPLACE.CREATE_PROPERTY,
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["marketplace", "properties"],
        });
      },
      ...options,
    }
  );
};

// 4. Update property
export const useMarketplaceUpdateProperty = (
  options?: Omit<
    UseMutationOptions<
      MarketplacePropertyResponse,
      ApiError,
      { id: string | number; data: Partial<IMarketplaceProperty> }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    MarketplacePropertyResponse,
    ApiError,
    { id: string | number; data: Partial<IMarketplaceProperty> }
  >({
    mutationFn: ({ id, data }) =>
      apiPut({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.MARKETPLACE.UPDATE_PROPERTY(id.toString()),
        data,
        auth: true,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "properties"],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "property", id],
      });
    },
    ...options,
  });
};

// 5. Delete property
export const useMarketplaceDeleteProperty = (
  options?: Omit<
    UseMutationOptions<MarketplacePropertyResponse, ApiError, string | number>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<MarketplacePropertyResponse, ApiError, string | number>({
    mutationFn: (id) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.MARKETPLACE.DELETE_PROPERTY(id.toString()),
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "properties"],
      });
    },
    ...options,
  });
};
