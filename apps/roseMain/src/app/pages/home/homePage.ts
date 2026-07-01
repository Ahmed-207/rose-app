import { Component } from '@angular/core';
import { BestSellingSection } from './components/best-selling/bestSellingSection';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { SpecialGiftSection } from './components/special-gift/specialGiftSection';
import { Testmonials } from './components/testmonials/testmonials';

@Component({
  selector: 'app-home-page',
  imports: [
    FeatureServiceSection,
    Testmonials,
    SpecialGiftSection,
    BestSellingSection,
  ],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {}
