import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions } from '@org/auth';

@Component({
  selector: 'account-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './accountSidebar.html',
  styleUrl: './accountSidebar.css',
})
export class AccountSidebar {
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);

  logout(): void {
    this.authActions.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
