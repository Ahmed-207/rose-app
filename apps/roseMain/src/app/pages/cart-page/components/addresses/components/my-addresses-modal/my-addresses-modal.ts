import { addressStore } from "@org/user-addresses";
import { Component, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { SkeletonListComponent } from "@org/shared-ui-components";
import { AddressCard } from "./components/address-card/address-card";
import { EmptyPage } from "./components/empty-page/empty-page";
import { DeletionModalData } from "../../models/delete-modal-data";
import { DeleteModal } from "./components/delete-modal/delete-modal";
import { AddressFormModal } from "./components/address-form-modal/address-form-modal";
import { Address } from "@org/user-addresses";
import { TranslatePipe } from "@ngx-translate/core";
import { AddressFormState } from "../../models/address-modal-state";
import { LucideX } from '@lucide/angular';


@Component({
  selector: 'app-my-addresses-modal',
  imports: [SkeletonListComponent, AddressCard, EmptyPage, DeleteModal, AddressFormModal, TranslatePipe, LucideX],
  templateUrl: './my-addresses-modal.html',
  styleUrl: './my-addresses-modal.css',
})
export class MyAddressesModal implements OnInit {

  modalClosed = output<boolean>();
  readonly _store = inject(addressStore);

  deletionModalForParent: WritableSignal<DeletionModalData> =
    signal<DeletionModalData>({ isModalOpened: false, deletionId: '' });

  addressFormState: WritableSignal<AddressFormState> =
    signal<AddressFormState>({ isOpen: false, mode: 'add', seed: null });

  closeModal(): void {
    this.modalClosed.emit(false);
  }

  toggleDeleteModal(passedData: DeletionModalData): void {
    this.deletionModalForParent.set(passedData);
  }

  openAddAddressForm(): void {
    this.addressFormState.set({ isOpen: true, mode: 'add', seed: null });
  }

  openEditAddressForm(address: Address): void {
    this.addressFormState.set({ isOpen: true, mode: 'edit', seed: address });
  }

  closeAddressForm(): void {
    this.addressFormState.set({ isOpen: false, mode: 'add', seed: null });
  }

  ngOnInit(): void {
    this._store.loadAddresses();
  }
}