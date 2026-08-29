import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { MobileBottom } from '../mobileBottom/mobileBottom';
import { Footer } from '../footer/footer';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    Sidebar,
    Navbar,
    // MobileBottom,
    Footer
  ],
  templateUrl: './mainLayout.html',
  styleUrl: './mainLayout.css',
})
export class MainLayout {

  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(state => !state);
  }
}
