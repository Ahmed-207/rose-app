import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideBell, LucideHeart, LucideMapPinPen, LucideShoppingCart, LucideUser } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from "@org/shared-theme";
import { CartService } from '../../../pages/cart-page/services/cart.service';


@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    TranslatePipe,
    UiLangSwitcher,
    ThemeToggler,
    RouterLink,
    RouterLinkActive,
    LucideUser,
    LucideShoppingCart,
    LucideBell,
    LucideMapPinPen
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  readonly cartCount = this.cartService.itemCount;

  ngOnInit(): void {
    this.cartService.refreshCount();
  }

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