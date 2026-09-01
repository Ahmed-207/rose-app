import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UiLangSwitcher } from '@org/ui-lang-switcher';
import { ThemeToggler } from '@org/shared-theme';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule , RouterModule , TranslatePipe, UiLangSwitcher, ThemeToggler],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  @Output() menuClick = new EventEmitter<void>();

  isUserMenuOpen = false;

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
}
