import { Component } from '@angular/core';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";
import { SpecialGiftSection } from "./components/special-gift/specialGiftSection";
import { TrustedbySection } from "./components/trustedby-section/trustedbySection";

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, Testmonials, SpecialGiftSection, TrustedbySection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
