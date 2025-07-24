import axios, { AxiosRequestConfig, Method, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BASE_URLS, ENDPOINTS } from '@/constants/urls';
import { deviceTokenUtils } from '@/utils/deviceToken';
import { registerForPushNotificationsAsync } from '@/utils/notificationRegistration';

// Define supported methods as a union type
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
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
  all: ['api'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...queryKeys.details(), id] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,
  user: () => [...queryKeys.all, 'user'] as const,
  parcels: () => [...queryKeys.all, 'parcels'] as const,
  parcel: (id: string | number) => [...queryKeys.parcels(), id] as const,
  leads: () => [...queryKeys.all, 'leads'] as const,
  lead: (id: string | number) => [...queryKeys.leads(), id] as const,
  campaigns: () => [...queryKeys.all, 'campaigns'] as const,
  campaign: (id: string | number) => [...queryKeys.campaigns(), id] as const,
  offers: () => [...queryKeys.all, 'offers'] as const,
  offer: (id: string | number) => [...queryKeys.offers(), id] as const,
  transactions: () => [...queryKeys.all, 'transactions'] as const,
  transaction: (id: string | number) => [...queryKeys.transactions(), id] as const,
  chat: () => [...queryKeys.all, 'chat'] as const,
  chatMessages: (chatId: string) => [...queryKeys.chat(), chatId, 'messages'] as const,
  notifications: () => [...queryKeys.all, 'notifications'] as const,
  balance: () => [...queryKeys.all, 'balance'] as const,
  tokens: () => [...queryKeys.all, 'tokens'] as const,
  mailerOptions: () => [...queryKeys.all, 'mailerOptions'] as const,
  profile: () => [...queryKeys.all, 'profile'] as const,
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
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (auth) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error('Authentication token not found');
      }
    }

    const axiosConfig: AxiosRequestConfig = {
      method: method as Method,
      baseURL,
      url: endpoint,
      headers,
      params,
      data: ['post', 'put', 'patch'].includes(method) ? data : undefined,
      timeout,
    };

    const response: AxiosResponse<T> = await axios(axiosConfig);
    
    return response.data;
  } catch (error: any) {
    // Handle Axios errors specifically
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? null;
      const responseData = axiosError.response?.data as any;
      const message = responseData?.message || axiosError.message || 'Network error occurred';
      
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
      message: (error as Error).message || 'Unknown error occurred',
      originalError: error as Error,
    };
    
    throw apiError;
  }
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (err) {
    return null;
  }
};

// Helper functions for common HTTP methods
export const apiGet = <T = any>(options: Omit<ApiCallOptions, 'method'>): Promise<T> => 
  apiCall<T>({ ...options, method: 'get' });

export const apiPost = <T = any>(options: Omit<ApiCallOptions, 'method'>): Promise<T> => 
  apiCall<T>({ ...options, method: 'post' });

export const apiPut = <T = any>(options: Omit<ApiCallOptions, 'method'>): Promise<T> => 
  apiCall<T>({ ...options, method: 'put' });

export const apiPatch = <T = any>(options: Omit<ApiCallOptions, 'method'>): Promise<T> => 
  apiCall<T>({ ...options, method: 'patch' });

export const apiDelete = <T = any>(options: Omit<ApiCallOptions, 'method'>): Promise<T> => 
  apiCall<T>({ ...options, method: 'delete' });

// TanStack Query Hooks

// Generic query hook
export const useApiQuery = <T = any>(
  queryKey: readonly unknown[],
  options: Omit<ApiCallOptions, 'method'>,
  queryOptions?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<T, ApiError>({
    queryKey,
    queryFn: () => apiGet<T>(options),
    ...queryOptions,
  });
};

// Generic mutation hook
export const useApiMutation = <T = any, V = any>(
  options: Omit<ApiCallOptions, 'method'> & { method: 'post' | 'put' | 'patch' | 'delete' },
  mutationOptions?: Omit<UseMutationOptions<T, ApiError, V>, 'mutationFn'>
) => {
  return useMutation<T, ApiError, V>({
    mutationFn: (variables: V) => apiCall<T>({ ...options, data: variables as any }),
    ...mutationOptions,
  });
};

// Specific query hooks for common operations
export const useGetParcels = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.parcels(),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/parcels',
      params,
      auth: true,
    },
    options
  );
};

export const useGetParcel = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.parcel(id),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/parcels/${id}`,
      auth: true,
    },
    options
  );
};

export const useGetLeads = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.leads(),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/leads',
      params,
      auth: true,
    },
    options
  );
};

export const useGetLead = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.lead(id),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/leads/${id}`,
      auth: true,
    },
    options
  );
};

export const useGetUser = (
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.user(),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/user/profile',
      auth: true,
    },
    options
  );
};

export const useGetBalance = (
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.balance(),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/user/balance',
      auth: true,
    },
    options
  );
};

export const useGetMailerOptions = (
  baseURL: string = BASE_URLS.DEVELOPMENT.VALUATION_API,
  endpoint: string = '/postCard/options',
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.mailerOptions(),
    {
      baseURL,
      endpoint,
      auth: true,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: 1000,
      enabled: false, // Disable by default to prevent automatic calls
      ...options,
    }
  );
};

export const useGetTransactions = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.transactions(),
    {
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/transactions',
      params,
      auth: true,
    },
    options
  );
};

// Mutation hooks
export const useCreateLead = (
  options?: Omit<UseMutationOptions<any, ApiError, Record<string, any>>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    {
      method: 'post',
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: ENDPOINTS.LEADS.CREATE,
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      },
      ...options,
    }
  );
};

export const useCheckLeadMatches = (
  options?: Omit<UseMutationOptions<any, ApiError, { leadId: string }>, 'mutationFn'>
) => {
  return useApiMutation(
    {
      method: 'post',
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: ENDPOINTS.LEADS.MATCH_CHECK,
      auth: true,
    },
    options
  );
};

export const useGetMatchDetails = (
  options?: Omit<UseMutationOptions<any, ApiError, { matchId: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { matchId: string }>({
    mutationFn: ({ matchId }) => apiGet({
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: ENDPOINTS.LEADS.MATCH_DETAILS(matchId),
      auth: true,
    }),
    ...options,
  });
};

export const useUpdateLead = (
  options?: Omit<UseMutationOptions<any, ApiError, { id: string | number; data: Record<string, any> }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { id: string | number; data: Record<string, any> }>({
    mutationFn: ({ id, data }) => apiPut({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/leads/${id}`,
      data,
      auth: true,
    }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.lead(id) });
    },
    ...options,
  });
};

export const useDeleteLead = (
  options?: Omit<UseMutationOptions<any, ApiError, string | number>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, string | number>({
    mutationFn: (id) => apiDelete({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/leads/${id}`,
      auth: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
    },
    ...options,
  });
};

export const useCreateParcel = (
  options?: Omit<UseMutationOptions<any, ApiError, Record<string, any>>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    {
      method: 'post',
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: '/parcels',
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.parcels() });
      },
      ...options,
    }
  );
};

export const useUpdateParcel = (
  options?: Omit<UseMutationOptions<any, ApiError, { id: string | number; data: Record<string, any> }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { id: string | number; data: Record<string, any> }>({
    mutationFn: ({ id, data }) => apiPut({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/parcels/${id}`,
      data,
      auth: true,
    }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parcels() });
      queryClient.invalidateQueries({ queryKey: queryKeys.parcel(id) });
    },
    ...options,
  });
};

export const useDeleteParcel = (
  options?: Omit<UseMutationOptions<any, ApiError, string | number>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, string | number>({
    mutationFn: (id) => apiDelete({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
      endpoint: `/parcels/${id}`,
      auth: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parcels() });
    },
    ...options,
  });
};

// Auth mutations
export const useLogin = (
  options?: Omit<UseMutationOptions<any, ApiError, { email: string; password: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      // Get device token with retry mechanism
      let deviceToken = await deviceTokenUtils.getDeviceToken();
      
      // If no device token is available, try to register for notifications
      if (!deviceToken) {
        try {
          await registerForPushNotificationsAsync();
          // Wait a bit for the token to be stored
          await new Promise(resolve => setTimeout(resolve, 1000));
          deviceToken = await deviceTokenUtils.getDeviceToken();
        } catch (error) {
          // Failed to register for notifications during login
        }
      }
      
      const payload = { 
        email, 
        password,
        deviceToken: deviceToken || undefined
      };
      
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: ENDPOINTS.AUTH.LOGIN,
        data: payload,
        auth: false,
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    ...options,
  });
};

export const useSignup = (
  options?: Omit<UseMutationOptions<any, ApiError, { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }>({
    mutationFn: async ({ firstName, lastName, email, password, phoneNumber }) => {
      // Get device token with retry mechanism
      let deviceToken = await deviceTokenUtils.getDeviceToken();
      
      // If no device token is available, try to register for notifications
      if (!deviceToken) {
        try {
          await registerForPushNotificationsAsync();
          // Wait a bit for the token to be stored
          await new Promise(resolve => setTimeout(resolve, 1000));
          deviceToken = await deviceTokenUtils.getDeviceToken();
        } catch (error) {
          // Failed to register for notifications during signup
        }
      }
      
      const payload = { 
        firstName,
        lastName,
        email, 
        password,
        phoneNumber,
        deviceToken: deviceToken || undefined
      };
      
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: ENDPOINTS.AUTH.REGISTER,
        data: payload,
        auth: false,
      });
      
      return response;
    },
    ...options,
  });
};

export const useCheckEmail = (
  options?: Omit<UseMutationOptions<any, ApiError, { email: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { email: string }>({
    mutationFn: ({ email }) => apiPost({
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
      endpoint: ENDPOINTS.AUTH.CHECK_EMAIL,
      data: { email },
      auth: false,
    }),
    ...options,
  });
};

export const useVerifyOtp = (
  options?: Omit<UseMutationOptions<any, ApiError, { email: string; otp: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { email: string; otp: string }>({
    mutationFn: async ({ email, otp }) => {
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: ENDPOINTS.AUTH.VERIFY_EMAIL,
        data: { email, otp },
        auth: false,
      });
      return response;
    },
    ...options,
  });
};

export const useLogout = (
  options?: Omit<UseMutationOptions<any, ApiError, void>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, void>({
    mutationFn: async () => {
      // Get device token
      const deviceToken = await deviceTokenUtils.getDeviceToken();
      
      const payload = {
        deviceToken: deviceToken || undefined
      };
      
      try {
        // Call logout API
        const response = await apiPost({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
          endpoint: ENDPOINTS.AUTH.LOGOUT,
          data: payload,
          auth: true,
        });
      } catch (error) {
        // Logout API call failed, but continuing with local cleanup
      }
      
      // Clear local storage tokens regardless of API response
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await deviceTokenUtils.clearDeviceToken();
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
};

export const useCreateSupportRequest = (
  options?: Omit<UseMutationOptions<any, ApiError, {
    type: string;
    description: string;
    parcelId?: string;
  }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, {
    type: string;
    description: string;
    parcelId?: string;
  }>({
    mutationFn: async (data) => {
      // Only include parcelId if it's present and not empty
      const requestData = {
        type: data.type,
        description: data.description,
        ...(data.parcelId && data.parcelId.trim() && { parcelId: data.parcelId.trim() })
      };
      
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
        endpoint: ENDPOINTS.HELP.SUPPORT_REQUEST,
        data: requestData,
        auth: true,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Optionally handle error
    },
    ...options,
  });
};

export const useSubmitContactForm = (
  options?: Omit<UseMutationOptions<any, ApiError, {
    name: string;
    email: string;
    contactNumber: string;
    message: string;
  }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, {
    name: string;
    email: string;
    contactNumber: string;
    message: string;
  }>({
    mutationFn: async (data) => {
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
        endpoint: ENDPOINTS.HELP.CONTACT_FORM,
        data: data,
        auth: false, // Contact form doesn't require authentication
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Optionally handle error
    },
    ...options,
  });
};

// Utility hook for invalidating queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateParcels: () => queryClient.invalidateQueries({ queryKey: queryKeys.parcels() }),
    invalidateLeads: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads() }),
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.user() }),
    invalidateBalance: () => queryClient.invalidateQueries({ queryKey: queryKeys.balance() }),
    invalidateTransactions: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions() }),
  };
};

// Specific query hooks for map components
export const useParcelSearch = (
  query: string,
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_API,
  endpoint: string = ENDPOINTS.PARCEL.ADVANCED_SEARCH,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, ApiError>({
    queryKey: [...queryKeys.parcels(), 'search', query, baseURL, endpoint],
    queryFn: () => apiPost({
      baseURL,
      endpoint,
      data: {
        searchType: 'intelligent',
        query: query,
        options: {
          limit: 10
        }
      },
      auth: true,
    }),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useParcelSearchByLocation = (
  latitude: number,
  longitude: number,
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_API,
  endpoint: string = ENDPOINTS.PARCEL.ADVANCED_SEARCH,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, ApiError>({
    queryKey: [...queryKeys.parcels(), 'location', latitude, longitude, baseURL, endpoint],
    queryFn: () => apiPost({
      baseURL,
      endpoint,
      data: {
        searchType: 'intelligent',
        query: `${latitude},${longitude}`,
        options: {
          limit: 150,
          return_geometry: true
        }
      },
      auth: true,
    }),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useParcelDataByLocation = (
  locationDetails: {
    country: string;
    state: string;
    county: string;
    city: string;
  } | null,
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_DATA_API,
  endpoint: string = ENDPOINTS.PARCEL.GET_PARCEL_DATA,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, ApiError>({
    queryKey: [...queryKeys.parcels(), 'location-details', locationDetails, baseURL, endpoint],
    queryFn: () => {
      if (!locationDetails) throw new Error('Location details required');
      
      const formattedCity = locationDetails.city.toLowerCase().replace(/\s+/g, '-');
      const formattedCounty = locationDetails.county
        .toLowerCase()
        .replace(/\s+county$/, '')
        .replace(/\s+/g, '-');

      return apiPost({
        baseURL,
        endpoint,
        data: {
          country: locationDetails.country,
          state: locationDetails.state,
          county: formattedCounty,
          city: formattedCity,
          return_geometry: true,
          limit: 150
        },
        auth: true,
      });
    },
    enabled: !!locationDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Mutation hooks for map operations
export const useSearchParcels = (
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_API,
  endpoint: string = ENDPOINTS.PARCEL.ADVANCED_SEARCH,
  options?: Omit<UseMutationOptions<any, ApiError, { query: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { query: string }>({
    mutationFn: ({ query }) => {
      const payload = {
        searchType: 'intelligent',
        query: query,
        options: {
          limit: 10
        }
      };
      
      return apiPost({
        baseURL,
        endpoint,
        data: payload,
        auth: true,
      });
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables, undefined);
    },
    ...options,
  });
};

// Advance search with custom payload structure
export const useAdvanceSearch = (
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_API,
  endpoint: string = ENDPOINTS.PARCEL.ADVANCED_SEARCH,
  options?: Omit<UseMutationOptions<any, ApiError, {
    searchType: string;
    query: string;
    options: {
      limit: number;
    };
  }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, {
    searchType: string;
    query: string;
    options: {
      limit: number;
    };
  }>({
    mutationFn: (payload) => {      
      return apiPost({
        baseURL,
        endpoint,
        data: payload,
        auth: true,
      });
    },
    ...options,
  });
};

export const useFetchParcelsByLocation = (
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_API,
  endpoint: string = ENDPOINTS.PARCEL.ADVANCED_SEARCH,
  options?: Omit<UseMutationOptions<any, ApiError, { latitude: number; longitude: number }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { latitude: number; longitude: number }>({
    mutationFn: ({ latitude, longitude }) => apiPost({
      baseURL,
      endpoint,
      data: {
        searchType: 'intelligent',
        query: `${latitude},${longitude}`,
        options: {
          limit: 150,
          return_geometry: true
        }
      },
      auth: true,
    }),
    ...options,
  });
};

export const useFetchParcelDataByLocation = (
  baseURL: string = BASE_URLS.DEVELOPMENT.PARCEL_DATA_API,
  endpoint: string = ENDPOINTS.PARCEL.GET_PARCEL_DATA,
  options?: Omit<UseMutationOptions<any, ApiError, {
    country: string;
    state: string;
    county: string;
    city: string;
  }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, {
    country: string;
    state: string;
    county: string;
    city: string;
  }>({
    mutationFn: (locationDetails) => {
      const formattedCity = locationDetails.city.toLowerCase().replace(/\s+/g, '-');
      const formattedCounty = locationDetails.county
        .toLowerCase()
        .replace(/\s+county$/, '')
        .replace(/\s+/g, '-');

      return apiPost({
        baseURL,
        endpoint,
        data: {
          country: locationDetails.country,
          state: locationDetails.state,
          county: formattedCounty,
          city: formattedCity,
          return_geometry: true,
          limit: 150
        },
        auth: true,
      });
    },
    ...options,
  });
};

export const useGetNotifications = (
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  const baseURL = BASE_URLS.DEVELOPMENT.BALANCE_API;
  const endpoint = '/matches/notifications';
  return useApiQuery(
    queryKeys.notifications(),
    {
      baseURL,
      endpoint,
      auth: true,
    },
    options
  );
};

export const useGetChatRooms = (
  params?: { isActive?: boolean; page?: number; limit?: number },
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.chat(),
    {
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.GET_ROOMS,
      params: {
        isActive: true,
        page: 1,
        limit: 10,
        ...params,
      },
      auth: true,
    },
    {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      retryDelay: 1000,
      ...options,
    }
  );
};

// Chat message hooks
export const useGetChatMessages = (
  chatId: string,
  limit: number = 50,
  offset: number = 0,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    queryKeys.chatMessages(chatId),
    {
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.GET_MESSAGES(chatId),
      params: { limit, offset },
      auth: true,
    },
    {
      staleTime: 10 * 1000, // 10 seconds
      gcTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
      retryDelay: 1000,
      enabled: !!chatId,
      ...options,
    }
  );
};

export const useSendMessage = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatId: string; message: { text: string; attachments?: any[] } }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatId: string; message: { text: string; attachments?: any[] } }>({
    mutationFn: ({ chatId, message }) => apiPost({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.SEND_MESSAGE(chatId),
      data: message,
      auth: true,
    }),
    onSuccess: (_, { chatId }) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(chatId) });
      // Invalidate chat rooms to update last message
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useCreateGroupChat = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatType: 'group'; name: string; participants?: string[] }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatType: 'group'; name: string; participants?: string[] }>({
    mutationFn: (groupData) => apiPost({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.CREATE_ROOM,
      data: groupData,
      auth: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useCreatePrivateChat = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatType: 'private'; userId: number }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatType: 'private'; userId: number }>({
    mutationFn: (privateData) => apiPost({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.CREATE_ROOM,
      data: privateData,
      auth: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useAddParticipants = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatId: string; participantIds: string[]; roles?: Array<{ id: string; role: string }> }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatId: string; participantIds: string[]; roles?: Array<{ id: string; role: string }> }>({
    mutationFn: ({ chatId, participantIds, roles }) => {
      const payload = roles 
        ? { participantIds, roles }
        : { participantIds };
      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
        endpoint: ENDPOINTS.CHAT.ADD_PARTICIPANTS(chatId),
        data: payload,
        auth: true,
      });
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useRemoveParticipant = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatId: string; participantId: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatId: string; participantId: string }>({
    mutationFn: ({ chatId, participantId }) => apiDelete({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.REMOVE_PARTICIPANT(chatId, participantId),
      auth: true,
    }),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useLeaveGroup = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatId: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatId: string }>({
    mutationFn: ({ chatId }) => apiPost({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.LEAVE_GROUP(chatId),
      data: {},
      auth: true,
    }),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

export const useDeleteGroup = (
  options?: Omit<UseMutationOptions<any, ApiError, { chatId: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, ApiError, { chatId: string }>({
    mutationFn: ({ chatId }) => apiDelete({
      baseURL: BASE_URLS.DEVELOPMENT.SELLER_BUYER_API,
      endpoint: ENDPOINTS.CHAT.DELETE_GROUP(chatId),
      auth: true,
    }),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat() });
    },
    ...options,
  });
};

// Bot document upload hook
export const useUploadDocumentToBot = (
  options?: Omit<UseMutationOptions<any, ApiError, { file: any; chatRoomId: string; senderId: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { file: any; chatRoomId: string; senderId: string }>({
    mutationFn: async ({ file, chatRoomId, senderId }) => {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);

      const url = `https://dev-ai-api.landhacker.ai/api/chat/upload-document?chat_room_id=${chatRoomId}&sender_id=${senderId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      return responseData;
    },
    ...options,
  });
};

export const useResetPassword = (
  options?: Omit<UseMutationOptions<any, ApiError, { email: string; code: string; newPassword: string; verificationId: number }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { email: string; code: string; newPassword: string; verificationId: number }>({
    mutationFn: async ({ email, code, newPassword, verificationId }) => {
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: { email, code, newPassword, verificationId },
        auth: false,
      });
      return response;
    },
    ...options,
  });
};

export const useForgotPassword = (
  options?: Omit<UseMutationOptions<any, ApiError, { email: string }>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      const response = await apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: { email },
        auth: false,
      });
      return response;
    },
    ...options,
  });
};

export const useGetProfile = (
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    [...queryKeys.all, 'profile'],
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
      endpoint: '/api/profile',
      auth: true,
    },
    options
  );
};

export const useUpdateProfile = (
  options?: Omit<UseMutationOptions<any, ApiError, any>, 'mutationFn'>
) => {
  return useMutation<any, ApiError, any>({
    mutationFn: async (data) => {
      return apiPut({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API,
        endpoint: '/api/profile',
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
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    ['marketplace', 'properties', params],
    {
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: '/api/marketplace/properties',
      params,
      auth: true,
    },
    options
  );
};

// 2. Get property by ID
export const useMarketplaceGetProperty = (
  id: string | number,
  options?: Omit<UseQueryOptions<any, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useApiQuery(
    ['marketplace', 'property', id],
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
  options?: Omit<UseMutationOptions<any, ApiError, Record<string, any>>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useApiMutation(
    {
      method: 'post',
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: '/api/marketplace/properties',
      auth: true,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['marketplace', 'properties'] });
      },
      ...options,
    }
  );
};

// 4. Update property
export const useMarketplaceUpdateProperty = (
  options?: Omit<UseMutationOptions<any, ApiError, { id: string | number; data: Record<string, any> }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { id: string | number; data: Record<string, any> }>(
    {
      mutationFn: ({ id, data }) => apiPut({
        baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
        endpoint: `/api/marketplace/properties/${id}`,
        data,
        auth: true,
      }),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['marketplace', 'properties'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace', 'property', id] });
      },
      ...options,
    }
  );
};

// 5. Delete property
export const useMarketplaceDeleteProperty = (
  options?: Omit<UseMutationOptions<any, ApiError, string | number>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, string | number>({
    mutationFn: (id) => apiDelete({
      baseURL: BASE_URLS.DEVELOPMENT.BALANCE_API,
      endpoint: `/api/marketplace/properties/${id}`,
      auth: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'properties'] });
    },
    ...options,
  });
};


export default apiCall;