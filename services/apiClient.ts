import axios, {
  AxiosRequestConfig,
  Method,
  AxiosResponse,
  AxiosError,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useQuery,
  useMutation, 
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
 
// Define supported methods as a union type
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
interface ApiCallOptions {
  method: HttpMethod;
  baseURL: string;
  endpoint: string;
  data?: Record<string, any>;
  params?: Record<string, any>;
  auth?: boolean;
  customHeaders?: Record<string, string>;
  timeout?: number;
}

// Define shape of error thrown
export interface ApiError {
  status: number | null;
  message: string;
  originalError: AxiosError | Error;
  data?: any;
}

// Response wrapper for better type safety
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Query key factory for better cache management
export const queryKeys = {
  all: ["api"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...queryKeys.details(), id] as const,
  auth: () => [...queryKeys.all, "auth"] as const,
  user: () => [...queryKeys.all, "user"] as const,
  parcels: () => [...queryKeys.all, "parcels"] as const,
  parcel: (id: string | number) => [...queryKeys.parcels(), id] as const,
  leads: () => [...queryKeys.all, "leads"] as const,
  lead: (id: string | number) => [...queryKeys.leads(), id] as const,
  campaigns: () => [...queryKeys.all, "campaigns"] as const,
  campaign: (id: string | number) => [...queryKeys.campaigns(), id] as const,
  offers: () => [...queryKeys.all, "offers"] as const,
  offer: (id: string | number) => [...queryKeys.offers(), id] as const,
  transactions: () => [...queryKeys.all, "transactions"] as const,
  transaction: (id: string | number) =>
    [...queryKeys.transactions(), id] as const,
  chat: () => [...queryKeys.all, "chat"] as const,
  chatMessages: (chatId: string) =>
    [...queryKeys.chat(), chatId, "messages"] as const,
  notifications: () => [...queryKeys.all, "notifications"] as const,
  balance: () => [...queryKeys.all, "balance"] as const,
  tokens: () => [...queryKeys.all, "tokens"] as const,
  mailerOptions: () => [...queryKeys.all, "mailerOptions"] as const,
  profile: () => [...queryKeys.all, "profile"] as const,

  // Homeowner Property Query Keys
  homeownerProperties: () =>
    [...queryKeys.all, "homeowner", "properties"] as const,
  homeownerProperty: (id: string | number) =>
    [...queryKeys.homeownerProperties(), id] as const,
  homeownerPropertyImages: (propertyId: string | number) =>
    [...queryKeys.homeownerProperty(propertyId), "images"] as const,
  homeownerPropertyFiles: (propertyId: string | number) =>
    [...queryKeys.homeownerProperty(propertyId), "files"] as const,
    
  // Homeowner Dashboard Query Keys
  homeownerDashboard: () => [...queryKeys.all, "homeowner", "dashboard"] as const,
  homeownerDashboardMetrics: () => [...queryKeys.homeownerDashboard(), "metrics"] as const,
  homeownerDashboardEarnings: () => [...queryKeys.homeownerDashboard(), "earnings"] as const,
  homeownerDashboardBookings: () => [...queryKeys.homeownerDashboard(), "bookings"] as const,
};

// Main API call function
const apiCall = async <T = any>({
  method,
  baseURL,
  endpoint,
  data = {},
  params = {},
  auth = false,
  customHeaders = {},
  timeout = 10000,
}: ApiCallOptions): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (auth) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("Authentication token not found");
      }
    }

    const axiosConfig: AxiosRequestConfig = {
      method: method as Method,
      baseURL,
      url: endpoint,
      headers,
      params,
      data: ["post", "put", "patch"].includes(method) ? data : undefined,
      timeout,
    };

    console.log("[API Call] Config:", {
      method: axiosConfig.method,
      url: `${baseURL}${endpoint}`,
      headers: headers,
      data: axiosConfig.data,
    });

    const response: AxiosResponse<T> = await axios(axiosConfig);

    return response.data;
  } catch (error: any) {
    // Handle Axios errors specifically
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? null;
      const responseData = axiosError.response?.data as any;
      const message =
        responseData?.message || axiosError.message || "Network error occurred";

      const apiError: ApiError = {
        status,
        message,
        originalError: axiosError,
        data: responseData,
      };

      throw apiError;
    }

    // Handle other errors
    const apiError: ApiError = {
      status: null,
      message: (error as Error).message || "Unknown error occurred",
      originalError: error as Error,
    };

    throw apiError;
  }
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (err) {
    return null;
  }
};

// Helper functions for common HTTP methods
export const apiGet = <T = any>(
  options: Omit<ApiCallOptions, "method">
): Promise<T> => apiCall<T>({ ...options, method: "get" });

export const apiPost = <T = any>(
  options: Omit<ApiCallOptions, "method">
): Promise<T> => apiCall<T>({ ...options, method: "post" });

export const apiPut = <T = any>(
  options: Omit<ApiCallOptions, "method">
): Promise<T> => apiCall<T>({ ...options, method: "put" });

export const apiPatch = <T = any>(
  options: Omit<ApiCallOptions, "method">
): Promise<T> => apiCall<T>({ ...options, method: "patch" });

export const apiDelete = <T = any>(
  options: Omit<ApiCallOptions, "method">
): Promise<T> => apiCall<T>({ ...options, method: "delete" });

// TanStack Query Hooks

// Generic query hook
export const useApiQuery = <T = any>(
  queryKey: readonly unknown[],
  options: Omit<ApiCallOptions, "method">,
  queryOptions?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) => {
  return useQuery<T, ApiError>({
    queryKey,
    queryFn: () => apiGet<T>(options),
    ...queryOptions,
  });
};

// Generic mutation hook
export const useApiMutation = <T = any, V = any>(
  options: Omit<ApiCallOptions, "method"> & {
    method: "post" | "put" | "patch" | "delete";
  },
  mutationOptions?: Omit<UseMutationOptions<T, ApiError, V>, "mutationFn">
) => {
  return useMutation<T, ApiError, V>({
    mutationFn: (variables: V) =>
      apiCall<T>({ ...options, data: variables as any }),
    ...mutationOptions,
  });
};



export default apiCall;