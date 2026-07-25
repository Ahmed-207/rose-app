import { Component, inject, input, output } from '@angular/core';
import { LucideX, LucideTrash2 } from '@lucide/angular';
import { DeletionModalData } from '../../../../models/delete-modal-data';
import { addressStore } from '@org/user-addresses';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'delete-modal',
  imports: [LucideX, LucideTrash2, TranslatePipe],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css',
})
export class DeleteModal {
  deletionId = input.required<string>();
  updatedModalStatus = output<DeletionModalData>();
  readonly _store = inject(addressStore);



  confirmAddressDeletion(): void {
    this._store.deleteAddress(this.deletionId());
    this.cancelDeletion();
  }


  cancelDeletion(): void {
    this.updatedModalStatus.emit({ isModalOpened: false, deletionId: '' })
  }


}