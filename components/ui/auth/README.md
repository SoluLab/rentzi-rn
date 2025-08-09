# Auth UI Components

This folder contains all authentication-related UI components used throughout the Rentzi application.

## Components

### Headers
- **ForgotPasswordHeader** - Header for the forgot password screen
- **ForgotPasswordOTPHeader** - Header for the forgot password OTP verification screen
- **MobileVerificationHeader** - Header for mobile number verification screen
- **NewPasswordHeader** - Header for the new password creation screen
- **OTPVerificationHeader** - Header for OTP verification screens

### Form Components
- **QuickAccessButtons** - Quick access buttons for different user roles (Renter, Investor, Homeowner)
- **TermsAndConditions** - Terms and conditions checkbox with links
- **UserTypeTabs** - Tab component for selecting between Renter/Investor and Homeowner

## Usage

```typescript
// Import individual components
import { ForgotPasswordHeader } from '@/components/ui/auth/ForgotPasswordHeader';

// Or import from the index file
import { 
  ForgotPasswordHeader, 
  UserTypeTabs, 
  TermsAndConditions 
} from '@/components/ui/auth';
```

## Features

- **TypeScript Support**: All components are fully typed
- **Responsive Design**: Components adapt to different screen sizes
- **Accessibility**: Components include proper accessibility attributes
- **Consistent Styling**: Uses the app's design system and constants
- **Reusable**: Components can be used across different auth flows

## Design System

All components use the following design tokens:
- Colors from `@/constants/colors`
- Spacing from `@/constants/spacing`
- Typography from `@/components/ui/Typography`
- Border radius from `@/constants/radius`

## Props

Each component accepts specific props for customization:
- **Headers**: Accept contact information (email, phone) for display
- **Form Components**: Accept callbacks for user interactions
- **Tabs**: Accept current selection and change handlers

## Examples

```typescript
// User Type Selection
<UserTypeTabs
  selectedUserType={userType}
  onUserTypeChange={setUserType}
/>

// Terms and Conditions
<TermsAndConditions
  acceptedTerms={acceptedTerms}
  onTermsChange={setAcceptedTerms}
  error={errors.acceptedTerms}
/>

// OTP Header
<OTPVerificationHeader
  email="user@example.com"
  phone="+1234567890"
/>
``` 