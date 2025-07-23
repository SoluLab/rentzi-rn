import { api } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS, ENDPOINTS } from '../constants/urls';
import { deviceTokenUtils } from '@/utils/deviceToken';

// Types and Interfaces
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
  verificationId: number;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface UserData {
  isBlockedByAdmin: boolean;
  isEmailVerified: boolean;
  verifiedAt: null | string;
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  blockedBy: null | string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface BaseAuthResponse {
  success: boolean;
  message: string;
}

interface RegisterResponse extends BaseAuthResponse {
  data?: TokenData & {
    user: UserData;
    verificationCodeId: number;
  };
}

interface AuthResponse extends BaseAuthResponse {
  data: TokenData & {
    user: UserData;
  };
}

interface RefreshTokenResponse extends BaseAuthResponse {
  data: TokenData;
}

interface CheckEmailResponse {
  exists: boolean;
  message: string;
}

interface GenericResponse extends BaseAuthResponse {}

interface ForgotPasswordResponse extends GenericResponse {
  data?: {
    verificationId: number;
  };
}

class AuthService {
  private readonly STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    RESET_VERIFICATION_ID: 'resetVerificationId',
  } as const;

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      this.logAuthAttempt('registration', { name: data.name, email: data.email });

      // Get device token
      const deviceToken = await deviceTokenUtils.getDeviceToken();
      
      const payload = {
        name: data.name.trim(),
        email: this.normalizeEmail(data.email),
        password: data.password,
        deviceToken: deviceToken || undefined
      };


      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.REGISTER,
        payload,
        false
      );


      if (response.success && response.data) {
        await this.storeTokens(response.data);
      }

      return response;
    } catch (error) {
      throw this.handleAuthError(error, {
        409: 'This email is already registered. Please login instead or use a different email.',
        default: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      this.logAuthAttempt('login', { email: data.email });

      // Get device token
      const deviceToken = await deviceTokenUtils.getDeviceToken();
      
      const payload = {
        email: this.normalizeEmail(data.email),
        password: data.password,
        deviceToken: deviceToken || undefined
      };


      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.LOGIN,
        payload,
        false
      );


      if (!response.success) {
        // Handle specific error cases based on response message or error
        if (response.error) {
          throw new Error(response.error);
        }
        throw new Error(response.message || 'Login failed');
      }

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      await this.storeTokens(response.data);
      return response as AuthResponse;
    } catch (error) {
      throw this.handleAuthError(error, {
        401: 'Invalid credentials. Please check your email and password.',
        403: 'Email verification required. Please check your inbox.',
        404: 'Email not found. Please check your email or sign up.',
        423: 'Your account has been blocked. Please contact support.',
        default: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Check if email exists
   */
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    try {
      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.CHECK_EMAIL,
        { email: this.normalizeEmail(email) },
        false
      );

      if (!response.success) {
        throw new Error(response.message || 'Email check failed');
      }

      return {
        exists: response.data?.exists ?? false,
        message: response.message
      };
    } catch (error) {
      if (this.isHttpError(error)) {
        if (error.status === 404) return { exists: false, message: 'Email not found' };
        if (error.status === 409) return { exists: true, message: 'Email already exists' };
      }
      throw this.handleAuthError(error, {
        default: 'An error occurred while checking email'
      });
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email: this.normalizeEmail(email) },
        false
      );

      if (response.success && response.data?.verificationId) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.RESET_VERIFICATION_ID,
          response.data.verificationId.toString()
        );
      }

      return response;
    } catch (error) {
      throw this.handleAuthError(error, {
        404: 'Email not found. Please check your email or sign up.',
        default: 'Failed to send reset code. Please try again.'
      });
    }
  }

  /**
   * Reset password with verification code
   */
  async resetPassword(data: ResetPasswordData): Promise<GenericResponse> {
    try {
      const storedVerificationId = await AsyncStorage.getItem(this.STORAGE_KEYS.RESET_VERIFICATION_ID);
      if (!storedVerificationId) {
        throw new Error('Verification ID not found. Please request a new reset code.');
      }

      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          email: this.normalizeEmail(data.email),
          code: data.code,
          newPassword: data.newPassword,
          verificationId: parseInt(storedVerificationId, 10)
        },
        false
      );

      if (response.success) {
        await AsyncStorage.removeItem(this.STORAGE_KEYS.RESET_VERIFICATION_ID);
      }

      return response;
    } catch (error) {
      throw this.handleAuthError(error, {
        400: 'Invalid verification code. Please try again.',
        410: 'Verification code has expired. Please request a new code.',
        default: 'Failed to reset password. Please try again.'
      });
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await AsyncStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken },
        false
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Token refresh failed');
      }

      await this.storeTokens(response.data);
      return response as RefreshTokenResponse;
    } catch (error) {
      throw this.handleAuthError(error, {
        401: 'Session expired. Please login again.',
        default: 'Failed to refresh session. Please login again.'
      });
    }
  }

  /**
   * Resend OTP verification code
   */
  async resendOtp(email: string): Promise<GenericResponse> {
    try {
      return await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.RESEND_OTP,
        { email: this.normalizeEmail(email) },
        false
      );
    } catch (error) {
      throw this.handleAuthError(error, {
        400: 'Invalid verification request. Please try again.',
        default: 'Failed to send new verification code. Please try again.'
      });
    }
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmail(data: VerifyEmailData): Promise<GenericResponse> {
    
    try {
      return await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.VERIFY_EMAIL,
        {
          email: this.normalizeEmail(data.email),
          code: data.code
        },
        false
      );
    } catch (error) {
      throw this.handleAuthError(error, {
        400: 'Invalid verification code. Please try again.',
        410: 'Verification code has expired. Please request a new code.',
        default: 'Failed to verify email. Please try again.'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<GenericResponse> {
    try {
      
      // Get device token
      const deviceToken = await deviceTokenUtils.getDeviceToken();
      
      const payload = {
        deviceToken: deviceToken || undefined
      };


      const response = await api.post(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.LOGOUT,
        payload,
        true
      );

      console.log('✅ Auth Service Logout Response:', response);

      // Clear local storage regardless of API response
      await this.clearTokens();
      await deviceTokenUtils.clearDeviceToken();

      return response;
    } catch (error) {
      console.warn('⚠️ Auth Service Logout API failed, but continuing with local cleanup:', error);
      
      // Clear local storage even if API fails
      await this.clearTokens();
      await deviceTokenUtils.clearDeviceToken();
      
      return { success: true, message: 'Logged out successfully' };
    }
  }

  /**
   * Store authentication tokens
   */
  private async storeTokens(data: TokenData): Promise<void> {
    
    await AsyncStorage.setItem(this.STORAGE_KEYS.TOKEN, data.accessToken);
    await AsyncStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    
    // Verify tokens were stored
    const storedAccessToken = await AsyncStorage.getItem(this.STORAGE_KEYS.TOKEN);
    const storedRefreshToken = await AsyncStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    
  
    if (!storedAccessToken || !storedRefreshToken) {
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Clear authentication tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      console.log('✅ Auth Service: Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Auth Service: Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Normalize email address
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Log authentication attempts
   */
  private logAuthAttempt(type: string, data: { [key: string]: string }): void {
    const logData = { ...data };
    if (logData.password) logData.password = '****';
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: unknown, messages: { [key: number]: string; default: string }): Error {
    // Check if it's an HTTP error with status code
    if (this.isHttpError(error)) {
      const message = messages[error.status] || messages.default;
      return new Error(message);
    }

    // Check if it's an API response error
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      
      // Try to extract status code from error message or check common patterns
      if (typeof errorMessage === 'string') {
        // Check for common error patterns
        if (errorMessage.toLowerCase().includes('invalid credentials') || 
            errorMessage.toLowerCase().includes('unauthorized')) {
          return new Error(messages[401] || messages.default);
        }
        if (errorMessage.toLowerCase().includes('verification') || 
            errorMessage.toLowerCase().includes('email verification')) {
          return new Error(messages[403] || messages.default);
        }
        if (errorMessage.toLowerCase().includes('not found') || 
            errorMessage.toLowerCase().includes('email not found')) {
          return new Error(messages[404] || messages.default);
        }
        if (errorMessage.toLowerCase().includes('blocked') || 
            errorMessage.toLowerCase().includes('account blocked')) {
          return new Error(messages[423] || messages.default);
        }
        // Return the original error message if no pattern matches
        return new Error(errorMessage);
      }
    }

    if (error instanceof Error) {
      return error;
    }
    
    return new Error(messages.default);
  }
  
  /**
   * Type guard for HTTP errors
   */
  private isHttpError(error: unknown): error is { status: number; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as any).status === 'number'
    );
  }
}

export const authService = new AuthService();


