/**
 * Debug utility to check available native modules
 */

import { NativeModules } from 'react-native';

export const debugNativeModules = (): void => {
  console.log('🔍 Available Native Modules:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const moduleNames = Object.keys(NativeModules);
  console.log(`📦 Total modules found: ${moduleNames.length}`);
  
  // Look for SumSub related modules
  const sumsubModules = moduleNames.filter(name => 
    name.toLowerCase().includes('sns') || 
    name.toLowerCase().includes('sumsub') || 
    name.toLowerCase().includes('idensic') ||
    name.toLowerCase().includes('kyc')
  );
  
  if (sumsubModules.length > 0) {
    console.log('✅ SumSub-related modules found:');
    sumsubModules.forEach(name => {
      console.log(`  - ${name}:`, Object.keys(NativeModules[name] || {}));
    });
  } else {
    console.log('❌ No SumSub-related modules found');
  }
  
  // List all modules for debugging
  console.log('\n📋 All available modules:');
  moduleNames.sort().forEach(name => {
    console.log(`  - ${name}`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

export const checkSpecificModule = (moduleName: string): void => {
  const module = NativeModules[moduleName];
  console.log(`🔍 Checking module: ${moduleName}`);
  
  if (module) {
    console.log('✅ Module found!');
    console.log('📋 Available methods:', Object.keys(module));
    console.log('📦 Module object:', module);
  } else {
    console.log('❌ Module not found');
  }
};

export default {
  debugNativeModules,
  checkSpecificModule
};