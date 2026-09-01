import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { resolveAuthErrorMessage } from '@org/auth';
import {
  AdminNotificationService,
  CreateNotificationReq,
  NotificationType,
} from '@org/notifications';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-notifications-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsPage implements OnInit {
  private readonly adminNotificationService = inject(AdminNotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly pushStatusMessage = signal<string | null>(null);

  readonly notificationTypes: NotificationType[] = ['ORDER', 'PROMO', 'SYSTEM'];

  readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(500)]],
    type: ['ORDER' as NotificationType, Validators.required],
  });

  ngOnInit(): void {
    this.loadPushStatus();
  }

  private loadPushStatus(): void {
    this.adminNotificationService
      .getPushStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payload) => {
          const { pushConfigured, subscriptionCount } = payload;
          this.pushStatusMessage.set(
            pushConfigured
              ? this.translate.instant('ADMIN.NOTIFICATIONS.PUSH_CONFIGURED', {
                  count: subscriptionCount,
                })
              : this.translate.instant('ADMIN.NOTIFICATIONS.PUSH_NOT_CONFIGURED'),
          );
        },
        error: () => {
          this.pushStatusMessage.set(
            this.translate.instant('ADMIN.NOTIFICATIONS.PUSH_UNAVAILABLE'),
          );
        },
      });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const body = this.form.getRawValue() as CreateNotificationReq;

    this.adminNotificationService
      .createNotification(body)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            this.translate.instant('ADMIN.NOTIFICATIONS.SUCCESS'),
          );
          this.form.reset({
            userId: '',
            title: '',
            message: '',
            type: 'ORDER',
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            resolveAuthErrorMessage(
              error,
              this.translate.instant('ADMIN.NOTIFICATIONS.ERROR_SEND'),
            ),
          );
        },
      });
  }

  showError(controlName: 'userId' | 'title' | 'message' | 'type'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }
}
