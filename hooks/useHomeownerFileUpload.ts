import {
  useHomeownerUploadPropertyImages,
  useHomeownerUploadPropertyVideos,
  useHomeownerUploadProperty360Videos,
} from "@/services/homeownerFileUpload";
import {
  MediaFile,
  VideoFile,
  FileUploadFormData,
  FileUploadValidationErrors,
  FileUploadApiError,
} from "@/types/homeownerFileUpload";

interface UseHomeownerFileUploadReturn {
  // Image upload
  uploadImages: (propertyId: string, images: MediaFile[]) => Promise<any>;
  uploadImagesLoading: boolean;
  uploadImagesError: FileUploadApiError | null;

  // Video upload
  uploadVideos: (propertyId: string, videos: VideoFile[]) => Promise<any>;
  uploadVideosLoading: boolean;
  uploadVideosError: FileUploadApiError | null;

  // 360° Video upload
  upload360Videos: (propertyId: string, videos: VideoFile[]) => Promise<any>;
  upload360VideosLoading: boolean;
  upload360VideosError: FileUploadApiError | null;

  // Upload cancellation
  cancelVideoUpload: () => void;
  cancel360VideoUpload: () => void;
  cancelImageUpload: () => void;

  // Form validation
  validateForm: (formData: FileUploadFormData) => boolean;
  getValidationErrors: (
    formData: FileUploadFormData
  ) => FileUploadValidationErrors;

  // Utility functions
  isFormValid: (formData: FileUploadFormData) => boolean;
  hasUnuploadedFiles: (formData: FileUploadFormData) => boolean;
}

export const useHomeownerFileUpload = (): UseHomeownerFileUploadReturn => {
  // Image upload mutation
  const uploadImagesMutation = useHomeownerUploadPropertyImages();

  // Video upload mutation
  const uploadVideosMutation = useHomeownerUploadPropertyVideos();

  // 360° Video upload mutation
  const upload360VideosMutation = useHomeownerUploadProperty360Videos();

  // Upload images function
  const uploadImages = async (propertyId: string, images: MediaFile[]) => {
    try {
      const files = images.map((img) => ({
        uri: img.uri,
        type: img.type || "image/jpeg",
        name: img.name || `image_${Date.now()}.jpg`,
      }));

      const response = await uploadImagesMutation.mutateAsync({
        propertyId,
        files,
      });

      return response;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  // Upload videos function
  const uploadVideos = async (propertyId: string, videos: VideoFile[]) => {
    try {
      const files = videos.map((video) => ({
        uri: video.uri,
        type: video.type || "video/mp4",
        name: video.name || `video_${Date.now()}.mp4`,
      }));

      const response = await uploadVideosMutation.mutateAsync({
        propertyId,
        files,
      });

      return response;
    } catch (error) {
      console.error("Error uploading videos:", error);
      throw error;
    }
  };

  // Upload 360° videos function
  const upload360Videos = async (propertyId: string, videos: VideoFile[]) => {
    try {
      const files = videos.map((video) => ({
        uri: video.uri,
        type: video.type || "video/mp4",
        name: video.name || `video360_${Date.now()}.mp4`,
      }));

      const response = await upload360VideosMutation.mutateAsync({
        propertyId,
        files,
      });

      return response;
    } catch (error) {
      console.error("Error uploading 360° videos:", error);
      throw error;
    }
  };

  // Validation functions
  const validatePhotos = (photos: MediaFile[]): string | undefined => {
    const MAX_PHOTO_SIZE_MB = 25;
    const MIN_PHOTO_DIMENSIONS = { width: 800, height: 600 };
    const MAX_PHOTOS = 20;

    if (photos.length < 3) {
      return `At least 3 photos are required. You have ${photos.length} photos.`;
    }

    if (photos.length > MAX_PHOTOS) {
      return `Maximum ${MAX_PHOTOS} photos allowed. You have ${photos.length} photos.`;
    }

    for (const photo of photos) {
      if (photo.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        return `Photo "${photo.name}" exceeds ${MAX_PHOTO_SIZE_MB}MB limit.`;
      }

      if (photo.width && photo.height) {
        if (
          photo.width < MIN_PHOTO_DIMENSIONS.width ||
          photo.height < MIN_PHOTO_DIMENSIONS.height
        ) {
          return `Photo "${photo.name}" dimensions (${photo.width}x${photo.height}) are below minimum requirement (${MIN_PHOTO_DIMENSIONS.width}x${MIN_PHOTO_DIMENSIONS.height}).`;
        }
      }
    }

    return undefined;
  };

  const validateVirtualTour = (
    virtualTour: FileUploadFormData["virtualTour"]
  ): string | undefined => {
    const MAX_VIDEO_SIZE_MB = 100;

    // Check if neither URL nor video is provided (virtual tour is required)
    const hasUrl = typeof virtualTour === "string" && virtualTour.trim();
    const hasVideo = typeof virtualTour === "object" && virtualTour.uri;

    if (!hasUrl && !hasVideo) {
      return "Virtual tour is required - provide either a YouTube/Vimeo URL or upload a video file";
    }

    if (typeof virtualTour === "string") {
      if (!virtualTour.trim()) return undefined; // Optional field

      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;

      if (!youtubeRegex.test(virtualTour) && !vimeoRegex.test(virtualTour)) {
        return "Please enter a valid YouTube or Vimeo URL";
      }
    } else if (typeof virtualTour === "object" && virtualTour.uri) {
      if (
        virtualTour.size &&
        virtualTour.size > MAX_VIDEO_SIZE_MB * 1024 * 1024
      ) {
        return "Video file must be less than 100MB";
      }
      if (
        virtualTour.name &&
        !virtualTour.name.toLowerCase().endsWith(".mp4")
      ) {
        return "Only MP4 files are allowed";
      }
    }

    return undefined;
  };

  const validateVideo360 = (
    video360: FileUploadFormData["video360"]
  ): string | undefined => {
    const MAX_VIDEO_SIZE_MB = 100;

    // 360° video is optional for residential properties, so no validation errors if not provided
    if (!video360) return undefined;

    if (video360.size && video360.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      return `360° video file "${video360.name}" exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`;
    }
    if (video360.name && !video360.name.toLowerCase().endsWith(".mp4")) {
      return "Only MP4 files are allowed for 360° video.";
    }
    return undefined;
  };

  const validateForm = (formData: FileUploadFormData): boolean => {
    const errors = getValidationErrors(formData);
    return Object.values(errors).every((error) => !error);
  };

  const getValidationErrors = (
    formData: FileUploadFormData
  ): FileUploadValidationErrors => {
    return {
      photos: validatePhotos(formData.photos),
      virtualTour: validateVirtualTour(formData.virtualTour),
      video360: validateVideo360(formData.video360),
    };
  };

  const isFormValid = (formData: FileUploadFormData): boolean => {
    // Check if all images are uploaded
    const unuploadedPhotos = formData.photos.filter(
      (photo) => !photo.uploadedUrl
    );

    // Check if virtual tour is properly set (either URL or uploaded video)
    const hasValidVirtualTour = Boolean(
      (typeof formData.virtualTour === "string" &&
        formData.virtualTour.trim()) ||
        (typeof formData.virtualTour === "object" &&
          formData.virtualTour.uploadedUrl)
    );

    // Check if virtual tour video is still uploading
    const isVideoUploadingCheck =
      typeof formData.virtualTour === "object" &&
      formData.virtualTour.uri &&
      !formData.virtualTour.uploadedUrl &&
      Boolean(uploadVideosMutation.isPending);

    // Check if 360° video is still uploading
    const isVideo360UploadingCheck =
      formData.video360 &&
      !formData.video360.uploadedUrl &&
      Boolean(upload360VideosMutation.isPending);

    // Form is valid when:
    // 1. At least 3 photos and all are uploaded
    // 2. Virtual tour is required - either URL or uploaded video
    // 3. No validation errors
    // 4. No uploads in progress
    return (
      formData.photos.length >= 3 &&
      unuploadedPhotos.length === 0 &&
      hasValidVirtualTour &&
      !isVideoUploadingCheck &&
      !isVideo360UploadingCheck &&
      Boolean(!uploadImagesMutation.isPending) &&
      Boolean(!uploadVideosMutation.isPending) &&
      Boolean(!upload360VideosMutation.isPending) &&
      Boolean(validateForm(formData))
    );
  };

  const hasUnuploadedFiles = (formData: FileUploadFormData): boolean => {
    const unuploadedPhotos = formData.photos.filter(
      (photo) => !photo.uploadedUrl
    );
    const hasUnuploadedVideo = Boolean(
      typeof formData.virtualTour === "object" &&
        formData.virtualTour.uri &&
        !formData.virtualTour.uploadedUrl
    );
    const hasUnuploadedVideo360 = Boolean(
      formData.video360 &&
        formData.video360.uri &&
        !formData.video360.uploadedUrl
    );

    return (
      unuploadedPhotos.length > 0 || hasUnuploadedVideo || hasUnuploadedVideo360
    );
  };

  // Upload cancellation functions
  const cancelVideoUpload = () => {
    if (uploadVideosMutation.isPending) {
      uploadVideosMutation.reset();
      console.log("⏹️ Video upload cancelled");
    }
  };

  const cancel360VideoUpload = () => {
    if (upload360VideosMutation.isPending) {
      upload360VideosMutation.reset();
      console.log("⏹️ 360° video upload cancelled");
    }
  };

  const cancelImageUpload = () => {
    if (uploadImagesMutation.isPending) {
      uploadImagesMutation.reset();
      console.log("⏹️ Image upload cancelled");
    }
  };

  return {
    // Image upload
    uploadImages,
    uploadImagesLoading: uploadImagesMutation.isPending,
    uploadImagesError: uploadImagesMutation.error || null,

    // Video upload
    uploadVideos,
    uploadVideosLoading: uploadVideosMutation.isPending,
    uploadVideosError: uploadVideosMutation.error || null,

    // 360° Video upload
    upload360Videos,
    upload360VideosLoading: upload360VideosMutation.isPending,
    upload360VideosError: upload360VideosMutation.error || null,

    // Upload cancellation
    cancelVideoUpload,
    cancel360VideoUpload,
    cancelImageUpload,

    // Form validation
    validateForm,
    getValidationErrors,

    // Utility functions
    isFormValid,
    hasUnuploadedFiles,
  };
};
