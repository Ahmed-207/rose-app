
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryCard, HeroSlide } from '../models/special-gift-Dtos';


@Component({
  selector: 'special-gift-section',
 imports: [CommonModule, GalleriaModule, ButtonModule, BadgeModule,TranslatePipe],
  templateUrl: './specialGiftSection.html',
  styleUrl: './specialGiftSection.css',
})
export class SpecialGiftSection {

  galleriaResponsiveOptions = [
    { breakpoint: '960px', numVisible: 1 },
    { breakpoint: '600px', numVisible: 1 },
  ];

  heroSlides: HeroSlide[] = [
    {
      title: 'Say It with Flowers',
      subtitle: 'Elegant gifts for every special moment.',
      btnLabel: "I'm buying!",
      imageUrl: '/assets/images/img1.png',
    },
    {
      title: 'Indulge in Sweet Love',
      subtitle: 'Artisan chocolates crafted with care.',
      btnLabel: 'Explore Now',
      imageUrl: '/assets/images/img2.png',

    },
    {
      title: 'Celebrate Every Milestone',
      subtitle: 'Curated sets for anniversaries & weddings.',
      btnLabel: 'Browse Sets',
      imageUrl: '/assets/images/img3.png',
    },
  ];


  categoryCards: CategoryCard[] = [
    {
      tag: 'Wedding',
      title: "Celebrate Her Forever with a Gift She’ll Always Remember",
      bgGradient: 'linear-gradient(135deg,#6b4c2a 0%,#c49a50 100%)',
      imagUrl: '/assets/images/img4.png',
    },
    {
      tag: 'Engagement',
      title: 'Honor the Beginning of a Beautiful Journey Together',
      bgGradient: 'linear-gradient(135deg,#d4c5a0 0%,#b8976a 100%)',
      imagUrl: '/assets/images/img5.png',
    },
    {
      tag: 'Anniversary',
      title: 'Mark Every Year of Love with a Meaningful Surprise',
      bgGradient: 'linear-gradient(135deg,#7a0f1e 0%,#c03040 100%)',
      imagUrl: '/assets/images/img3.png',
    },
  ];
}
