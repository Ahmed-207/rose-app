import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'roseMain',
  exposes: {
    './Routes': 'apps/roseMain/src/app/remote-entry/entry.routes.ts',
  },
    shared: (libraryName, sharedConfig) => {
    if (libraryName.startsWith('primeng') || libraryName === 'primeicons' || libraryName === '@primeng/themes') {
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

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
