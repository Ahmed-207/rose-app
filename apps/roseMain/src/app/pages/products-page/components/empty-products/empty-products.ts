import { Component, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-products',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './empty-products.html',
  styleUrl: './empty-products.css',
})
export class EmptyProducts {
  readonly clearFilters = output<void>();
}