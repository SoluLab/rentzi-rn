import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Dimensions,
  ActionSheetIOS,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { Camera, Image as ImageIcon, Video, X, Upload } from 'lucide-react-native';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';
import {
  useHomeownerSavePropertyDraft,
} from '@/services/homeownerAddProperty';
import { useHomeownerFileUpload } from '@/hooks/useHomeownerFileUpload';
import { BASE_URLS, ENDPOINTS } from '@/constants/urls';

interface MediaFile {
    uri: string;
    name: string;
    size: number;
    type: string;
  width?: number;
  height?: number;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  expiresAt?: string;
}

interface VideoFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  expiresAt?: string;
}

interface MediaFormData {
  photos: MediaFile[];
  virtualTour: VideoFile | string;
  video360: VideoFile | null; // Add 360° video field
}

interface MediaValidationErrors {
  photos?: string;
  virtualTour?: string;
  video360?: string; // Add validation for 360° video
}

const MAX_PHOTO_SIZE_MB = 25;
const MAX_VIDEO_SIZE_MB = 100;
const MIN_PHOTO_DIMENSIONS = { width: 800, height: 600 };
const MAX_PHOTOS = 20;

export default function ResidentialPropertyMediaUploadScreen() {
  const router = useRouter();
  const { data, updateMediaUpload } = useResidentialPropertyStore();

  console.log("🎬 MediaUploadScreen rendered with store data:", data.mediaUpload);

  // API mutation hook for updating property
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Residential property draft saved successfully with media uploads:",
        response
      );
      // Navigate to documents upload step
      router.push(
        "/add-residential-details/residential-property-documents-upload"
      );
    },
    onError: (error) => {
      console.error(
        "Error saving residential property draft with media uploads:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });



  // Use the new file upload hook
  const {
    uploadImages,
    uploadImagesLoading,
    uploadImagesError,
    uploadVideos,
    uploadVideosLoading,
    uploadVideosError,
    upload360Videos,
    upload360VideosLoading,
    upload360VideosError,
    cancelVideoUpload,
    cancel360VideoUpload,
    cancelImageUpload,
    validateForm: validateFileForm,
    getValidationErrors,
    isFormValid: isFileFormValid,
    hasUnuploadedFiles,
  } = useHomeownerFileUpload();

  // Cleanup effect to cancel ongoing uploads when component unmounts
  useEffect(() => {
    console.log("🎬 MediaUploadScreen mounted");
    
    return () => {
      // Cancel any ongoing uploads when component unmounts
      if (uploadImagesLoading) {
        console.log("🧹 Cleaning up: Cancelling ongoing image upload");
        cancelImageUpload();
      }
      if (uploadVideosLoading) {
        console.log("🧹 Cleaning up: Cancelling ongoing video upload");
        cancelVideoUpload();
      }
      if (upload360VideosLoading) {
        console.log("🧹 Cleaning up: Cancelling ongoing 360° video upload");
        cancel360VideoUpload();
      }
    };
  }, [uploadImagesLoading, uploadVideosLoading, upload360VideosLoading, cancelImageUpload, cancelVideoUpload, cancel360VideoUpload]);

  const [formData, setFormData] = useState<MediaFormData>(() => {
    // Get existing data from store
    const existingData = data.mediaUpload;
    console.log("🔄 Initializing form data from store:", existingData);
    
    if (existingData) {
      // Properly restore all media data including videos
      return {
        photos: existingData.photos.map(photo => ({
          ...photo,
          width: photo.width || 0,
          height: photo.height || 0,
        })) as MediaFile[],
        virtualTour: existingData.virtualTour || '',
        video360: existingData.video360 || null,
      };
    }
    
    // Default values if no existing data
    return {
      photos: [],
      virtualTour: '',
      video360: null,
    };
  });
  const [errors, setErrors] = useState<MediaValidationErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isVideo360Uploading, setIsVideo360Uploading] = useState(false); // Add state for 360° video upload
  const [uploadRetries, setUploadRetries] = useState<{ [key: number]: number }>({});
  const [hasUnuploadedImages, setHasUnuploadedImages] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Initialize form data from store when component mounts
  useEffect(() => {
    const existingData = data.mediaUpload;
    console.log("🚀 Component mounted, initializing from store:", existingData);
    
    if (existingData) {
      // Ensure we have the latest data from store
      const hasStoredData = 
        existingData.photos.length > 0 || 
        existingData.virtualTour || 
        existingData.video360;
      
      if (hasStoredData) {
        console.log("📥 Restoring data from store on mount");
        setFormData({
          photos: existingData.photos.map(photo => ({
            ...photo,
            width: photo.width || 0,
            height: photo.height || 0,
          })) as MediaFile[],
          virtualTour: existingData.virtualTour || '',
          video360: existingData.video360 || null,
        });
      }
    }
  }, [data.mediaUpload]);

  // Update hasUnuploadedImages state whenever photos change
  useEffect(() => {
    const unuploadedCount = formData.photos.filter(photo => !photo.uploadedUrl).length;
    setHasUnuploadedImages(unuploadedCount > 0);
    console.log("Photos updated, unuploaded count:", unuploadedCount);
  }, [formData.photos]);

  // Sync form data with store data when store changes
  useEffect(() => {
    const existingData = data.mediaUpload;
    console.log("🔄 Store data changed, syncing form data:", existingData);
    
    if (existingData) {
      setFormData(prevFormData => {
        // Only update if there are actual differences to avoid infinite loops
        const hasChanges = 
          JSON.stringify(prevFormData.photos) !== JSON.stringify(existingData.photos) ||
          JSON.stringify(prevFormData.virtualTour) !== JSON.stringify(existingData.virtualTour) ||
          JSON.stringify(prevFormData.video360) !== JSON.stringify(existingData.video360);
        
        if (hasChanges) {
          console.log("🔄 Updating form data from store changes");
          console.log("📸 Photos from store:", existingData.photos.length);
          console.log("🎥 Virtual tour from store:", existingData.virtualTour);
          console.log("📹 360° video from store:", existingData.video360);
          
          return {
            photos: existingData.photos.map(photo => ({
              ...photo,
              width: photo.width || 0,
              height: photo.height || 0,
            })) as MediaFile[],
            virtualTour: existingData.virtualTour || '',
            video360: existingData.video360 || null,
          };
        }
        return prevFormData;
      });
    }
  }, [data.mediaUpload]);

  // Debug effect to log form data changes
  useEffect(() => {
    console.log("📝 Form data changed:", {
      photosCount: formData.photos.length,
      virtualTour: formData.virtualTour,
      video360: formData.video360,
    });
  }, [formData]);

  // Log component unmounting with current form data
  useEffect(() => {
    return () => {
      console.log("🎬 MediaUploadScreen unmounting, current form data:", {
        photosCount: formData.photos.length,
        virtualTour: formData.virtualTour,
        video360: formData.video360,
      });
    };
  }, [formData]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to upload photos.'
        );
      }
    }
  };

  // Validation functions
  const validatePhotos = (photos: MediaFile[]): string | undefined => {
    if (photos.length < 3) {
      return `At least 3 photos are required. You have ${photos.length} photos.`;
    }

    for (const photo of photos) {
      if (photo.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        return `Photo "${photo.name}" exceeds ${MAX_PHOTO_SIZE_MB}MB limit.`;
      }
      
      if (photo.width && photo.height) {
        if (photo.width < MIN_PHOTO_DIMENSIONS.width || photo.height < MIN_PHOTO_DIMENSIONS.height) {
          return `Photo "${photo.name}" dimensions (${photo.width}x${photo.height}) are below minimum requirement (${MIN_PHOTO_DIMENSIONS.width}x${MIN_PHOTO_DIMENSIONS.height}).`;
        }
      }
    }
    
    // Check if all photos are uploaded (optional validation)
    const unuploadedPhotos = photos.filter(photo => !photo.uploadedUrl);
    if (unuploadedPhotos.length > 0) {
      console.warn(`${unuploadedPhotos.length} photos are not yet uploaded to server`);
    }
    
    return undefined;
  };

  const validateVirtualTour = (virtualTour: MediaFormData['virtualTour']): string | undefined => {
    // Check if neither URL nor video is provided (virtual tour is required)
    const hasUrl = typeof virtualTour === 'string' && virtualTour.trim();
    const hasVideo = typeof virtualTour === 'object' && virtualTour.uri;
    
    if (!hasUrl && !hasVideo) {
      return 'Virtual tour is required - provide either a YouTube/Vimeo URL or upload a video file';
    }
    
    if (typeof virtualTour === 'string') {
      if (!virtualTour.trim()) return undefined; // Optional field
      
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;

      if (!youtubeRegex.test(virtualTour) && !vimeoRegex.test(virtualTour)) {
        return 'Please enter a valid YouTube or Vimeo URL';
      }
    } else if (typeof virtualTour === 'object' && virtualTour.uri) {
      if (virtualTour.size && virtualTour.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        return 'Video file must be less than 100MB';
      }
      if (virtualTour.name && !virtualTour.name.toLowerCase().endsWith('.mp4')) {
        return 'Only MP4 files are allowed';
      }
    }
    
    return undefined;
  };

  const validateVideo360 = (video360: MediaFormData['video360']): string | undefined => {
    // 360° video is optional for residential properties, so no validation errors if not provided
    if (!video360) return undefined;
    
    if (video360.size && video360.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      return `360° video file "${video360.name}" exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`;
    }
    if (video360.name && !video360.name.toLowerCase().endsWith('.mp4')) {
      return 'Only MP4 files are allowed for 360° video.';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors = getValidationErrors(formData);
    setErrors(newErrors);
    return validateFileForm(formData);
  };

  const updateFormData = (field: keyof MediaFormData, value: MediaFile[] | string | { uri: string; name: string; size: number; type: string; } | null) => {
    console.log(`🔄 updateFormData called for field: ${field}`, value);
    
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update the store immediately
    console.log("💾 Updating store with new form data:", newFormData);
    updateMediaUpload(newFormData);

    // Clear error when user starts uploading/typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Handle virtual tour field specifically
    if (field === 'virtualTour') {
      if (typeof value === 'string') {
        if (value.trim()) {
          // URL is being added
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
          const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
          
          if (youtubeRegex.test(value) || vimeoRegex.test(value)) {
            console.log("🔄 URL added, clearing any existing video file");
          }
        } else {
          // Empty string means removal
          console.log("🗑️ Virtual tour URL removed");
          setIsVideoUploading(false);
        }
      } else {
        // Video object is being added
        console.log("🎬 Video file added to virtual tour");
      }
    }

    // Handle video360 field specifically
    if (field === 'video360') {
      if (value === null) {
        // 360° video is being removed
        console.log("🗑️ 360° video removed");
        setIsVideo360Uploading(false);
      } else if (typeof value === 'object' && 'uri' in value) {
        // 360° video object is being added
        console.log("🎬 360° video file added");
      }
    }
  };

  const isFormValid = () => {
    return isFileFormValid(formData);
  };

  const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });
  };

  const uploadImageToServer = async (mediaFile: MediaFile, photoIndex: number) => {
    try {
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for image upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        return;
      }

      console.log("Uploading image:", mediaFile);
      console.log("Property ID:", propertyId);

      const response = await uploadImages(propertyId, [mediaFile]);

      console.log("Image upload response:", response);

      // Update the photo with uploaded URL and key
      if (response.data?.uploadedFiles?.[0]) {
        const uploadedFile = response.data.uploadedFiles[0];
        
        // Create a new array to ensure state update
        setFormData(prevFormData => {
          const updatedPhotos = [...prevFormData.photos];
          updatedPhotos[photoIndex] = {
            ...updatedPhotos[photoIndex],
            uploadedUrl: uploadedFile.url,
            uploadedKey: uploadedFile.key,
            originalName: uploadedFile.originalName,
            fileName: uploadedFile.fileName,
            size: uploadedFile.size,
            type: uploadedFile.type,
            mimetype: uploadedFile.mimetype,
            expiresAt: uploadedFile.expiresAt,
          };
          
          const newFormData = { ...prevFormData, photos: updatedPhotos };
          
          // Check if all images are now uploaded and update state
          const stillUnuploaded = updatedPhotos.filter(photo => !photo.uploadedUrl);
          setHasUnuploadedImages(stillUnuploaded.length > 0);
          
          console.log("Updated photo with uploaded URL:", uploadedFile.url);
          console.log("Remaining unuploaded images:", stillUnuploaded.length);
          
          return newFormData;
        });

        // Update the store AFTER state update to avoid render conflicts
        const updatedPhotos = [...formData.photos];
        updatedPhotos[photoIndex] = {
          ...updatedPhotos[photoIndex],
          uploadedUrl: uploadedFile.url,
          uploadedKey: uploadedFile.key,
          originalName: uploadedFile.originalName,
          fileName: uploadedFile.fileName,
          size: uploadedFile.size,
          type: uploadedFile.type,
          mimetype: uploadedFile.mimetype,
          expiresAt: uploadedFile.expiresAt,
        };
        
        const newFormData = { ...formData, photos: updatedPhotos };
        updateMediaUpload(newFormData);
      } else {
        console.warn("No uploaded files in response:", response);
      }
    } catch (error: any) {
      console.error("Error uploading image to server:", error);

      // Show a more specific error message
      if (error?.message === "Network Error") {
        Alert.alert(
          "Upload Failed",
          "Network error occurred. Please check your internet connection and try again."
        );
      } else if (error?.status === 401) {
        Alert.alert(
          "Authentication Error", 
          "Please log in again to continue."
        );
      } else if (error?.status === 413) {
        Alert.alert(
          "File Too Large",
          "The image file is too large. Please select a smaller image."
        );
      } else if (error?.status === 422) {
        Alert.alert(
          "Upload Failed",
          "Invalid image format. Please try again with a different image."
        );
      } else {
        Alert.alert(
          "Upload Failed",
          "Failed to upload image. Please try again."
        );
      }
    }
  };

  const uploadVideoToServer = async (videoFile: VideoFile) => {
    try {
      setIsVideoUploading(true);
      
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for video upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        setIsVideoUploading(false);
        return;
      }

      console.log("🎬 VIDEO UPLOAD DEBUG:");
      console.log("📁 Uploading video file:", videoFile);
      console.log("🏠 Property ID:", propertyId);
      
      const response = await uploadVideos(propertyId, [videoFile]);

      console.log("Video upload response:", response);

      // Update the video with uploaded URL and key
      if (response.data?.uploadedFiles?.[0]) {
        const uploadedFile = response.data.uploadedFiles[0];
        
        // Create a new form data object to ensure state update
        setFormData(prevFormData => {
          const updatedVirtualTour: VideoFile = {
            ...videoFile,
            uploadedUrl: uploadedFile.url,
            uploadedKey: uploadedFile.key,
            originalName: uploadedFile.originalName,
            fileName: uploadedFile.fileName,
            size: uploadedFile.size,
            type: uploadedFile.type,
            mimetype: uploadedFile.mimetype,
            expiresAt: uploadedFile.expiresAt,
          };
          
          const newFormData = { ...prevFormData, virtualTour: updatedVirtualTour };
          
          console.log("Updated video with uploaded URL:", uploadedFile.url);
          
          return newFormData;
        });

        // Update the store AFTER state update to avoid render conflicts
        const updatedVirtualTour: VideoFile = {
          ...videoFile,
          uploadedUrl: uploadedFile.url,
          uploadedKey: uploadedFile.key,
          originalName: uploadedFile.originalName,
          fileName: uploadedFile.fileName,
          size: uploadedFile.size,
          type: uploadedFile.type,
          mimetype: uploadedFile.mimetype,
          expiresAt: uploadedFile.expiresAt,
        };
        
        const newFormData = { ...formData, virtualTour: updatedVirtualTour };
        console.log("💾 Updating store with uploaded virtual tour video:", updatedVirtualTour);
        updateMediaUpload(newFormData);
        
        return videoFile;
      } else {
        console.warn("No uploaded files in response:", response);
        return null;
      }
    } catch (error: any) {
      console.error("Error uploading video to server:", error);
      
      // Show a more specific error message
      if (error?.message === "Network Error") {
        Alert.alert(
          "Upload Failed", 
          "Network error occurred. Please check your internet connection and try again."
        );
      } else if (error?.status === 401) {
        Alert.alert(
          "Authentication Error", 
          "Please log in again to continue."
        );
      } else if (error?.status === 413) {
        Alert.alert(
          "File Too Large", 
          "The video file is too large. Please select a smaller video."
        );
      } else if (error?.status === 422) {
        Alert.alert(
          "Upload Failed", 
          "Invalid video format. Please try again with a different video."
        );
      } else {
        Alert.alert(
          "Upload Failed", 
          "Failed to upload video. Please try again."
        );
      }
      return null;
    } finally {
      setIsVideoUploading(false);
    }
  };

  const showPhotoPickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickPhotosFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Upload Photos',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickPhotosFromLibrary },
        ]
      );
    }
  };

  const showVideoPickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Video', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takeVideo();
          } else if (buttonIndex === 2) {
            pickVideoFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Upload Video',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Video', onPress: takeVideo },
          { text: 'Choose from Library', onPress: pickVideoFromLibrary },
        ]
      );
    }
  };

  const pickPhotosFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - formData.photos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);
        
        // Process all selected images at once
        const newPhotos = await Promise.all(
          result.assets.map(async (asset) => {
            try {
              // Get image dimensions
              const { width, height } = await getImageDimensions(asset.uri);
              
              // Get file size
              const response = await fetch(asset.uri);
              const blob = await response.blob();
              const size = blob.size;
              
              return {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
                size: size,
                type: 'image/jpeg',
                width,
                height,
              };
            } catch (error) {
              console.error('Error processing image:', error);
              return null;
            }
          })
        );

        // Filter out any failed images and add to existing photos
        const validPhotos = newPhotos.filter(photo => photo !== null) as MediaFile[];
        const updatedPhotos = [...formData.photos, ...validPhotos];
        updateFormData('photos', updatedPhotos);

        // Check if there are unuploaded images
        const unuploadedCount = updatedPhotos.filter(photo => !photo.uploadedUrl).length;
        setHasUnuploadedImages(unuploadedCount > 0);
        console.log("Added photos, unuploaded count:", unuploadedCount);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);
      
      // Get image dimensions
      const { width, height } = await getImageDimensions(asset.uri);
      
      // Get file size
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const size = blob.size;
      
      const mediaFile: MediaFile = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: size,
        type: 'image/jpeg',
        width,
        height,
      };

      // Add to form data first
      const newPhotos = [...formData.photos, mediaFile];
      updateFormData('photos', newPhotos);

      // Check if there are unuploaded images
      const unuploadedCount = newPhotos.filter(photo => !photo.uploadedUrl).length;
      setHasUnuploadedImages(unuploadedCount > 0);
      console.log("Added single photo, unuploaded count:", unuploadedCount);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const photoToRemove = formData.photos[index];
    
    // Cancel any ongoing image upload if this photo is being uploaded
    if (uploadImagesLoading && !photoToRemove.uploadedUrl) {
      console.log("⏹️ Cancelling ongoing image upload for removed photo");
      cancelImageUpload();
    }
    
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
    
    // Check if there are still unuploaded images after removal
    const stillUnuploaded = newPhotos.filter(photo => !photo.uploadedUrl);
    setHasUnuploadedImages(stillUnuploaded.length > 0);
    
    console.log("Removed photo:", photoToRemove);
    console.log("Remaining unuploaded images after removal:", stillUnuploaded.length);
  };

  const retryUpload = async (photoIndex: number) => {
    const photo = formData.photos[photoIndex];
    if (photo && !photo.uploadedUrl) {
      console.log(`Retrying upload for photo ${photoIndex}:`, photo.name);
      await uploadImageToServer(photo, photoIndex);
    }
  };

  const retryVideoUpload = async () => {
    const virtualTour = formData.virtualTour;
    if (typeof virtualTour === 'object' && virtualTour.uri && !virtualTour.uploadedUrl) {
      console.log(`Retrying upload for video:`, virtualTour.name);
      await uploadVideoToServer(virtualTour);
    }
  };

  const retryVideo360Upload = async () => {
    const video360 = formData.video360;
    if (video360 && !video360.uploadedUrl) {
      console.log(`Retrying upload for 360° video:`, video360.name);
      await uploadVideo360ToServer(video360);
    }
  };

  const uploadVideo360ToServer = async (videoFile: VideoFile) => {
    try {
      setIsVideo360Uploading(true);
      
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for 360° video upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        setIsVideo360Uploading(false);
        return;
      }

      const response = await upload360Videos(propertyId, [videoFile]);

      console.log("360° video upload response:", response);

      // Update the video with uploaded URL and key
      if (response.data?.uploadedFiles?.[0]) {
        const uploadedFile = response.data.uploadedFiles[0];
        
        // Create a new form data object to ensure state update
        setFormData(prevFormData => {
          const updatedVideo360: VideoFile = {
            ...videoFile,
            uploadedUrl: uploadedFile.url,
            uploadedKey: uploadedFile.key,
            originalName: uploadedFile.originalName,
            fileName: uploadedFile.fileName,
            size: uploadedFile.size,
            type: uploadedFile.type,
            mimetype: uploadedFile.mimetype,
            expiresAt: uploadedFile.expiresAt,
          };
          
          const newFormData = { ...prevFormData, video360: updatedVideo360 };
          
          console.log("Updated 360° video with uploaded URL:", uploadedFile.url);
          
          return newFormData;
        });

        // Update the store AFTER state update to avoid render conflicts
        const updatedVideo360: VideoFile = {
          ...videoFile,
          uploadedUrl: uploadedFile.url,
          uploadedKey: uploadedFile.key,
          originalName: uploadedFile.originalName,
          fileName: uploadedFile.fileName,
          size: uploadedFile.size,
          type: uploadedFile.type,
          mimetype: uploadedFile.mimetype,
          expiresAt: uploadedFile.expiresAt,
        };
        
        const newFormData = { ...formData, video360: updatedVideo360 };
        console.log("💾 Updating store with uploaded 360° video:", updatedVideo360);
        updateMediaUpload(newFormData);
        
        return videoFile;
      } else {
        console.warn("No uploaded files in response:", response);
        return null;
      }
    } catch (error: any) {
      console.error("Error uploading 360° video to server:", error);
      
      // Show a more specific error message
      if (error?.message === "Network Error") {
        Alert.alert(
          "Upload Failed", 
          "Network error occurred. Please check your internet connection and try again."
        );
      } else if (error?.status === 401) {
        Alert.alert(
          "Authentication Error", 
          "Please log in again to continue."
        );
      } else if (error?.status === 413) {
        Alert.alert(
          "File Too Large", 
          "The 360° video file is too large. Please select a smaller video."
        );
      } else if (error?.status === 422) {
        Alert.alert(
          "Upload Failed", 
          "Invalid 360° video format. Please try again with a different video."
        );
      } else {
        Alert.alert(
          "Upload Failed", 
          "Failed to upload 360° video. Please try again."
        );
      }
      return null;
    } finally {
      setIsVideo360Uploading(false);
    }
  };

  const uploadAllImages = async () => {
    console.log("🚀 Upload All Images button clicked!");
    
    if (!formData.photos || formData.photos.length === 0) {
      console.log("❌ No photos to upload");
      Alert.alert("Error", "No images to upload");
      return;
    }

    console.log("📸 Total photos in formData:", formData.photos.length);
    setIsUploading(true);
    
    try {
      const unuploadedPhotos = formData.photos.filter(photo => !photo.uploadedUrl);

      console.log("📤 Unuploaded photos found:", unuploadedPhotos.length);

      if (unuploadedPhotos.length === 0) {
        console.log("✅ All images are already uploaded");
        Alert.alert("Info", "All images are already uploaded");
        setHasUnuploadedImages(false);
        setIsUploading(false);
        return;
      }

      console.log(`🔄 Starting batch upload of ${unuploadedPhotos.length} images`);
      
      let successfulUploads = 0;
      let failedUploads = 0;
      
      // Upload all images one by one
      for (let i = 0; i < unuploadedPhotos.length; i++) {
        const photo = unuploadedPhotos[i];
        const originalIndex = formData.photos.indexOf(photo);
        console.log(`📡 Uploading photo ${i + 1}/${unuploadedPhotos.length}: ${photo.name}`);
        
        try {
          await uploadImageToServer(photo, originalIndex);
          successfulUploads++;
        } catch (error) {
          console.error(`❌ Failed to upload photo ${photo.name}:`, error);
          failedUploads++;
        }
      }
      
      // Check if all uploads were successful
      if (failedUploads === 0 && successfulUploads > 0) {
        setHasUnuploadedImages(false);
        console.log("🎉 All images uploaded successfully!");
        Alert.alert("Success", `All ${successfulUploads} images uploaded successfully!`);
      } else if (successfulUploads > 0 && failedUploads > 0) {
        console.log(`⚠️ Partial success: ${successfulUploads} uploaded, ${failedUploads} failed`);
        Alert.alert("Partial Success", `${successfulUploads} images uploaded successfully, ${failedUploads} failed. Please retry failed uploads.`);
      } else if (successfulUploads === 0) {
        console.log("❌ No images were uploaded successfully");
        Alert.alert("Upload Failed", "No images were uploaded successfully. Please check your connection and try again.");
      }
      
    } catch (error) {
      console.error("💥 Error uploading batch images:", error);
      Alert.alert("Error", "Some images failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      console.log("🏁 Upload process finished");
    }
  };

  const takeVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;
        if (size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `Video file size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
          return;
        }
        const newVirtualTour: VideoFile = {
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: size,
          type: 'video/mp4',
        };
        
        // Clear any existing URL when video is added
        console.log("🔄 Video added, clearing any existing URL");
        
        // Add to form data first
        updateFormData('virtualTour', newVirtualTour);

        // Upload video immediately
        await uploadVideoToServer(newVirtualTour);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take video. Please try again.');
    }
  };

  const takeVideo360 = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;
        if (size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `360° video file size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
          return;
        }
        const newVideo360: VideoFile = {
          uri: asset.uri,
          name: asset.fileName || `video360_${Date.now()}.mp4`,
          size: size,
          type: 'video/mp4',
        };
        
        // Add to form data first
        updateFormData('video360', newVideo360);

        // Upload video immediately
        await uploadVideo360ToServer(newVideo360);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take 360° video. Please try again.');
    }
  };

  const pickVideoFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;
        if (size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `Video file size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
          return;
        }
        const newVirtualTour: VideoFile = {
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: size,
          type: 'video/mp4',
        };
        
        // Clear any existing URL when video is added
        console.log("🔄 Video added, clearing any existing URL");
        
        // Add to form data first
        updateFormData('virtualTour', newVirtualTour);

        // Upload video immediately
        await uploadVideoToServer(newVirtualTour);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file. Please try again.');
    }
  };

  const pickVideo360FromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;
        if (size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `360° video file size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
          return;
        }
        const newVideo360: VideoFile = {
          uri: asset.uri,
          name: asset.fileName || `video360_${Date.now()}.mp4`,
          size: size,
          type: 'video/mp4',
        };
        
        // Add to form data first
        updateFormData('video360', newVideo360);

        // Upload video immediately
        await uploadVideo360ToServer(newVideo360);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick 360° video file. Please try again.');
    }
  };

  const showVideo360PickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take 360° Video', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takeVideo360();
          } else if (buttonIndex === 2) {
            pickVideo360FromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Upload 360° Video',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take 360° Video', onPress: takeVideo360 },
          { text: 'Choose from Library', onPress: pickVideo360FromLibrary },
        ]
      );
    }
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "residential",
    };

    // Transform photos to match schema format - only include successfully uploaded photos
    if (formData.photos.length > 0) {
      const uploadedPhotos = formData.photos.filter(photo => photo.uploadedUrl);
      
      console.log("📸 Total photos in formData:", formData.photos.length);
      console.log("📤 Successfully uploaded photos:", uploadedPhotos.length);
      console.log("🔗 Uploaded photo URLs:", uploadedPhotos.map(photo => photo.uploadedUrl));
      
      apiData.images = uploadedPhotos.map(photo => ({
        key: photo.uploadedKey || photo.fileName || photo.name,
        url: photo.uploadedUrl,
      }));
      
      console.log("📝 API images array:", apiData.images);
    }

    // Transform virtual tour - goes to videos array
    if (typeof formData.virtualTour === 'string' && formData.virtualTour.trim()) {
      // For YouTube/Vimeo URLs, store in videos array
      apiData.videos = [{
        key: 'virtual_tour_url',
        url: formData.virtualTour
      }];
      console.log("🎥 Virtual tour URL added to videos:", formData.virtualTour);
    } else if (typeof formData.virtualTour === 'object' && formData.virtualTour.uploadedUrl) {
      // For uploaded video files, only include if successfully uploaded
      apiData.videos = [{
        key: formData.virtualTour.uploadedKey || formData.virtualTour.fileName || formData.virtualTour.name,
        url: formData.virtualTour.uploadedUrl,
      }];
      console.log("🎥 Virtual tour video uploaded to videos:", formData.virtualTour.uploadedUrl);
    }

    // Transform 360° video - goes to videos360 array (separate from regular videos)
    if (formData.video360 && formData.video360.uploadedUrl) {
      apiData.videos360 = [{
        key: formData.video360.uploadedKey || formData.video360.fileName || formData.video360.name,
        url: formData.video360.uploadedUrl,
      }];
      console.log("🎥 360° video uploaded to videos360:", formData.video360.uploadedUrl);
    }

    console.log("🚀 Final API data being sent to draft:", apiData);
    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
     
      if (hasUnuploadedFiles(formData)) {
        let message = "";
        const unuploadedPhotos = formData.photos.filter(photo => !photo.uploadedUrl);
        const hasUnuploadedVideo = typeof formData.virtualTour === 'object' && formData.virtualTour.uri && !formData.virtualTour.uploadedUrl;
        const hasUnuploadedVideo360 = formData.video360 && formData.video360.uri && !formData.video360.uploadedUrl;
        
        if (unuploadedPhotos.length > 0) {
          message += `${unuploadedPhotos.length} photos are not yet uploaded to the server. `;
        }
        if (hasUnuploadedVideo) {
          message += "Virtual tour video is not yet uploaded to the server. ";
        }
        if (hasUnuploadedVideo360) {
          message += "360° video is not yet uploaded to the server. ";
        }
        message += "You can continue, but the media may not be saved properly.";

        Alert.alert(
          "Unuploaded Media",
          message,
          [
          { text: "Continue Anyway", onPress: () => proceedWithDraft() },
            { text: "Upload First", style: "cancel" }
          ]
        );
      } else {
        await proceedWithDraft();
      }
    }
  };

  const proceedWithDraft = async () => {
    try {
      updateMediaUpload(formData);
      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      
      console.log("🏠 Residential Property ID from store before draft API:", propertyId);
      
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      
      const finalPayload = { propertyId, ...apiData };
      console.log("💾 Saving residential property draft with complete media data:");
      console.log("📋 Property ID:", propertyId);
      console.log("🖼️ Images count:", apiData.images?.length || 0);
      console.log("🎥 Videos count:", apiData.videos?.length || 0);
      console.log("📦 Complete payload:", JSON.stringify(finalPayload, null, 2));
      
      await saveDraftPropertyMutation.mutateAsync(finalPayload);
    } catch (error) {
      console.error("💥 Error in proceedWithDraft:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateVideoTitle = (title: string): string => {
    // If the title is short enough, return as is
    if (title.length <= 15) {
      return title;
    }
    
    // For long titles, show first 12 characters + ... + last 8 characters
    const firstPart = title.slice(0, 12);
    const lastPart = title.slice(-8);
    return `${firstPart}...${lastPart}`;
  };

  // Debug function to check store state
  const debugStoreState = () => {
    console.log("🔍 DEBUG: Current store state:", data.mediaUpload);
    console.log("🔍 DEBUG: Current form data:", formData);
    console.log("🔍 DEBUG: Store photos count:", data.mediaUpload?.photos?.length || 0);
    console.log("🔍 DEBUG: Store virtual tour:", data.mediaUpload?.virtualTour);
    console.log("🔍 DEBUG: Store 360° video:", data.mediaUpload?.video360);
    
    Alert.alert(
      "Store Debug Info",
      `Photos: ${data.mediaUpload?.photos?.length || 0}\n` +
      `Virtual Tour: ${data.mediaUpload?.virtualTour ? 'Present' : 'None'}\n` +
      `360° Video: ${data.mediaUpload?.video360 ? 'Present' : 'None'}`
    );
  };

  // Force refresh store data
  const forceRefreshStore = () => {
    console.log("🔄 Force refreshing store data");
    const currentStoreData = data.mediaUpload;
    console.log("📥 Current store data:", currentStoreData);
    
    if (currentStoreData) {
      setFormData({
        photos: currentStoreData.photos.map(photo => ({
          ...photo,
          width: photo.width || 0,
          height: photo.height || 0,
        })) as MediaFile[],
        virtualTour: currentStoreData.virtualTour || '',
        video360: currentStoreData.video360 || null,
      });
      
      Alert.alert("Store Refreshed", "Form data has been refreshed from store");
    } else {
      Alert.alert("No Store Data", "No data found in store");
    }
  };

    return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Media Upload" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
     
        {/* Photo Upload Section */}
        <View style={styles.uploadSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Upload Photos *
          </Typography>
          
          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Requirements: Min 3 photos, Max {MAX_PHOTOS} photos • JPG/PNG only • Max {MAX_PHOTO_SIZE_MB}MB per photo • Min {MIN_PHOTO_DIMENSIONS.width}x{MIN_PHOTO_DIMENSIONS.height}px
          </Typography>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showPhotoPickerOptions}
            disabled={isUploading || uploadImagesLoading || formData.photos.length >= MAX_PHOTOS}
          >
            <Camera size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {isUploading || uploadImagesLoading ? "Uploading..." : `Add Photos (${formData.photos.length}/${MAX_PHOTOS})`}
            </Typography>
          </TouchableOpacity>

          {errors.photos && (
            <Typography variant="caption" color="error" style={styles.errorText}>
              {errors.photos}
            </Typography>
          )}

          {/* Photo Grid */}
          {formData.photos.length > 0 && (
      <View style={styles.photoGrid}>
        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
            <TouchableOpacity
                    style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
                    <X size={16} color={colors.neutral.white} />
            </TouchableOpacity>
            <View style={styles.photoInfo}>
              <Typography variant="caption" style={styles.photoName}>
                {photo.name}
              </Typography>
              <Typography variant="caption" style={styles.photoSize}>
                      {formatFileSize(photo.size)} • {photo.width || 0}x{photo.height || 0}
              </Typography>
              {photo.uploadedUrl ? (
                      <Typography variant="caption" style={styles.uploadedText}>
                  ✓ Uploaded
                </Typography>
              ) : (
                      <TouchableOpacity 
                        onPress={() => retryUpload(index)}
                        style={styles.retryButton}
                        disabled={isUploading || uploadImagesLoading}
                      >
                        <Typography variant="caption" style={styles.retryText}>
                          {(isUploading || uploadImagesLoading) ? "Uploading..." : "⏳ Waiting"}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
           )}

           {/* Upload All Images Button - Show only when there are unuploaded images */}
           {hasUnuploadedImages && formData.photos.length > 0 && (
          <TouchableOpacity
               style={styles.uploadAllButton}
               onPress={uploadAllImages}
               disabled={isUploading || uploadImagesLoading}
             >
               <Upload size={20} color={colors.neutral.white} />
               <Typography variant="body" style={styles.uploadAllButtonText}>
                 {isUploading || uploadImagesLoading ? "Uploading Images..." : "Upload All Images"}
            </Typography>
          </TouchableOpacity>
          )}
        </View>

        {/* Virtual Tour Section */}
        <View style={styles.uploadSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Virtual Tour or Video Walkthrough *
          </Typography>

          <Input
            label="YouTube/Vimeo URL"
            value={typeof formData.virtualTour === 'string' ? formData.virtualTour : ''}
            onChangeText={(value) => updateFormData('virtualTour', value)}
            placeholder="https://youtube.com/watch?v=..."
            error={errors.virtualTour}
            editable={!(typeof formData.virtualTour === 'object' && formData.virtualTour.uri)}
            style={typeof formData.virtualTour === 'object' && formData.virtualTour.uri ? { opacity: 0.5 } : {}}
          />

          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Required: Enter YouTube or Vimeo URL OR upload a video file (only one option can be selected)
          </Typography>

          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" color="secondary" style={styles.orText}>
              OR
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.uploadButton, 
              (typeof formData.virtualTour === 'string' && formData.virtualTour.trim()) ? { opacity: 0.5 } : {}
            ]}
            onPress={showVideoPickerOptions}
            disabled={isVideoUploading || uploadVideosLoading || Boolean(typeof formData.virtualTour === 'string' && formData.virtualTour.trim())}
          >
            <Video size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {(isVideoUploading || uploadVideosLoading) ? "Uploading Video..." : 
               (typeof formData.virtualTour === 'string' && formData.virtualTour.trim()) ? "URL Already Added" : 
               "Upload Video File"}
            </Typography>
          </TouchableOpacity>

          {/* Show selected video info if present */}
          {typeof formData.virtualTour === 'object' && formData.virtualTour.uri && (
              <View style={styles.virtualTourDisplay}>
                <View style={styles.virtualTourInfo}>
                <Video size={20} color={colors.primary.gold} />
                  <View style={styles.videoTextContainer}>
                    <Typography variant="body" style={styles.virtualTourText} numberOfLines={2}>
                      {truncateVideoTitle(formData.virtualTour.name)}
                    </Typography>
                    <Typography variant="caption" style={styles.videoSizeText}>
                      {formatFileSize(formData.virtualTour.size)}
                    </Typography>
                  </View>
                  <View style={styles.videoStatusContainer}>
                    {formData.virtualTour.uploadedUrl ? (
                      <Typography variant="caption" style={styles.uploadedText}>
                        ✓ Uploaded
                      </Typography>
                    ) : (isVideoUploading || uploadVideosLoading) ? (
                      <Typography variant="caption" style={styles.uploadingText}>
                        ⏳ Uploading...
                      </Typography>
                    ) : (
                      <TouchableOpacity onPress={retryVideoUpload}>
                        <Typography variant="caption" style={styles.retryText}>
                          ↻ Retry
                        </Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              <TouchableOpacity onPress={() => {
                console.log("🗑️ Removing video file");
                console.log("Before removal - virtualTour:", formData.virtualTour);
                console.log("Before removal - isPending:", uploadVideosLoading);
                
                // Cancel any ongoing video upload
                if (uploadVideosLoading) {
                  console.log("⏹️ Cancelling ongoing video upload");
                  cancelVideoUpload();
                }
                
                setIsVideoUploading(false);
                updateFormData('virtualTour', '');
                console.log("After removal - should be empty string");
              }}>
                <X size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
          )}
        </View>

        {/* 360° Video Section */}
        <View style={styles.uploadSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            360° Video Upload (Optional)
          </Typography>

          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Upload a 360° video for immersive property viewing experience • MP4 only • Max {MAX_VIDEO_SIZE_MB}MB
          </Typography>

          <TouchableOpacity
            style={[
              styles.uploadButton, 
              (formData.video360 && formData.video360.uri) ? { opacity: 0.5 } : {}
            ]}
            onPress={showVideo360PickerOptions}
            disabled={isVideo360Uploading || upload360VideosLoading || Boolean(formData.video360 && formData.video360.uri)}
          >
            <Video size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {(isVideo360Uploading || upload360VideosLoading) ? "Uploading 360° Video..." : 
               (formData.video360 && formData.video360.uri) ? "360° Video Already Added" : 
               "Upload 360° Video"}
            </Typography>
          </TouchableOpacity>

          {/* Show selected 360° video info if present */}
          {formData.video360 && formData.video360.uri && (
              <View style={styles.virtualTourDisplay}>
                <View style={styles.virtualTourInfo}>
                <Video size={20} color={colors.primary.gold} />
                  <View style={styles.videoTextContainer}>
                    <Typography variant="body" style={styles.virtualTourText} numberOfLines={2}>
                      {truncateVideoTitle(formData.video360.name)} (360°)
                    </Typography>
                    <Typography variant="caption" style={styles.videoSizeText}>
                      {formatFileSize(formData.video360.size)}
                    </Typography>
                  </View>
                  <View style={styles.videoStatusContainer}>
                    {formData.video360.uploadedUrl ? (
                      <Typography variant="caption" style={styles.uploadedText}>
                        ✓ Uploaded
                      </Typography>
                    ) : (isVideo360Uploading || upload360VideosLoading) ? (
                      <Typography variant="caption" style={styles.uploadingText}>
                        ⏳ Uploading...
                      </Typography>
                    ) : (
                      <TouchableOpacity onPress={retryVideo360Upload}>
                        <Typography variant="caption" style={styles.retryText}>
                          ↻ Retry
                        </Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              <TouchableOpacity onPress={() => {
                console.log("🗑️ Removing 360° video file");
                console.log("Before removal - video360:", formData.video360);
                console.log("Before removal - isPending:", upload360VideosLoading);
                
                // Cancel any ongoing video upload
                if (upload360VideosLoading) {
                  console.log("⏹️ Cancelling ongoing 360° video upload");
                  cancel360VideoUpload();
                }
                
                setIsVideo360Uploading(false);
                updateFormData('video360', null);
                console.log("After removal - should be null");
              }}>
                <X size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
          )}
        </View>

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: spacing.xl,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.primary.gold,
    borderStyle: 'dashed',
    borderRadius: radius.input,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  uploadButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary.gold,
    fontWeight: '500',
  },
  validationText: {
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  photoItem: {
    width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: radius.input,
    backgroundColor: colors.background.secondary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.status.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.xs,
    borderBottomLeftRadius: radius.input,
    borderBottomRightRadius: radius.input,
  },
  photoName: {
    color: colors.neutral.white,
    fontSize: 10,
  },
  photoSize: {
    color: colors.neutral.white,
    fontSize: 9,
    opacity: 0.8,
  },
  uploadedText: {
    color: colors.status.success,
    fontSize: 10,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 2,
  },
  retryText: {
    color: colors.primary.gold,
    fontSize: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  uploadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    elevation: 2,
    shadowColor: colors.primary.gold,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadAllButtonText: {
    marginLeft: spacing.sm,
    color: colors.neutral.white,
    fontWeight: '600',
    fontSize: 16,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  orText: {
    marginHorizontal: spacing.md,
    color: colors.text.secondary,
  },
  nextButton: {
    marginTop: spacing.xl,
  },
  virtualTourDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  virtualTourInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoTextContainer: {
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  virtualTourText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  videoSizeText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  videoStatusContainer: {
    alignItems: 'flex-end',
  },
  uploadingText: {
    color: colors.primary.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButtonText: {
    color: colors.primary.gold,
    fontWeight: '600',
  },
});