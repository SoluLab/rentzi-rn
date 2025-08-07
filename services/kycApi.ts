import { apiPost } from './apiClient';
import { getRenterAuthBaseURL } from '@/constants/urls';
import { ENDPOINTS } from '@/constants/urls';

export interface KYCInitializeRequest {
  // Add any request parameters if needed
}

export interface KYCInitializeData {
  accessToken: string;
  sdkConfig: {
    accessToken: string;
    appToken: string;
    baseUrl: string;
    flowName: string;
  };
  applicantId: string;
}

export interface KYCInitializeResponse {
  success: boolean;
  message: string;
  data: KYCInitializeData;
}

export interface KYCInitializeApiResponse {
  success: boolean;
  message: string;
  data: KYCInitializeData;
}

export class KYCApiService {
  /**
   * Initialize KYC verification for renter/investor
   * @returns Promise<KYCInitializeData>
   */
  static async initializeKYC(): Promise<KYCInitializeData> {
    try {
      const response = await apiPost<KYCInitializeApiResponse>({
        baseURL: getRenterAuthBaseURL(),
        endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.KYC_INITIALIZE,
        data: {}, // Empty object since no request parameters are specified
        auth: true
      });

      console.log('🔍 API Response structure:', JSON.stringify(response, null, 2));

      // Let's check if response.data has a 'data' property
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const kycData = (response.data as any).data as KYCInitializeData;
        
        if (!kycData) {
          throw new Error('KYC data not found in response');
        }
        
        // Validate that we have the required fields
        if (!kycData.accessToken) {
          throw new Error('Access token not found in KYC response');
        }
        
        return kycData;
      } else {
        const kycData = response.data as KYCInitializeData;
        
        if (!kycData) {
          throw new Error('KYC data not found in response');
        }
        
        // Validate that we have the required fields
        if (!kycData.accessToken) {
          throw new Error('Access token not found in KYC response');
        }
        
        return kycData;
      }
    } catch (error: any) {
      console.error('Error initializing KYC:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to initialize KYC verification'
      );
    }
  }
}

export default KYCApiService; 