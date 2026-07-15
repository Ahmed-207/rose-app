import { Component, input, output } from '@angular/core';
import { LucidePhone } from '@lucide/angular';

@Component({
  selector: 'select-address-card',
  imports: [LucidePhone],
  templateUrl: './select-address-card.html',
  styleUrl: './select-address-card.css',
  host: {
    class: 'block w-full'
  }
})
export class SelectAddressCard {

  cardCity = input.required<string>();
  cardStreet = input.required<string>();
  cardPhone = input.required<string>();
  isMainAddress = input.required<boolean>();
  addressId = input.required<string>();
  isSelected = input<boolean>(false);
  cardSelectedId = output<string>();

  onCardClick(): void {
    this.cardSelectedId.emit(this.addressId());
  }

}
