import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AuthActions,
  AuthErrorService,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from '@org/auth';
import { ConfirmDialog } from 'apps/shared/components/confirm-dialog/confirmDialog';
import { passwordMatchValidator } from 'apps/shared/utils/passwordMatchValidator';
import { finalize, of, switchMap } from 'rxjs';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, TranslatePipe, ConfirmDialog],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = signal<'profile' | 'password'>('profile');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly photoPreview = signal<string | null>(null);
  readonly photoError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly statusMessage = signal<string | null>(null);
  readonly errorMessage = this.authErrorService.message;

  private selectedPhoto: File | null = null;

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    phone: [''],
    gender: [{ value: '', disabled: true }],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') },
  );

  ngOnInit(): void {
    const isPasswordRoute = this.router.url.includes('/change-password');
    this.activeTab.set(isPasswordRoute ? 'password' : 'profile');
    if (!isPasswordRoute) {
      this.loadProfile();
    }
  }

  selectTab(tab: 'profile' | 'password'): void {
    this.activeTab.set(tab);
    this.message.set(null);
    this.statusMessage.set(null);
    this.authErrorService.clear();
    const targetUrl = tab === 'password' ? '/admin/change-password' : '/admin/profile';
    if (this.router.url !== targetUrl) {
      void this.router.navigateByUrl(targetUrl);
    }
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

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSaving()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.message.set(null);
    this.statusMessage.set(null);
    this.authErrorService.clear();

    const value = this.profileForm.getRawValue();
    const request: UpdateProfileRequest = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phone: this.normalizePhone(value.phone),
      photo: null,
    };

    this.isSaving.set(true);
    const upload$ = this.selectedPhoto
      ? this.authActions.uploadImage(this.selectedPhoto)
      : of<string | null>(null);

    upload$
      .pipe(
        switchMap((photoUrl) => this.authActions.updateProfile({ ...request, photo: photoUrl })),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (profile) => {
          this.patchProfile(profile);
          this.selectedPhoto = null;
          this.message.set('account.SAVE_SUCCESS');
        },
      });
  }

  changePassword(): void {
    this.message.set(null);
    this.statusMessage.set(null);
    this.authErrorService.clear();

    if (this.passwordForm.invalid || this.isSaving()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = {
      currentPassword: value.currentPassword,
      newPassword: value.newPassword,
      confirmPassword: value.confirmPassword,
    };

    this.isSaving.set(true);
    this.authActions
      .changePassword(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.message.set('account.PASSWORD_CHANGE_SUCCESS');
        },
      });
  }

  openDeleteConfirm(): void {
    if (!this.isDeleting()) {
      this.showDeleteConfirm.set(true);
    }
  }

  cancelDeleteAccount(): void {
    if (!this.isDeleting()) {
      this.showDeleteConfirm.set(false);
    }
  }

  deleteAccount(): void {
    if (this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.authErrorService.clear();
    this.authActions
      .deleteAccount()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDeleting.set(false)),
      )
      .subscribe({
        next: () => {
          this.showDeleteConfirm.set(false);
          void this.router.navigateByUrl('/auth/login');
        },
      });
  }

  hasFieldError(form: { get: (path: string) => AbstractControl | null }, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.authErrorService.clear();
    this.authActions
      .getProfile()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({ next: (profile) => this.patchProfile(profile) });
  }

  private patchProfile(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
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
    return digits.startsWith('20') ? `+${digits}` : `+20${digits}`;
  }

  private stripCountryCode(phone: string): string {
    return phone.replace(/^\+?20/, '').replace(/\D/g, '');
  }
}
