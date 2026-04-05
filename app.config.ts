import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SalesCoachApp',
  slug: 'SalesCoachApp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.coachduynguyen.SalesCoachApp',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  // EAS Update config
  updates: {
    url: 'https://u.expo.dev/4c77992d-b9c4-4a58-b1a9-71bac1dcf2ed',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    eas: {
      projectId: '4c77992d-b9c4-4a58-b1a9-71bac1dcf2ed',
    },
  },
});
