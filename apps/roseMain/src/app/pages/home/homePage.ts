import { Component } from '@angular/core';
import { BestSellingSection } from './components/best-selling/bestSellingSection';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";
import { SpecialGiftSection } from "./components/special-gift/specialGiftSection";
import { TrustedbySection } from "./components/trustedby-section/trustedbySection";
import { GallerySection } from "./components/gallery-section/gallery-section";
import { MostPopularSection } from "./components/most-popular/mostPopularSection";

@Component({
  selector: 'app-home-page',
  imports: [
    FeatureServiceSection,
    Testmonials,
    SpecialGiftSection,
    BestSellingSection,
    TrustedbySection,
    GallerySection,
    MostPopularSection,
  
],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
