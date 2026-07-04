import { Component } from '@angular/core';
import { SectionHeader } from "../section-header/section-header";
import { TranslatePipe } from '@ngx-translate/core';

export interface GalleryItem {
  path: string;
  alt?: string;
}

@Component({
  selector: 'app-gallery-section',
  imports: [SectionHeader, TranslatePipe],
  templateUrl: './gallery-section.html',
  styleUrl: './gallery-section.css',
})
export class GallerySection {

  readonly galleryImages: GalleryItem[] = [
    {
      path: '/assets/images/gallery-section-images/gallery-1.png'
    },
    {
      path: '/assets/images/gallery-section-images/gallery-2.png'
    },
    {
      path: '/assets/images/gallery-section-images/gallery-3.png'
    },
    {
      path: '/assets/images/gallery-section-images/gallery-4.png'
    },
    {
      path: '/assets/images/gallery-section-images/gallery-5.png'
    },
    {
      path: '/assets/images/gallery-section-images/gallery-6.png'
    }
  ]

}
