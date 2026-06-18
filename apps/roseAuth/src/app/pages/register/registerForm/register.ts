import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthActions, AuthErrorService, RegisterRequest } from '@org/auth';
import { Button } from '@org/shared-ui-components';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { RegisterService } from '../services/register-service';

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
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authActions = inject(AuthActions);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly router = inject(Router);
  private readonly registerService = inject(RegisterService);

  readonly email = computed(() => this.registerService.state().email);
  readonly isLoading = signal(false);
  readonly errorMessage = this.authErrorService.message;

  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)],
      ],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.form.get('email')?.setValue(this.email());
  }

  get passwordMatchError(): string {
    const touched = this.form.get('confirmPassword')?.touched;
    return touched && this.form.hasError('passwordMismatch') ? 'Passwords do not match' : '';
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const { username, firstName, lastName, password, confirmPassword } = this.form.value;

    const request: RegisterRequest = {
      username: username as string,
      email: this.email(),
      password: password as string,
      confirmPassword: confirmPassword as string,
      firstName: firstName as string,
      lastName: lastName as string,
    };

    this.isLoading.set(true);
    this.authErrorService.clear();

    this.authActions
      .register(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.registerService.clear();
          void this.router.navigateByUrl('/home');
        },
      });
  }
}
