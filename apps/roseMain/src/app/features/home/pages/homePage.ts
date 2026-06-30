import { Component } from '@angular/core';
import { SpecialGiftSection } from '../components/specialGiftSection';
import { FeatureServiceSection } from '../components/featureServiceSection';
import { BestSellingSection } from '../components/bestSellingSection';

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, SpecialGiftSection, BestSellingSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {}
