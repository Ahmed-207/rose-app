import { Component } from '@angular/core';
import { FeatureServiceSection } from '../components/featureServiceSection';
import { MostPopularSection } from "../components/mostPopularSection";
import { AboutUs } from '../components/aboutUs';

@Component({
  selector: 'app-home-page',
  imports: [FeatureServiceSection, MostPopularSection, AboutUs],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {
}
