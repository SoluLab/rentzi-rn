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
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string; [key: string]: any }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { propertyId: string; [key: string]: any }>(
    {
      mutationFn: ({ propertyId, ...data }) => {
        const url =
          BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER +
          ENDPOINTS.HOMEOWNER_PROPERTY.SAVE_DRAFT(propertyId);
        console.log("Save Draft Full URL:", url);
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
  return useMutation<any, ApiError, { propertyId: string }>(
    {
      mutationFn: async ({ propertyId }) => {
        const response = await apiPost({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
          endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.SUBMIT_FOR_REVIEW(propertyId),
          auth: true,
        });
        
        // Check if the API response indicates an error
        if (response && response.success === false) {
          throw new Error(response.message || 'Property submission failed');
        }
        
        return response;
      },
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
          type: image.type || "image/jpeg",
          name: image.name || `image_${index}.jpg`,
        };

        // Append each image to FormData with "files" key
        formData.append("files", file as any);
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
        data: formData,
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

// 7.5. Upload Property Videos (exactly like images)
export const useHomeownerUploadPropertyVideos = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { propertyId: string | number; videos: any[] }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiError,
    { propertyId: string | number; videos: any[] }
  >({
    mutationFn: async ({ propertyId, videos }) => {
      const formData = new FormData();

      // Ensure each video is properly formatted for React Native
      videos.forEach((video, index) => {
        // Validate that the video object has required properties
        if (!video.uri) {
          throw new Error(`Video ${index} is missing URI`);
        }

        // Create a proper file object for React Native
        const file = {
          uri: video.uri,
          type: video.type || "video/mp4",
          name: video.name || `video_${index}.mp4`,
        };

        // Append each video to FormData with "files" key
        formData.append("files", file as any);
      });

      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;
      const endpoint = ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(
        propertyId.toString()
      );
      const fullURL = baseURL + endpoint;

      console.log("📋 FormData created:", formData);
      console.log("📹 Videos to upload:", videos);
      console.log("🌐 Base URL:", baseURL);
      console.log("📂 Endpoint:", endpoint);
      console.log("🔗 Full URL:", fullURL);

      // Debug: Log each video being added to FormData
      videos.forEach((video, index) => {
        console.log(`Video ${index}:`, {
          uri: video.uri,
          type: video.type,
          name: video.name,
        });
      });

      return apiPost({
        baseURL: baseURL,
        endpoint: endpoint,
        data: formData,
        auth: true,
        timeout: 900000, // 15 minutes for video uploads
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

      // Use different endpoint based on file type
      const endpoint =
        fileType === "video"
          ? ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(propertyId.toString())
          : ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_FILES(propertyId.toString());

  

      return apiPost({
        baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
        endpoint,
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
