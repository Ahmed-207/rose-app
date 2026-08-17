import { Component, ViewEncapsulation } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton';

@Component({
  selector: 'lib-skeleton-card',
  imports: [SkeletonComponent],
  templateUrl: './skeleton-card.html',
  styleUrl: './skeleton-card.css',
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonCardComponent {}
