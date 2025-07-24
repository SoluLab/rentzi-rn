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
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';

interface MediaUploadData {
  photos: Array<{
    uri: string;
    name: string;
    size: number;
    width: number;
    height: number;
    type: string;
  }>;
  virtualTour: {
    type: 'link' | 'file';
    value: string;
    name?: string;
    size?: number;
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
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showVirtualTourOptions, setShowVirtualTourOptions] = useState(false);
  const [virtualTourType, setVirtualTourType] = useState<'link' | 'file'>('link');

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
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(photo.type)) {
        return 'Only JPG and PNG files are allowed';
      }
    }
    return undefined;
  };

  const validateVirtualTour = (virtualTour: MediaUploadData['virtualTour']): string | undefined => {
    if (!virtualTour.value.trim()) {
      return undefined; // Optional field
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
    // Re-validate the form to check if it's actually valid
    const newErrors: MediaUploadErrors = {};

    newErrors.photos = validatePhotos(formData.photos);
    newErrors.virtualTour = validateVirtualTour(formData.virtualTour);

    // Check if all required fields are filled and no validation errors
    return (
      formData.photos.length >= 3 &&
      Object.values(newErrors).every(error => !error)
    );
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', updatedPhotos);
  };

  // Virtual tour functions
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/mp4',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newVirtualTour = {
          type: 'file' as const,
          value: asset.uri,
          name: asset.name,
          size: asset.size,
        };
        updateFormData('virtualTour', newVirtualTour);
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

  const handleNext = () => {
    if (validateForm()) {
      router.push('/residential-property-documents-upload');
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
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer>
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
            onPress={() => setShowPhotoOptions(true)}
          >
            <Ionicons name="camera" size={24} color={colors.primary.gold} />
            <Typography variant="body" style={styles.uploadButtonText}>
              Add Photos ({formData.photos.length}/∞)
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
          <Typography variant="caption" style={styles.helperText}>
            Optional. YouTube/Vimeo link or MP4 file. Max 100MB.
          </Typography>

          {formData.virtualTour.value ? (
            <View style={styles.virtualTourDisplay}>
              <View style={styles.virtualTourInfo}>
                <Ionicons 
                  name={formData.virtualTour.type === 'link' ? 'link' : 'videocam'} 
                  size={20} 
                  color={colors.primary.gold} 
                />
                <Typography variant="body" style={styles.virtualTourText}>
                  {formData.virtualTour.type === 'link' 
                    ? formData.virtualTour.value 
                    : formData.virtualTour.name
                  }
                </Typography>
              </View>
              <TouchableOpacity onPress={removeVirtualTour}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowVirtualTourOptions(true)}
            >
              <Ionicons name="videocam" size={24} color={colors.primary.gold} />
              <Typography variant="body" style={styles.uploadButtonText}>
                Add Virtual Tour
              </Typography>
            </TouchableOpacity>
          )}

          {errors.virtualTour && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.virtualTour}
            </Typography>
          )}
        </View>

        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid()}
          style={styles.nextButton}
        />
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoOptions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Add Photos</Typography>
            <TouchableOpacity onPress={() => setShowPhotoOptions(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setShowPhotoOptions(false);
                pickImages();
              }}
            >
              <Ionicons name="images" size={24} color={colors.primary.gold} />
              <Typography variant="body" style={styles.modalItemText}>
                Choose from Library
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setShowPhotoOptions(false);
                takePhoto();
              }}
            >
              <Ionicons name="camera" size={24} color={colors.primary.gold} />
              <Typography variant="body" style={styles.modalItemText}>
                Take Photo
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Virtual Tour Options Modal */}
      <Modal
        visible={showVirtualTourOptions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Add Virtual Tour</Typography>
            <TouchableOpacity onPress={() => setShowVirtualTourOptions(false)}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setVirtualTourType('link');
                setShowVirtualTourOptions(false);
                Alert.prompt(
                  'Enter Video Link',
                  'Please enter a YouTube or Vimeo URL:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Add', 
                      onPress: (link) => {
                        if (link) {
                          updateVirtualTourLink(link);
                        }
                      }
                    }
                  ],
                  'plain-text'
                );
              }}
            >
              <Ionicons name="link" size={24} color={colors.primary.gold} />
              <Typography variant="body" style={styles.modalItemText}>
                Add Video Link
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setVirtualTourType('file');
                setShowVirtualTourOptions(false);
                pickVideo();
              }}
            >
              <Ionicons name="videocam" size={24} color={colors.primary.gold} />
              <Typography variant="body" style={styles.modalItemText}>
                Upload Video File
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
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
  nextButton: {
    marginTop: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalItemText: {
    marginLeft: spacing.md,
    fontSize: 16,
  },
}); 