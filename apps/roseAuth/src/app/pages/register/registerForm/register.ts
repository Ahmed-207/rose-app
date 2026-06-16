import { Component, computed, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterService } from '../services/register-service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/shared-ui-components';
import { FormControlComponent } from 'apps/shared/components/form-controls/form-control';
import { AuthCardComponent } from '../../../shared/components/auth-card/auth-card.component';
import { AuthActions } from '@org/auth';


function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw  = control.get('password')?.value;
  const cpw = control.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule,RouterLink,TranslatePipe,Button,FormControlComponent,AuthCardComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
   private fb     = inject(FormBuilder);
 // private _authService= inject(AuthService);
 private authActions = inject(AuthActions);
    private _router = inject(Router);
   private _registrationService = inject(RegisterService);

  readonly email = computed(() => this._registrationService.state().email);

  isLoading    = false;
  errorMessage = "";

  genderOptions = [
    { value: 'MALE',   label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];

  form = this.fb.group(
    {
      username:        ['', [Validators.required, Validators.minLength(3)]],
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      email: ['', Validators.required],
      password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required],
      gender:          ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );


ngOnInit(): void {

    this.form.get('email')?.setValue(this.email());

  }

  get passwordMatchError(): string {
    const touched = this.form.get('confirmPassword')?.touched;
    return touched && this.form.hasError('passwordMismatch')
      ? 'Passwords do not match'
      : '';
  }
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading=true;


    const { username, firstName, lastName, password, confirmPassword, gender } = this.form.value;
     this.authActions.register({
      email: this.email(),
      username: username!,
      firstName: firstName!,
      lastName: lastName!,
      password: password!,
      gender:gender!,
      confirmPassword: confirmPassword!,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this._registrationService.clear();
        this._router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Registration failed. Please try again.';
      },
    });

  }
}
