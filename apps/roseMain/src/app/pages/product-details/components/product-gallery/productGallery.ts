import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './productGallery.html',
  styleUrl: './productGallery.css',
})
export class ProductGallery {
  readonly images = input.required<string[]>();
  readonly selectedIndex = model(0);

  selectImage(index: number): void {
    this.selectedIndex.set(index);
  }
}
