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
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import { deviceTokenUtils } from "@/utils/deviceToken";
import { AuthResponse, LoginRequest, ApiErrorResponse } from "@/types";

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
interface ApiError {
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
  homeownerProperties: () => [...queryKeys.all, "homeowner", "properties"] as const,
  homeownerProperty: (id: string | number) => [...queryKeys.homeownerProperties(), id] as const,
  homeownerPropertyImages: (propertyId: string | number) => [...queryKeys.homeownerProperty(propertyId), "images"] as const,
  homeownerPropertyFiles: (propertyId: string | number) => [...queryKeys.homeownerProperty(propertyId), "files"] as const,
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

// Auth mutations

// Login
export const useLogin = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<
    UseMutationOptions<AuthResponse, ApiError, LoginRequest>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: async ({ email, password }) => {
      const payload: LoginRequest = {
        email,
        password,
      };

      // Set base URL based on user type
      const baseURL =
        userType === "homeowner"
          ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
          : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

      console.log("[API Client] Login payload:", payload);
      console.log("[API Client] User type:", userType);
      console.log(
        "[API Client] Login URL:",
        `${baseURL}${ENDPOINTS.AUTH.SIGNIN}`
      );

      const response = await apiPost<AuthResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNIN,
        data: payload,
        auth: false,
      });
      console.log("[API Client] Login response:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    ...options,
  });
};

// Signup
export const useSignup = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        countryCode: string;
        mobile: string;
        userType: string[];
      }
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    any,
    ApiError,
    {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      countryCode: string;
      mobile: string;
      userType: string[];
    }
  >({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
      countryCode,
      mobile,
      userType,
    }) => {
      const payload = {
        name: {
          firstName,
          lastName,
        },
        email,
        password,
        phone: {
          countryCode,
          mobile,
        },
        userType,
      };

      console.log("[API Client] Registration payload:", payload);
      console.log(
        "[API Client] Registration URL:",
        `${BASE_URLS.DEVELOPMENT.AUTH_API_RENTER}${ENDPOINTS.AUTH.SIGNUP}`
      );

      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_RENTER,
        endpoint: ENDPOINTS.AUTH.SIGNUP,
        data: payload,
        auth: false,
      });

      console.log("[API Client] Registration response:", response);

      return response;
    },
    ...options,
  });
};

// Verify OTP

export const useVerifyOtp = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<
    UseMutationOptions<any, ApiError, { email: string; otp: string }>,
    "mutationFn"
  >
) => {
  return useMutation<any, ApiError, { email: string; otp: string }>({
    mutationFn: async ({ email, otp }) => {
      console.log('useVerifyOtp called with:', { email, otp, userType });
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_OTP,
        data: { email, otp },
        auth: true, // Enable authentication to include Bearer token
      });
      console.log('useVerifyOtp response:', response);
      return response;
    },
    ...options,
  });
};

// Logout

export const useLogout = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<UseMutationOptions<any, ApiError, void>, "mutationFn">
) => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, void>({
    mutationFn: async () => {
      try {
        // Set base URL based on user type
        const baseURL =
          userType === "homeowner"
            ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
            : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

        // Call logout API
        const response = await apiPost({
          baseURL,
          endpoint: ENDPOINTS.AUTH.LOGOUT,
          data: {},
          auth: true,
        });
      } catch (error) {
        // Logout API call failed, but continuing with local cleanup
      }
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await deviceTokenUtils.clearDeviceToken();

      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
    },
    
    ...options,
  });
};

// Reset password
export const useResetPassword = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      {
        email: string;
        code: string;
        newPassword: string;
        verificationId: number;
      }
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    any,
    ApiError,
    { email: string; code: string; newPassword: string; verificationId: number }
  >({
    mutationFn: async ({ email, code, newPassword, verificationId }) => {
      const baseURL =
        userType === "homeowner"
          ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
          : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: { email, code, newPassword, verificationId },
        auth: false,
      });
      return response;
    },
    ...options,
  });
};

// Forgot password
export const useForgotPassword = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<
    UseMutationOptions<any, ApiError, { email: string }>,
    "mutationFn"
  >
) => {
  return useMutation<any, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      const baseURL =
        userType === "homeowner"
          ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
          : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

      console.log("[API Client] ForgotPassword request:", { email });
      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: { email },
        auth: false,
      });
      console.log("[API Client] ForgotPassword response:", response);
      return response;
    },
    ...options,
  });
};

// Get profile
export const useGetProfile = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  const baseURL =
    userType === "homeowner"
      ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
      : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

  return useApiQuery(
    [...queryKeys.all, "profile"],
    {
      baseURL,
      endpoint: "/api/profile",
      auth: true,
    },
    options
  );
};

// Update profile
export const useUpdateProfile = (
  userType: "renter_investor" | "homeowner" = "renter_investor",
  options?: Omit<UseMutationOptions<any, ApiError, any>, "mutationFn">
) => {
  return useMutation<any, ApiError, any>({
    mutationFn: async (data) => {
      const baseURL =
        userType === "homeowner"
          ? BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER
          : BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;

      return apiPut({
        baseURL,
        endpoint: "/api/profile",
        data,
        auth: true,
      });
    },
    ...options,
  });
};

// Marketplace API TanStack Query & Mutation Hooks

// 1. Get all properties (with filters/pagination)
export const useMarketplaceGetProperties = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    ["marketplace", "properties", params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: "/api/marketplace/properties",
      params,
      auth: true,
    },
    options
  );
};

// 2. Get property by ID
export const useMarketplaceGetProperty = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    ["marketplace", "property", id],
    {
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: `/api/marketplace/properties/${id}`,
      auth: true,
    },
    options
  );
};

// 3. Create property
export const useMarketplaceCreateProperty = (
  options?: Omit<
    UseMutationOptions<any, ApiError, Record<string, any>>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: "/api/marketplace/properties",
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
      any,
      ApiError,
      { id: string | number; data: Record<string, any> }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { id: string | number; data: Record<string, any> }
  >({
    mutationFn: ({ id, data }) =>
      apiPut({
        baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
        endpoint: `/api/marketplace/properties/${id}`,
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
    UseMutationOptions<any, ApiError, string | number>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, string | number>({
    mutationFn: (id) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
        endpoint: `/api/marketplace/properties/${id}`,
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





// ============================================================================
// HOMEOWNER PROPERTY API HOOKS
// ============================================================================

// 1. Create Property
export const useHomeownerCreateProperty = (
  options?: Omit<
    UseMutationOptions<any, ApiError, Record<string, any>>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.CREATE_PROPERTY,
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeownerProperties(),
        });
      },
      ...options,
    }
  );
};

// 2. Save Property Draft
export const useHomeownerSavePropertyDraft = (
  options?: Omit<
    UseMutationOptions<any, ApiError, Record<string, any>>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.SAVE_DRAFT,
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeownerProperties(),
        });
      },
      ...options,
    }
  );
};

// 3. Submit Property for Review
export const useHomeownerSubmitPropertyForReview = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { propertyId: string }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.SUBMIT_FOR_REVIEW,
      auth: true,
    },
    {
      onSuccess: (_, { propertyId }) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeownerProperties(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.homeownerProperty(propertyId),
        });
      },
      ...options,
    }
  );
};

// 4. Get All Properties (with filters/pagination)
export const useHomeownerGetAllProperties = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    [...queryKeys.homeownerProperties(), params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.GET_ALL_PROPERTIES,
      params,
      auth: true,
    },
    options
  );
};

// 5. Get Property by ID
export const useHomeownerGetPropertyById = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    queryKeys.homeownerProperty(id),
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.GET_PROPERTY_BY_ID(id.toString()),
      auth: true,
    },
    options
  );
};

// 6. Update Property
export const useHomeownerUpdateProperty = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { id: string | number; data: Record<string, any> }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { id: string | number; data: Record<string, any> }
  >({
    mutationFn: ({ id, data }) =>
      apiPut({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPDATE_PROPERTY(id.toString()),
        data,
        auth: true,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperties(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperty(id),
      });
    },
    ...options,
  });
};

// 7. Delete Property
export const useHomeownerDeleteProperty = (
  options?: Omit<
    UseMutationOptions<any, ApiError, string | number>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, string | number>({
    mutationFn: (id) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DELETE_PROPERTY(id.toString()),
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperties(),
      });
    },
    ...options,
  });
};

// 8. Upload Property Images
export const useHomeownerUploadPropertyImages = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { propertyId: string | number; images: File[] }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string | number; images: File[] }>({
    mutationFn: async ({ propertyId, images }) => {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_IMAGES(propertyId.toString()),
        data: formData as any,
        auth: true,
        customHeaders: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperty(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerPropertyImages(propertyId),
      });
    },
    ...options,
  });
};

// 9. Delete Property Image
export const useHomeownerDeletePropertyImage = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { propertyId: string | number; imageName: string }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string | number; imageName: string }>({
    mutationFn: ({ propertyId, imageName }) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DELETE_IMAGE(propertyId.toString(), imageName),
        auth: true,
      }),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperty(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerPropertyImages(propertyId),
      });
    },
    ...options,
  });
};

// 10. Upload Property Files
export const useHomeownerUploadPropertyFiles = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { propertyId: string | number; files: File[]; fileType: string }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string | number; files: File[]; fileType: string }>({
    mutationFn: async ({ propertyId, files, fileType }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('fileType', fileType);

      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_FILES(propertyId.toString()),
        data: formData as any,
        auth: true,
        customHeaders: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperty(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerPropertyFiles(propertyId),
      });
    },
    ...options,
  });
};

// 11. Delete Property File
export const useHomeownerDeletePropertyFile = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { propertyId: string | number; fileName: string }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string | number; fileName: string }>({
    mutationFn: ({ propertyId, fileName }) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DELETE_FILE(propertyId.toString(), fileName),
        auth: true,
      }),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerProperty(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.homeownerPropertyFiles(propertyId),
      });
    },
    ...options,
  });
};

export default apiCall;
