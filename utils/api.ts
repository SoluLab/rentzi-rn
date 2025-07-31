import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS, ENDPOINTS, getFullUrl } from '../constants/urls';
import { toast } from '../components/ui/Toast';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
} as const;

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  DEFAULT: 'An error occurred',
  TOKEN_REFRESH: 'TOKEN_REFRESH_REQUIRED',
} as const;

export { ERROR_MESSAGES };

class ApiService {
  private readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  private async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  }

  private async setTokens(tokens: TokenResponse): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem('token', tokens.accessToken),
      AsyncStorage.setItem('refreshToken', tokens.refreshToken),
    ]);
  }

  private createHeaders(authToken?: string | null): Headers {
    const headers = new Headers(this.defaultHeaders);
    if (authToken) {
      headers.append('Authorization', `Bearer ${authToken}`);
    }
    return headers;
  }

  private getErrorMessage(status: number, message?: string): string {
    // Prioritize server message over generic ones
    if (message) {
      return message;
    }
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.VALIDATION_ERROR:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      default:
        return ERROR_MESSAGES.DEFAULT;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = this.getErrorMessage(response.status, data.message);
      
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          throw new Error(ERROR_MESSAGES.TOKEN_REFRESH);
        }
      }
      
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: data.message || 'Success',
      data: data.data || data,
    };
  }

  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.request<TokenResponse>(
        API_URLS.AUTH_API,
        ENDPOINTS.AUTH.REFRESH_TOKEN,
        {
          method: 'POST',
          body: { refreshToken },
          requiresAuth: false,
        }
      );

      if (response.success && response.data) {
        await this.setTokens(response.data);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  public async request<T>(
    baseUrl: string,
    endpoint: string,
    config: Partial<RequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      requiresAuth = true,
    } = config;

    try {
      const authToken = requiresAuth ? await this.getAuthToken() : null;
      const headers = this.createHeaders(authToken);
      const url = getFullUrl(baseUrl, endpoint);




      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });


      const result = await this.handleResponse<T>(response);


      return result;
    } catch (error: any) {

      if (error.message === ERROR_MESSAGES.TOKEN_REFRESH) {
        return this.request<T>(baseUrl, endpoint, config);
      }

      return {
        success: false,
        message: error.message || 'Request failed',
        error: error.message,
      };
    }
  }

  // Convenience methods for HTTP verbs
  private createMethod<T>(method: HttpMethod) {
    return (baseUrl: string, endpoint: string, body?: any, requiresAuth = true): Promise<ApiResponse<T>> => {
      return this.request<T>(baseUrl, endpoint, { method, body, requiresAuth });
    };
  }

  public get = this.createMethod<any>('GET');
  public post = this.createMethod<any>('POST');
  public put = this.createMethod<any>('PUT');
  public delete = this.createMethod<any>('DELETE');
  public patch = this.createMethod<any>('PATCH');
}

export const api = new ApiService();