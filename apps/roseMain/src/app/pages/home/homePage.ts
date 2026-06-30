import { Component } from '@angular/core';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, Testmonials],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
