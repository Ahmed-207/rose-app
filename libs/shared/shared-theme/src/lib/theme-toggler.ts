import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'lib-theme-toggler',
  imports: [RippleModule],
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.css',
})
export class ThemeToggler {
  readonly theme = inject(ThemeService);
}
