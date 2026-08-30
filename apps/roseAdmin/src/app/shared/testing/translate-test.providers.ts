import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

export function provideTestTranslate() {
  return provideTranslateService({
    fallbackLang: 'en',
    lang: 'en',
  });
}

export function configureTestingModuleWithTranslate(
  config: Parameters<typeof TestBed.configureTestingModule>[0],
) {
  return TestBed.configureTestingModule({
    ...config,
    providers: [...(config.providers ?? []), provideTestTranslate()],
  });
}
