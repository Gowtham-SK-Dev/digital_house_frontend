const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for Digital House Mobile App
 * https://facebook.github.io/react-native/docs/metro
 */
const config = {
  project: {
    ios: {},
    android: {},
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);


