import { Component, input, output } from '@angular/core';
import { Product } from '@org/products';
import { SearchProductCard } from "./components/search-product-card/search-product-card";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search-dropdown',
  imports: [SearchProductCard, TranslatePipe],
  templateUrl: './search-dropdown.html',
  styleUrl: './search-dropdown.css',
})
export class SearchDropdown {
  products = input.required<Product[]>();
  isLoading = input<boolean>(false);
  searchQuery = input<string>('');
  selectProduct = output<Product>();
}
