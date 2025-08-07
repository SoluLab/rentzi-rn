/**
 * Verification utility to check if SumSub SDK is properly installed
 */

import { NativeModules, Platform } from 'react-native';
import { debugNativeModules, checkSpecificModule } from './debugNativeModules';

interface SDKVerificationResult {
  isInstalled: boolean;
  platform: string;
  nativeModuleAvailable: boolean;
  sdkVersion?: string;
  error?: string;
}

export const verifySumsubSDK = async (): Promise<SDKVerificationResult> => {
  try {
    console.log('🔍 Verifying SumSub SDK installation...');
    
    // Debug all available native modules
    debugNativeModules();
    
    const result: SDKVerificationResult = {
      isInstalled: false,
      platform: Platform.OS,
      nativeModuleAvailable: false,
    };

    // Check if native module is available
    const { SNSMobileSDKModule } = NativeModules;
    result.nativeModuleAvailable = !!SNSMobileSDKModule;
    
    // Check specific module in detail
    checkSpecificModule('SNSMobileSDKModule');

    if (SNSMobileSDKModule) {
      console.log('✅ Native module found:', Object.keys(SNSMobileSDKModule));
      
      // Try to get SDK version
      try {
        if (SNSMobileSDKModule.getVersion) {
          result.sdkVersion = await SNSMobileSDKModule.getVersion();
          console.log('📦 SDK Version:', result.sdkVersion);
        }
      } catch (versionError) {
        console.log('⚠️ Could not get SDK version:', versionError);
      }

      result.isInstalled = true;
    } else {
      console.log('❌ Native module not found');
      result.error = 'SNSMobileSDK native module not available';
    }

    return result;

  } catch (error) {
    console.error('💥 SDK verification failed:', error);
    return {
      isInstalled: false,
      platform: Platform.OS,
      nativeModuleAvailable: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const logSDKStatus = async (): Promise<void> => {
  const result = await verifySumsubSDK();
  
  console.log('\n🏥 SumSub SDK Status Report:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Platform: ${result.platform}`);
  console.log(`Native Module Available: ${result.nativeModuleAvailable ? '✅' : '❌'}`);
  console.log(`SDK Installed: ${result.isInstalled ? '✅' : '❌'}`);
  
  if (result.sdkVersion) {
    console.log(`SDK Version: ${result.sdkVersion}`);
  }
  
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

export default {
  verifySumsubSDK,
  logSDKStatus
};