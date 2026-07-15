import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { BestSellingSection } from './components/best-selling/bestSellingSection';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";
import { SpecialGiftSection } from "./components/special-gift/specialGiftSection";
import { TrustedbySection } from "./components/trustedby-section/trustedbySection";
import { GallerySection } from "./components/gallery-section/gallery-section";
import { MostPopularSection } from "./components/most-popular/mostPopularSection";
import { AuthActions } from '@org/auth';
import { ShippingAddress } from "../cart/components/addresses/shipping-address";

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
    ShippingAddress
  ],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {

  //-- logic only to test the address management 
  private readonly authActions = inject(AuthActions);
  readonly isLoggedIn = computed(() => this.authActions.isAuthenticated());
  //-- end of testing logic 

}

