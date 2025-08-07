import { apiPost, apiGet, apiPut } from './apiClient';
import { KYC_CONFIG, isDemoMode } from '@/constants/kycConfig';

export interface TokenRequest {
  userId: string;
  levelName?: string;
  ttlInSecs?: number;
}

export interface TokenResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

export class KYCTokenService {
  private static readonly DEFAULT_LEVEL = 'basic-kyc-level';
  private static readonly DEFAULT_TTL = 3600; // 1 hour

  /**
   * Generate access token for KYC verification
   * This should be called from your backend
   * @param request Token request parameters
   * @returns Promise<TokenResponse>
   */
  static async generateAccessToken(request: TokenRequest): Promise<TokenResponse> {
    try {
      const response = await apiPost({
        baseURL: 'https://api.yourbackend.com', // Replace with your actual backend URL
        endpoint: '/kyc/generate-token',
        data: {
          userId: request.userId,
          levelName: request.levelName || this.DEFAULT_LEVEL,
          ttlInSecs: request.ttlInSecs || this.DEFAULT_TTL,
        },
        auth: true
      });

      return response.data;
    } catch (error: any) {
      console.error('Error generating KYC access token:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate KYC access token'
      );
    }
  }

  /**
   * Get user's KYC status
   * @param userId User ID
   * @returns Promise<string>
   */
  static async getKYCStatus(userId: string): Promise<string> {
    try {
      const response = await apiGet({
        baseURL: 'https://api.yourbackend.com', // Replace with your actual backend URL
        endpoint: `/kyc/status/${userId}`,
        auth: true
      });
      return response.data.status;
    } catch (error: any) {
      console.error('Error getting KYC status:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to get KYC status'
      );
    }
  }

  /**
   * Update user's KYC status
   * @param userId User ID
   * @param status New KYC status
   * @param token Verification token (optional)
   * @returns Promise<void>
   */
  static async updateKYCStatus(
    userId: string, 
    status: string, 
    token?: string
  ): Promise<void> {
    try {
      await apiPut({
        baseURL: 'https://api.yourbackend.com', // Replace with your actual backend URL
        endpoint: `/kyc/status/${userId}`,
        data: {
          status,
          token,
          updatedAt: new Date().toISOString(),
        },
        auth: true
      });
    } catch (error: any) {
      console.error('Error updating KYC status:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to update KYC status'
      );
    }
  }

  /**
   * Create a demo access token for testing the SumSub SDK
   * This uses a real demo token that works with SumSub sandbox environment
   * Remove this in production and use the actual backend endpoint
   * @param userId User ID
   * @returns string
   */
  static createDemoAccessToken(userId: string): string {
    // Demo access token from configuration
    const demoToken = KYC_CONFIG.DEMO_MODE.ACCESS_TOKEN;
    
    if (KYC_CONFIG.FEATURES.ENABLE_DEBUG_LOGGING) {
      console.warn('🧪 Using SumSub demo access token for testing');
      console.log('📋 Demo User ID:', userId);
      console.log('🌐 Environment:', KYC_CONFIG.DEMO_MODE.ENVIRONMENT);
    }
    
    return demoToken;
  }

  /**
   * Create a mock access token for testing purposes (fallback)
   * Remove this in production and use the actual backend endpoint
   * @param userId User ID
   * @returns string
   */
  static createMockAccessToken(userId: string): string {
    // This is for testing only - replace with actual backend call
    const mockToken = `mock_token_${userId}_${Date.now()}`;
    console.warn('Using mock KYC token for testing:', mockToken);
    return mockToken;
  }

  /**
   * Validate if we have a valid backend configuration
   * @returns boolean
   */
  static isBackendConfigured(): boolean {
    // Check if backend is configured (not in demo mode)
    return !isDemoMode() && process.env.EXPO_PUBLIC_KYC_ENABLED === 'true';
  }
}

export default KYCTokenService;