import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dorhakim.mytracker',
  appName: 'MyTracker',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_mytracker",
      iconColor: "#488AFF",
    },
  },
};

export default config;
