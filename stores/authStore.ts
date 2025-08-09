import { create } from 'zustand';
import { User } from '@/types';
import { useProfileStore } from './profileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple JWT token generator for demo purposes
const generateDemoJWT = (userId: string, role: string) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }));
  const signature = btoa('demo-signature');
  return `${header}.${payload}.${signature}`;
};
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otpSent: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  otpExpiry: number;
  loginAttempts: number;
}
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    dateOfBirth: string;
    password: string;
    role?: 'renter' | 'investor' | 'homeowner';
  }) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string, phone: string) => Promise<void>;
  verifyOTP: (otp: string, email: string) => Promise<void>;
  verifyEmailOTP: (otp: string, email: string) => Promise<void>;
  verifyMobileOTP: (otp: string, phone: string) => Promise<void>;
  resendOTP: (email: string, phone: string) => Promise<void>;
  sendForgotPasswordOTP: (email: string) => Promise<void>;
  verifyForgotPasswordOTP: (otp: string, email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  setUser: (user: User) => void;
  setEmailVerified: (verified: boolean) => void;
  setMobileVerified: (verified: boolean) => void;
  updateUserRole: (role: User['role']) => void;
}
type AuthStore = AuthState & AuthActions;
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  otpSent: false,
  emailVerified: false,
  mobileVerified: false,
  otpExpiry: 0,
  loginAttempts: 0,
  // Actions
  login: async (emailOrMobile: string, password: string) => {
    set({ isLoading: true, loginAttempts: get().loginAttempts + 1 });
    try {
      // Demo users database with both email and mobile
      const demoUsers = [
        {
          email: 'renter@rentzi.com',
          mobile: '9876543210',
          password: 'renter123',
          name: 'Alexander Sterling',
          role: 'renter',
          kycStatus: 'incomplete',
        },
        {
          email: 'investor@rentzi.com',
          mobile: '9876543211',
          password: 'investor123',
          name: 'Victoria Blackwood',
          role: 'investor',
          kycStatus: 'complete',
        },
        {
          email: 'homeowner@rentzi.com',
          mobile: '9876543212',
          password: 'homeowner123',
          name: 'Marcus Rothschild',
          role: 'homeowner',
          kycStatus: 'complete',
        },
        {
          email: 'test@test.com',
          mobile: '9876543213',
          password: 'test123',
          name: 'Test User',
          role: 'renter',
          kycStatus: 'incomplete',
        },
      ];
      
      // Check if input is email or mobile
      const isEmail = emailOrMobile.includes('@');
      const userExists = demoUsers.find((user) => {
        if (isEmail) {
          return user.email.toLowerCase() === emailOrMobile.toLowerCase();
        } else {
          return user.mobile === emailOrMobile.replace(/\D/g, '');
        }
      });
      
      if (!userExists) {
        set({ isLoading: false });
        throw new Error('No account found with this email or mobile number. Please sign up first');
      }
      
      // Check if password is correct
      if (userExists.password !== password) {
        set({ isLoading: false });
        throw new Error('Incorrect password');
      }
      
      // Create user object
      const authenticatedUser: User = {
        id: Date.now().toString(),
        email: userExists.email,
        name: userExists.name,
        role: userExists.role as 'renter' | 'investor' | 'homeowner',
        profileDetails: {
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40',
          phone: '+1 (555) 123-4567',
          bio: 'Welcome to my profile! I love exploring luxury properties.',
        },
        investmentStatus: userExists.role === 'investor',
        kycStatus: userExists.kycStatus as 'incomplete' | 'pending' | 'complete',
        paymentMethods: [],
        notificationPreferences: {
          bookings: true,
          investments: true,
          listings: true,
          marketing: false,
        },
      };
      
      // Note: JWT token will be stored from real API response during OTP verification
      // We don't store a token here as it should come from the actual authentication API
      console.log(`[AuthStore] User validated for role: ${userExists.role}, waiting for OTP verification to get real token`);
      
      // Set OTP expiry time (2 minutes from now)
      const otpExpiryTime = Date.now() + 2 * 60 * 1000;
      set({
        user: authenticatedUser,
        isLoading: false,
        otpSent: true,
        otpExpiry: otpExpiryTime,
        emailVerified: false,
        mobileVerified: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (userData) => {
    set({ isLoading: true });
    try {
      // Simulate API call for registration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.fullName,
        role: userData.role || 'renter',
        profileDetails: {
          phone: userData.phone,
          bio: '',
        },
        investmentStatus: false,
        kycStatus: 'incomplete',
        paymentMethods: [],
        notificationPreferences: {
          bookings: true,
          investments: true,
          listings: true,
          marketing: false,
        },
      };
      // Set OTP expiry time (2 minutes from now)
      const otpExpiryTime = Date.now() + 2 * 60 * 1000;
      set({
        user: newUser,
        isLoading: false,
        otpSent: true,
        otpExpiry: otpExpiryTime,
        emailVerified: false,
        mobileVerified: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => {
    // Clear profile data when logging out
    useProfileStore.getState().clearProfileData();
    
    // Clear the JWT token
    AsyncStorage.removeItem("token");
    console.log('[AuthStore] Cleared JWT token on logout');
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      otpSent: false,
      emailVerified: false,
      mobileVerified: false,
      otpExpiry: 0,
      loginAttempts: 0,
    });
  },
  sendOTP: async (email: string, phone: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call to send OTP via email and SMS
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({
        isLoading: false,
        otpSent: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  verifyOTP: async (otp: string, email: string) => {
    set({ isLoading: true });
    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        set({ isLoading: false });
        throw new Error('Please enter a valid 6-digit numeric OTP');
      }
      // Check if OTP has expired
      const { otpExpiry } = get();
      if (Date.now() > otpExpiry) {
        set({ isLoading: false });
        throw new Error('OTP expired. Request a new one');
      }
      
      const { user } = get();
      if (!user) {
        set({ isLoading: false });
        throw new Error('No user found. Please login again.');
      }
      
      // Call real authentication API based on user type
      if (user.role === 'homeowner') {
        // Call homeowner authentication API
        const { apiPost } = await import('@/services/apiClient');
        const { getHomeownerAuthBaseURL, ENDPOINTS } = await import('@/constants/urls');
        
        const response = await apiPost({
          baseURL: getHomeownerAuthBaseURL(),
          endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
          data: { identifier: email, otp },
          auth: false,
        });
        
        console.log('[AuthStore] Homeowner authentication API response:', response);
        
        // Authentication successful - user is now authenticated
        set({
          isAuthenticated: true,
          isLoading: false,
          otpSent: false,
          emailVerified: true,
          mobileVerified: true,
        });
        return; // Success - OTP is valid and user is now authenticated
      } else {
        // Call renter/investor authentication API
        const { apiPost } = await import('@/services/apiClient');
        const { getRenterAuthBaseURL, ENDPOINTS } = await import('@/constants/urls');
        
        const response = await apiPost({
          baseURL: getRenterAuthBaseURL(),
          endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
          data: { identifier: email, otp },
          auth: false,
        });
        
        console.log('[AuthStore] Renter/Investor authentication API response:', response);
        
        // Authentication successful - user is now authenticated
        set({
          isAuthenticated: true,
          isLoading: false,
          otpSent: false,
          emailVerified: true,
          mobileVerified: true,
        });
        return; // Success - OTP is valid and user is now authenticated
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  verifyEmailOTP: async (otp: string, email: string) => {
    set({ isLoading: true });
    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        set({ isLoading: false });
        throw new Error('Please enter a valid 6-digit numeric OTP');
      }
      // Check if OTP has expired
      const { otpExpiry } = get();
      if (Date.now() > otpExpiry) {
        set({ isLoading: false });
        throw new Error('OTP expired. Request a new one');
      }
      // Simulate API call for email OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Email OTP verification successful
      const { user } = get();
      if (user) {
        // For login flow, complete authentication after email verification
        // For registration flow, just mark email as verified
        set({
          isAuthenticated: true,
          isLoading: false,
          emailVerified: true,
          otpSent: false,
        });
        return; // Success - Email OTP is valid
      }
      set({ isLoading: false });
      throw new Error('No user found for email verification');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  verifyMobileOTP: async (otp: string, phone: string) => {
    set({ isLoading: true });
    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        set({ isLoading: false });
        throw new Error('Please enter a valid 6-digit numeric OTP');
      }
      // Check if OTP has expired
      const { otpExpiry } = get();
      if (Date.now() > otpExpiry) {
        set({ isLoading: false });
        throw new Error('OTP expired. Request a new one');
      }
      // Simulate API call for mobile OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mobile OTP verification successful
      const { user } = get();
      if (user) {
        set({
          isAuthenticated: true,
          isLoading: false,
          otpSent: false,
          mobileVerified: true,
        });
        return; // Success - Mobile OTP is valid and user is now fully authenticated
      }
      set({ isLoading: false });
      throw new Error('No user found for mobile verification');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  resendOTP: async (email: string, phone: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Reset OTP expiry time (2 minutes from now)
      const otpExpiryTime = Date.now() + 2 * 60 * 1000;
      set({
        isLoading: false,
        otpExpiry: otpExpiryTime,
        otpSent: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  setUser: (user: User) => {
    set({ user });
  },
  setEmailVerified: (verified: boolean) => {
    set({ emailVerified: verified });
  },
  setMobileVerified: (verified: boolean) => {
    set({ mobileVerified: verified });
  },
  updateUserRole: (role) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          role,
          investmentStatus: role === 'investor',
        },
      });
    }
  },
  
  // Helper function to get current token info
  getTokenInfo: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        // Decode JWT token to get user type (for debugging)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        console.log('[AuthStore] Current token payload:', decodedPayload);
        return { token, userType: decodedPayload.userType };
      }
      return null;
    } catch (error) {
      console.error('[AuthStore] Error getting token info:', error);
      return null;
    }
  },
  sendForgotPasswordOTP: async (email: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call for forgot password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({
        isLoading: false,
        otpSent: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  verifyForgotPasswordOTP: async (otp: string, email: string) => {
    set({ isLoading: true });
    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        set({ isLoading: false });
        throw new Error('Please enter a valid 6-digit numeric OTP');
      }
      // Check if OTP has expired
      const { otpExpiry } = get();
      if (Date.now() > otpExpiry) {
        set({ isLoading: false });
        throw new Error('OTP expired. Request a new one');
      }
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check if OTP is valid (using default "123456" for demo)
      if (otp === '123456') {
        set({
          isLoading: false,
          emailVerified: true,
        });
        return; // Success - OTP is valid, proceed to reset password
      }
      set({ isLoading: false });
      throw new Error('Incorrect OTP entered');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  resetPassword: async (email: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({
        isLoading: false,
        otpSent: false,
        emailVerified: false,
        otpExpiry: 0,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));