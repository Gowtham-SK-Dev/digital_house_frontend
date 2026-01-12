import Config from 'react-native-config';

export const config = {
  // API
  apiUrl: Config.REACT_APP_API_URL || 'http://192.168.1.100:5000/api',
  socketUrl: Config.REACT_APP_SOCKET_URL || 'http://192.168.1.100:5000',

  // Firebase
  firebase: {
    apiKey: Config.REACT_APP_FIREBASE_API_KEY,
    authDomain: Config.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: Config.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: Config.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Config.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: Config.REACT_APP_FIREBASE_APP_ID,
  },

  // OneSignal
  oneSignal: {
    appId: Config.REACT_APP_ONESIGNAL_APP_ID,
  },

  // Cloudinary
  cloudinary: {
    cloudName: Config.REACT_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: Config.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  },

  // Analytics
  analytics: {
    googleId: Config.REACT_APP_GOOGLE_ANALYTICS_ID,
    metaPixelId: Config.REACT_APP_META_PIXEL_ID,
  },

  // App
  appName: Config.REACT_APP_NAME || 'Digital House',
  version: Config.REACT_APP_VERSION || '1.0.0',
};
