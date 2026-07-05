import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, TranslatePipe, UiLangSwitcher, ThemeToggler, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }

  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}