import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
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
  { label: 'Overview', path: 'overview', icon: 'pi pi-th-large' },
  { label: 'Categories', path: 'categories', icon: 'pi pi-folder' },
  { label: 'Occasions', path: 'occasions', icon: 'pi pi-calendar' },
  { label: 'Products', path: 'products', icon: 'pi pi-box' } 
];
}
