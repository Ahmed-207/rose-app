import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule , TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {


  @Output() closeMenu = new EventEmitter<void>();

  isUserMenuOpen = false;

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  menuItems = [
  { label: 'ADMIN.NAVIGATION.OVERVIEW' , path: 'dashboard', icon: 'pi pi-th-large' },
  { label: 'ADMIN.NAVIGATION.CATEGORIES' , path: 'categories', icon: 'pi pi-folder' },
  { label: 'ADMIN.NAVIGATION.OCCASIONS' , path: 'occasions', icon: 'pi pi-calendar' },
  { label: 'ADMIN.NAVIGATION.PRODUCTS' , path: 'products', icon: 'pi pi-box' },
  { label: 'ADMIN.NAVIGATION.NOTIFICATIONS', path: 'notifications', icon: 'pi pi-bell' },
];
}
