import { NativeModules, Platform } from 'react-native';

const { SNSMobileSDKModule } = NativeModules;

// Import the SumSub SDK properly
const SumSubSDK = require('@sumsub/react-native-mobilesdk-module');

export interface KYCConfig {
  accessToken: string;
  userId?: string;
  flowName?: string;
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface KYCResult {
  success: boolean;
  token?: string;
  userId?: string;
  errorMsg?: string;
  errorType?: string;
}

export class KYCService {
  /**
   * Initialize and launch the SumSub KYC SDK
   * @param config KYC configuration object
   * @returns Promise<KYCResult>
   */
  static async launchKYC(config: KYCConfig): Promise<KYCResult> {
    try {
      if (!SNSMobileSDKModule) {
        throw new Error('SumSub SDK is not available. Make sure the module is properly linked.');
      }

      // Validate required parameters
      if (!config.accessToken) {
        throw new Error('Access token is required for KYC verification');
      }

      // Prepare SDK configuration
      const sdkConfig = {
        accessToken: config.accessToken,
        userId: config.userId || '',
        flowName: config.flowName || 'msdk-default-flow',
        locale: config.locale || 'en',
        ...(Platform.OS === 'ios' && {
          theme: config.theme || 'system'
        })
      };

      console.log('Launching SumSub KYC SDK with config:', {
        ...sdkConfig,
        accessToken: '***' // Hide access token in logs
      });

      // Launch the SDK using the proper SumSub API
      const sdk = SumSubSDK.init(config.accessToken, () => {
        // Token expiration handler - return a promise that resolves to a new token
        return Promise.resolve(config.accessToken);
      })
      .withLocale(config.locale || 'en')
      .withDebug(true) // Enable debug mode for testing
      .build();

      const result = await sdk.launch();
      
      console.log('KYC SDK result:', result);

      return {
        success: true,
        token: result.token,
        userId: result.userId,
      };

    } catch (error: any) {
      console.error('KYC SDK Error:', error);
      
      return {
        success: false,
        errorMsg: error.message || 'Unknown error occurred during KYC verification',
        errorType: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Check if the SumSub SDK is available
   * @returns boolean
   */
  static isSDKAvailable(): boolean {
    return !!SNSMobileSDKModule;
  }

  /**
   * Get SDK version information
   * @returns Promise<string>
   */
  static async getSDKVersion(): Promise<string> {
    try {
      if (!SNSMobileSDKModule || !SNSMobileSDKModule.getVersion) {
        return 'Unknown';
      }
      return await SNSMobileSDKModule.getVersion();
    } catch (error) {
      console.error('Error getting SDK version:', error);
      return 'Unknown';
    }
  }

  /**
   * Create access token request helper
   * This should be called from your backend service
   * @param userId User ID for the verification
   * @param levelName Level name for the verification flow
   * @returns Object with request configuration
   */
  static createAccessTokenRequest(userId: string, levelName: string = 'basic-kyc-level') {
    return {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add your API key in the actual implementation
        // 'X-App-Token': 'YOUR_API_KEY'
      },
      body: JSON.stringify({
        userId,
        levelName,
        ttlInSecs: 3600, // 1 hour
      })
    };
  }
}

export default KYCService;