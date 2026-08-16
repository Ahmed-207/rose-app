import { Component, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-address-modal-button',
  imports: [TranslatePipe],
  templateUrl: './address-modal-button.html',
  styleUrl: './address-modal-button.css',
})
export class AddressModalButton {

  modalOpened = output<boolean>();

  openAddressModal():void{
    this.modalOpened.emit(true);
  }

}
