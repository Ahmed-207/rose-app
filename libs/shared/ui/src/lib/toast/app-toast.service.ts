import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

export type AppToastType = 'success' | 'error' | 'info' | 'warn';

@Injectable({ providedIn: 'root' })
export class AppToastService {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warn(message: string): void {
    this.show('warn', message);
  }

  private show(severity: AppToastType, message: string): void {
    this.messageService.add({
      key: 'app',
      severity,
      summary: this.translate.instant(message),
      life: 3500,
    });
  }
}
