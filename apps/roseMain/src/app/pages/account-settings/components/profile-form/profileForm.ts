import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthActions,
  AuthErrorService,
  Gender,
  UpdateProfileRequest,
  UserProfile,
} from '@org/auth';
import { Button } from 'apps/shared/components/button/button';
import { ConfirmDialog } from 'apps/shared/components/confirm-dialog/confirmDialog';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { finalize, of, switchMap } from 'rxjs';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

@Component({
  selector: 'account-profile-form',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    FormControlComponent,
    Button,
    ConfirmDialog,
  ],
  templateUrl: './profileForm.html',
  styleUrl: './profileForm.css',
})
export class ProfileForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly errorMessage = this.authErrorService.message;
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isConfirmingEmail = signal(false);
  readonly isRequestingEmail = signal(false);
  readonly awaitingEmailCode = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly photoPreview = signal<string | null>(null);
  readonly photoError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly statusMessage = signal<string | null>(null);
  readonly pendingNewEmail = signal('');

  private selectedPhoto: File | null = null;
  private loadedEmail = '';
  private loadedProfile: UserProfile | null = null;

  readonly genderOptions = [
    {
      value: Gender.Male,
      label: this.translate.instant('auth.GENDER_MALE'),
    },
    {
      value: Gender.Female,
      label: this.translate.instant('auth.GENDER_FEMALE'),
    },
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: [{ value: '', disabled: true }],
  });

  readonly emailCodeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.photoError.set(null);

    if (!file) {
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      this.photoError.set('account.PHOTO_TYPE_ERROR');
      input.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      this.photoError.set('account.PHOTO_SIZE_ERROR');
      input.value = '';
      return;
    }

    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview.set(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  saveChanges(): void {
    if (this.isSaving() || this.awaitingEmailCode()) {
      return;
    }

    this.successMessage.set(null);
    this.statusMessage.set(null);
    this.authErrorService.clear();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set('account.FORM_INVALID');
      return;
    }

    const value = this.form.getRawValue();
    const newEmail = value.email.trim();
    const emailChanged =
      !!newEmail && newEmail.toLowerCase() !== this.loadedEmail.toLowerCase();

    const request: UpdateProfileRequest = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phone: value.phone.trim() ? this.normalizePhone(value.phone) : '',
      photo: this.selectedPhoto,
    };

    const profileChanged = this.hasProfileChanges(request);

    if (!profileChanged && !emailChanged) {
      this.statusMessage.set('account.NO_CHANGES');
      return;
    }

    // Email-only change: go straight to verification request
    if (!profileChanged && emailChanged) {
      this.startEmailChange(newEmail);
      return;
    }

    this.isSaving.set(true);
    let finishedOk = false;

    this.authActions
      .updateProfile(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((profile) => {
          this.patchForm(profile, emailChanged ? newEmail : undefined);
          this.selectedPhoto = null;

          if (!emailChanged) {
            return of({ emailRequested: false as const });
          }

          return this.requestEmailCode$(newEmail).pipe(
            switchMap(() => of({ emailRequested: true as const })),
          );
        }),
        finalize(() => {
          this.isSaving.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
          }
        }),
      )
      .subscribe((result) => {
        finishedOk = true;

        if (result.emailRequested) {
          this.enterEmailVerification(newEmail);
          return;
        }

        this.successMessage.set('account.SAVE_SUCCESS');
        this.statusMessage.set(null);
      });
  }

  confirmEmailChange(): void {
    if (this.isConfirmingEmail() || !this.pendingNewEmail()) {
      return;
    }

    this.authErrorService.clear();
    this.statusMessage.set(null);
    if (this.emailCodeForm.invalid) {
      this.emailCodeForm.markAllAsTouched();
      this.statusMessage.set('account.FORM_INVALID');
      return;
    }

    const newEmail = this.pendingNewEmail();
    this.isConfirmingEmail.set(true);
    let finishedOk = false;
    this.authActions
      .confirmEmailChange(
        { code: this.emailCodeForm.getRawValue().code.trim() },
        newEmail,
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isConfirmingEmail.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
          }
        }),
      )
      .subscribe((profile) => {
        finishedOk = true;
        if (profile) {
          this.patchForm(profile);
        } else {
          this.loadedEmail = newEmail;
          this.form.patchValue({ email: newEmail });
          if (this.loadedProfile) {
            this.loadedProfile = { ...this.loadedProfile, email: newEmail };
          }
        }
        this.pendingNewEmail.set('');
        this.awaitingEmailCode.set(false);
        this.emailCodeForm.reset();
        this.successMessage.set('account.EMAIL_CHANGE_SUCCESS');
        this.statusMessage.set(null);
      });
  }

  resendEmailCode(): void {
    const newEmail = this.pendingNewEmail();
    if (!newEmail || this.isRequestingEmail()) {
      return;
    }

    this.authErrorService.clear();
    this.statusMessage.set(null);
    this.isRequestingEmail.set(true);
    let finishedOk = false;
    this.requestEmailCode$(newEmail)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isRequestingEmail.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
          }
        }),
      )
      .subscribe(() => {
        finishedOk = true;
        this.successMessage.set('account.EMAIL_CODE_SENT');
      });
  }

  cancelEmailChange(): void {
    this.awaitingEmailCode.set(false);
    this.pendingNewEmail.set('');
    this.emailCodeForm.reset();
    this.form.patchValue({ email: this.loadedEmail });
    this.successMessage.set(null);
    this.statusMessage.set(null);
  }

  openDeleteConfirm(): void {
    if (this.isDeleting()) {
      return;
    }
    this.showDeleteConfirm.set(true);
  }

  cancelDeleteAccount(): void {
    if (this.isDeleting()) {
      return;
    }
    this.showDeleteConfirm.set(false);
  }

  deleteAccount(): void {
    if (this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.authErrorService.clear();
    this.statusMessage.set(null);
    let finishedOk = false;
    this.authActions
      .deleteAccount()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isDeleting.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
            this.showDeleteConfirm.set(false);
          }
        }),
      )
      .subscribe(() => {
        finishedOk = true;
        this.showDeleteConfirm.set(false);
        void this.router.navigateByUrl('/auth/login');
      });
  }

  private startEmailChange(newEmail: string): void {
    this.isSaving.set(true);
    let finishedOk = false;

    this.requestEmailCode$(newEmail)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSaving.set(false);
          if (!finishedOk && !this.errorMessage()) {
            this.statusMessage.set('account.SAVE_FAILED');
          }
        }),
      )
      .subscribe(() => {
        finishedOk = true;
        this.enterEmailVerification(newEmail);
      });
  }

  private requestEmailCode$(newEmail: string) {
    this.pendingNewEmail.set(newEmail);
    return this.authActions.requestEmailChange({ newEmail });
  }

  private enterEmailVerification(newEmail: string): void {
    this.pendingNewEmail.set(newEmail);
    this.form.patchValue({ email: newEmail });
    this.awaitingEmailCode.set(true);
    this.emailCodeForm.reset();
    this.successMessage.set('account.EMAIL_CODE_SENT');
    this.statusMessage.set(null);
  }

  private hasProfileChanges(request: UpdateProfileRequest): boolean {
    if (this.selectedPhoto) {
      return true;
    }

    const current = this.loadedProfile;
    if (!current) {
      return true;
    }

    const currentPhone = this.normalizePhone(current.phone || '') || '';
    const nextPhone = request.phone || '';

    return (
      (current.firstName || '') !== request.firstName ||
      (current.lastName || '') !== request.lastName ||
      currentPhone !== nextPhone
    );
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.authErrorService.clear();
    this.statusMessage.set(null);
    this.patchFromSession();

    this.authActions
      .getProfile()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (profile) => this.patchForm(profile),
        complete: () => {
          if (!this.loadedProfile) {
            this.statusMessage.set('account.LOAD_FAILED');
          }
        },
      });
  }

  private patchFromSession(): void {
    const session = this.authActions.getSession();
    if (!session) {
      return;
    }

    this.loadedEmail = session.email || '';
    this.form.patchValue({
      email: this.loadedEmail,
    });
  }

  private patchForm(profile: UserProfile, emailOverride?: string): void {
    this.loadedProfile = profile;
    this.loadedEmail = profile.email || '';
    this.form.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: emailOverride || this.loadedEmail,
      phone: this.stripCountryCode(profile.phone || ''),
      gender: profile.gender || '',
    });

    this.photoPreview.set(profile.photoUrl || null);
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      return '';
    }
    if (digits.startsWith('20')) {
      return `+${digits}`;
    }
    return `+20${digits}`;
  }

  private stripCountryCode(phone: string): string {
    return phone.replace(/^\+?20/, '').replace(/\D/g, '');
  }
}
