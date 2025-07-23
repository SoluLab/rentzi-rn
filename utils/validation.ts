// List of common disposable email domains to reject
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'zoaxe.com',
  'zoemail.org',
  'zomg.info',
];
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  // Check for spaces first
  if (/\s/.test(password)) {
    return { isValid: false, error: 'Password must not contain spaces' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  if (!hasUppercase) {
    return {
      isValid: false,
      error: 'Password must contain at least 1 uppercase letter',
    };
  }
  if (!hasLowercase) {
    return {
      isValid: false,
      error: 'Password must contain at least 1 lowercase letter',
    };
  }
  if (!hasDigit) {
    return {
      isValid: false,
      error: 'Password must contain at least 1 digit',
    };
  }
  if (!hasSpecialChar) {
    return {
      isValid: false,
      error: 'Password must contain at least 1 special character (!@#$%^&*)',
    };
  }
  return { isValid: true };
};
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  // Email format validation with the specified pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  // Check against disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }
  return { isValid: true };
};
export const validateOTP = (otp: string): { isValid: boolean; error?: string } => {
  if (!otp) {
    return { isValid: false, error: 'OTP is required' };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: 'Please enter a valid 6-digit numeric OTP' };
  }
  return { isValid: true };
};
export const validateMobileNumber = (mobile: string): { isValid: boolean; error?: string } => {
  if (!mobile) {
    return { isValid: false, error: 'Mobile number is required' };
  }
  // Remove all non-digit characters for validation
  const cleanMobile = mobile.replace(/\D/g, '');
  // Check if it's exactly 10 digits for login
  if (cleanMobile.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }
  // Check if it contains only numeric characters
  if (!/^\d+$/.test(cleanMobile)) {
    return { isValid: false, error: 'Mobile number must contain only digits' };
  }
  return { isValid: true };
};
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  if (name.trim().length > 30) {
    return { isValid: false, error: 'Name cannot exceed 30 characters' };
  }
  // Check for valid characters (letters only, no spaces, hyphens, or apostrophes for individual names)
  const nameRegex = /^[a-zA-Z]+$/;
  if (!nameRegex.test(name.trim())) {
    return {
      isValid: false,
      error: 'Name can only contain letters',
    };
  }
  return { isValid: true };
};