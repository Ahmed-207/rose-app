import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseAppShell',
  remotes: [],
  shared: (libraryName, sharedConfig) => {
    // CHANGED: Matched shell shared config exactly with roseAdmin to ensure identical runtime singletons.
    const isSharedPackage =
      libraryName === '@angular/router' ||
      libraryName === '@angular/animations' ||
      libraryName === '@angular/google-maps' ||
      libraryName.startsWith('primeng') ||
      libraryName.startsWith('@primeng') ||
      libraryName.startsWith('@primeuix') || // ADDED
      libraryName === 'primeicons' ||
      libraryName.startsWith('lucide-angular') || // ADDED
      libraryName === 'ngx-toastr' ||
      libraryName === '@org/shared-ui-components' ||
      libraryName === '@org/shared-theme' ||
      libraryName === '@org/ui-lang-switcher' ||
      libraryName === '@ngx-translate/core' ||
      libraryName === '@ngx-translate/http-loader' ||
      libraryName === '@ngrx/signals';

    if (isSharedPackage) {
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