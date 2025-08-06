# Demo KYC Testing Guide 🧪

This guide explains how to test the KYC integration using the provided demo access token.

## Demo Access Token

A working SumSub demo access token has been configured for testing:

```typescript
// Sandbox demo token (safe for testing)
'sbx:uY0bf4Hb2ILq8J5MNGjm2lL2.KYhj9eF7lGS3NFPnqLj7B3G8M9P4K1Q2'
```

This token connects to SumSub's sandbox environment, allowing you to test the full KYC flow without real verification.

## How to Test

### 1. **Enable Demo Mode**

Demo mode is automatically enabled in development. You can verify this in `constants/kycConfig.ts`:

```typescript
DEMO_MODE: {
  ENABLED: true, // This enables demo mode
  ACCESS_TOKEN: 'sbx:uY0bf4Hb2ILq8J5MNGjm2lL2.KYhj9eF7lGS3NFPnqLj7B3G8M9P4K1Q2',
  ENVIRONMENT: 'sandbox',
}
```

### 2. **Test KYC Flow**

Navigate to any property in the app and try to invest:

1. Go to Property Details screen
2. Click "Invest in this Property"
3. Click "Start KYC Process"
4. You'll see a "Demo Mode 🧪" alert
5. Click "Continue Demo"
6. The SumSub SDK will open in sandbox mode

### 3. **Using Test Utilities**

You can also test using the built-in utilities:

```typescript
import { testKYCHandler, quickKYCTest } from '@/utils/testSumsubSDK';

// Test with the handler (recommended)
await testKYCHandler(router);

// Quick test
await quickKYCTest();
```

### 4. **Manual Testing with Different User Types**

```typescript
import { KYCHandler } from '@/services/kycHandler';

// Test as investor
await KYCHandler.handleKYCVerification({
  user: { id: 'test_investor', email: 'investor@test.com' },
  router,
  userType: 'investor'
});

// Test as homeowner
await KYCHandler.handleKYCVerification({
  user: { id: 'test_homeowner', email: 'homeowner@test.com' },
  router,
  userType: 'homeowner'
});

// Test as renter
await KYCHandler.handleKYCVerification({
  user: { id: 'test_renter', email: 'renter@test.com' },
  router,
  userType: 'renter'
});
```

## Demo Flow Features

### ✅ **What Works in Demo Mode**

- Real SumSub SDK opens natively
- Full document upload flow
- Identity verification screens
- Liveness detection (if enabled)
- Photo capture and upload
- Real-time validation feedback

### ⚠️ **Demo Limitations**

- Verification results are simulated
- No real identity verification
- Documents are not actually processed
- Results may be inconsistent
- Sandbox data doesn't persist

## Expected Demo Behavior

### **Success Flow:**
1. SDK opens successfully
2. User completes document upload
3. Photos are taken and uploaded
4. SDK returns success result
5. App shows "KYC Completed" message

### **Error Scenarios to Test:**
1. **Network Issues**: Disable internet → should show fallback
2. **SDK Not Available**: Simulated by returning false from `isSDKAvailable()`
3. **Token Issues**: Invalid token → should show error and offer web fallback

## Debugging Demo Mode

### **Enable Debug Logging**

Debug logging is automatically enabled in development:

```typescript
// Check logs for these messages:
console.log('🧪 Using SumSub demo access token for testing');
console.log('📋 Demo User ID:', userId);
console.log('🌐 Environment:', 'sandbox');
```

### **Verify Demo Configuration**

```typescript
import { isDemoMode, KYC_CONFIG } from '@/constants/kycConfig';

console.log('Demo Mode:', isDemoMode()); // Should be true
console.log('Token:', KYC_CONFIG.DEMO_MODE.ACCESS_TOKEN);
console.log('Environment:', KYC_CONFIG.DEMO_MODE.ENVIRONMENT);
```

## Transitioning to Production

When ready for production:

1. **Disable Demo Mode:**
   ```typescript
   // In constants/kycConfig.ts
   DEMO_MODE: {
     ENABLED: false, // Set to false
     // ... rest of config
   }
   ```

2. **Set Environment Variable:**
   ```env
   EXPO_PUBLIC_KYC_ENABLED=true
   ```

3. **Implement Backend Endpoints:**
   - Token generation endpoint
   - Status update endpoint
   - Webhook handling

4. **Replace Demo Token:**
   - Remove demo token from code
   - Implement proper backend token generation
   - Add your SumSub API credentials to backend

## Troubleshooting

### **Demo Token Not Working?**

1. Check if package is properly installed:
   ```bash
   yarn list @sumsub/react-native-mobilesdk-module
   ```

2. Verify platform setup is complete:
   ```bash
   # iOS
   cd ios && pod install
   
   # Android
   cd android && ./gradlew clean
   ```

3. Test SDK availability:
   ```typescript
   import { checkKYCHealth } from '@/utils/testSumsubSDK';
   checkKYCHealth();
   ```

### **SDK Not Opening?**

1. Check device compatibility (physical device recommended)
2. Verify permissions are granted
3. Check console for error messages
4. Try the web fallback option

### **Demo Results Inconsistent?**

This is expected behavior in sandbox mode. The demo environment simulates various scenarios for testing purposes.

## Next Steps

Once demo testing is successful:

1. ✅ Complete platform-specific setup
2. ✅ Implement backend integration
3. ✅ Configure production tokens
4. ✅ Set up webhook handling
5. ✅ Test with real verification flow

The demo token provides a safe environment to test the complete integration before connecting to production systems! 🚀