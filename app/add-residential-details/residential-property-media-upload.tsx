import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  ActionSheetIOS,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';
import { useHomeownerSavePropertyDraft, useHomeownerUploadPropertyImages, useHomeownerUploadPropertyFiles } from '@/services/homeownerAddProperty';
import { BASE_URLS, ENDPOINTS } from '@/constants/urls';

interface MediaUploadData {
  photos: Array<{
    uri: string;
    name: string;
    size: number;
    width: number;
    height: number;
    type: string;
    uploadedUrl?: string; // Add uploaded URL field
    uploadedKey?: string; // Add uploaded key field
  }>;
  virtualTour: {
    type: 'link' | 'file';
    value: string;
    name?: string;
    size?: number;
    uploadedUrl?: string; // Add uploaded URL field
    uploadedKey?: string; // Add uploaded key field
  };
}

interface MediaUploadErrors {
  photos?: string;
  virtualTour?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ResidentialPropertyMediaUploadScreen() {
  const router = useRouter();
  const { data, updateMediaUpload, resetStore } = useResidentialPropertyStore();

  // API mutation hook for updating property draft
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Residential property draft saved successfully with media uploads:",
        response
      );
      // Navigate to documents upload step
      router.push('/add-residential-details/residential-property-documents-upload');
    },
    onError: (error) => {
      console.error(
        "Error saving residential property draft with media uploads:",
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

  // API mutation hook for uploading videos
  const uploadVideosMutation = useHomeownerUploadPropertyFiles({
    onSuccess: (response) => {
      console.log("Videos uploaded successfully:", response);
      // The uploaded URLs will be handled in the upload function
    },
    onError: (error) => {
      console.error("Error uploading videos:", error);
      Alert.alert("Error", "Failed to upload videos. Please try again.");
    },
  });

  // Reset store if property was already submitted
  React.useEffect(() => {
    if (data.isSubmitted) {
      resetStore();
    }
  }, []);

  const [formData, setFormData] = useState<MediaUploadData>(data.mediaUpload || {
    photos: [],
    virtualTour: {
      type: 'link',
      value: '',
    },
  });
  const [errors, setErrors] = useState<MediaUploadErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  // Validation functions
  const validatePhotos = (photos: MediaUploadData['photos']): string | undefined => {
    if (photos.length < 3) {
      return 'Minimum 3 photos are required';
    }
    
    for (const photo of photos) {
      if (photo.size > 25 * 1024 * 1024) {
        return 'Each photo must be less than 25MB';
      }
      if (photo.width < 800 || photo.height < 600) {
        return 'Each photo must be at least 800x600 pixels';
      }
      // More flexible file type checking
      const fileType = photo.type?.toLowerCase() || '';
      const fileName = photo.name?.toLowerCase() || '';
      const isJPEG = fileType.includes('jpeg') || fileType.includes('jpg') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
      const isPNG = fileType.includes('png') || fileName.endsWith('.png');
      
      if (!isJPEG && !isPNG) {
        console.log('Invalid photo type:', { type: photo.type, name: photo.name, fileType, fileName });
        return 'Only JPG and PNG files are allowed';
      }
    }
    return undefined;
  };

  const validateVirtualTour = (virtualTour: MediaUploadData['virtualTour']): string | undefined => {
    // Check if either link or file is provided
    if (!virtualTour.value || !virtualTour.value.trim()) {
      return 'Please provide either a YouTube/Vimeo URL or upload a video file'; // Mandatory field
    }

    if (virtualTour.type === 'link') {
      const url = virtualTour.value.trim();
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
      
      if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
        return 'Please enter a valid YouTube or Vimeo URL';
      }
    } else if (virtualTour.type === 'file') {
      if (virtualTour.size && virtualTour.size > 100 * 1024 * 1024) {
        return 'Video file must be less than 100MB';
      }
      if (virtualTour.name && !virtualTour.name.toLowerCase().endsWith('.mp4')) {
        return 'Only MP4 files are allowed';
      }
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: MediaUploadErrors = {};

    newErrors.photos = validatePhotos(formData.photos);
    newErrors.virtualTour = validateVirtualTour(formData.virtualTour);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const updateFormData = (field: keyof MediaUploadData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateMediaUpload(newFormData);
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const isFormValid = () => {
    // Check if minimum photos requirement is met
    const hasMinimumPhotos = formData.photos.length >= 3;
    
    // Check for validation errors
    const photoError = validatePhotos(formData.photos);
    const virtualTourError = validateVirtualTour(formData.virtualTour);
    
    // Debug logging
    console.log('Form Validation Debug:', {
      photosCount: formData.photos.length,
      hasMinimumPhotos,
      photoError,
      virtualTourError,
      virtualTourData: formData.virtualTour,
      isFormValid: hasMinimumPhotos && !photoError && !virtualTourError
    });
    
    // Form is valid if we have minimum photos and no validation errors
    return hasMinimumPhotos && !photoError && !virtualTourError;
  };

  const transformPhotosToFiles = (): any[] => {
    return formData.photos.map(photo => {
      // Create a file object compatible with React Native and FormData
      const file = {
        uri: photo.uri,
        name: photo.name,
        type: photo.type || 'image/jpeg',
        size: photo.size,
      };
      
      return file;
    });
  };

  const uploadImageToServer = async (photo: MediaUploadData['photos'][0], photoIndex: number) => {
    try {
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for image upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        return;
      }

      // Create file object for upload - ensure proper format for React Native
      const file = {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.name || `image_${photoIndex}.jpg`,
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
      if (response.data?.uploadedImages?.[0]) {
        const uploadedImage = response.data.uploadedImages[0];
        const updatedPhotos = [...formData.photos];
        updatedPhotos[photoIndex] = {
          ...updatedPhotos[photoIndex],
          uploadedUrl: uploadedImage.url,
          uploadedKey: uploadedImage.key,
        };
        updateFormData('photos', updatedPhotos);
        console.log("Updated photo with uploaded URL:", uploadedImage.url);
      } else {
        console.warn("No uploaded images in response:", response);
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

  // Photo upload functions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
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
            pickImages();
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
          { text: 'Choose from Library', onPress: pickImages },
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
            pickVideo();
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
          { text: 'Choose from Library', onPress: pickVideo },
        ]
      );
    }
  };

  const pickImages = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
          type: asset.type || 'image/jpeg',
        }));

        const updatedPhotos = [...formData.photos, ...newPhotos];
        updateFormData('photos', updatedPhotos);

        // Upload all new images
        const startIndex = formData.photos.length;
        for (let i = 0; i < newPhotos.length; i++) {
          await uploadImageToServer(newPhotos[i], startIndex + i);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant permission to access your camera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newPhoto = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
          type: asset.type || 'image/jpeg',
        };

        const updatedPhotos = [...formData.photos, newPhoto];
        updateFormData('photos', updatedPhotos);

        // Upload image immediately
        await uploadImageToServer(newPhoto, updatedPhotos.length - 1);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', updatedPhotos);
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
    if (virtualTour.type === 'file' && virtualTour.value && !virtualTour.uploadedUrl) {
      console.log(`Retrying upload for video:`, virtualTour.name);
      await uploadVideoToServer(virtualTour);
    }
  };

  // Virtual tour functions
  const takeVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newVirtualTour = {
          type: 'file' as const,
          value: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: asset.fileSize || 0,
        };
        updateFormData('virtualTour', newVirtualTour);

        // Upload video immediately
        await uploadVideoToServer(newVirtualTour);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take video. Please try again.');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newVirtualTour = {
          type: 'file' as const,
          value: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: asset.fileSize || 0,
        };
        updateFormData('virtualTour', newVirtualTour);

        // Upload video immediately
        await uploadVideoToServer(newVirtualTour);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file. Please try again.');
    }
  };

  const updateVirtualTourLink = (link: string) => {
    const newVirtualTour = {
      type: 'link' as const,
      value: link,
    };
    updateFormData('virtualTour', newVirtualTour);
  };

  const removeVirtualTour = () => {
    const newVirtualTour = {
      type: 'link' as const,
      value: '',
    };
    updateFormData('virtualTour', newVirtualTour);
  };

  const uploadVideoToServer = async (videoFile: MediaUploadData['virtualTour']) => {
    try {
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for video upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        return;
      }

      // Create file object for upload - ensure proper format for React Native
      const file = {
        uri: videoFile.value,
        type: 'video/mp4',
        name: videoFile.name || `video_${Date.now()}.mp4`,
      };

      console.log("Uploading video:", file);
      console.log("Property ID:", propertyId);
      console.log("Full URL:", BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER + ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_FILES(propertyId));
      
      const response = await uploadVideosMutation.mutateAsync({
        propertyId,
        files: [file],
        fileType: 'video',
      });

      console.log("Video upload response:", response);

      // Update the video with uploaded URL and key
      if (response.data?.uploadedFiles?.[0]) {
        const uploadedVideo = response.data.uploadedFiles[0];
        const updatedVirtualTour = {
          ...videoFile,
          uploadedUrl: uploadedVideo.url,
          uploadedKey: uploadedVideo.key,
        };
        updateFormData('virtualTour', updatedVirtualTour);
        console.log("Updated video with uploaded URL:", uploadedVideo.url);
      } else {
        console.warn("No uploaded videos in response:", response);
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
    }
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "residential",
    };

    // Transform photos to match schema format
    if (formData.photos.length > 0) {
      apiData.images = formData.photos.map((photo, index) => ({
        key: photo.uploadedKey || `photo_${index}`, // Use uploaded key if available
        url: photo.uploadedUrl || photo.uri, // Use uploadedUrl if available
      }));
    }

    // Transform virtual tour
    if (formData.virtualTour.type === 'link' && formData.virtualTour.value.trim()) {
      // For YouTube/Vimeo URLs, we might store them differently
      apiData.virtualTourUrl = formData.virtualTour.value;
    } else if (formData.virtualTour.type === 'file' && formData.virtualTour.value) {
      // For uploaded video files
      apiData.videos = [{
        key: formData.virtualTour.uploadedKey || 'virtual_tour',
        url: formData.virtualTour.uploadedUrl || formData.virtualTour.value, // Use uploadedUrl if available
      }];
    }

    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Check if there are unuploaded photos
      const unuploadedPhotos = formData.photos.filter(photo => !photo.uploadedUrl);
      const hasUnuploadedVideo = formData.virtualTour.type === 'file' && formData.virtualTour.value && !formData.virtualTour.uploadedUrl;
      
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
      updateMediaUpload(formData);
      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      console.log(
        "Residential Property ID from store before draft API:",
        propertyId
      );
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      console.log("Saving residential property draft with media data:", {
        propertyId,
        ...apiData,
      });
      await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
    } catch (error) {
      console.error("Error in proceedWithDraft:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPhotoGrid = () => {
    return (
      <View style={styles.photoGrid}>
        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoImage}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color={colors.status.error} />
            </TouchableOpacity>
            <View style={styles.photoInfo}>
              <Typography variant="caption" style={styles.photoName}>
                {photo.name}
              </Typography>
              <Typography variant="caption" style={styles.photoSize}>
                {formatFileSize(photo.size)} • {photo.width}x{photo.height}
              </Typography>
              {photo.uploadedUrl ? (
                <Typography variant="caption" style={styles.uploadStatus}>
                  ✓ Uploaded
                </Typography>
              ) : (
                <TouchableOpacity onPress={() => retryUpload(index)}>
                  <Typography variant="caption" style={styles.retryStatus}>
                    ↻ Retry
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Media Uploads" />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Typography variant="h3" style={styles.sectionTitle}>
          Upload Photos & Virtual Tour
        </Typography>

        {/* Photos Section */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Upload Photos *
          </Typography>
          <Typography variant="caption" style={styles.helperText}>
            Minimum 3 photos required. JPG/PNG only. Max 25MB each. Min 800x600px.
          </Typography>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showPhotoPickerOptions}
            disabled={uploadImagesMutation.isPending}
          >
            <Ionicons name="camera" size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {uploadImagesMutation.isPending ? "Uploading..." : `Add Photos (${formData.photos.length}/∞)`}
            </Typography>
          </TouchableOpacity>

          {formData.photos.length > 0 && renderPhotoGrid()}

          {errors.photos && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.photos}
            </Typography>
          )}
        </View>

        {/* Virtual Tour Section */}
        <View style={styles.fieldContainer}>
          <Typography variant="body" style={styles.label}>
            Virtual Tour or Video Walkthrough
          </Typography>
          
          <Input
            label="YouTube/Vimeo URL"
            value={formData.virtualTour.type === 'link' ? formData.virtualTour.value : ''}
            onChangeText={(value) => updateVirtualTourLink(value)}
            placeholder="https://youtube.com/watch?v=..."
            error={errors.virtualTour}
          />
          
          <Typography variant="caption" style={styles.helperText}>
            Required: Enter YouTube or Vimeo URL
          </Typography>

          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" style={styles.orText}>
              OR
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showVideoPickerOptions}
            disabled={uploadVideosMutation.isPending}
          >
            <Ionicons name="videocam" size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              {uploadVideosMutation.isPending ? "Uploading Video..." : "Upload Video File"}
            </Typography>
          </TouchableOpacity>
          
          <Typography variant="caption" style={styles.helperText}>
            Required: MP4 format • Max 100MB
          </Typography>

          {formData.virtualTour.value && formData.virtualTour.type === 'file' && (
            <View style={styles.virtualTourDisplay}>
              <View style={styles.virtualTourInfo}>
                <Ionicons name="videocam" size={20} color={colors.primary.gold} />
                <Typography variant="body" style={styles.virtualTourText}>
                  {formData.virtualTour.name}
                </Typography>
                {formData.virtualTour.uploadedUrl ? (
                  <Typography variant="caption" style={styles.uploadStatus}>
                    ✓ Uploaded
                  </Typography>
                ) : (
                  <TouchableOpacity onPress={retryVideoUpload}>
                    <Typography variant="caption" style={styles.retryStatus}>
                      ↻ Retry
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={removeVirtualTour}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {errors.virtualTour && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.virtualTour}
            </Typography>
          )}
        </View>

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
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.xl,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    color: colors.text.secondary,
    marginBottom: spacing.md,
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
  },
  uploadButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary.gold,
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  photoItem: {
    width: (screenWidth - spacing.lg * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.input,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
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
  virtualTourText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  errorText: {
    color: colors.status.error,
    marginTop: spacing.sm,
  },
  uploadStatus: {
    color: colors.status.success,
    fontSize: 9,
    fontWeight: '600',
  },
  retryStatus: {
    color: colors.primary.gold,
    fontSize: 9,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: spacing.xl,
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
}); 