import { Component } from '@angular/core';
import { FeatureServiceSection } from '../components/featureServiceSection';
import { BestSellingSection } from '../components/bestSellingSection';

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, BestSellingSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
