import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password-sent',
  imports: [TranslatePipe],
  templateUrl: './forgot-password-sent.html',
  styleUrl: './forgot-password-sent.css',
})
export class ForgotPasswordSent implements OnInit {
  private readonly router = inject(Router);

  readonly email = signal('');

  ngOnInit(): void {
    const stateEmail = history.state?.['email'] as string | undefined;
    this.email.set(stateEmail ?? '');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }
}
