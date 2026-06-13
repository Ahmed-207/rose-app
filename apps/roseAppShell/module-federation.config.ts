import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseAppShell',
  remotes: [],
  shared: (libraryName, sharedConfig) => {
    if (
      libraryName.startsWith('primeng') ||
      libraryName === 'primeicons' ||
      libraryName === '@primeng/themes' || libraryName === '@org/shared-ui-components' ||
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
