/**
 * Test utilities for SumSub KYC SDK
 * This file contains helper functions for testing the KYC integration
 */

import { Alert } from 'react-native';
import { KYCService } from '@/services/kycService';
import { KYCTokenService } from '@/services/kycTokenService';
import { KYCHandler } from '@/services/kycHandler';
import { logSDKStatus } from './verifySumsubSDK';
import { quickSDKTest } from './quickKYCTest';

export interface TestKYCConfig {
  userId: string;
  useRealToken?: boolean;
  levelName?: string;
}

/**
 * Test the KYC SDK integration
 * This function can be called from any component to test KYC functionality
 */
export const testKYCIntegration = async (config: TestKYCConfig): Promise<void> => {
  try {
    console.log('🧪 Testing KYC SDK Integration...');
    
    // Check if SDK is available
    const isAvailable = KYCService.isSDKAvailable();
    console.log('📱 SDK Available:', isAvailable);
    
    if (!isAvailable) {
      Alert.alert(
        'Test Failed',
        'SumSub SDK is not available. Make sure it\'s properly installed and linked.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Get SDK version
    try {
      const version = await KYCService.getSDKVersion();
      console.log('📦 SDK Version:', version);
    } catch (error) {
      console.log('⚠️ Could not get SDK version:', error);
    }

    // Generate access token
    let accessToken: string;
    
    if (config.useRealToken && KYCTokenService.isBackendConfigured()) {
      console.log('🌐 Using real backend token...');
      try {
        const tokenResponse = await KYCTokenService.generateAccessToken({
          userId: config.userId,
          levelName: config.levelName || 'basic-kyc-level',
          ttlInSecs: 3600
        });
        accessToken = tokenResponse.token;
        console.log('✅ Real token generated successfully');
      } catch (error) {
        console.error('❌ Failed to generate real token:', error);
        accessToken = KYCTokenService.createMockAccessToken(config.userId);
        console.log('🎭 Falling back to mock token');
      }
    } else {
      console.log('🧪 Using demo token for testing...');
      accessToken = KYCTokenService.createDemoAccessToken(config.userId);
    }

    // Test KYC launch
    console.log('🚀 Launching KYC SDK...');
    
    const result = await KYCService.launchKYC({
      accessToken,
      userId: config.userId,
      flowName: 'basic-kyc',
      locale: 'en',
      theme: 'system'
    });

    console.log('📊 KYC Result:', result);

    if (result.success) {
      Alert.alert(
        'Test Successful! ✅',
        `KYC verification completed successfully!\n\nToken: ${result.token ? '✅ Received' : '❌ None'}\nUser ID: ${result.userId || 'N/A'}`,
        [{ text: 'Great!' }]
      );

      // Test status update
      if (config.useRealToken) {
        try {
          await KYCTokenService.updateKYCStatus(
            config.userId,
            'complete',
            result.token
          );
          console.log('✅ Status updated successfully');
        } catch (error) {
          console.log('⚠️ Status update failed:', error);
        }
      }
    } else {
      Alert.alert(
        'Test Failed ❌',
        `KYC verification failed.\n\nError: ${result.errorMsg || 'Unknown error'}\nType: ${result.errorType || 'Unknown'}`,
        [{ text: 'OK' }]
      );
    }

  } catch (error) {
    console.error('💥 Test crashed:', error);
    Alert.alert(
      'Test Crashed! 💥',
      `An unexpected error occurred during testing.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
      [{ text: 'OK' }]
    );
  }
};

/**
 * Quick test with default configuration
 */
export const quickKYCTest = async (): Promise<void> => {
  await testKYCIntegration({
    userId: `test_user_${Date.now()}`,
    useRealToken: false,
    levelName: 'basic-kyc-level'
  });
};

/**
 * Test KYC with real backend integration
 */
export const testKYCWithBackend = async (userId: string): Promise<void> => {
  await testKYCIntegration({
    userId,
    useRealToken: true,
    levelName: 'basic-kyc-level'
  });
};

/**
 * Check KYC system health
 */
export const checkKYCHealth = async (): Promise<void> => {
  console.log('🏥 KYC Health Check:');
  
  // Log detailed SDK status
  await logSDKStatus();
  
  console.log('  📱 SDK Available:', KYCService.isSDKAvailable());
  console.log('  🌐 Backend Configured:', KYCTokenService.isBackendConfigured());
  console.log('  📦 Package Installed:', !!require.resolve('@sumsub/react-native-mobilesdk-module'));
  
  Alert.alert(
    'KYC Health Check 🏥',
    `SDK Available: ${KYCService.isSDKAvailable() ? '✅' : '❌'}\nBackend Configured: ${KYCTokenService.isBackendConfigured() ? '✅' : '❌'}\nPackage Installed: ✅`,
    [{ text: 'OK' }]
  );
};

/**
 * Simple test using the KYC handler (recommended)
 */
export const testKYCHandler = async (router: any): Promise<void> => {
  const mockUser = { id: `test_${Date.now()}`, email: 'test@example.com' };
  
  await KYCHandler.handleKYCVerification({
    user: mockUser,
    router,
    onSuccess: () => console.log('✅ Handler test successful'),
    onError: (error) => console.log('❌ Handler test failed:', error)
  });
};

export default {
  testKYCIntegration,
  quickKYCTest,
  testKYCWithBackend,
  testKYCHandler,
  checkKYCHealth,
  quickSDKTest
};