# KYC Integration with SumSub SDK

This document explains how to use the SumSub KYC integration in the Rentzi React Native app.

## Overview

The KYC (Know Your Customer) integration uses the SumSub Mobile SDK to provide seamless identity verification directly within the app. When users need to complete KYC verification, the SDK opens natively instead of redirecting to a web page.

## Components

### 1. KYCHandler (`services/kycHandler.ts`) - **Recommended**

High-level handler that simplifies KYC integration with comprehensive error handling:

```typescript
import { KYCHandler } from '@/services/kycHandler';

// Simple usage
await KYCHandler.handleKYCVerification({ user, router });

// With callbacks
await KYCHandler.handleKYCVerification({
  user,
  router,
  onSuccess: () => console.log('Success!'),
  onError: (error) => console.error(error)
});
```

### 2. KYCService (`services/kycService.ts`)

The main service class that handles SDK operations:

```typescript
import { KYCService } from '@/services/kycService';

// Launch KYC verification
const result = await KYCService.launchKYC({
  accessToken: 'your_access_token',
  userId: 'user_id',
  flowName: 'basic-kyc',
  locale: 'en',
  theme: 'system'
});
```

**Methods:**
- `launchKYC(config)` - Opens the KYC SDK with configuration
- `isSDKAvailable()` - Checks if the SDK is properly linked
- `getSDKVersion()` - Returns SDK version information
- `createAccessTokenRequest()` - Helper for backend token generation

### 3. KYCTokenService (`services/kycTokenService.ts`)

Handles access token generation and KYC status management:

```typescript
import { KYCTokenService } from '@/services/kycTokenService';

// Generate access token (backend integration)
const tokenResponse = await KYCTokenService.generateAccessToken({
  userId: 'user_id',
  levelName: 'basic-kyc-level',
  ttlInSecs: 3600
});

// Update KYC status
await KYCTokenService.updateKYCStatus(userId, 'complete', token);
```

## Implementation Example

### Simple Usage (Recommended)

The easiest way to integrate KYC is using the `KYCHandler`:

```typescript
import { KYCHandler } from '@/services/kycHandler';

const handleKYCVerification = async () => {
  setShowKYCModal(false);
  await KYCHandler.handleKYCVerification({
    user,
    router,
    onSuccess: () => {
      console.log('KYC completed successfully');
      // Optionally refresh UI or update state
    },
    onError: (error) => {
      console.error('KYC failed:', error);
    }
  });
};
```

### Advanced Usage

For more control, you can use the individual services:

```typescript
import { KYCService, KYCTokenService } from '@/services/...';

const handleKYCVerification = async () => {
  try {
    const tokenResponse = await KYCTokenService.generateAccessToken({
      userId: user?.id || 'anonymous',
      levelName: 'basic-kyc-level'
    });

    const result = await KYCService.launchKYC({
      accessToken: tokenResponse.token,
      userId: user?.id || 'anonymous',
      flowName: 'basic-kyc',
      locale: 'en',
      theme: 'system'
    });

    if (result.success) {
      await KYCTokenService.updateKYCStatus(
        user?.id || 'anonymous',
        'complete',
        result.token
      );
    }
  } catch (error) {
    console.error('KYC Error:', error);
    router.push('/kyc-verification'); // Fallback
  }
};
```

## Backend Integration

### Required Endpoints

1. **POST `/kyc/generate-token`**
   ```json
   {
     "userId": "string",
     "levelName": "string",
     "ttlInSecs": 3600
   }
   ```

2. **GET `/kyc/status/:userId`**
   Returns user's current KYC status

3. **PUT `/kyc/status/:userId`**
   ```json
   {
     "status": "complete",
     "token": "verification_token",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

### Access Token Generation

Your backend should generate access tokens using the SumSub API:

```javascript
const generateAccessToken = async (userId, levelName) => {
  const response = await fetch('https://api.sumsub.com/resources/accessTokens', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-App-Token': process.env.SUMSUB_APP_TOKEN,
      'X-App-Secret': process.env.SUMSUB_SECRET_KEY
    },
    body: JSON.stringify({
      userId,
      levelName,
      ttlInSecs: 3600
    })
  });
  
  return response.json();
};
```

## Configuration

### Environment Variables

Add to your environment configuration:

```env
EXPO_PUBLIC_KYC_ENABLED=true
SUMSUB_APP_TOKEN=your_app_token
SUMSUB_SECRET_KEY=your_secret_key
```

### Testing Mode

For testing without a backend, the service includes a mock token generator:

```typescript
// This creates a mock token for testing
const accessToken = KYCTokenService.createMockAccessToken(userId);
```

## Error Handling

The integration includes comprehensive error handling:

1. **SDK Not Available** - Falls back to web version
2. **Token Generation Failed** - Shows error and offers web fallback
3. **KYC Process Failed** - Allows retry or web fallback
4. **Network Errors** - Graceful degradation to web version

## Platform-Specific Notes

### iOS
- Requires proper SDK linking in `ios/Podfile`
- Theme configuration supported

### Android
- Requires SDK integration in `android/build.gradle`
- Automatic theme detection

## Testing

To test the integration:

1. **With Backend**: Set `EXPO_PUBLIC_KYC_ENABLED=true`
2. **Mock Mode**: Leave environment variable unset for demo mode
3. **Fallback**: Web version always available as backup

## Security Considerations

1. **Access Tokens**: Never store access tokens client-side
2. **User IDs**: Always validate user identity server-side
3. **API Keys**: Keep SumSub credentials secure on backend only
4. **Token Expiry**: Implement proper token refresh logic

## Troubleshooting

### Common Issues

1. **SDK Not Found**: Check if the package is properly installed and linked
2. **Token Invalid**: Verify backend token generation
3. **Network Issues**: Ensure API endpoints are accessible
4. **Permissions**: Check device permissions for camera/storage

### Debug Mode

Enable debug logging:

```typescript
// In development, add detailed logging
if (__DEV__) {
  console.log('KYC Config:', { accessToken: '***', userId, flowName });
}
```