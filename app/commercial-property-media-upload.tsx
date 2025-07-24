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

interface MediaFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

interface MediaFormData {
  photos: MediaFile[];
  virtualTour: string;
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
  const [formData, setFormData] = useState<MediaFormData>({
    photos: [],
    virtualTour: '',
  });

  const [errors, setErrors] = useState<MediaValidationErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

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
    
    return undefined;
  };

  const validateVirtualTour = (url: string): string | undefined => {
    if (!url.trim()) return undefined; // Optional field
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
    
    if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
      return 'Please enter a valid YouTube or Vimeo URL';
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

  const updateFormData = (field: keyof MediaFormData, value: MediaFile[] | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts uploading/typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - formData.photos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        for (const asset of result.assets) {
          await processImage(asset);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photos. Please try again.');
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

      const newPhotos = [...formData.photos, mediaFile];
      updateFormData('photos', newPhotos);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
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

  const pickVideoFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;
        
        if (size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `Video file size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
          return;
        }

        Alert.alert('Success', `Video uploaded successfully. Size: ${formatFileSize(size)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to next step or save data
      Alert.alert('Success', 'Media upload completed! Proceeding to next step...');
      // router.push('/next-step');
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: MediaValidationErrors = {};

    newErrors.photos = validatePhotos(formData.photos);
    newErrors.virtualTour = validateVirtualTour(formData.virtualTour);

    // Check if all required fields are filled and no validation errors
    return (
      formData.photos.length >= 5 &&
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

  return (
    <ScreenContainer>
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
          
          <Button
            title={isUploading ? "Uploading..." : "Upload Photos"}
            onPress={showPhotoPickerOptions}
            disabled={isUploading || formData.photos.length >= MAX_PHOTOS}
            style={styles.uploadButton}
          />
          
          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Requirements: Min 5 photos, Max {MAX_PHOTOS} photos • JPG/PNG only • Max {MAX_PHOTO_SIZE_MB}MB per photo • Min {MIN_PHOTO_DIMENSIONS.width}x{MIN_PHOTO_DIMENSIONS.height}px
          </Typography>
          
          <Typography variant="caption" color="secondary" style={styles.photoCount}>
            {formData.photos.length}/{MAX_PHOTOS} photos uploaded
          </Typography>

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
                  <Typography variant="caption" style={styles.photoInfo}>
                    {formatFileSize(photo.size)}
                  </Typography>
                  {photo.width && photo.height && (
                    <Typography variant="caption" style={styles.photoInfo}>
                      {photo.width}x{photo.height}
                    </Typography>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Virtual Tour Section */}
        <View style={styles.uploadSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Virtual Tour or Video Walkthrough
          </Typography>
          
          <Input
            label="YouTube/Vimeo URL"
            value={formData.virtualTour}
            onChangeText={(value) => updateFormData('virtualTour', value)}
            placeholder="https://youtube.com/watch?v=..."
            error={errors.virtualTour}
          />
          
          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Optional: Enter YouTube or Vimeo URL
          </Typography>

          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" color="secondary" style={styles.orText}>
              OR
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Upload Video File"
            onPress={pickVideoFile}
            variant="outline"
            style={styles.uploadButton}
          />
          
          <Typography variant="caption" color="secondary" style={styles.validationText}>
            Optional: MP4 format • Max {MAX_VIDEO_SIZE_MB}MB
          </Typography>
        </View>

        {/* Next Button */}
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>
    </ScreenContainer>
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
    marginBottom: spacing.sm,
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
    gap: spacing.sm,
  },
  photoItem: {
    width: '48%',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: radius.input,
    backgroundColor: colors.background.secondary,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.status.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.text.secondary,
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
}); 