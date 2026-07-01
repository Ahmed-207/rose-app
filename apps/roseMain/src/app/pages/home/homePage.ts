import { Component } from '@angular/core';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";
import { SpecialGiftSection } from "./components/special-gift/specialGiftSection";

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, Testmonials, SpecialGiftSection],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
