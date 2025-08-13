import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import { apiPost, queryKeys } from "./apiClient";
import {
  FileUploadResponse,
  FileUploadRequest,
  FileUploadApiError,
} from "@/types/homeownerFileUpload";

// Upload Property Images
export const useHomeownerUploadPropertyImages = (
  options?: Omit<
    UseMutationOptions<
      FileUploadResponse,
      FileUploadApiError,
      FileUploadRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<FileUploadResponse, FileUploadApiError, FileUploadRequest>(
    {
      mutationFn: async ({ propertyId, files }) => {
        const formData = new FormData();

        // Ensure each image is properly formatted for React Native
        files.forEach((file, index) => {
          // Validate that the file object has required properties
          if (!file.uri) {
            throw new Error(`File ${index} is missing URI`);
          }

          // Create a proper file object for React Native
          const fileObj = {
            uri: file.uri,
            type: file.type || "image/jpeg",
            name: file.name || `image_${index}.jpg`,
          };

          // Append each file to FormData with "files" key
          formData.append("propertyFiles", fileObj as any);
        });

        console.log("FormData created for images:", formData);
        console.log("Files to upload:", files);

        return apiPost<FileUploadResponse>({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
          endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_IMAGES(propertyId),
          data: formData,
          auth: true,
          timeout: 180000, // 3 minutes for image uploads
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
    }
  );
};

// Upload Property Videos
export const useHomeownerUploadPropertyVideos = (
  options?: Omit<
    UseMutationOptions<
      FileUploadResponse,
      FileUploadApiError,
      FileUploadRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<FileUploadResponse, FileUploadApiError, FileUploadRequest>(
    {
      mutationFn: async ({ propertyId, files }) => {
        const formData = new FormData();

        // Ensure each video is properly formatted for React Native
        files.forEach((file, index) => {
          // Validate that the file object has required properties
          if (!file.uri) {
            throw new Error(`File ${index} is missing URI`);
          }

          // Create a proper file object for React Native
          const fileObj = {
            uri: file.uri,
            type: file.type || "video/mp4",
            name: file.name || `video_${index}.mp4`,
          };

          // Append each file to FormData with "files" key
          formData.append("propertyFiles", fileObj as any);
        });

        console.log("FormData created for videos:", formData);
        console.log("Files to upload:", files);

        return apiPost<FileUploadResponse>({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
          endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(propertyId),
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
    }
  );
};

// Upload Property 360° Videos (separate endpoint for 360° videos)
export const useHomeownerUploadProperty360Videos = (
  options?: Omit<
    UseMutationOptions<
      FileUploadResponse,
      FileUploadApiError,
      FileUploadRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<FileUploadResponse, FileUploadApiError, FileUploadRequest>(
    {
      mutationFn: async ({ propertyId, files }) => {
        const formData = new FormData();

        // Ensure each 360° video is properly formatted for React Native
        files.forEach((file, index) => {
          // Validate that the file object has required properties
          if (!file.uri) {
            throw new Error(`File ${index} is missing URI`);
          }

          // Create a proper file object for React Native
          const fileObj = {
            uri: file.uri,
            type: file.type || "video/mp4",
            name: file.name || `video360_${index}.mp4`,
          };

          // Append each file to FormData with "files" key
          formData.append("propertyFiles", fileObj as any);
        });

        console.log("FormData created for 360° videos:", formData);
        console.log("Files to upload:", files);

        // Use the same video endpoint for 360° videos
        return apiPost<FileUploadResponse>({
          baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
          endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(propertyId),
          data: formData,
          auth: true,
          timeout: 900000, // 15 minutes for 360° video uploads
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
    }
  );
};
