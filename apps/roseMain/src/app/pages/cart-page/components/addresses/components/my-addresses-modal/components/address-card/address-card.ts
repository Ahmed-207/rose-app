import { Component, input, output } from '@angular/core';
import { LucideMapPin, LucidePhone, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { DeletionModalData } from '../../../../models/delete-modal-data';

@Component({
  selector: 'app-address-card',
  imports: [LucideMapPin, LucidePhone, LucidePencil, LucideTrash2],
  templateUrl: './address-card.html',
  styleUrl: './address-card.css',
})
export class AddressCard {

  cardCity = input.required<string>();
  cardStreet = input.required<string>();
  cardPhone = input.required<string>();
  isMainAddress = input.required<boolean>();
  cardTitle = input.required<string>();
  addressId = input.required<string>();

  deleteModalData = output<DeletionModalData>();
  editModalData = output<void>();

  editAddress(): void {
    this.editModalData.emit();
  }

  deleteAddress(): void {
    this.deleteModalData.emit({
      isModalOpened: true,
      deletionId: this.addressId()
    });
  }
}