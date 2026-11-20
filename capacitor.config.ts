import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teis.workapp',
  appName: 'TEIS workapp',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
