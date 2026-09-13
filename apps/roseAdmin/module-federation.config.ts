import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseAdmin',
  exposes: {
    './Routes': 'apps/roseAdmin/src/app/remote-entry/entry.routes.ts',
  },
  shared: (libraryName, sharedConfig) => {
    // CHANGED: Expanded matching logic to catch scoped sub-paths like @primeuix/utils, 
    // lucide-angular, and deep primeng sub-modules to prevent CORS/504 errors.
    const isSharedPackage =
      libraryName === '@angular/router' ||
      libraryName === '@angular/animations' ||
      libraryName === '@angular/google-maps' ||
      libraryName.startsWith('primeng') ||
      libraryName.startsWith('@primeng') ||
      libraryName.startsWith('@primeuix') || // ADDED: Captures @primeuix/utils & @primeuix/themes
      libraryName === 'primeicons' ||
      libraryName.startsWith('lucide-angular') || // ADDED: Shared icon chunks
      libraryName === 'ngx-toastr' || // ADDED: Ensures Toastr singleton across host/remote
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