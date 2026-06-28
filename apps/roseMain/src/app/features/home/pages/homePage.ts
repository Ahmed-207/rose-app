import { Component } from '@angular/core';
import { TrustedbySection } from '../components/trustedbySection';
import { FeatureServiceSection } from '../components/featureServiceSection';

@Component({
  selector: 'app-home-page',
 imports: [TrustedbySection,FeatureServiceSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
  
})
export class HomePage {
}
