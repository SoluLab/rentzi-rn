import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';
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
      // Simulate API call for credential validation
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        role: 'renter',
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check if OTP is valid (using default "123456" for demo)
      if (otp === '123456') {
        const { user } = get();
        if (user) {
          set({
            isAuthenticated: true,
            isLoading: false,
            otpSent: false,
            emailVerified: true,
            mobileVerified: true,
          });
          return; // Success - OTP is valid and user is now authenticated
        }
      }
      set({ isLoading: false });
      throw new Error('Incorrect OTP entered');
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
      // Check if email OTP is valid (using default "123456" for demo)
      if (otp === '123456') {
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
      }
      set({ isLoading: false });
      throw new Error('Incorrect OTP entered');
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
      // Check if mobile OTP is valid (using default "123456" for demo)
      if (otp === '123456') {
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
      }
      set({ isLoading: false });
      throw new Error('Incorrect OTP entered');
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
  sendForgotPasswordOTP: async (email: string) => {
    set({ isLoading: true });
    try {
      // Call real AuthService
      const response = await authService.forgotPassword(email);
      set({
        isLoading: false,
        otpSent: true,
        // Optionally, you can set an expiry if the backend provides it, or remove this if not needed
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