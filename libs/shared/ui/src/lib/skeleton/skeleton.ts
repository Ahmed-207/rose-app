import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-skeleton',
  template: `<span class="skeleton skeleton-shimmer" aria-hidden="true"></span>`,
  styleUrl: './skeleton.css',
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonComponent {}
