import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.pipayments.staffapp',
  appName: 'pipaystaff',
  webDir: 'www',
  bundledWebRuntime: false,  
    "android": {
      "allowMixedContent": true
    }
};

export default config;
