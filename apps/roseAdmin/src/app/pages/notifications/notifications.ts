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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  readonly notificationTypes: NotificationType[] = [
    'ORDER',
    'PROMOTION',
    'SYSTEM',
    'REVIEW',
    'OTHER',
  ];

  readonly form = this.fb.nonNullable.group({
    userId: ['', [Validators.required, Validators.pattern(UUID_REGEX)]],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(500)]],
    type: ['ORDER' as NotificationType, Validators.required],
    link: ['', Validators.pattern(/^$|^https?:\/\/.+/i)],
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

    const raw = this.form.getRawValue();
    const body: CreateNotificationReq = {
      userId: raw.userId.trim(),
      title: raw.title.trim(),
      message: raw.message.trim(),
      type: raw.type,
      ...(raw.link.trim() ? { link: raw.link.trim() } : {}),
    };

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
            link: '',
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

  showError(controlName: 'userId' | 'title' | 'message' | 'type' | 'link'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  fieldErrorKey(
    controlName: 'userId' | 'title' | 'message' | 'link',
  ): string | null {
    const control = this.form.controls[controlName];
    if (!this.showError(controlName)) {
      return null;
    }

    if (controlName === 'userId') {
      if (control.errors?.['required']) {
        return 'ADMIN.NOTIFICATIONS.USER_ID_REQUIRED';
      }
      if (control.errors?.['pattern']) {
        return 'ADMIN.NOTIFICATIONS.USER_ID_INVALID';
      }
    }

    if (controlName === 'title' && control.errors?.['required']) {
      return 'ADMIN.NOTIFICATIONS.TITLE_REQUIRED';
    }

    if (controlName === 'message' && control.errors?.['required']) {
      return 'ADMIN.NOTIFICATIONS.MESSAGE_REQUIRED';
    }

    if (controlName === 'link' && control.errors?.['pattern']) {
      return 'ADMIN.NOTIFICATIONS.LINK_INVALID';
    }

    return null;
  }
}
