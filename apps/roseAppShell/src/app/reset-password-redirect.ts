import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-redirect',
  template: '',
})
export class ResetPasswordRedirect implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    void this.router.navigate(['/auth/reset-password'], {
      queryParams: this.route.snapshot.queryParams,
      replaceUrl: true,
    });
  }
}
