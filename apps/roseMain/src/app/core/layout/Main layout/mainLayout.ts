import { Component, computed, inject } from '@angular/core';
import { Navbar } from '../Navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Footer } from "../Footer/footer";
import { SecondryNavbar } from "../secondry Navbar/secondryNavbar";
import { AuthActions, Role } from '@org/auth';
import { TrustedbySection } from "../../../features/home/components/trustedbySection";

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Navbar, Footer, SecondryNavbar, TrustedbySection],
  templateUrl: './mainLayout.html',
  styleUrl: './mainLayout.css',
})
export class MainLayout {
  private readonly authActions = inject(AuthActions);

  readonly isLoggedIn = computed(() => this.authActions.isAuthenticated());
  readonly isAdmin = computed(() => this.authActions.getRole() === Role.Admin);
  readonly user = computed(() => this.authActions.getSession());
}
