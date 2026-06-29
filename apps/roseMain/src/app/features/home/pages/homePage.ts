import { Component } from '@angular/core';
import { SpecialGiftSection } from '../components/specialGiftSection';
import { FeatureServiceSection } from '../components/featureServiceSection';


@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection,SpecialGiftSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
