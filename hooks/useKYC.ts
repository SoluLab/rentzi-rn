import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { KYCApiService, KYCInitializeResponse, KYCInitializeData } from '@/services/kycApi';
import { KYCService } from '@/services/kycService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';

export interface UseKYCReturn {
  isLoading: boolean;
  error: string | null;
  initializeKYC: () => Promise<void>;
  launchKYCSDK: (kycData: KYCInitializeData) => Promise<void>;
}

export const useKYC = (): UseKYCReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const initializeKYC = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing KYC verification...');
      
      // Call the KYC initialization API
      const response = await KYCApiService.initializeKYC();
      
      console.log('✅ KYC initialized successfully:', response);
      console.log('📋 KYC Data structure:', {
        accessToken: response.accessToken,
        applicantId: response.applicantId,
        sdkConfig: response.sdkConfig
      });
      
      // Launch the KYC SDK with the received data
      await launchKYCSDK(response);
      
    } catch (err: any) {
      console.error('❌ KYC initialization failed:', err);
      const errorMessage = err.message || 'Failed to initialize KYC verification';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const launchKYCSDK = async (kycData: KYCInitializeData): Promise<void> => {
    try {
      console.log('📱 Launching KYC SDK...');
      
      // Check if SDK is available
      if (!KYCService.isSDKAvailable()) {
        throw new Error('KYC SDK is not available. Please try again later.');
      }

      // Launch the KYC SDK with the received configuration
      const result = await KYCService.launchKYC({
        accessToken: kycData.accessToken,
        userId: user?.id || user?.email || 'anonymous',
        flowName: kycData.sdkConfig.flowName,
        locale: 'en',
        theme: 'system'
      });

      console.log('📊 KYC SDK result:', result);

      if (result.success) {
        // Update user KYC status to complete
        if (user) {
          const updatedUser = { ...user, kycStatus: 'complete' as const };
          setUser(updatedUser);
        }
        
        toast.success('KYC verification completed successfully!');
        
        // Navigate back to the previous screen (property detail)
        router.back();
      } else {
        throw new Error(result.errorMsg || 'KYC verification failed');
      }

    } catch (err: any) {
      console.error('❌ KYC SDK launch failed:', err);
      const errorMessage = err.message || 'Failed to launch KYC verification';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Show alert with retry option
      Alert.alert(
        'KYC Verification Failed',
        errorMessage,
        [
          { text: 'OK' },
          { 
            text: 'Try Again', 
            onPress: () => initializeKYC() 
          }
        ]
      );
    }
  };

  return {
    isLoading,
    error,
    initializeKYC,
    launchKYCSDK,
  };
};

export default useKYC; 