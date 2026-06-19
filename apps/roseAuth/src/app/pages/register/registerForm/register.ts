import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/shared-ui-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputOtpModule } from 'primeng/inputotp';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StepperModule } from 'primeng/stepper';
import { RegisterService } from '../services/register-service';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { AuthActions } from '@org/auth';

type ActivateFn = (value: number) => void;

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const cpw = control.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    Button,
    FormControlComponent,
    AuthCardComponent,
    InputOtpModule,
    MessageModule,
    ToastModule,
    StepperModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [MessageService],
})
export class Register {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authActions = inject(AuthActions);
  private router = inject(Router);
  private registrationService = inject(RegisterService);
  private messageService = inject(MessageService);

  // ---- stepper state ----
  // 1 = email, 2 = otp, 3 = account details
  activeStep = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');

  email = computed(() => this.registrationService.state().email);
  cardTitle = computed(() => (this.activeStep() === 3 ? 'Become part of our family!' : ''));

  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];

  // ---- step 1: email ----
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // ---- step 2: otp ----
  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  // ---- step 3: account details ----
  detailsForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: this.email() || '', disabled: true }],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)],
      ],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    // keep the read-only email field in step 3 in sync with the verified email
    effect(() => {
      this.detailsForm.patchValue({ email: this.email() }, { emitEvent: false });
    });
  }

  get passwordMatchError(): string {
    const touched = this.detailsForm.get('confirmPassword')?.touched;
    return touched && this.detailsForm.hasError('passwordMismatch') ? 'Passwords do not match' : '';
  }

  isOtpInvalid(): boolean {
    const control = this.otpForm.get('code');
    return !!control && control.invalid && (control.touched || this.isLoading());
  }

  onStepChange(value?: number): void {
    this.activeStep.set(value ?? 1);
  }

  // ---- step 1 -> 2 ----
  submitEmail(activate: ActivateFn): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const email = this.emailForm.value.email!;

    this.authActions
      .sendEmailVerification({ email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.status) {
            this.registrationService.setEmail(email);
            activate(2);
          } else {
            this.errorMessage.set(res.message);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message ?? 'Something went wrong. Please try again.');
        },
      });
  }

  // ---- step 2 -> 3 ----
  submitOtp(activate: ActivateFn): void {
    this.otpForm.markAllAsTouched();

    if (this.otpForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'OTP is invalid', life: 3000 });
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authActions
      .confirmEmailVerification({
        email: this.email(),
        code: this.otpForm.value.code!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.status) {
            this.registrationService.markVerified();
            activate(3);
          } else {
            this.errorMessage.set(res.message);
            this.otpForm.reset();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message ?? 'Invalid code. Please try again.');
          this.otpForm.reset();
        },
      });
  }

  editEmail(activate: ActivateFn): void {
    this.errorMessage.set('');
    this.otpForm.reset();
    activate(1);
  }

  // ---- step 3: finish ----
  submitDetails(): void {
    this.detailsForm.markAllAsTouched();
    if (this.detailsForm.invalid) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    const { username, firstName, lastName, password, confirmPassword, gender } = this.detailsForm.value;

    this.authActions
      .register({
        email: this.email(),
        username: username!,
        firstName: firstName!,
        lastName: lastName!,
        password: password!,
        gender: gender!,
        confirmPassword: confirmPassword!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.registrationService.clear();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
        },
      });
  }
}
