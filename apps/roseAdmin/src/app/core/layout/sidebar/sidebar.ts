import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions } from '@org/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule , TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authActions = inject(AuthActions);
  private readonly router = inject(Router);

  @Output() closeMenu = new EventEmitter<void>();

  isUserMenuOpen = false;

  readonly session = this.authActions.getSession();
  readonly username = this.session?.username ?? 'Admin';
  readonly email = this.session?.email ?? 'admin@rose.com';

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.isUserMenuOpen = false;
    this.closeMenu.emit();
    this.authActions.logout();
    void this.router.navigateByUrl('/auth/login');
  }

  menuItems = [
  { label: 'ADMIN.NAVIGATION.OVERVIEW' , path: '/admin/dashboard', icon: 'pi pi-th-large' },
  { label: 'ADMIN.NAVIGATION.CATEGORIES' , path: '/admin/categories', icon: 'pi pi-folder' },
  { label: 'ADMIN.NAVIGATION.OCCASIONS' , path: '/admin/occasions', icon: 'pi pi-calendar' },
  { label: 'ADMIN.NAVIGATION.PRODUCTS' , path: '/admin/products', icon: 'pi pi-box' },
  { label: 'ADMIN.NAVIGATION.NOTIFICATIONS', path: '/admin/notifications', icon: 'pi pi-bell' },
];
}
