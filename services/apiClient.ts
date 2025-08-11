import axios, {
  AxiosRequestConfig,
  Method,
  AxiosResponse,
  AxiosError,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
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
  homeownerProfile: () => [...queryKeys.all, "homeowner", "profile"] as const,

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
  homeownerDashboardStats: () => [...queryKeys.homeownerDashboard(), "stats"] as const,
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
      // Add additional debugging for React Native
      validateStatus: (status) => {
        //console.log("[API Call] Response status:", status);
        return status < 500; // Accept all status codes less than 500
      },
    };

    {/*
console.log("[API Call] Config:", {
      method: axiosConfig.method,
      url: `${baseURL}${endpoint}`,
      headers: headers,
      data: axiosConfig.data,
      timeout: timeout,
    });
    */}
    
    console.log("------------------------------------------------");
    console.log("[API Call] 🔧 DEBUG INFO:");
    console.log("[API Call] 🌐 Base URL:", baseURL);
    console.log("[API Call] 📍 Endpoint:", endpoint);
    console.log("[API Call] 🔗 Full URL:", `${baseURL}${endpoint}`);
    console.log("[API Call] 🚀 Request Method:", method);
    console.log("[API Call] 📦 Request Data:", JSON.stringify(data, null, 2));
    console.log("[API Call] ⚙️  Axios Config:", JSON.stringify(axiosConfig, null, 2));
    const response: AxiosResponse<T> = await axios(axiosConfig);
    console.log("[API Call] Response Received:", JSON.stringify(response.data, null, 2));
    console.log("------------------------------------------------");

    return response.data;
  } catch (error: any) {
    // Handle Axios errors specifically
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? null;
      const responseData = axiosError.response?.data as any;
      
      // Enhanced error message for network issues
      let message = "Network error occurred";
      if (axiosError.code === 'ECONNREFUSED') {
        message = "Server is not reachable. Please check if the server is running.";
      } else if (axiosError.code === 'ENOTFOUND') {
        message = "Server address not found. Please check the API URL.";
      } else if (axiosError.code === 'ETIMEDOUT') {
        message = "Request timed out. Please check your internet connection.";
      } else if (responseData?.message) {
        message = responseData.message;
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      console.log("[API Error] Details:", {
        code: axiosError.code,
        status: status,
        message: message,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      });

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
    console.log("[API Client] Retrieved token:", token ? "Token exists" : "No token found");
    
    if (token) {
      try {
        // Decode JWT token to get user type (for debugging)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        console.log("[API Client] Token payload:", decodedPayload);
        console.log("[API Client] User type in token:", decodedPayload.userType);
      } catch (decodeError) {
        console.log("[API Client] Could not decode token payload");
      }
    }
    
    return token;
  } catch (err) {
    console.log("[API Client] Error retrieving token:", err);
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