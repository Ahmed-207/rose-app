import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideBell, LucideShoppingCart, LucideUser } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions } from '@org/auth';
import { NotificationStore } from '@org/notifications';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from '@org/shared-theme';
import { CartService } from '../../../pages/cart-page/services/cart.service';
import { NotificationModal } from '../../../shared/components/notification-modal/notification-modal';
import { SearchBar } from '../search-bar/search-bar';

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
    SearchBar,
    NotificationModal,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly authActions = inject(AuthActions);
  private readonly document = inject(DOCUMENT);
  readonly notificationStore = inject(NotificationStore);

  readonly cartCount = this.cartService.itemCount;
  readonly isLoggedIn = computed(() => !!this.authActions.getSession());
  readonly isNotificationPanelOpen = signal(false);

  ngOnInit(): void {
    this.cartService.refreshCount();
    if (this.isLoggedIn()) {
      this.notificationStore.refreshUnreadCount();
    }
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }

  toggleNotificationPanel(event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn()) {
      void this.router.navigateByUrl('/auth/login');
      return;
    }

    const nextState = !this.isNotificationPanelOpen();
    this.isNotificationPanelOpen.set(nextState);

    if (nextState) {
      this.notificationStore.loadNotifications();
      this.notificationStore.refreshUnreadCount();
      this.document.addEventListener('click', this.handleOutsideClick);
    } else {
      this.document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  closeNotificationPanel(): void {
    this.isNotificationPanelOpen.set(false);
    this.document.removeEventListener('click', this.handleOutsideClick);
  }

  private readonly handleOutsideClick = (event: Event): void => {
    const target = event.target;
    if (
      target instanceof Node &&
      this.document.querySelector('.notification-bell-wrapper')?.contains(target)
    ) {
      return;
    }
    this.closeNotificationPanel();
  };

  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
