import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { validateFullName } from '@/utils/validation';
import { Camera, CheckCircle2 } from 'lucide-react-native';
import { useHomeownerProfile } from '@/hooks/useHomeownerProfile';
import { useGlobalProfile } from '@/hooks/useGlobalProfile';
import { useAuthStore } from '@/stores/authStore';
import { countryCodes } from '@/components/ui/PhoneInput';

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  
  // Determine user type and use appropriate hooks
  const { profile: homeownerProfile, isLoadingProfile: isHomeownerLoading, updateProfile: updateHomeownerProfile, isUpdatingProfile } = useHomeownerProfile();
  const { profileData: renterProfile, isLoading: isRenterLoading, updateProfile: updateRenterProfile } = useGlobalProfile();
  
  // Determine user type - Priority: URL params > Auth store > Profile data
  const urlRole = params.role as string;
  const userRole = user?.role;
  const isHomeowner = urlRole === 'homeowner' || userRole === 'homeowner' || (homeownerProfile && !renterProfile);
  
  // Use the appropriate profile data based on user type
  // If homeowner profile exists, use it regardless of user role detection
  const profile = homeownerProfile || renterProfile;
  const isLoadingProfile = isHomeowner ? isHomeownerLoading : isRenterLoading;
  const isUpdating = isHomeowner ? isUpdatingProfile : isRenterLoading;
  
  console.log('EditProfile - URL role param:', urlRole);
  console.log('EditProfile - User role:', user?.role);
  console.log('EditProfile - Is homeowner:', isHomeowner);
  console.log('EditProfile - Homeowner profile:', homeownerProfile);
  console.log('EditProfile - Renter profile:', renterProfile);
  console.log('EditProfile - Selected profile:', profile);
  
  // Initialize state with profile data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes.find(c => c.code === "US") || countryCodes[0]);
  const [profileImage, setProfileImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update state when profile data is loaded
  useEffect(() => {
    console.log('EditProfile - Profile data received:', profile);
    console.log('EditProfile - Is homeowner:', isHomeowner);
    console.log('EditProfile - Is loading:', isLoadingProfile);
    
    if (profile) {
      console.log('EditProfile - Setting profile data:', {
        firstName: profile.name?.firstName,
        lastName: profile.name?.lastName,
        mobile: profile.phone?.mobile,
        countryCode: profile.phone?.countryCode,
        email: profile.email
      });
      
      setFirstName(profile.name?.firstName || '');
      setLastName(profile.name?.lastName || '');
      setPhoneNumber(profile.phone?.mobile || '');
      
      // Set country code based on profile data
      const countryCode = countryCodes.find(c => c.phoneCode === profile.phone?.countryCode);
      if (countryCode) {
        setSelectedCountryCode(countryCode);
      }
      
      // Set profile image from profile data or use default
      const avatar = 'avatar' in profile ? profile.avatar : undefined;
      setProfileImage(avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40');
    } else if (homeownerProfile && typeof homeownerProfile === 'object') {
      // Fallback: if no profile is selected but homeowner profile exists, use it
      console.log('EditProfile - Using homeowner profile as fallback');
      setFirstName((homeownerProfile as any).name?.firstName || '');
      setLastName((homeownerProfile as any).name?.lastName || '');
      setPhoneNumber((homeownerProfile as any).phone?.mobile || '');
      
      const countryCode = countryCodes.find(c => c.phoneCode === (homeownerProfile as any).phone?.countryCode);
      if (countryCode) {
        setSelectedCountryCode(countryCode);
      }
      
      const avatar = 'avatar' in homeownerProfile ? (homeownerProfile as any).avatar : undefined;
      setProfileImage(avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40');
    } else {
      console.log('EditProfile - No profile data available');
      // Reset form fields if no profile data
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setSelectedCountryCode(countryCodes.find(c => c.code === "US") || countryCodes[0]);
      setProfileImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40');
    }
  }, [profile, homeownerProfile, isHomeowner, isLoadingProfile]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Name validation
    const nameValidation = validateFullName(firstName + ' ' + lastName);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error!;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    const payload = {
      name: {
        firstName,
        lastName,
      },
      phone: {
        countryCode: selectedCountryCode.phoneCode,
        mobile: phoneNumber,
      },
    };
    
    try {
      // Determine which update function to use based on user role
      console.log('EditProfile - Saving with role:', urlRole || userRole);
      console.log('EditProfile - Is homeowner determined:', isHomeowner);
      
      if (isHomeowner) {
        await updateHomeownerProfile(payload);
        // The hook will automatically refetch profile data and show success toast
        router.back();
      } else {
        await updateRenterProfile(payload);
        // The hook will automatically refetch profile data and show success toast
        router.back();
      }
    } catch (error: any) {
      // Error handling is already done in the hooks
      console.error('Profile update error:', error);
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
    if (field === 'firstName') setFirstName(value);
    if (field === 'lastName') setLastName(value);
    if (field === 'phoneNumber') setPhoneNumber(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountryCode(country);
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: '' }));
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
              {/* Profile Picture Section - For all users */}
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
                  label="First Name"
                  value={firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="Enter your first name"
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Enter your last name"
                  error={errors.lastName}
                />
                <PhoneInput
                  label="Mobile Number"
                  value={phoneNumber}
                  onChangeText={(value) => updateField('phoneNumber', value)}
                  placeholder="Enter your mobile number"
                  error={errors.phoneNumber}
                  selectedCountry={selectedCountryCode}
                  onCountryChange={handleCountryChange}
                />
                            </View>

              
              {/* Save Button */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  loading={isUpdating}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
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