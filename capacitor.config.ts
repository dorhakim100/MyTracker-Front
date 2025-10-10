import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mytracker.app',
  appName: 'MyTracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config

