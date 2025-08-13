import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useLogin } from "@/services/auth";
import { useRenterInvestorLogin } from "@/services/renterInvestorAuth";
import { loginSchema, userTypeSchema, type LoginFormData, type UserType } from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import { AuthResponse } from "@/types/auth";
import { RenterInvestorLoginResponse, RenterInvestorLoginRequest } from "@/types/renterInvestorAuth";
import { validateWithZod } from "@/utils/validation";

interface UseLoginFormReturn {
  formData: LoginFormData;
  userType: UserType;
  errors: Record<string, string>;
  isLoading: boolean;
  updateField: (field: keyof LoginFormData, value: string) => void;
  setUserType: (type: UserType) => void;
  handleLogin: () => Promise<void>;
  quickAccessLogin: (role: string) => void;
}

export const useLoginForm = (): UseLoginFormReturn => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [userType, setUserType] = useState<UserType>("renter_investor");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const homeownerLoginMutation = useLogin({
    onSuccess: async (response: AuthResponse) => {
      if (response.success && response.data) {
        const { user } = response.data;
        if (!user.isEmailVerified || !user.isPhoneVerified) {
          toast.info(TOAST_MESSAGES.AUTH.LOGIN.ACCOUNT_VERIFICATION_REQUIRED);
          router.push({
            pathname: "/(auth)/otp-verification",
            params: {
              email: user.email,
              phone: JSON.stringify(user.phone),
              type: "login",
              roleType: userType,
            },
          });
          return;
        }
        toast.success(TOAST_MESSAGES.AUTH.LOGIN.SUCCESS);
        router.replace("/(tabs)");
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.LOGIN.FAILED;
        toast.error(errorMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.AUTH.LOGIN.FAILED;
      toast.error(errorMessage);
    },
  });

  const renterInvestorLoginMutation = useRenterInvestorLogin({
    onSuccess: async (response: RenterInvestorLoginResponse, variables) => {
      if (response.success && response.data) {
        if (response.data.requiresOTP) {
          toast.info(TOAST_MESSAGES.AUTH.LOGIN.OTP_SENT);
          const emailParam = typeof variables.identifier === 'string' ? variables.identifier : '';
          const phoneParam = typeof variables.identifier === 'object' ? JSON.stringify(variables.identifier) : '';
          router.push({
            pathname: "/(auth)/otp-verification",
            params: {
              email: emailParam,
              phone: phoneParam,
              sessionId: response.data.sessionId,
              userId: response.data.userId,
              type: "login",
              roleType: userType,
              otp: response.data.otp,
            },
          });
          return;
        }
        toast.success(TOAST_MESSAGES.AUTH.LOGIN.SUCCESS);
        router.replace("/(tabs)");
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.LOGIN.FAILED;
        toast.error(errorMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.AUTH.LOGIN.FAILED;
      toast.error(errorMessage);
    },
  });

  const loginMutation = userType === "homeowner" ? homeownerLoginMutation : renterInvestorLoginMutation;

  const validateForm = useCallback((): boolean => {
    // Prepare identifier for validation: if it's a JSON string (phone mode), validate as "+<cc><mobile>"
    let identifierForValidation = formData.identifier;
    const trimmed = identifierForValidation.trim();
    let parsedPhone: { countryCode: string; mobile: string } | null = null;
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.countryCode === "string" && typeof parsed.mobile === "string") {
          parsedPhone = parsed;
          identifierForValidation = `${parsed.countryCode}${parsed.mobile}`;
        }
      } catch (_) {
        // ignore parse error; keep original
      }
    }

    const { isValid, errors: validationErrors } = validateWithZod(loginSchema, {
      ...formData,
      identifier: identifierForValidation,
    } as any);
    // Customize identifier error message based on mode
    if (validationErrors.identifier) {
      const customErrors = { ...validationErrors };
      if (parsedPhone) {
        customErrors.identifier = "Please enter a valid mobile number (including country code)";
      } else {
        customErrors.identifier = "Please enter a valid email address";
      }
      setErrors(customErrors);
    } else {
      setErrors(validationErrors);
    }
    return isValid;
  }, [formData]);

  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    const rawIdentifier = formData.identifier.trim();
    let identifier: any = rawIdentifier;

    // If identifier is a JSON string from phone UI, parse it
    if (rawIdentifier.startsWith("{") && rawIdentifier.endsWith("}")) {
      try {
        const parsed = JSON.parse(rawIdentifier);
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.countryCode === "string" &&
          typeof parsed.mobile === "string"
        ) {
          identifier = parsed;
        }
      } catch (_) {
        // fall back to raw string if parse fails
      }
    }

    const payload = { identifier, password: formData.password } as any;

    loginMutation.mutate(payload);
  }, [formData, userType, validateForm, loginMutation]);

  const quickAccessLogin = useCallback((role: string) => {
    const email = "vimal@solulab.co";
    const defaultPassword = "@Test123";

    const newUserType: UserType = role === "homeowner" ? "homeowner" : "renter_investor";
    setUserType(newUserType);
    setFormData({ identifier: email, password: defaultPassword });

    setTimeout(() => {
      const payload = { identifier: email, password: defaultPassword };

      loginMutation.mutate(payload);
    }, 100);
  }, [loginMutation]);

  return {
    formData,
    userType,
    errors,
    isLoading: loginMutation.isPending,
    updateField,
    setUserType,
    handleLogin,
    quickAccessLogin,
  };
}; 