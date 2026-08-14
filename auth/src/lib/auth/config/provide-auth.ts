import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { API_URL } from './api';

export interface AuthConfig {
  apiUrl: string;
  extraInterceptors?: HttpInterceptorFn[];
}

export function provideAuth(config: AuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_URL, useValue: config.apiUrl },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        ...(config.extraInterceptors ?? []),
      ]),
    ),
  ]);
}
