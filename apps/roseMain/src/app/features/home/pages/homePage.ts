import { Component } from '@angular/core';
import { TrustedbySection } from '../components/trustedbySection';

@Component({
  selector: 'app-home-page',
  imports: [TrustedbySection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
