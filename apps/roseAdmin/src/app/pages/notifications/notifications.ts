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
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  NotificationRecipient,
  NotificationUserSearchService,
} from './notification-user-search.service';

const MIN_SEARCH_LENGTH = 2;

@Component({
  selector: 'app-notifications-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsPage implements OnInit {
  private readonly adminNotificationService = inject(AdminNotificationService);
  private readonly userSearchService = inject(NotificationUserSearchService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchQuery$ = new Subject<string>();

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly pushStatusMessage = signal<string | null>(null);
  readonly userSearchQuery = signal('');
  readonly searchResults = signal<NotificationRecipient[]>([]);
  readonly selectedUser = signal<NotificationRecipient | null>(null);
  readonly isSearching = signal(false);
  readonly showResults = signal(false);
  readonly searchAttempted = signal(false);

  readonly notificationTypes: NotificationType[] = [
    'ORDER',
    'PROMOTION',
    'SYSTEM',
    'REVIEW',
    'OTHER',
  ];

  readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(500)]],
    type: ['ORDER' as NotificationType, Validators.required],
    link: ['', Validators.pattern(/^$|^https?:\/\/.+/i)],
  });

  ngOnInit(): void {
    this.loadPushStatus();
    this.setupUserSearch();
  }

  private setupUserSearch(): void {
    this.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          const trimmed = query.trim();
          if (trimmed.length < MIN_SEARCH_LENGTH) {
            this.searchResults.set([]);
            this.showResults.set(false);
            this.searchAttempted.set(false);
            this.isSearching.set(false);
          }
        }),
        switchMap((query) => {
          const trimmed = query.trim();
          if (trimmed.length < MIN_SEARCH_LENGTH) {
            return EMPTY;
          }

          this.isSearching.set(true);
          this.searchAttempted.set(true);

          return this.userSearchService.searchUsers(trimmed).pipe(
            catchError(() => {
              this.searchResults.set([]);
              return EMPTY;
            }),
            finalize(() => this.isSearching.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
        this.showResults.set(results.length > 0);
      });
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

  onUserSearchInput(value: string): void {
    this.userSearchQuery.set(value);
    this.searchQuery$.next(value);
  }

  onSearchFocus(): void {
    if (this.searchResults().length > 0) {
      this.showResults.set(true);
    }
  }

  onSearchBlur(): void {
    setTimeout(() => this.showResults.set(false));
  }

  selectUser(user: NotificationRecipient): void {
    this.selectedUser.set(user);
    this.form.controls.userId.setValue(user.id);
    this.userSearchQuery.set('');
    this.searchResults.set([]);
    this.showResults.set(false);
    this.searchAttempted.set(false);
  }

  clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.form.controls.userId.setValue('');
    this.userSearchQuery.set('');
    this.searchResults.set([]);
    this.showResults.set(false);
    this.searchAttempted.set(false);
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
          this.clearSelectedUser();
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

    if (controlName === 'userId' && control.errors?.['required']) {
      return 'ADMIN.NOTIFICATIONS.RECIPIENT_REQUIRED';
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
