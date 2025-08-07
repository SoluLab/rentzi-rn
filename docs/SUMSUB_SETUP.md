# SumSub SDK Setup Guide

This guide walks you through setting up the SumSub React Native SDK for KYC verification.

## Installation

The package has already been installed using:

```bash
yarn add @sumsub/react-native-mobilesdk-module
```

## Platform-Specific Setup

### iOS Setup ✅ COMPLETED

1. **Install iOS dependencies:** ✅
   ```bash
   cd ios && pod install --repo-update
   ```

2. **SumSub repository added to Podfile:** ✅
   ```ruby
   # Already added to your Podfile
   source 'https://github.com/SumSubstance/Specs.git'
   source 'https://cdn.cocoapods.org/'
   ```

3. **IdensicMobileSDK installed:** ✅
   - Version: 1.35.1
   - Auto-linked via React Native

3. **Permissions in `ios/Rentzi/Info.plist`:**
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Camera access is required for identity verification</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Photo library access is required for document upload</string>
   <key>NSMicrophoneUsageDescription</key>
   <string>Microphone access is required for video verification</string>
   ```

### Android Setup

1. **Update `android/app/build.gradle`:**
   ```gradle
   android {
       compileSdkVersion 34
       buildToolsVersion "34.0.0"
       
       defaultConfig {
           minSdkVersion 21  // SumSub requires minimum API 21
           targetSdkVersion 34
       }
   }
   
   dependencies {
       implementation project(':sumsub_react-native-mobilesdk-module')
   }
   ```

2. **Update `android/settings.gradle`:**
   ```gradle
   include ':sumsub_react-native-mobilesdk-module'
   project(':sumsub_react-native-mobilesdk-module').projectDir = 
       new File(rootProject.projectDir, '../node_modules/@sumsub/react-native-mobilesdk-module/android')
   ```

3. **Permissions in `android/app/src/main/AndroidManifest.xml`:**
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

## Metro Configuration

Update `metro.config.js` to include the SumSub module:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add SumSub SDK to resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
```

## Testing the Installation

After setup, test the integration:

```typescript
import { checkKYCHealth } from '@/utils/testSumsubSDK';

// In your component
const testSDK = () => {
  checkKYCHealth();
};
```

## Environment Configuration

Create or update your environment configuration:

```typescript
// In app.config.js or similar
export default {
  expo: {
    // ... other config
    extra: {
      kycEnabled: process.env.EXPO_PUBLIC_KYC_ENABLED === 'true',
      sumsubAppToken: process.env.SUMSUB_APP_TOKEN,
      // Don't put secret keys in client code
    }
  }
};
```

## Backend Setup Required

The SumSub SDK requires backend integration for security. You'll need:

1. **SumSub Account**: Sign up at [sumsub.com](https://sumsub.com)
2. **API Credentials**: Get your App Token and Secret Key
3. **Webhook Endpoints**: Set up endpoints for verification status updates

### Sample Backend Endpoint (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Generate access token endpoint
app.post('/api/kyc/generate-token', async (req, res) => {
  const { userId, levelName } = req.body;
  
  try {
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
        levelName: levelName || 'basic-kyc-level',
        ttlInSecs: 3600
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate access token' });
  }
});

// Webhook endpoint for status updates
app.post('/api/kyc/webhook', (req, res) => {
  const signature = req.headers['x-payload-digest'];
  const body = JSON.stringify(req.body);
  
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha256', process.env.SUMSUB_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  if (signature !== hash) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const { type, payload } = req.body;
  console.log('KYC Status Update:', { type, payload });
  
  // Update user status in your database
  // ... your database update logic
  
  res.status(200).send('OK');
});
```

## Troubleshooting

### Common Issues

1. **Module not found**: 
   - Run `yarn install` again
   - Clear metro cache: `npx react-native start --reset-cache`

2. **iOS linking issues**:
   - Delete `ios/build` folder
   - Run `cd ios && pod install --repo-update`
   - Clean and rebuild in Xcode

3. **Android compilation errors**:
   - Clean build: `cd android && ./gradlew clean`
   - Check minimum SDK version (21+)
   - Verify all dependencies are compatible

4. **SDK not available at runtime**:
   - Check if NativeModules.SNSMobileSDK exists
   - Verify platform-specific setup is complete
   - Test on physical device (simulators may have issues)

### Debug Commands

```bash
# Check if package is installed
yarn list @sumsub/react-native-mobilesdk-module

# iOS: Check pod installation
cd ios && pod list | grep -i sumsub

# Android: Check if module is linked
cd android && ./gradlew :app:dependencies | grep -i sumsub

# Clear all caches
npx react-native start --reset-cache
rm -rf node_modules && yarn install
```

## Next Steps

1. Complete the platform-specific setup above
2. Configure your backend endpoints
3. Test the integration using the test utilities
4. Implement proper error handling and user feedback
5. Set up webhook processing for status updates

## Security Notes

- **Never** include SumSub Secret Keys in client code
- Always validate tokens server-side
- Implement proper webhook signature verification
- Use HTTPS for all API communications
- Store user verification status securely