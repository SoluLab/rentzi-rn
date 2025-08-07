import { Alert } from 'react-native';
import { Router } from 'expo-router';
import { KYCService } from './kycService';
import { KYCTokenService } from './kycTokenService';
import { getKYCConfigForUserType, isDemoMode } from '@/constants/kycConfig';

export interface KYCHandlerConfig {
  user?: { id?: string; email?: string };
  router: Router;
  userType?: 'investor' | 'homeowner' | 'renter';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export class KYCHandler {
  /**
   * Handle KYC verification process with comprehensive error handling
   */
  static async handleKYCVerification(config: KYCHandlerConfig): Promise<void> {
    const { user, router, onSuccess, onError } = config;

    try {
      // Check SDK availability
      if (!KYCService.isSDKAvailable()) {
        Alert.alert(
          'SDK Not Available',
          'KYC verification is not available at the moment. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Generate access token
      const accessToken = await this.getAccessToken(user?.id || user?.email || 'anonymous');
      
      // Get KYC configuration based on user type
      const kycConfig = getKYCConfigForUserType(config.userType || 'renter');
      
      // Launch KYC SDK
      const result = await KYCService.launchKYC({
        accessToken,
        userId: user?.id || user?.email || 'anonymous',
        flowName: kycConfig.flowName,
        locale: kycConfig.locale,
        theme: kycConfig.theme
      });

      if (result.success) {
        await this.handleSuccess(result, user?.id || user?.email || 'anonymous');
        onSuccess?.();
      } else {
        this.handleFailure(result, () => this.handleKYCVerification(config));
        onError?.(result.errorMsg || 'KYC verification failed');
      }

    } catch (error) {
      console.error('KYC Error:', error);
      this.handleError(error, router);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get access token with fallback to mock for testing
   */
  private static async getAccessToken(userId: string): Promise<string> {
    try { 
        {if (KYCTokenService.isBackendConfigured()) {
        const tokenResponse = await KYCTokenService.generateAccessToken({
          userId,
          levelName: 'basic-kyc-level',
          ttlInSecs: 3600
        });
        return tokenResponse.token;
      } else if (isDemoMode()) {
        // Demo mode with working demo token
        this.showDemoAlert();
        return KYCTokenService.createDemoAccessToken(userId);
      } else {
        // Fallback to mock token
        return KYCTokenService.createMockAccessToken(userId);
      }}
    } catch (tokenError) {
      console.error('Failed to generate access token:', tokenError);
      throw new Error('Could not generate access token for KYC verification');
    }
  }

  /**
   * Handle successful KYC completion
   */
  private static async handleSuccess(result: any, userId: string): Promise<void> {
    try {
      await KYCTokenService.updateKYCStatus(userId, 'complete', result.token);
      
      Alert.alert(
        'KYC Completed',
        'Your KYC verification has been completed successfully!',
        [{ text: 'OK' }]
      );
      
      console.log('KYC completed with result:', result);
    } catch (updateError) {
      console.error('Failed to update KYC status:', updateError);
      Alert.alert(
        'KYC Completed',
        'Your KYC verification was completed, but there was an issue updating your status. Please contact support.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Handle KYC failure
   */
  private static handleFailure(result: any, retryCallback: () => void): void {
    Alert.alert(
      'KYC Failed',
      result.errorMsg || 'KYC verification failed. Please try again.',
      [
        { text: 'OK' },
        { text: 'Try Again', onPress: retryCallback }
      ]
    );
  }

  /**
   * Handle unexpected errors
   */
  private static handleError(error: unknown, router: Router): void {
    Alert.alert(
      'Error',
      'An unexpected error occurred during KYC verification.',
      [
        { text: 'OK' },
        {
          text: 'Use Web Version',
          onPress: () => router.push('/kyc-verification')
        }
      ]
    );
  }

  /**
   * Show demo mode alert
   */
  private static showDemoAlert(): void {
    Alert.alert(
      'Demo Mode 🧪',
      'Using SumSub demo access token. This will open the real KYC SDK in sandbox mode for testing.',
      [{ text: 'Continue Demo' }]
    );
  }

  /**
   * Quick launch KYC with minimal configuration
   */
  static async quickLaunch(user: any, router: Router): Promise<void> {
    await this.handleKYCVerification({ user, router });
  }
}

export default KYCHandler;