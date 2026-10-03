import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spartan3d.print',
  appName: 'Spartan 3D Print',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Allow navigation to external URLs
    allowNavigation: ['*'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    App: {
      launchAutoHide: false,
      launchShowDuration: 0,
      backgroundColor: '#0f172a',
      loadingHideTimeout: 500,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#6366f1',
    },
  },
  android: {
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD,
    },
  },
  ios: {
    scheme: 'spartan3d',
  },
};

export default config;
