/**
 * Quick test to verify SumSub SDK is working after rebuild
 */

import { Alert } from 'react-native';
import { KYCService } from '@/services/kycService';
import { KYCTokenService } from '@/services/kycTokenService';
import { logSDKStatus } from './verifySumsubSDK';

export const quickSDKTest = async (): Promise<void> => {
  try {
    console.log('🚀 Starting Quick SDK Test...');
    
    // Step 1: Check SDK status
    await logSDKStatus();
    
    // Step 2: Check if SDK is available
    const isAvailable = KYCService.isSDKAvailable();
    console.log('📱 SDK Available:', isAvailable);
    
    if (!isAvailable) {
      Alert.alert(
        'SDK Not Available ❌',
        'The native module is still not available. Make sure the app is rebuilt after installing native dependencies.',
        [
          { text: 'OK' },
          {
            text: 'Rebuild App',
            onPress: () => {
              console.log('Please run: npx expo run:ios');
              Alert.alert('Rebuild Required', 'Please run: npx expo run:ios in your terminal to rebuild the app with native dependencies.');
            }
          }
        ]
      );
      return;
    }
    
    // Step 3: Try to get demo token
    const demoToken = KYCTokenService.createDemoAccessToken('test_user');
    console.log('🎭 Demo token generated:', demoToken.substring(0, 20) + '...');
    
    // Step 4: Show success
    Alert.alert(
      'SDK Ready! ✅',
      'SumSub SDK is properly installed and ready to use.\n\nYou can now test the KYC flow by:\n1. Going to a property\n2. Clicking "Start Investing"\n3. Clicking "Start KYC Process"',
      [{ text: 'Awesome!' }]
    );
    
    console.log('✅ Quick SDK Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick SDK Test failed:', error);
    Alert.alert(
      'Test Failed ❌',
      `SDK test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      [{ text: 'OK' }]
    );
  }
};

export default quickSDKTest;