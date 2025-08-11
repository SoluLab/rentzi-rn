import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Platform,
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
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';
import { useHomeownerSavePropertyDraft, useHomeownerUploadPropertyImages, useHomeownerUploadPropertyVideos } from '@/services/homeownerAddProperty';
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
}

interface MediaValidationErrors {
  photos?: string;
  virtualTour?: string;
}

const MAX_PHOTO_SIZE_MB = 25;
const MAX_VIDEO_SIZE_MB = 100;
const MIN_PHOTO_DIMENSIONS = { width: 800, height: 600 };
const MAX_PHOTOS = 20;

export default function CommercialPropertyMediaUploadScreen() {
  const router = useRouter();
  const { data, updateMediaUploads } = useCommercialPropertyStore();
  
  // API mutation hook for updating property
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Commercial property draft saved successfully with media uploads:",
        response
      );
      // Navigate to documents upload step
      router.push('/add-commercial-details/commercial-property-documents-upload');
    },
    onError: (error) => {
      console.error(
        "Error saving commercial property draft with media uploads:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  // API mutation hook for uploading images
  const uploadImagesMutation = useHomeownerUploadPropertyImages({
    onSuccess: (response) => {
      console.log("Images uploaded successfully:", response);
      // The uploaded URLs will be handled in the upload function
    },
    onError: (error) => {
      console.error("Error uploading images:", error);
      Alert.alert("Error", "Failed to upload images. Please try again.");
    },
  });

  // API mutation hook for uploading videos - using dedicated service (same as images)
  const uploadVideosMutation = useHomeownerUploadPropertyVideos({
    onSuccess: (response) => {
      console.log("Videos uploaded successfully:", response);
      // The uploaded URLs will be handled in the upload function
    },
    onError: (error) => {
      console.error("Error uploading videos:", error);
      Alert.alert("Error", "Failed to upload videos. Please try again.");
    },
  });
  
  const [formData, setFormData] = useState<MediaFormData>(data.mediaUploads);
  const [errors, setErrors] = useState<MediaValidationErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [uploadRetries, setUploadRetries] = useState<{ [key: number]: number }>({});
  const [hasUnuploadedImages, setHasUnuploadedImages] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Update hasUnuploadedImages state whenever photos change
  useEffect(() => {
    const unuploadedCount = formData.photos.filter(photo => !photo.uploadedUrl).length;
    setHasUnuploadedImages(unuploadedCount > 0);
    console.log("Photos updated, unuploaded count:", unuploadedCount);
  }, [formData.photos]);

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
    if (photos.length < 5) {
      return `At least 5 photos are required. You have ${photos.length} photos.`;
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

  const validateForm = (): boolean => {
    const newErrors: MediaValidationErrors = {};

    newErrors.photos = validatePhotos(formData.photos);
    newErrors.virtualTour = validateVirtualTour(formData.virtualTour);

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateFormData = (field: keyof MediaFormData, value: MediaFile[] | string | { uri: string; name: string; size: number; type: string; }) => {
    console.log("📝 updateFormData called:", field, value);
    
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateMediaUploads(newFormData);
    
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
          console.log("🗑️ Virtual tour cleared");
          setIsVideoUploading(false);
        }
      } else {
        // Video object is being added
        console.log("🎬 Video file added");
      }
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

  const uploadImageToServer = async (mediaFile: MediaFile, photoIndex: number) => {
    try {
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for image upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        return;
      }

      // Create file object for upload - ensure proper format for React Native
      const file = {
        uri: mediaFile.uri,
        type: mediaFile.type || 'image/jpeg',
        name: mediaFile.name || `image_${photoIndex}.jpg`,
      };

      console.log("Uploading image:", file);
      console.log("Property ID:", propertyId);
      console.log("Full URL:", BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER + ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_IMAGES(propertyId));
      
      const response = await uploadImagesMutation.mutateAsync({
        propertyId,
        images: [file],
      });

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
          
          // Update the store
          updateMediaUploads(newFormData);
          
          // Check if all images are now uploaded and update state
          const stillUnuploaded = updatedPhotos.filter(photo => !photo.uploadedUrl);
          setHasUnuploadedImages(stillUnuploaded.length > 0);
          
          console.log("Updated photo with uploaded URL:", uploadedFile.url);
          console.log("Remaining unuploaded images:", stillUnuploaded.length);
          
          return newFormData;
        });
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

      // Create file object for upload - ensure proper format for React Native
      const file = {
        uri: videoFile.uri,
        type: videoFile.type || 'video/mp4',
        name: videoFile.name || `video_${Date.now()}.mp4`,
      };

      console.log("🎬 VIDEO UPLOAD DEBUG:");
      console.log("📁 Uploading video file:", file);
      console.log("🏠 Property ID:", propertyId);
      console.log("🌐 Base URL:", BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER);
      console.log("📍 Endpoint:", ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(propertyId));
      console.log("🔗 Full URL:", BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER + ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_VIDEOS(propertyId));
      
      const response = await uploadVideosMutation.mutateAsync({
        propertyId,
        videos: [file],
      });

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
          
          // Update the store
          updateMediaUploads(newFormData);
          
          console.log("Updated video with uploaded URL:", uploadedFile.url);
          
          return newFormData;
        });
        
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

  const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });
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

  const removePhoto = (index: number) => {
    const photoToRemove = formData.photos[index];
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
    
    // Check if there are still unuploaded images after removal
    const stillUnuploaded = newPhotos.filter(photo => !photo.uploadedUrl);
    setHasUnuploadedImages(stillUnuploaded.length > 0);
    
    // TODO: If the photo was uploaded, we could also delete it from server
    // For now, we'll just remove it from local state
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
      console.log("📤 Unuploaded photos details:", unuploadedPhotos.map(p => ({ name: p.name, uri: p.uri?.substring(0, 50) + '...' })));

      if (unuploadedPhotos.length === 0) {
        console.log("✅ All images are already uploaded");
        Alert.alert("Info", "All images are already uploaded");
        setHasUnuploadedImages(false);
        setIsUploading(false);
        return;
      }

      console.log(`🔄 Starting batch upload of ${unuploadedPhotos.length} images`);
      
      // Upload all images one by one
      for (let i = 0; i < unuploadedPhotos.length; i++) {
        const photo = unuploadedPhotos[i];
        const originalIndex = formData.photos.indexOf(photo);
        console.log(`📡 Uploading photo ${i + 1}/${unuploadedPhotos.length}: ${photo.name}`);
        await uploadImageToServer(photo, originalIndex);
      }
      
      setHasUnuploadedImages(false);
      console.log("🎉 All images uploaded successfully!");
      Alert.alert("Success", "All images uploaded successfully!");
      
    } catch (error) {
      console.error("💥 Error uploading batch images:", error);
      Alert.alert("Error", "Some images failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      console.log("🏁 Upload process finished");
    }
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "commercial",
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

    // Transform virtual tour
    if (typeof formData.virtualTour === 'string' && formData.virtualTour.trim()) {
      // For YouTube/Vimeo URLs, store in videos array
      apiData.videos = [{
        key: 'virtual_tour_url',
        url: formData.virtualTour
      }];
      console.log("🎥 Virtual tour URL added:", formData.virtualTour);
    } else if (typeof formData.virtualTour === 'object' && formData.virtualTour.uploadedUrl) {
      // For uploaded video files, only include if successfully uploaded
      apiData.videos = [{
        key: formData.virtualTour.uploadedKey || formData.virtualTour.fileName || formData.virtualTour.name,
        url: formData.virtualTour.uploadedUrl,
      }];
      console.log("🎥 Virtual tour video uploaded:", formData.virtualTour.uploadedUrl);
    }

    console.log("🚀 Final API data being sent to draft:", apiData);
    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Check if there are unuploaded photos
      const unuploadedPhotos = formData.photos.filter(photo => !photo.uploadedUrl);
      const hasUnuploadedVideo = typeof formData.virtualTour === 'object' && formData.virtualTour.uri && !formData.virtualTour.uploadedUrl;
      
      if (unuploadedPhotos.length > 0 || hasUnuploadedVideo) {
        let message = "";
        if (unuploadedPhotos.length > 0) {
          message += `${unuploadedPhotos.length} photos are not yet uploaded to the server. `;
        }
        if (hasUnuploadedVideo) {
          message += "Video is not yet uploaded to the server. ";
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
      updateMediaUploads(formData);
      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      
      console.log("🏠 Commercial Property ID from store before draft API:", propertyId);
      
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      
      const finalPayload = { propertyId, ...apiData };
      console.log("💾 Saving commercial property draft with complete media data:");
      console.log("📋 Property ID:", propertyId);
      console.log("🖼️ Images count:", apiData.images?.length || 0);
      console.log("🎥 Videos count:", apiData.videos?.length || 0);
      console.log("📦 Complete payload:", JSON.stringify(finalPayload, null, 2));
      
      await saveDraftPropertyMutation.mutateAsync(finalPayload);
    } catch (error) {
      console.error("💥 Error in proceedWithDraft:", error);
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: MediaValidationErrors = {};

    newErrors.photos = validatePhotos(formData.photos);
    newErrors.virtualTour = validateVirtualTour(formData.virtualTour);

    // Check if all images are uploaded
    const unuploadedPhotos = formData.photos.filter(photo => !photo.uploadedUrl);
    
    // Check if virtual tour is properly set (either URL or uploaded video)
    const hasValidVirtualTour = 
      (typeof formData.virtualTour === 'string' && formData.virtualTour.trim()) ||
      (typeof formData.virtualTour === 'object' && formData.virtualTour.uploadedUrl);
    
    // Check if virtual tour video is still uploading
    const isVideoUploadingCheck = 
      typeof formData.virtualTour === 'object' && 
      formData.virtualTour.uri && 
      !formData.virtualTour.uploadedUrl &&
      (isVideoUploading || uploadVideosMutation.isPending);

    console.log("🔍 Form validation check:");
    console.log("📸 Photos count:", formData.photos.length);
    console.log("📤 Unuploaded photos:", unuploadedPhotos.length);
    console.log("🎥 Has valid virtual tour:", hasValidVirtualTour);
    console.log("⏳ Is video uploading check:", isVideoUploadingCheck);
    console.log("📱 Is uploading:", isUploading);
    console.log("🎬 Is video uploading:", isVideoUploading);
    console.log("🖼️ Images mutation pending:", uploadImagesMutation.isPending);
    console.log("🎬 Videos mutation pending:", uploadVideosMutation.isPending);

    // Form is valid when:
    // 1. At least 5 photos and all are uploaded
    // 2. Virtual tour is required - either URL or uploaded video
    // 3. No validation errors
    // 4. No uploads in progress
    return (
      formData.photos.length >= 5 &&
      unuploadedPhotos.length === 0 &&
      hasValidVirtualTour &&
      !isVideoUploadingCheck &&
      !isUploading &&
      !uploadImagesMutation.isPending &&
      !uploadVideosMutation.isPending &&
      Object.values(newErrors).every(error => !error)
    );
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Media Upload" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Upload Media
        </Typography>

        {/* Photo Upload Section */}
        <View style={styles.uploadSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Upload Photos *
          </Typography>
          
          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Requirements: Min 5 photos, Max {MAX_PHOTOS} photos • JPG/PNG only • Max {MAX_PHOTO_SIZE_MB}MB per photo • Min {MIN_PHOTO_DIMENSIONS.width}x{MIN_PHOTO_DIMENSIONS.height}px
          </Typography>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showPhotoPickerOptions}
            disabled={isUploading || uploadImagesMutation.isPending || formData.photos.length >= MAX_PHOTOS}
          >
            <Camera size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {isUploading || uploadImagesMutation.isPending ? "Uploading..." : `Add Photos (${formData.photos.length}/${MAX_PHOTOS})`}
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
                      {formatFileSize(photo.size)} • {photo.width}x{photo.height}
                    </Typography>
                    {photo.uploadedUrl ? (
                      <Typography variant="caption" style={styles.uploadedText}>
                        ✓ Uploaded
                      </Typography>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => retryUpload(index)}
                        style={styles.retryButton}
                        disabled={isUploading || uploadImagesMutation.isPending}
                      >
                        <Typography variant="caption" style={styles.retryText}>
                          {(isUploading || uploadImagesMutation.isPending) ? "Uploading..." : "⏳ Waiting"}
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
               disabled={isUploading || uploadImagesMutation.isPending}
             >
               <Upload size={20} color={colors.neutral.white} />
               <Typography variant="body" style={styles.uploadAllButtonText}>
                 {isUploading || uploadImagesMutation.isPending ? "Uploading Images..." : "Upload All Images"}
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
            disabled={isVideoUploading || uploadVideosMutation.isPending || Boolean(typeof formData.virtualTour === 'string' && formData.virtualTour.trim())}
          >
            <Video size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {(isVideoUploading || uploadVideosMutation.isPending) ? "Uploading Video..." : 
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
                   ) : (isVideoUploading || uploadVideosMutation.isPending) ? (
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
                 console.log("Before removal - isPending:", uploadVideosMutation.isPending);
                 
                 // Cancel any ongoing video upload
                 if (uploadVideosMutation.isPending) {
                   console.log("⏹️ Cancelling ongoing video upload");
                   uploadVideosMutation.reset();
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
  photoCount: {
    marginBottom: spacing.md,
    fontWeight: '500',
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
 }); 