import { Component, input, ViewEncapsulation } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton';

@Component({
  selector: 'lib-skeleton-list',
  imports: [SkeletonComponent],
  templateUrl: './skeleton-list.html',
  styleUrl: './skeleton-list.css',
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonListComponent {
  rows = input<number>(3);
}
