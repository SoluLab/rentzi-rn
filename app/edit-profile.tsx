import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { validatePassword, validateFullName } from '@/utils/validation';
import { Camera, CheckCircle2 } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profileDetails.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Name validation
    const nameValidation = validateFullName(name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error!;
    }
    // Password validation (only if user wants to change password)
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (newPassword) {
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
          newErrors.newPassword = passwordValidation.error!;
        }
      } else {
        newErrors.newPassword = 'New password is required';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Update user data
      if (user) {
        const updatedUser = {
          ...user,
          name,
          profileDetails: {
            ...user.profileDetails,
            avatar: profileImage,
          },
        };
        setUser(updatedUser);
      }
      toast.success('Profile updated successfully!');
      router.back();
    } catch (error: any) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleImagePicker = () => {
    Alert.alert('Update Profile Picture', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Photo Library', onPress: openImageLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      toast.error('Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  const openImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      toast.error('Photo library permission is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  const updateField = (field: string, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'currentPassword') setCurrentPassword(value);
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };
  return (
    <View style={styles.container}>
      <Header title="Edit Profile" onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Profile Picture
            </Typography>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    profileImage ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40',
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.imageEditButton} onPress={handleImagePicker}>
                <Camera size={20} color={colors.neutral.white} />
              </TouchableOpacity>
            </View>
            <Typography variant="caption" color="secondary" align="center">
              Tap the camera icon to change your profile picture
            </Typography>
          </View>
          {/* Personal Information */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Personal Information
            </Typography>
            <Input
              label="Full Name"
              value={name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter your full name"
              error={errors.name}
            />
          </View>
          {/* Change Password */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Change Password
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.sectionDescription}>
              Leave blank if you don't want to change your password
            </Typography>
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={(value) => updateField('currentPassword', value)}
              placeholder="Enter your current password"
              secureTextEntry
              showPasswordToggle
              error={errors.currentPassword}
            />
            <View>
              <Input
                label="New Password"
                value={newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                placeholder="Enter your new password"
                secureTextEntry
                showPasswordToggle
                error={errors.newPassword}
              />
              <PasswordStrengthMeter password={newPassword} hideWhenSpaces={true} />
            </View>
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Confirm your new password"
              secureTextEntry
              showPasswordToggle
              error={errors.confirmPassword}
            />
          </View>
          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionDescription: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary.gold,
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary.gold,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  buttonContainer: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingTop: spacing.lg,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
});