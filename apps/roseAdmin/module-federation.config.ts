import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseAdmin',
  exposes: {
    './Routes': 'apps/roseAdmin/src/app/remote-entry/entry.routes.ts',
  },
  shared: (libraryName, sharedConfig) => {
    if (
      
      libraryName.startsWith('primeng') ||
      libraryName === 'primeicons' ||
      libraryName === '@primeng/themes' ||
      libraryName === '@primeuix/themes' ||
      libraryName === '@org/shared-ui-components' ||
      libraryName === '@org/shared-theme' ||
      libraryName === '@org/ui-lang-switcher' ||
      libraryName === '@ngx-translate/core' ||
      libraryName === '@ngx-translate/http-loader' ||
      libraryName === '@ngrx/signals' ||
      libraryName === '@angular/google-maps'
    ) {
      return {
        ...sharedConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
      };
    }
    return sharedConfig;
  }
};

export default config;
