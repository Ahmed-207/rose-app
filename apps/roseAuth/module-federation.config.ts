import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseAuth',
  exposes: {
    './Routes': 'apps/roseAuth/src/app/remote-entry/entry.routes.ts',
  },
  shared: (libraryName, sharedConfig) => {
    if (
      libraryName.startsWith('primeng') ||
      libraryName === 'primeicons' ||
      libraryName === '@primeng/themes' ||
      libraryName === '@primeuix/themes' ||
      libraryName === '@org/shared-ui-components' ||
      libraryName === '@org/shared-theme' ||
      libraryName === '@ngx-translate/core' ||
      libraryName === '@ngx-translate/http-loader'
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
