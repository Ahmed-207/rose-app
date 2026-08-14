import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MessageService } from 'primeng/api';

export function provideAppToast(): EnvironmentProviders {
  return makeEnvironmentProviders([MessageService]);
}
