import { Component, computed, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { addressStore } from '@org/user-addresses';
import { Spinner, Message } from "@org/shared-ui-components";
import { SelectAddressCard } from "./components/select-address-card/select-address-card";
import { EmptyPage } from "./components/my-addresses-modal/components/empty-page/empty-page";
import { AddressModalButton } from "./components/address-modal-button/address-modal-button";
import { MyAddressesModal } from "./components/my-addresses-modal/my-addresses-modal";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'shipping-address',
  imports: [Spinner, SelectAddressCard, EmptyPage, Message, AddressModalButton, MyAddressesModal, TranslatePipe],
  templateUrl: './shipping-address.html',
  styleUrl: './shipping-address.css',
})
export class ShippingAddress implements OnInit {

  readonly _store = inject(addressStore);
  isModalOpened: WritableSignal<boolean> = signal<boolean>(false);
  selectedAddressId = computed(() => this._store.lastSelectedAddressId());

  onAddressSelect(addressId: string): void {
    console.log("Selected ID updated in state:", this.selectedAddressId());
    this._store.changeLastSelected(addressId);
  };


  toggleModal(newModalState: boolean): void {
    this.isModalOpened.set(newModalState);
  }




  ngOnInit(): void {
    this._store.loadAddresses();
  }
}
