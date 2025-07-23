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

export const validatePropertyTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title.trim()) {
    return { isValid: false, error: 'Property title is required' };
  }
  if (title.length < 2) {
    return { isValid: false, error: 'Property title must be at least 2 characters long' };
  }
  if (title.length > 100) {
    return { isValid: false, error: 'Property title cannot exceed 100 characters' };
  }
  // Allow only letters, numbers, spaces, hyphens, and slashes
  const titleRegex = /^[a-zA-Z0-9\s\-/]+$/;
  if (!titleRegex.test(title)) {
    return { isValid: false, error: 'Property title can only contain letters, numbers, spaces, hyphens, and slashes' };
  }
  return { isValid: true };
};

export const validatePincode = (pincode: string): { isValid: boolean; error?: string } => {
  if (!pincode) {
    return { isValid: false, error: 'Pincode is required' };
  }
  const cleanPincode = pincode.replace(/\D/g, '');
  if (cleanPincode.length < 5 || cleanPincode.length > 6) {
    return { isValid: false, error: 'Pincode must be 5-6 digits' };
  }
  if (!/^\d+$/.test(cleanPincode)) {
    return { isValid: false, error: 'Pincode must contain only digits' };
  }
  return { isValid: true };
};

export const validateSquareFootage = (sqft: string): { isValid: boolean; error?: string } => {
  if (!sqft) {
    return { isValid: false, error: 'Square footage is required' };
  }
  const cleanSqft = sqft.replace(/\D/g, '');
  const sqftNumber = parseInt(cleanSqft);
  if (isNaN(sqftNumber) || sqftNumber < 3000) {
    return { isValid: false, error: 'Square footage must be at least 3,000 sqft' };
  }
  return { isValid: true };
};

export const validateYearBuilt = (year: string): { isValid: boolean; error?: string } => {
  if (!year) {
    return { isValid: false, error: 'Year built is required' };
  }
  const cleanYear = year.replace(/\D/g, '');
  const yearNumber = parseInt(cleanYear);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
    return { isValid: false, error: `Year must be between 1900 and ${currentYear}` };
  }
  return { isValid: true };
};