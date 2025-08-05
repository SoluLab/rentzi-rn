const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Update resolver to handle SVG files
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config; 