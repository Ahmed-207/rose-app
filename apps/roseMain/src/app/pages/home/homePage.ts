import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { BestSellingSection } from './components/best-selling/bestSellingSection';
import { FeatureServiceSection } from './components/feature-service/featureServiceSection';
import { Testmonials } from "./components/testmonials/testmonials";
import { SpecialGiftSection } from "./components/special-gift/specialGiftSection";
import { TrustedbySection } from "./components/trustedby-section/trustedbySection";
import { GallerySection } from "./components/gallery-section/gallery-section";
import { MostPopularSection } from "./components/most-popular/mostPopularSection";
import { AddressModalButton } from '../cart/components/addresses/components/address-modal-button/address-modal-button';
import { MyAddressesModal } from '../cart/components/addresses/components/my-addresses-modal/my-addresses-modal';
import { AuthActions } from '@org/auth';

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
    AddressModalButton,
    MyAddressesModal
  ],
  templateUrl: './homePage.html',
  styleUrl: './homePage.css',
})
export class HomePage {

  //-- logic only to test the address management 
  isModalOpened: WritableSignal<boolean> = signal<boolean>(false);
  private readonly authActions = inject(AuthActions);
  readonly isLoggedIn = computed(() => this.authActions.isAuthenticated());

  toggleModal(newModalState: boolean): void {
    this.isModalOpened.set(newModalState);
  }

  //-- end of testing logic 

}

