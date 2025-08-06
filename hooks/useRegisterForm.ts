import { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useSignup } from "@/services/auth";
import { useRenterInvestorRegister } from "@/services/renterInvestorAuth";
import { 
  registerSchema, 
  type RegisterFormData,
  type CountryCode
} from "@/types/auth";
import { 
  type RenterInvestorRegisterRequest
} from "@/types/renterInvestorAuth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseRegisterFormReturn {
  formData: RegisterFormData;
  selectedCountryCode: CountryCode;
  acceptedTerms: boolean;
  errors: Record<string, string>;
  isLoading: boolean;
  updateField: (field: keyof RegisterFormData, value: any) => void;
  setSelectedCountryCode: (countryCode: CountryCode) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  handleRegister: () => Promise<void>;
}

export const useRegisterForm = (roleType?: string): UseRegisterFormReturn => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    selectedCountryCode: {
      code: "US",
      name: "United States",
      flag: "🇺🇸",
      phoneCode: "+1",
    },
  });
  
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>({
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    phoneCode: "+1",
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const signupMutation = useSignup();
  const renterInvestorRegisterMutation = useRenterInvestorRegister();

  const isLoading = signupMutation.isPending || renterInvestorRegisterMutation.isPending;

  // Initialize country code based on device locale
  useEffect(() => {
    // For now, we'll use the default US country code
    // Locale detection can be added later if needed
    console.log("Using default US country code");
  }, []);

  const validateForm = useCallback((): boolean => {
    try {
      const dataToValidate = {
        ...formData,
        acceptedTerms,
        selectedCountryCode,
      };
      registerSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const newErrors: Record<string, string> = {};
        zodError.errors?.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData, acceptedTerms, selectedCountryCode]);

  const updateField = useCallback((field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      toast.error(TOAST_MESSAGES.AUTH.REGISTER.VALIDATION_ERROR);
      return;
    }

    try {
      // Use the roleType parameter or default to renter_investor
      const userType = roleType || "renter_investor";
      
      console.log("[RegisterForm] Using userType:", userType);
      
      if (userType === "renter_investor") {
        const payload: RenterInvestorRegisterRequest = {
          name: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          email: formData.email,
          password: formData.password,
          phone: {
            countryCode: selectedCountryCode.phoneCode,
            mobile: formData.mobileNumber,
          },
        };

        const response = await renterInvestorRegisterMutation.mutateAsync(payload);
        
        if (response.success) {
          toast.success(TOAST_MESSAGES.AUTH.REGISTER.SUCCESS);
          router.push({
            pathname: "/(auth)/mobile-verification",
            params: {
              email: formData.email,
              phone: formData.mobileNumber,
              type: "register",
              roleType: userType,
            },
          });
        } else {
          toast.error(response.message || TOAST_MESSAGES.AUTH.REGISTER.FAILED);
        }
      } else {
        // Homeowner registration logic
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          countryCode: selectedCountryCode.phoneCode,
          mobile: formData.mobileNumber,
          roleType: userType,
        };

        const response = await signupMutation.mutateAsync(payload);
        
        if (response.success) {
          toast.success(TOAST_MESSAGES.AUTH.REGISTER.SUCCESS);
          router.push({
            pathname: "/(auth)/mobile-verification",
            params: {
              email: formData.email,
              phone: formData.mobileNumber,
              type: "register",
              roleType: userType,
            },
          });
        } else {
          toast.error(response.message || TOAST_MESSAGES.AUTH.REGISTER.FAILED);
        }
      }
    } catch (error: any) {
      console.log("Register error:", error);
      
      let errorMessage = TOAST_MESSAGES.AUTH.REGISTER.FAILED;
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        errorMessage = TOAST_MESSAGES.AUTH.REGISTER.FAILED;
      }
      
      toast.error(errorMessage);
    }
  }, [
    formData,
    selectedCountryCode,
    acceptedTerms,
    validateForm,
    signupMutation,
    renterInvestorRegisterMutation,
    router,
    roleType
  ]);

  return {
    formData,
    selectedCountryCode,
    acceptedTerms,
    errors,
    isLoading,
    updateField,
    setSelectedCountryCode,
    setAcceptedTerms,
    handleRegister,
  };
}; 