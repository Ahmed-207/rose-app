import { Component } from '@angular/core';
import { SpecialGiftSection } from '../components/specialGiftSection';

@Component({
  selector: 'app-home-page',
  imports: [SpecialGiftSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
