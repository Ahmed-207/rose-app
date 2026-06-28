import { Component } from '@angular/core';
import { FeatureServiceSection } from '../components/featureServiceSection';

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
