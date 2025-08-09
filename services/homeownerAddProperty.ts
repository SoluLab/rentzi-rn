import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import {
  apiPost,
  apiPut,
  apiDelete,
  useApiMutation,
  queryKeys,
} from "./apiClient";

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
    UseMutationOptions<any, ApiError, { propertyId: string; [key: string]: any }>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string; [key: string]: any }>(
    {
      mutationFn: ({ propertyId, ...data }) => {
        const url = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER + ENDPOINTS.HOMEOWNER_PROPERTY.SAVE_DRAFT(propertyId);
        console.log('Save Draft Full URL:', url);
        return apiPut({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
          endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.SAVE_DRAFT(propertyId),
          data,
          auth: true,
        });
      },
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

// 4. Update Property
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

// 5. Delete Property
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

// 6. Upload Property Images
export const useHomeownerUploadPropertyImages = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string | number; images: any[] }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { propertyId: string | number; images: any[] }
  >({
    mutationFn: async ({ propertyId, images }) => {
      const formData = new FormData();
      
      // Ensure each image is properly formatted for React Native
      images.forEach((image, index) => {
        // Validate that the image object has required properties
        if (!image.uri) {
          throw new Error(`Image ${index} is missing URI`);
        }
        
        // Create a proper file object for React Native
        const file = {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${index}.jpg`,
        };
        
        // Append each image with the "images" field name
        formData.append("images", file as any);
      });

      console.log("FormData created:", formData);
      console.log("Images to upload:", images);
      
      // Debug: Log each image being added to FormData
      images.forEach((image, index) => {
        console.log(`Image ${index}:`, {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });
      
      // Debug: Log FormData entries (commented out due to TypeScript issues)
      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData entry - ${key}:`, value);
      // }

      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_IMAGES(
          propertyId.toString()
        ),
        data: formData as any,
        auth: true,
        customHeaders: {
          // Don't set Content-Type for multipart/form-data, let the browser set it with boundary
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

// 7. Delete Property Image
export const useHomeownerDeletePropertyImage = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string | number; imageName: string }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { propertyId: string | number; imageName: string }
  >({
    mutationFn: ({ propertyId, imageName }) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DELETE_IMAGE(
          propertyId.toString(),
          imageName
        ),
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

// 8. Upload Property Files
export const useHomeownerUploadPropertyFiles = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string | number; files: any[]; fileType: string }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { propertyId: string | number; files: any[]; fileType: string }
  >({
    mutationFn: async ({ propertyId, files, fileType }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("fileType", fileType);

      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_FILES(
          propertyId.toString()
        ),
        data: formData as any,
        auth: true,
        customHeaders: {
          "Content-Type": "multipart/form-data",
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

// 9. Delete Property File
export const useHomeownerDeletePropertyFile = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string | number; fileName: string }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { propertyId: string | number; fileName: string }
  >({
    mutationFn: ({ propertyId, fileName }) =>
      apiDelete({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DELETE_FILE(
          propertyId.toString(),
          fileName
        ),
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
